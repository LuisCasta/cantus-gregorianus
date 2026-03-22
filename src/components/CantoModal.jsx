import { useEffect, useRef, useCallback, useState } from 'react';
import * as ABCJS from 'abcjs';
import 'abcjs/abcjs-audio.css';
import { TIEMPO_CONFIG } from '../utils/tiempos';

const SOUNDFONT_URL = 'https://paulrosen.github.io/midi-js-soundfonts/abcjs/';

export default function CantoModal({ canto, onClose }) {
  const synthRef = useRef(null);
  const scoreId  = 'modal-score-abcjs';

  const [gregoSvg,      setGregoSvg]      = useState(null);
  const [gregoLoading,  setGregoLoading]  = useState(false);
  const [gregoError,    setGregoError]    = useState(false);

  // Fetch SVG from GregoBase when gregobase_id exists
  useEffect(() => {
    if (!canto?.gregobase_id) return;
    setGregoSvg(null);
    setGregoError(false);
    setGregoLoading(true);

    fetch(`/gregobase/download.php?id=${canto.gregobase_id}&format=svg`)
      .then(r => {
        if (!r.ok) throw new Error();
        return r.text();
      })
      .then(svg => {
        setGregoSvg(svg);
        setGregoLoading(false);
      })
      .catch(() => {
        setGregoError(true);
        setGregoLoading(false);
      });
  }, [canto?.gregobase_id]);

  const stopAudio = useCallback(() => {
    if (synthRef.current) {
      try { synthRef.current.pause(); } catch (_) {}
      synthRef.current = null;
    }
  }, []);

  // Render ABCjs score + audio
  useEffect(() => {
    if (!canto?.abc) return;
    const timer = setTimeout(() => {
      const visualObjs = ABCJS.renderAbc(scoreId, canto.abc, {
        staffwidth: Math.min(580, window.innerWidth - 64),
        scale: 1,
        responsive: 'resize',
        paddingright: 0,
        paddingleft: 0,
        add_classes: true,
      });

      if (ABCJS.synth && ABCJS.synth.supportsAudio()) {
        try {
          synthRef.current = new ABCJS.synth.SynthController();
          synthRef.current.load('#modal-audio-player', null, {
            displayRestart: true,
            displayPlay: true,
            displayProgress: true,
            displayWarp: false,
          });
          synthRef.current.setTune(visualObjs[0], false, {
            soundFontUrl: SOUNDFONT_URL,
          }).catch(() => {
            const el = document.getElementById('modal-audio-player');
            if (el) el.innerHTML = '<p class="audio-note">Audio no disponible — verifica tu conexión.</p>';
          });
        } catch (_) {}
      }
    }, 40);

    return () => {
      clearTimeout(timer);
      stopAudio();
    };
  }, [canto?.abc, stopAudio]);

  // ESC key + body scroll lock
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!canto) return null;

  const cfg = TIEMPO_CONFIG[canto.tiempo] || { color: '#888', label: canto.tiempo };
  const metaItems = [
    { label: 'Tiempo',    value: canto.tiempo },
    { label: 'Categoría', value: canto.categoria },
    { label: 'Modo',      value: canto.modo },
    { label: 'Idioma',    value: canto.idioma },
    { label: 'Época',     value: canto.epoca || '—' },
    { label: 'Fuente',    value: canto.fuente || '—' },
  ];

  return (
    <div
      className="modal-overlay"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      aria-modal="true"
      role="dialog"
    >
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">&times;</button>
        <button
          className="modal-share"
          aria-label="Compartir"
          onClick={() => {
            const url = window.location.href;
            if (navigator.share) {
              navigator.share({ title: canto.titulo, url });
            } else {
              navigator.clipboard?.writeText(url);
              const wa = `https://wa.me/?text=${encodeURIComponent(canto.titulo + '\n' + url)}`;
              window.open(wa, '_blank');
            }
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
          Compartir
        </button>

        <div className="modal-header">
          <div className="modal-header-badges">
            <span className="modal-badge" style={{ background: `${cfg.color}1a`, color: cfg.color, borderColor: `${cfg.color}44` }}>
              {cfg.label || canto.tiempo}
            </span>
            <span className="modal-badge" style={{ background: 'rgba(26,37,64,.08)', color: '#1a2540', borderColor: 'rgba(26,37,64,.2)' }}>
              {canto.modo}
            </span>
            {canto.gregobase_id && (
              <span className="modal-badge" style={{ background: 'rgba(45,106,45,.08)', color: '#2d6a2d', borderColor: 'rgba(45,106,45,.25)' }}>
                GregoBase #{canto.gregobase_id}
              </span>
            )}
          </div>
          <h2 className="modal-title">{canto.titulo}</h2>
          {canto.subtitulo && <p className="modal-subtitulo">{canto.subtitulo}</p>}
          {canto.fuente && (
            <p className="modal-autor">{canto.fuente}{canto.epoca ? ` · ${canto.epoca}` : ''}</p>
          )}
        </div>

        <div className="modal-meta">
          {metaItems.map(item => (
            <div key={item.label} className="modal-meta-item">
              <span className="modal-meta-label">{item.label}</span>
              <span className="modal-meta-value">{item.value}</span>
            </div>
          ))}
        </div>

        {/* ── Notación gregoriana auténtica (GregoBase SVG) ── */}
        {canto.gregobase_id && (
          <div className="modal-score-section">
            <div className="modal-section-header">
              <span className="modal-section-icon">𝕲</span>
              <h3 className="modal-section-title">Notación Gregoriana</h3>
              <div className="grego-actions">
                <a
                  href={`/gregobase/download.php?id=${canto.gregobase_id}&format=pdf`}
                  download={`${canto.titulo || 'canto'}.pdf`}
                  className="grego-download-btn"
                  title="Descargar partitura PDF"
                >
                  ↓ PDF
                </a>
                <a
                  href={`/gregobase/download.php?id=${canto.gregobase_id}&format=gabc`}
                  download={`${canto.titulo || 'canto'}.gabc`}
                  className="grego-download-btn"
                  title="Descargar notación gabc"
                >
                  ↓ GABC
                </a>
                <a
                  href={`https://gregobase.selapa.net/chant.php?id=${canto.gregobase_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grego-download-btn grego-link-btn"
                  title="Ver en GregoBase"
                >
                  Ver en GregoBase ↗
                </a>
              </div>
            </div>

            {gregoLoading && (
              <p className="score-unavailable">Cargando notación gregoriana…</p>
            )}
            {gregoError && (
              <p className="score-unavailable">No se pudo cargar la notación. <a href={`https://gregobase.selapa.net/chant.php?id=${canto.gregobase_id}`} target="_blank" rel="noopener noreferrer">Ver en GregoBase ↗</a></p>
            )}
            {gregoSvg && !gregoLoading && (
              <div
                className="modal-score grego-svg"
                dangerouslySetInnerHTML={{ __html: gregoSvg }}
              />
            )}
          </div>
        )}

        {/* ── Partitura ABC + Audio ── */}
        {canto.abc && (
          <div className="modal-score-section">
            <div className="modal-section-header">
              <span className="modal-section-icon">&#9834;</span>
              <h3 className="modal-section-title">{canto.gregobase_id ? 'Partitura Moderna + Audio' : 'Partitura'}</h3>
            </div>
            <div id={scoreId} className="modal-score" />
            <div id="modal-audio-player" className="modal-audio" />
          </div>
        )}

        <div className="modal-body">
          <div className="modal-section-header">
            <span className="modal-section-icon">&#9676;</span>
            <h3 className="modal-section-title">Texto {canto.idioma === 'Latín' ? 'Latino' : canto.idioma}</h3>
          </div>
          <pre className="modal-letra">{canto.letra || ''}</pre>

          {canto.traduccion && (
            <>
              <div className="modal-section-header modal-section-header-mt">
                <span className="modal-section-icon">&#9673;</span>
                <h3 className="modal-section-title">Traducción</h3>
              </div>
              <p className="modal-traduccion">{canto.traduccion}</p>
            </>
          )}
        </div>

        {canto.tags?.length > 0 && (
          <div className="modal-tags">
            {canto.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
