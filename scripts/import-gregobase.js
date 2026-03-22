#!/usr/bin/env node
/**
 * scripts/import-gregobase.js
 *
 * Downloads the GregoBase SQL dump and converts it to JSON compatible
 * with the AMDG app format.
 *
 * Usage:
 *   node scripts/import-gregobase.js            # uses cached SQL if present
 *   node scripts/import-gregobase.js --force     # re-downloads SQL dump
 *   node scripts/import-gregobase.js --limit 50  # only first 50 chants (test)
 */

import { writeFileSync, existsSync, readFileSync, createWriteStream } from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SQL_URL   = 'https://raw.githubusercontent.com/gregorio-project/GregoBase/master/gregobase_online.sql';
const CACHE_FILE = path.join(__dirname, 'gregobase_online.sql');
const OUTPUT_FILE = path.join(__dirname, '../public/data/gregobase-cantos.json');

const args     = process.argv.slice(2);
const FORCE    = args.includes('--force');
const limitIdx = args.indexOf('--limit');
const LIMIT    = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : Infinity;

// ─── Field mappings ────────────────────────────────────────────────────────

const OFFICE_LABEL = {
  in: 'Introito',  gr: 'Gradual',    al: 'Aleluya',   of: 'Ofertorio',
  co: 'Comunión',  ky: 'Kyrie',      gl: 'Gloria',    cr: 'Credo',
  sa: 'Sanctus',   ag: 'Agnus Dei',  an: 'Antífona',  hy: 'Himno',
  re: 'Responsorio', vs: 'Verso',    ps: 'Salmo',     tr: 'Tracto',
  sq: 'Secuencia', ca: 'Cántico',    mt: 'Motete',    of: 'Ofertorio',
};

const OFFICE_TIEMPO = {
  in: 'Misa', gr: 'Misa', al: 'Misa', of: 'Misa', co: 'Misa',
  ky: 'Misa', gl: 'Misa', cr: 'Misa', sa: 'Misa', ag: 'Misa',
  sq: 'Misa', tr: 'Misa',
  an: 'Oficio Divino', re: 'Oficio Divino', vs: 'Oficio Divino',
  ps: 'Oficio Divino', hy: 'Oficio Divino', ca: 'Oficio Divino',
};

const MODE_LABEL = {
  '1': 'Modo I',   '2': 'Modo II',  '3': 'Modo III', '4': 'Modo IV',
  '5': 'Modo V',   '6': 'Modo VI',  '7': 'Modo VII', '8': 'Modo VIII',
  '1g': 'Modo I (g)', 'p': 'Modo Peregrino',
};

// ─── Download with redirect support ────────────────────────────────────────

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? https : http;
    proto.get(url, res => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        download(res.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} from ${url}`));
        return;
      }
      const file = createWriteStream(dest);
      let downloaded = 0;
      res.on('data', chunk => {
        downloaded += chunk.length;
        process.stdout.write(`\r  ${(downloaded / 1024 / 1024).toFixed(1)} MB downloaded...`);
      });
      res.pipe(file);
      file.on('finish', () => { file.close(); console.log(''); resolve(); });
    }).on('error', reject);
  });
}

// ─── SQL value parser ───────────────────────────────────────────────────────

/**
 * Parses all rows from INSERT INTO `tableName` VALUES (...) blocks.
 * Handles MySQL escape sequences, NULL, numbers, and multi-row INSERTs.
 * Returns an array of arrays (field values per row).
 */
function extractTable(sql, tableName) {
  const rows = [];
  // Match both "INSERT INTO `t` VALUES" and "INSERT INTO `t` (`col`,...) VALUES"
  const re   = new RegExp(`INSERT INTO \`${tableName}\`(?:\\s*\\([^)]+\\))?\\s*VALUES\\s*`, 'gi');
  let match;

  while ((match = re.exec(sql)) !== null) {
    let i = match.index + match[0].length;

    // Parse all rows in this INSERT block (ends at semicolon)
    while (i < sql.length && sql[i] !== ';') {
      // Skip whitespace / commas between rows
      while (i < sql.length && (sql[i] === ' ' || sql[i] === '\n' ||
             sql[i] === '\r' || sql[i] === '\t' || sql[i] === ',')) i++;
      if (i >= sql.length || sql[i] === ';') break;
      if (sql[i] !== '(') { i++; continue; }

      i++; // skip '('
      const fields = [];

      while (i < sql.length && sql[i] !== ')') {
        // Skip leading whitespace
        while (i < sql.length && (sql[i] === ' ' || sql[i] === '\t')) i++;
        if (sql[i] === ')') break;
        if (sql[i] === ',') { i++; continue; }

        if (sql.slice(i, i + 4) === 'NULL') {
          fields.push(null);
          i += 4;
        } else if (sql[i] === "'") {
          // String literal
          i++; // skip opening quote
          let str = '';
          while (i < sql.length) {
            if (sql[i] === '\\') {
              i++;
              const c = sql[i++];
              if      (c === 'n') str += '\n';
              else if (c === 't') str += '\t';
              else if (c === 'r') str += '\r';
              else                str += c;
            } else if (sql[i] === "'") {
              if (sql[i + 1] === "'") { str += "'"; i += 2; } // ''
              else                    { i++; break; }          // end
            } else {
              str += sql[i++];
            }
          }
          fields.push(str);
        } else {
          // Number or bare word
          let val = '';
          while (i < sql.length && sql[i] !== ',' && sql[i] !== ')') val += sql[i++];
          val = val.trim();
          fields.push(val === 'NULL' ? null : isNaN(val) ? val : Number(val));
        }

        // Skip trailing whitespace + comma separator
        while (i < sql.length && (sql[i] === ' ' || sql[i] === '\t')) i++;
        if (sql[i] === ',') i++;
      }

      if (sql[i] === ')') i++; // skip ')'
      rows.push(fields);
    }

    re.lastIndex = i;
  }

  return rows;
}

