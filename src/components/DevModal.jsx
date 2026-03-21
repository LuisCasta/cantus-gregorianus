import { useEffect } from 'react';

function DevBlock({ title, text }) {
  return (
    <div>
      {title && <p className="modal-dev-list-title">{title}</p>}
      <div className="modal-dev-text" style={{ whiteSpace: 'pre-wrap' }}>{text}</div>
    </div>
  );
}

function DevList({ title, items, numbered = true }) {
  return (
    <div>
      {title && <p className="modal-dev-list-title">{title}</p>}
      <div className="modal-dev-list">
        {items.map((item, i) => (
          <div key={i} className="modal-dev-list-item">
            {numbered && <span className="modal-dev-list-num">{i + 1}</span>}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DevModal({ dev, onClose }) {
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!dev) return null;

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }} aria-modal="true" role="dialog">
      <div className="modal-card modal-card-dev">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>

        <div className="modal-header">
          <span className="modal-badge modal-badge-dev">{dev.tipo}</span>
          <h2 className="modal-title">{dev.titulo}</h2>
          <div className="modal-dev-meta">
            <span className="modal-dev-meta-badge">⏱ {dev.duracion}</span>
            <span className="modal-dev-meta-badge">📅 {dev.dias}</span>
          </div>
        </div>

        <div className="modal-body">
          <p className="modal-dev-desc">{dev.descripcion}</p>

          {dev.texto_introductorio && <DevBlock title="Modo de Rezar" text={dev.texto_introductorio} />}

          {dev.misterios && (
            <>
              <p className="modal-dev-list-title">Los Misterios del Rosario</p>
              <div className="misterios-grid">
                {dev.misterios.map(m => (
                  <div key={m.nombre} className="misterio-block">
                    <p className="misterio-nombre">{m.nombre}</p>
                    <p className="misterio-dias">{m.dias}</p>
                    <ul className="misterio-list">{m.lista.map(i => <li key={i}>{i}</li>)}</ul>
                  </div>
                ))}
              </div>
              {dev.jaculatoria && <div className="modal-dev-text">{dev.jaculatoria}</div>}
            </>
          )}

          {dev.estaciones && <DevList title="Las XIV Estaciones" items={dev.estaciones} />}

          {dev.texto && <DevBlock text={dev.texto} />}

          {dev.horas && <DevList title="Las Horas del Oficio" items={dev.horas} />}

          {dev.pasos && <DevList title="Los Pasos" items={dev.pasos} />}

          {dev.estructura && <DevList title="Estructura" items={dev.estructura} />}

          {dev.oraciones && (
            <>
              <DevList title="Oraciones sugeridas" items={dev.oraciones} />
              {dev.jaculatorias && (
                <>
                  <p className="modal-dev-list-title">Jaculatorias</p>
                  {dev.jaculatorias.map((j, i) => <div key={i} className="modal-dev-text">{j}</div>)}
                </>
              )}
            </>
          )}

          {dev.oracion_principal && <DevBlock title="Oración" text={dev.oracion_principal} />}
        </div>

        {dev.tags?.length > 0 && (
          <div className="modal-tags">
            {dev.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
