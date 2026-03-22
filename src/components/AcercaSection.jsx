export default function AcercaSection() {
  return (
    <section className="section section-alt" id="acerca">
      <div className="container">
        <div className="section-header">
          <p className="section-eyebrow">Sobre este portal</p>
          <h2 className="section-title">Acerca de AMDG</h2>
        </div>
        <div className="acerca-grid">
          <div className="acerca-text">
            <p><strong>AMDG</strong> — <em>Ad Maiorem Dei Gloriam</em> — es el lema de la Compañía de Jesús y el principio que inspira este portal: todo para la mayor gloria de Dios.</p>
            <p>Este portal recoge el repertorio de <strong>canto gregoriano</strong> y música sacra de la tradición litúrgica romana, principalmente del <em>Graduale Romanum</em>, el <em>Liber Usualis</em> y el <em>Antiphonale Romanum</em>.</p>
            <p>El canto gregoriano, declarado por la Iglesia como «el canto propio de la liturgia romana» (Sacrosanctum Concilium, 116), se caracteriza por su monofonía, su texto latino y su íntima unión con la oración litúrgica.</p>
            <p>Las <strong>partituras</strong> incluidas se presentan en notación musical moderna (adaptación del Graduale) para facilitar su estudio y práctica.</p>
          </div>
          <div className="acerca-info">
            <div className="info-card">
              <h3 className="info-card-title">Modos Gregorianos</h3>
              <ul className="modos-list">
                {[
                  ['I','Dórico — Re (Auténtico)'],['II','Hipodórico — La (Plagal)'],
                  ['III','Frigio — Mi (Auténtico)'],['IV','Hipofrigio — Si (Plagal)'],
                  ['V','Lidio — Fa (Auténtico)'],['VI','Hipolidio — Do (Plagal)'],
                  ['VII','Mixolidio — Sol (Auténtico)'],['VIII','Hipomixolidio — Re (Plagal)'],
                ].map(([num, desc]) => (
                  <li key={num}><span className="modo-num">{num}</span><span>{desc}</span></li>
                ))}
              </ul>
            </div>
            <div className="info-card">
              <h3 className="info-card-title">Fuentes Litúrgicas</h3>
              <ul className="fuentes-list">
                {['Graduale Romanum (1908, Ed. vaticana)','Liber Usualis (Solesmes)','Antiphonale Romanum','Missale Romanum (1962)','Breviarium Romanum'].map(f => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