// ─── Tag → tiempo litúrgico ────────────────────────────────────────────────
// Ordered by priority (more specific first)
const TAG_TIEMPO_RULES = [
  { pattern: /hebdomada\s+sancta|feria\s+vi\s+in\s+passion|sabbato\s+sancto|in\s+passione\s+domini|feria\s+v\s+infra\s+hebdomadam\s+sanct/i, tiempo: 'Semana Santa' },
  { pattern: /adventus|tempus\s+adventus|tempore\s+adventus|dominica\s+[ivi1-4]+\s+adventus|missa.*adventus|ad\s+completorium\s+in\s+adventum/i, tiempo: 'Adviento' },
  { pattern: /nativitat|christmas|epiphan|die\s+2[45]\s+decembris|octava\s+nativitatis|sollemnitas.*nativitate|vigilia\s+epiphan|noel/i, tiempo: 'Navidad' },
  { pattern: /quadragesim|lent\b|tempore\s+quadragesim|tempore\s+passion|vigilia.*quad|dominica.*quadrages|sunday\s+lent|passion.*domini/i, tiempo: 'Cuaresma y Semana Santa' },
  { pattern: /paschal|paschali|paschale|paschæ|easter|resurrect|vigilia\s+pasch|dominica\s+pasch|ad\s+missam\s+vigiliae/i, tiempo: 'Pascua' },
  { pattern: /ascension/i, tiempo: 'Pascua' },
  { pattern: /pentecost|spiritu\s+sancto|sanctisimae\s+trinitatis|trinity/i, tiempo: 'Pentecostés' },
  { pattern: /corpus\s+christi|ss\.\s+sacrament|honorem\s+ss\.\s+sacram|\bcorpus\b/i, tiempo: 'Santísimo Sacramento' },
  { pattern: /mariae?\s+virginis|beatae?\s+mariae?|b\.\s*[mv]\.\s*maria|genetricis\s+mariae|conceptione\s+immacul|nativitate\s+b\.?\s*mari|honorem\s+b\.?\s+mariae?/i, tiempo: 'Virgen María' },
  { pattern: /sancti\s+ioseph|s\.\s+familiae/i, tiempo: 'San José' },
  { pattern: /omnium\s+sanctorum|commune\s+sanctorum|nativitate\s+sancti|sanctorum\s+petri|festiv.*sanctorum/i, tiempo: 'Santos' },
  { pattern: /defunctorum|pro\s+defunct|de\s+vigilia\s+pro\s+defunc|officium\s+defunctorum/i, tiempo: 'Difuntos' },
  { pattern: /tempus\s+per\s+annum|tempore\s+per\s+annum|post\s+pentecosten|dominica\s+\d+\s+post/i, tiempo: 'Tiempo Ordinario' },
];

function tiempoFromTags(tags) {
  for (const { pattern, tiempo } of TAG_TIEMPO_RULES) {
    if (tags.some(t => pattern.test(t))) return tiempo;
  }
  return null;
}

// ─── Column indices (from gregobase_structure.sql) ─────────────────────────
// gregobase_chants: id, cantusid, version, incipit, initial, office-part,
//                  mode, mode_var, transcriber, commentary, headers, gabc,
//                  gabc_verses, tex_verses, remarks, copyrighted, duplicateof
const C = { id:0, cantusid:1, incipit:3, officePart:5, mode:6,
            transcriber:8, copyrighted:15, duplicateof:16 };

