export const ORDEN_TIEMPOS = [
  'Misa',
  'Adviento',
  'Navidad',
  'Cuaresma y Semana Santa',
  'Semana Santa',
  'Pascua',
  'Pentecostés',
  'Santísimo Sacramento',
  'Virgen María',
  'San José',
  'Santos',
  'Difuntos',
  'Tiempo Ordinario',
  'Oficio Divino',
  'Canto Gregoriano',
];

export const TIEMPO_CONFIG = {
  'Misa':                    { color: '#b8960c', dot: '#d4aa22', label: 'Misa',             desc: 'Ordinario y Propio de la Misa',               icon: '✠' },
  'Adviento':                { color: '#5d3a7a', dot: '#7b52a0', label: 'Adviento',          desc: 'Preparación a la Navidad',                    icon: '◌' },
  'Navidad':                 { color: '#c62828', dot: '#e53935', label: 'Navidad',           desc: 'Natividad del Señor y Epifanía',              icon: '★' },
  'Cuaresma y Semana Santa': { color: '#4a2f6b', dot: '#6a4190', label: 'Cuaresma',         desc: 'Penitencia, conversión y Pasión',             icon: '†' },
  'Semana Santa':            { color: '#4a2f6b', dot: '#6a4190', label: 'Semana Santa',      desc: 'Pasión, Muerte y Sepultura del Señor',        icon: '†' },
  'Pascua':                  { color: '#f5c518', dot: '#e8b400', label: 'Pascua',            desc: 'Resurrección del Señor',                      icon: '☀' },
  'Pentecostés':             { color: '#c62828', dot: '#e53935', label: 'Pentecostés',       desc: 'Venida del Espíritu Santo',                   icon: '🔥' },
  'Santísimo Sacramento':    { color: '#b8960c', dot: '#d4aa22', label: 'Corpus Christi',    desc: 'Adoración Eucarística y Corpus Christi',      icon: '◎' },
  'Virgen María':            { color: '#3a5fa0', dot: '#4a75c4', label: 'Virgen María',      desc: 'Himnos y Antífonas Marianas',                 icon: '✦' },
  'Difuntos':                { color: '#4a4a4a', dot: '#6b6b6b', label: 'Difuntos',          desc: 'Misa de Réquiem y sufragios',                 icon: '☩' },
  'Tiempo Ordinario':        { color: '#2d6a2d', dot: '#3d8f3d', label: 'Tiempo Ordinario', desc: 'Domingos y ferias del año',                   icon: '◆' },
  'Oficio Divino':           { color: '#5a4a1a', dot: '#7a6428', label: 'Oficio Divino',    desc: 'Liturgia de las Horas',                       icon: '◉' },
  'Canto Gregoriano':        { color: '#3a3a5a', dot: '#555580', label: 'Gregoriano',       desc: 'Repertorio gregoriano general',               icon: '𝕲' },
};

export const ICONOS_DEV = {
  rosario: '📿', cruz: '✠', custodia: '☀', campana: '🔔',
  novena: '📖', libro: '📚', maria: '✦', angel: '✧', corazon: '♥',
};

export function getUniqueTiempos(cantos) {
  const found = [];
  ORDEN_TIEMPOS.forEach(t => {
    if (cantos.some(c => c.tiempo === t)) found.push(t);
  });
  cantos.forEach(c => {
    if (!found.includes(c.tiempo)) found.push(c.tiempo);
  });
  return found;
}
