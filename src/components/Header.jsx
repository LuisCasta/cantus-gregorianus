import { useState, useEffect } from 'react';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = document.querySelectorAll('section[id]');
      let current = '';
      sections.forEach(sec => {
        if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`} id="site-header">
      <div className="header-inner container">
        <a href="#hero" className="logo">
          <span className="logo-symbol">&#9768;</span>
          <span className="logo-text">AMDG</span>
          <span className="logo-sub">Ad Maiorem Dei Gloriam</span>
        </a>
        <nav className={`main-nav${menuOpen ? ' open' : ''}`} id="main-nav">
          {[['cantos','Cantos'],['devociones','Devociones'],['tiempos','Año Litúrgico'],['acerca','Acerca']].map(([id, label]) => (
            <a key={id} href={`#${id}`} className={`nav-link${activeSection === id ? ' active' : ''}`} data-section={id} onClick={closeMenu}>{label}</a>
          ))}
        </nav>
        <button className={`hamburger${menuOpen ? ' open' : ''}`} id="hamburger" aria-label="Abrir menú" onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
