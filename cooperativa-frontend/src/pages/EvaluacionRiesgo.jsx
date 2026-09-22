import Layout from "../components/Layout";

export default function EvaluacionRiesgo() {
  return (
    <Layout title="Evaluación de Riesgo Crediticio">
      <section className="panel">
        <h2 className="section-title">Información de la solicitud</h2>
        <div className="client-box">
          Solicitud: SOL-2026-001 | Cliente: Juan Pérez | Tipo de crédito: Microcrédito | Monto solicitado: $5.000
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">🤖 Evaluación mediante Inteligencia Artificial</h2>
        <div className="bureau-grid">
          <InfoItem title="Modelo utilizado" value="Random Forest" />
          <InfoItem title="Estado del análisis" value="Análisis completado" extra="yellow-left" />
          <InfoItem title="Tiempo de procesamiento" value="0.42 segundos" extra="orange-left" />
          <InfoItem title="Fecha del análisis" value="15/04/2026 - 14:32" />
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Información del Buró de Crédito</h2>
        <div className="bureau-grid">
          <InfoItem title="Buró consultado" value="Sí" />
          <InfoItem title="Fecha de consulta" value="15/04/2026" />
          <InfoItem title="Score externo" value="720" />
          <InfoItem title="Estado de consulta" value="Consulta exitosa" />
        </div>
      </section>

      <section className="cards four-cards">
        <MetricCard title="Historial crediticio" value="Bueno" text="Pagos cumplidos en registros anteriores." />
        <MetricCard title="Nivel de endeudamiento" value="34%" text="Dentro del rango permitido." extra="orange" />
        <MetricCard title="Score IA" value="720" text="Puntaje predictivo calculado por el modelo." extra="yellow" />
        <MetricCard title="Capacidad de pago" value="$280" text="Capacidad mensual estimada." />
      </section>

      <section className="risk-grid">
        <div className="panel">
          <h2 className="section-title">Historial crediticio</h2>
          <div className="history-list">
            <History title="Crédito anterior">Pagado correctamente sin retrasos importantes.</History>
            <History title="Obligaciones activas" extra="warning">Mantiene una obligación financiera vigente.</History>
            <History title="Comportamiento de pago">Historial favorable según registros consultados.</History>
            <History title="Alertas" extra="danger">No se registran alertas críticas recientes.</History>
          </div>
        </div>

        <div className="panel">
          <h2 className="section-title">Resultado generado por IA</h2>
          <div className="score-box">
            <div className="circle">
              <div className="circle-inner"><span>720</span>Score IA</div>
            </div>

            <div className="risk-badges">
              <div className="risk low">Bajo</div>
              <div className="risk medium">Medio</div>
              <div className="risk high">Alto</div>
            </div>

            <div className="prediction-grid">
              <Prediction value="8%" text="Probabilidad de mora" />
              <Prediction value="96%" text="Confianza del modelo" />
              <Prediction value="Aprobar" text="Recomendación IA" />
            </div>

            <div className="result-box">
              <h3>Clasificación sugerida: Riesgo Bajo</h3>
              <p>El modelo de Inteligencia Artificial detecta un perfil financiero favorable. El cliente presenta buen historial crediticio, endeudamiento controlado y capacidad de pago suficiente. Se recomienda continuar con la aprobación del crédito.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Variables analizadas por el modelo IA</h2>
        <div className="variables-grid">
          {["Historial crediticio","Ingresos mensuales","Egresos mensuales","Nivel de endeudamiento","Capacidad de pago","Score externo del buró","Tipo de crédito","Obligaciones activas","Comportamiento de pago"].map(v => <div className="variable" key={v}>✔ {v}</div>)}
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Explicación de la decisión IA</h2>
        <div className="explain-box">
          <p><strong>Factores principales:</strong> el modelo identificó que el cliente mantiene un historial crediticio positivo, un nivel de endeudamiento del 34% y un score externo de 720. Estos factores reducen la probabilidad de morosidad y aumentan la viabilidad de aprobación.</p>
          <p><strong>Interpretación:</strong> la recomendación generada por la IA sirve como apoyo para el analista de crédito. La decisión final debe ser confirmada por el personal autorizado de la cooperativa.</p>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">Acciones de evaluación</h2>
        <div className="actions">
          <button className="btn btn-gray">Cancelar</button>
          <button className="btn btn-yellow">🤖 Generar evaluación IA</button>
          <button className="btn btn-yellow">Recalcular score</button>
          <button className="btn btn-save">✅ Aprobar crédito</button>
          <button className="btn btn-red">❌ Rechazar crédito</button>
          <button className="btn btn-save">💾 Guardar evaluación</button>
        </div>
      </section>
    </Layout>
  );
}

function InfoItem({ title, value, extra = "" }) {
  return <div className={`bureau-item ${extra}`}><strong>{title}</strong><span>{value}</span></div>;
}
function MetricCard({ title, value, text, extra = "" }) {
  return <div className={`card ${extra}`}><h3>{title}</h3><div className="number">{value}</div><p>{text}</p></div>;
}
function History({ title, extra = "", children }) {
  return <div className={`history-item ${extra}`}><strong>{title}</strong>{children}</div>;
}
function Prediction({ value, text }) {
  return <div className="prediction-card"><strong>{value}</strong><span>{text}</span></div>;
}