// gregobase_tags:          id, tag
// gregobase_chant_tags:    chant_id, tag_id
// gregobase_sources:       id, year, period, editor, title, ...
// gregobase_chant_sources: chant_id, source_id, ...

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  // 1. Get SQL dump
  if (!existsSync(CACHE_FILE) || FORCE) {
    console.log(`Downloading SQL dump from GitHub...`);
    await download(SQL_URL, CACHE_FILE);
    console.log('Download complete.');
  } else {
    console.log(`Using cached SQL: ${CACHE_FILE}`);
    console.log('  (run with --force to re-download)');
  }

  console.log('Reading SQL into memory...');
  const sql = readFileSync(CACHE_FILE, 'utf8');
  console.log(`  ${(sql.length / 1024 / 1024).toFixed(1)} MB`);

  // 2. Parse all needed tables
  console.log('Parsing gregobase_chants...');
  const chantRows = extractTable(sql, 'gregobase_chants');
  console.log(`  ${chantRows.length} rows`);

  console.log('Parsing gregobase_tags...');
  const tagRows = extractTable(sql, 'gregobase_tags');

  console.log('Parsing gregobase_chant_tags...');
  const chantTagRows = extractTable(sql, 'gregobase_chant_tags');

  console.log('Parsing gregobase_sources...');
  const sourceRows = extractTable(sql, 'gregobase_sources');

  console.log('Parsing gregobase_chant_sources...');
  const chantSourceRows = extractTable(sql, 'gregobase_chant_sources');

  // 3. Build lookup maps
  const tagById = new Map(tagRows.map(r => [r[0], r[1]]));

  const tagsByChant = new Map();
  for (const [chantId, tagId] of chantTagRows) {
    if (!tagsByChant.has(chantId)) tagsByChant.set(chantId, []);
    const t = tagById.get(tagId);
    if (t) tagsByChant.get(chantId).push(t.toLowerCase());
  }

  const sourceById = new Map(sourceRows.map(r => ({
    id: r[0], year: r[1], period: r[2], editor: r[3], title: r[4],
  })).map(s => [s.id, s]));

  const sourceByChant = new Map();
  for (const [chantId, sourceId] of chantSourceRows) {
    if (!sourceByChant.has(chantId)) sourceByChant.set(chantId, sourceById.get(sourceId));
  }

  // 4. Convert rows to app format
  console.log('Converting to app JSON...');
  const cantos = [];
  let skipped = 0;

  for (const row of chantRows) {
    if (cantos.length >= LIMIT) break;

    const id          = row[C.id];
    const incipit     = row[C.incipit] || '';
    const officePart  = (row[C.officePart] || '').toLowerCase();
    const mode        = row[C.mode] || null;
    const copyrighted = row[C.copyrighted];
    const duplicateof = row[C.duplicateof];
    const transcriber = row[C.transcriber] || null;
    const cantusid    = row[C.cantusid] || null;

    // Skip duplicates and copyrighted material
    if (duplicateof || copyrighted) { skipped++; continue; }
    // Skip entries with no incipit
    if (!incipit.trim()) { skipped++; continue; }

    const source = sourceByChant.get(id);
    const tags   = tagsByChant.get(id) || [];

    const tiempoFromTag = tiempoFromTags(tags);

    cantos.push({
      id,
      gregobase_id: id,
      titulo:    incipit,
      idioma:    'Latín',
      tiempo:    tiempoFromTag || OFFICE_TIEMPO[officePart] || 'Canto Gregoriano',
      categoria: OFFICE_LABEL[officePart]   || officePart || 'Canto',
      modo:      MODE_LABEL[mode]           || (mode ? `Modo ${mode}` : '—'),
      fuente:    source?.title              || transcriber || '—',
      epoca:     source?.year ? String(source.year) : (source?.period || '—'),
      cantusid,
      abc:       null,
      tags,
    });
  }

  console.log(`  ${cantos.length} chants converted, ${skipped} skipped (duplicates/copyrighted)`);

  // 5. Write output
  writeFileSync(OUTPUT_FILE, JSON.stringify(cantos, null, 2), 'utf8');
  const sizeMB = (JSON.stringify(cantos).length / 1024 / 1024).toFixed(1);
  console.log(`\nOutput: ${OUTPUT_FILE}`);
  console.log(`Size:   ${sizeMB} MB  |  ${cantos.length} cantos`);
  console.log('\nDone. Now you can load /data/gregobase-cantos.json in the app.');
}

main().catch(e => { console.error('\nError:', e.message); process.exit(1); });
