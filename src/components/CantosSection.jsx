import { useState, useMemo, useEffect } from 'react';
import { ORDEN_TIEMPOS, TIEMPO_CONFIG, getUniqueTiempos } from '../utils/tiempos';

function CantoCard({ canto, onClick }) {
  const cfg = TIEMPO_CONFIG[canto.tiempo] || { color: '#888', label: canto.tiempo };
  return (
    <div
      className={`canto-card${canto.popular ? ' popular' : ''}`}
      role="button"
      tabIndex={0}
      onClick={() => onClick(canto)}
      onKeyDown={e => e.key === 'Enter' && onClick(canto)}
    >
      <div className="card-top">
        <span
          className="card-badge card-badge-tiempo"
          style={{ background: `${cfg.color}1a`, color: cfg.color, borderColor: `${cfg.color}44` }}
        >
          {cfg.icon} {cfg.label || canto.tiempo}
        </span>
        <div className="card-top-right">
          {canto.nuevo && <span className="card-badge-nuevo">Recién añadido</span>}
          {canto.abc && <span className="card-badge-score" title="Incluye partitura y audio">&#119070;</span>}
        </div>
      </div>
      <div className="card-titles">
        <h3 className="card-title">{canto.titulo}</h3>
        {canto.subtitulo && <p className="card-subtitulo">{canto.subtitulo}</p>}
      </div>
      <p className="card-meta-row">
        <span className="card-modo">{canto.modo}</span>
        <span className="card-dot">·</span>
        <span className="card-idioma">{canto.idioma}</span>
        {canto.epoca && <><span className="card-dot">·</span><span className="card-epoca">{canto.epoca}</span></>}
      </p>
      <p className="card-preview">{canto.descripcion || ''}</p>
      <div className="card-footer">
        <span className="card-fuente">{canto.fuente || ''}</span>
        <span className="card-cta">Ver canto →</span>
      </div>
    </div>
  );
}

const PAGE_SIZE = 24;

export default function CantosSection({ cantos, onSelectCanto, activeTiempo, setActiveTiempo, gregoLoading }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('tiempo');
  const [activeIdioma, setActiveIdioma] = useState('all');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination when filters change
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [search, activeTiempo, sortBy, activeIdioma]);

  const tiempos = useMemo(() => getUniqueTiempos(cantos), [cantos]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = cantos.filter(c => {
      const matchTiempo = activeTiempo === 'all' || c.tiempo === activeTiempo;
      const matchIdioma = activeIdioma === 'all' || c.idioma === activeIdioma;
      const matchSearch = !q ||
        c.titulo.toLowerCase().includes(q) ||
        (c.subtitulo && c.subtitulo.toLowerCase().includes(q)) ||
        (c.fuente && c.fuente.toLowerCase().includes(q)) ||
        c.tiempo.toLowerCase().includes(q) ||
        c.categoria.toLowerCase().includes(q) ||
        (c.tags && c.tags.some(t => t.toLowerCase().includes(q)));
      return matchTiempo && matchIdioma && matchSearch;
    });

    list = [...list].sort((a, b) => {
      if (sortBy === 'titulo') return a.titulo.localeCompare(b.titulo, 'es');
      if (sortBy === 'popular') return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      if (sortBy === 'modo') return a.modo.localeCompare(b.modo, 'es');
      const ia = ORDEN_TIEMPOS.indexOf(a.tiempo);
      const ib = ORDEN_TIEMPOS.indexOf(b.tiempo);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    });
    return list;
  }, [cantos, search, sortBy, activeTiempo, activeIdioma]);

  return (
    <section className="section" id="cantos">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Graduale Romanum · Liber Usualis</p>
          <h2 className="section-title">Cantos Gregorianos</h2>
          <p className="section-desc">Repertorio de canto gregoriano y música sacra tradicional, organizado por tiempos litúrgicos del Rito Romano.</p>
        </div>

        <div className="controls-bar">
          <div className="search-wrapper">
            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="search"
              className="search-input"
              placeholder="Buscar canto, himno, antífona..."
              autoComplete="off"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="idioma-filters">
          {[
            { key: 'all', label: 'Todos los idiomas' },
            { key: 'Latín', label: 'Latín' },
            { key: 'Español', label: 'Español' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`idioma-btn${activeIdioma === key ? ' active' : ''}`}
              onClick={() => setActiveIdioma(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="tiempo-filters">
          <button
            className={`tiempo-btn${activeTiempo === 'all' ? ' active' : ''}`}
            onClick={() => setActiveTiempo('all')}
          >
            <span className="tiempo-dot tiempo-all" />Todos
          </button>
          {tiempos.map(t => {
            const cfg = TIEMPO_CONFIG[t] || { dot: '#888', label: t };
            return (
              <button
                key={t}
                className={`tiempo-btn${activeTiempo === t ? ' active' : ''}`}
                onClick={() => setActiveTiempo(t)}
              >
                <span className="tiempo-dot" style={{ background: cfg.dot }} />
                {cfg.label || t}
              </button>
            );
          })}
        </div>

        {gregoLoading && (
          <div className="grego-loading-bar">
            <span className="grego-loading-dot" />
            Cargando catálogo completo de GregoBase…
          </div>
        )}

        <div className="sort-bar">
          <span className="results-count">{filtered.length} canto{filtered.length !== 1 ? 's' : ''}</span>
          <div className="sort-controls">
            <label htmlFor="sort-select" className="sort-label">Ordenar:</label>
            <select id="sort-select" className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="tiempo">Por Tiempo Litúrgico</option>
              <option value="titulo">Título (A-Z)</option>
              <option value="popular">Más populares</option>
              <option value="modo">Por Modo Gregoriano</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">&#9835;</div>
            <p>No se encontraron cantos con ese criterio.</p>
            <button className="btn btn-outline-dark btn-sm" onClick={() => { setSearch(''); setActiveTiempo('all'); }}>
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <>
            <div className="cards-grid">
              {filtered.slice(0, visibleCount).map(c => (
                <CantoCard key={c.gregobase_id ? `g${c.gregobase_id}` : `m${c.id}`} canto={c} onClick={onSelectCanto} />
              ))}
            </div>
            {visibleCount < filtered.length && (
              <div className="load-more-wrap">
                <button
                  className="btn btn-outline-dark"
                  onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                >
                  Mostrar {Math.min(PAGE_SIZE, filtered.length - visibleCount)} más
                  <span className="load-more-total"> · {filtered.length - visibleCount} restantes</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
