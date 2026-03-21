import { TIEMPO_CONFIG, getUniqueTiempos } from '../utils/tiempos';

export default function TiemposSection({ cantos, onFilterTiempo }) {
  const tiempos = getUniqueTiempos(cantos);

  return (
    <section className="section" id="tiempos">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Calendarium Romanum</p>
          <h2 className="section-title">Año Litúrgico</h2>
          <p className="section-desc">El año litúrgico del Rito Romano distribuye los misterios de la Redención en el curso del año.</p>
        </div>
        <div className="tiempos-grid">
          {tiempos.map(t => {
            const cfg = TIEMPO_CONFIG[t] || { color: '#888', dot: '#888', label: t, desc: '', icon: '◆' };
            const count = cantos.filter(c => c.tiempo === t).length;
            return (
              <div
                key={t}
                className="tiempo-tile"
                style={{ '--tiempo-color': cfg.dot }}
                onClick={() => onFilterTiempo(t)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && onFilterTiempo(t)}
              >
                <div className="tiempo-tile-icon">{cfg.icon}</div>
                <div className="tiempo-tile-body">
                  <h3 className="tiempo-tile-name">{cfg.label || t}</h3>
                  <p className="tiempo-tile-desc">{cfg.desc || ''}</p>
                  <span className="tiempo-tile-count">{count} canto{count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
