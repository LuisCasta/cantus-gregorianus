import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';

import Header from './components/Header';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import CantosSection from './components/CantosSection';
import CantoModal from './components/CantoModal';
import DevocionesSectionection from './components/DevocionesSectionection';
import DevModal from './components/DevModal';
import TiemposSection from './components/TiemposSection';
import AcercaSection from './components/AcercaSection';
import Footer from './components/Footer';

export default function App() {
  const [cantos, setCantos]           = useState([]);
  const [devociones, setDevociones]   = useState([]);
  const [gregoLoading, setGregoLoading] = useState(false);
  const [selectedCanto, setSelectedCanto] = useState(null);
  const [selectedDev, setSelectedDev]     = useState(null);
  const [activeTiempo, setActiveTiempo]   = useState('all');
  const cantosSectionRef = useRef(null);

  useEffect(() => {
    Promise.all([
      fetch('/data/cantos.json').then(r => r.json()),
      fetch('/data/devociones.json').then(r => r.json()),
    ]).then(([manual, d]) => {
      setCantos(manual);
      setDevociones(d);

      // Load full GregoBase catalog lazily after initial render
      setGregoLoading(true);
      fetch('/data/gregobase-cantos.json')
        .then(r => r.json())
        .then(gregoCantos => {
          const manualIds = new Set(manual.map(c => c.gregobase_id).filter(Boolean));
          const extra = gregoCantos.filter(g => !manualIds.has(g.gregobase_id));
          setCantos([...manual, ...extra]);
          setGregoLoading(false);
        })
        .catch(() => setGregoLoading(false));
    });
  }, []);

  // Sync selectedCanto with ?canto= URL param
  useEffect(() => {
    if (!cantos.length) return;
    const id = new URLSearchParams(window.location.search).get('canto');
    if (id) {
      const found = cantos.find(c => String(c.id) === id || String(c.gregobase_id) === id);
      if (found) setSelectedCanto(found);
    }
  }, [cantos]);

  const openCanto = useCallback((canto) => {
    setSelectedCanto(canto);
    const url = new URL(window.location);
    url.searchParams.set('canto', canto.gregobase_id ?? canto.id);
    window.history.pushState({}, '', url);
  }, []);

  const closeCanto = useCallback(() => {
    setSelectedCanto(null);
    const url = new URL(window.location);
    url.searchParams.delete('canto');
    window.history.pushState({}, '', url);
  }, []);

  const handleFilterTiempo = useCallback((tiempo) => {
    setActiveTiempo(tiempo);
    document.getElementById('cantos')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <>
      <Header />
      <Hero />
      <StatsBar cantos={cantos} devociones={devociones} />
      <CantosSection
        cantos={cantos}
        onSelectCanto={openCanto}
        activeTiempo={activeTiempo}
        setActiveTiempo={setActiveTiempo}
        gregoLoading={gregoLoading}
      />
      <DevocionesSectionection devociones={devociones} onSelectDev={setSelectedDev} />
      <TiemposSection cantos={cantos} onFilterTiempo={handleFilterTiempo} />
      <AcercaSection />
      <Footer />

      {selectedCanto && (
        <CantoModal canto={selectedCanto} onClose={closeCanto} />
      )}
      {selectedDev && (
        <DevModal dev={selectedDev} onClose={() => setSelectedDev(null)} />
      )}
    </>
  );
}
