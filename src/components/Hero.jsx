export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-overlay" />
      <div className="hero-content container">
        <p className="hero-eyebrow">Ritus Romanus Traditionalis</p>
        <h1 className="hero-title">Cantus Gregorianus<br /><em>et Devotiones</em></h1>
        <p className="hero-desc">
          Cantos gregorianos, himnos latinos y devociones de la tradición católica anterior al Concilio Vaticano II.
          Ordenados por tiempos litúrgicos para el servicio de la oración y la liturgia.
        </p>
        <div className="hero-actions">
          <a href="#cantos" className="btn btn-primary">Cantos Gregorianos</a>
          <a href="#devociones" className="btn btn-outline">Devociones</a>
        </div>
        <div className="hero-badges">
          {['Latín','Canto Gregoriano','Partituras','Pre-1964'].map(b => (
            <span key={b} className="hero-badge">{b}</span>
          ))}
        </div>
      </div>
      <div className="hero-scroll-indicator"><span /></div>
    </section>
  );
}
