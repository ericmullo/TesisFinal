import Layout from "../components/Layout";

export default function Reportes() {
  return (
    <Layout title="Reportes y Dashboard Gerencial" user="Gerencia">
      <section className="panel">
        <h2 className="section-title">Filtros de consulta</h2>

        <div className="filters">
          <div className="form-group"><label>Fecha inicio</label><input type="date" /></div>
          <div className="form-group"><label>Fecha fin</label><input type="date" /></div>
          <div className="form-group"><label>Tipo de crédito</label><select><option>Todos</option><option>Consumo</option><option>Microcrédito</option><option>Vivienda</option><option>Comercial</option></select></div>
          <div className="form-group"><label>Nivel de riesgo</label><select><option>Todos</option><option>Bajo</option><option>Medio</option><option>Alto</option></select></div>
          <button className="btn btn-green">🔎 Aplicar filtros</button>
        </div>

        <div className="export-buttons">
          <button className="btn btn-yellow">📄 Exportar PDF</button>
          <button className="btn btn-green">📊 Exportar Excel</button>
          <button className="btn btn-gray">Limpiar filtros</button>
        </div>
      </section>

      <section className="summary-cards four">
        <div className="card"><h3>Solicitudes evaluadas</h3><div className="number">128</div><p>Total del periodo seleccionado.</p></div>
        <div className="card red"><h3>Morosidad estimada</h3><div className="number">10.8%</div><p>Indicador de riesgo institucional.</p></div>
        <div className="card orange"><h3>Riesgo medio</h3><div className="number">51</div><p>Solicitudes con revisión adicional.</p></div>
        <div className="card yellow"><h3>Riesgo bajo</h3><div className="number">53</div><p>Solicitudes con perfil favorable.</p></div>
      </section>

      <section className="report-grid">
        <div className="panel">
          <h2 className="section-title">Gráfico de morosidad mensual</h2>
          <div className="chart-box">
            <div className="bar red" style={{height:180}}><small>12%</small><span>Ene</span></div>
            <div className="bar orange" style={{height:165}}><small>11%</small><span>Feb</span></div>
            <div className="bar red" style={{height:170}}><small>11.3%</small><span>Mar</span></div>
            <div className="bar orange" style={{height:150}}><small>10%</small><span>Abr</span></div>
            <div className="bar" style={{height:138}}><small>9.2%</small><span>May</span></div>
            <div className="bar" style={{height:120}}><small>8%</small><span>Jun</span></div>
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title">Reportes disponibles</h2>
          <div className="report-list">
            {[
              ["Reporte de evaluaciones","Detalle de solicitudes evaluadas por periodo."],
              ["Reporte de riesgo","Clasificación de clientes por riesgo bajo, medio y alto."],
              ["Reporte de morosidad","Análisis mensual de comportamiento crediticio."],
              ["Reporte gerencial","Resumen ejecutivo para toma de decisiones."]
            ].map(([t,p]) => <div className="report-item" key={t}><strong>{t}</strong><p>{p}</p></div>)}
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Resumen de reportes generados</h2>
        <table className="table">
          <thead><tr><th>Reporte</th><th>Periodo</th><th>Solicitudes</th><th>Riesgo predominante</th><th>Formato</th></tr></thead>
          <tbody>
            <tr><td>Evaluaciones crediticias</td><td>Enero - Marzo 2026</td><td>87</td><td><span className="badge medio">Medio</span></td><td>PDF / Excel</td></tr>
            <tr><td>Indicadores de morosidad</td><td>Abril - Junio 2026</td><td>128</td><td><span className="badge bajo">Bajo</span></td><td>PDF / Excel</td></tr>
            <tr><td>Clientes con riesgo alto</td><td>Junio 2026</td><td>24</td><td><span className="badge alto">Alto</span></td><td>PDF / Excel</td></tr>
          </tbody>
        </table>
      </section>
    </Layout>
  );
}
