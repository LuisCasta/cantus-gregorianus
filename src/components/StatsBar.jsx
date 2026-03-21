import { useState, useEffect } from 'react';

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = Math.max(1, Math.floor(target / 30));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, duration / 30);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export default function StatsBar({ cantos, devociones }) {
  const tiemposUnicos = new Set(cantos.map(c => c.tiempo)).size;
  const conPartitura = cantos.filter(c => c.abc).length;

  const nCantos     = useCountUp(cantos.length);
  const nTiempos    = useCountUp(tiemposUnicos);
  const nDevociones = useCountUp(devociones.length);
  const nPartituras = useCountUp(conPartitura);

  const items = [
    { id: 'cantos',     n: nCantos,     label: 'Cantos' },
    { id: 'tiempos',    n: nTiempos,    label: 'Tiempos Litúrgicos' },
    { id: 'devociones', n: nDevociones, label: 'Devociones' },
    { id: 'partituras', n: nPartituras, label: 'Partituras' },
  ];

  return (
    <div className="stats-bar">
      <div className="container stats-inner">
        {items.map((item, i) => (
          <>
            <div key={item.id} className="stat-item">
              <span className="stat-number">{item.n}</span>
              <span className="stat-label">{item.label}</span>
            </div>
            {i < items.length - 1 && <div key={`div-${i}`} className="stat-divider" />}
          </>
        ))}
      </div>
    </div>
  );
}
