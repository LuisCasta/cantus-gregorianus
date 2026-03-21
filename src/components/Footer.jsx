export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="logo-symbol">&#9768;</span>
          <span className="footer-brand-name">AMDG</span>
          <p className="footer-tagline">Ad Maiorem Dei Gloriam</p>
        </div>
        <div className="footer-links">
          {[['#cantos','Cantos'],['#devociones','Devociones'],['#tiempos','Año Litúrgico'],['#acerca','Acerca']].map(([href, label]) => (
            <a key={href} href={href} className="footer-link">{label}</a>
          ))}
        </div>
        <p className="footer-note">
          Ritus Romanus Traditionalis &bull; Todos los textos son de dominio público o uso litúrgico libre
        </p>
      </div>
    </footer>
  );
}
