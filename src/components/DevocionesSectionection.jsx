import { useState, useMemo } from 'react';
import { ICONOS_DEV } from '../utils/tiempos';

function DevCard({ dev, onClick }) {
  return (
    <div
      className="devocion-card"
      role="button"
      tabIndex={0}
      onClick={() => onClick(dev)}
      onKeyDown={e => e.key === 'Enter' && onClick(dev)}
    >
      <div className="devocion-icon">{ICONOS_DEV[dev.icono] || '✠'}</div>
      <span className="devocion-tipo-badge">{dev.tipo}</span>
      <h3 className="devocion-title">{dev.titulo}</h3>
      <p className="devocion-desc">{dev.descripcion}</p>
      <div className="devocion-footer">
        <span className="devocion-duracion">⏱ {dev.duracion}</span>
        <span className="devocion-cta">Ver →</span>
      </div>
    </div>
  );
}

export default function DevocionesSectionection({ devociones, onSelectDev }) {
  const [activeTipo, setActiveTipo] = useState('all');
  const tipos = useMemo(() => [...new Set(devociones.map(d => d.tipo))].sort(), [devociones]);

  const visible = activeTipo === 'all'
    ? devociones
    : devociones.filter(d => d.tipo === activeTipo);

  return (
    <section className="section section-alt" id="devociones">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Pietas Catholica Traditionalis</p>
          <h2 className="section-title">Devociones</h2>
          <p className="section-desc">Oraciones, novenas, letanías y prácticas de la espiritualidad católica tradicional.</p>
        </div>

        <div className="filter-tabs filter-tabs-dev" role="tablist">
          <button className={`filter-tab${activeTipo === 'all' ? ' active' : ''}`} onClick={() => setActiveTipo('all')} role="tab">Todas</button>
          {tipos.map(t => (
            <button key={t} className={`filter-tab${activeTipo === t ? ' active' : ''}`} onClick={() => setActiveTipo(t)} role="tab">{t}</button>
          ))}
        </div>

        <div className="devociones-grid">
          {visible.map(d => <DevCard key={d.id} dev={d} onClick={onSelectDev} />)}
        </div>
      </div>
    </section>
  );
}
