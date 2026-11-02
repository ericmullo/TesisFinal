import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { obtenerResumenDashboard } from "../services/api";

const formatoPorcentaje = (valor) => valor == null
  ? "-"
  : `${Number(valor).toLocaleString("es-EC", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

const formatoFecha = (valor) => valor
  ? new Date(valor).toLocaleDateString("es-EC", { day: "2-digit", month: "2-digit", year: "numeric" })
  : "-";

export default function Dashboard() {
  const [resumen, setResumen] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    obtenerResumenDashboard()
      .then((datos) => { if (activo) setResumen(datos); })
      .catch((fallo) => { if (activo) setError(fallo.message); })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const riesgos = resumen?.riesgos || {};
  const decisiones = resumen?.decisiones || {};
  const meses = resumen?.solicitudesPorMes || [];
  const recientes = resumen?.evaluacionesRecientes || [];
  const maximo = Math.max(1, ...meses.map((item) => Number(item.cantidad) || 0));
  const decisionesFormales = (decisiones.aprobadas || 0) + (decisiones.rechazadas || 0);

  return (
    <Layout title="Dashboard Principal">
      <div className="page-intro">
        <span className="page-eyebrow">Vista general</span>
        <h2>Seguimiento de solicitudes y riesgo</h2>
        <p>Indicadores registrados en el sistema para apoyar el trabajo de análisis crediticio.</p>
      </div>

      {cargando && <section className="panel" role="status">Cargando indicadores...</section>}
      {error && <section className="panel form-error-inline" role="alert">{error}</section>}

      {!cargando && !error && resumen && (
        <>
          <h2 className="dashboard-group-title">Actividad y niveles de riesgo</h2>
          <section className="cards five dashboard-metrics" aria-label="Indicadores de actividad">
            <Indicador titulo="Total clientes" valor={resumen.totalClientes} descripcion="Clientes registrados" />
            <Indicador titulo="Total solicitudes" valor={resumen.totalSolicitudes} descripcion="Solicitudes registradas" />
            <Indicador titulo="Riesgo alto" valor={riesgos.alto} descripcion="Evaluaciones de riesgo alto" tono="red" />
            <Indicador titulo="Riesgo medio" valor={riesgos.medio} descripcion="Evaluaciones de riesgo medio" tono="orange" />
            <Indicador titulo="Riesgo bajo" valor={riesgos.bajo} descripcion="Evaluaciones de riesgo bajo" tono="yellow" />
          </section>

          <h2 className="dashboard-group-title">Estado de las decisiones</h2>
          <section className="summary-cards four dashboard-decisions" aria-label="Decisiones sobre solicitudes">
            <IndicadorPequeno titulo="Evaluaciones IA" valor={resumen.totalEvaluaciones} detalle={`Decisiones formales: ${decisionesFormales}`} />
            <IndicadorPequeno titulo="Sin decisión formal" valor={decisiones.pendientes} tono="yellow" />
            <IndicadorPequeno titulo="Aprobadas por analista" valor={decisiones.aprobadas} />
            <IndicadorPequeno titulo="Rechazadas por analista" valor={decisiones.rechazadas} tono="red" />
          </section>

          <section className="dashboard-grid">
            <div className="panel">
              <h2>Solicitudes por mes - {resumen.anio}</h2>
              <p>Distribución mensual de solicitudes registradas durante {resumen.anio}.</p>
              <div className="bar-chart" role="img" aria-label="Gráfico de solicitudes por mes">
                {meses.map((item) => (
                  <div className="bar" key={item.mes}
                    style={{ height: `${Math.max(10, (Number(item.cantidad) / maximo) * 220)}px` }}
                    title={`${item.mes}: ${item.cantidad} solicitudes`}>
                    <small>{item.cantidad}</small><span>{item.mes}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="panel">
              <h2>Resumen de riesgo</h2>
              <p>Clasificación de las evaluaciones realizadas.</p>
              <div className="risk-list">
                <div className="risk-item high"><strong>Riesgo alto ({riesgos.alto || 0})</strong>Requiere revisión detallada del analista.</div>
                <div className="risk-item medium"><strong>Riesgo medio ({riesgos.medio || 0})</strong>Solicitudes que requieren revisión adicional.</div>
                <div className="risk-item low"><strong>Riesgo bajo ({riesgos.bajo || 0})</strong>Solicitudes con menor riesgo estimado por el modelo.</div>
              </div>
            </div>
          </section>

          <section className="panel footer-panel">
            <div className="dashboard-table-heading">
              <div><h2>Últimas solicitudes evaluadas</h2><p>Resultados más recientes generados por el modelo de IA.</p></div>
              <span>Mostrando las últimas {recientes.length}</span>
            </div>
            <div className="dashboard-table-scroll">
              <table className="table">
                <thead><tr>
                  <th>Solicitud</th><th>Cliente</th><th>Tipo de crédito</th><th>Score IA</th>
                  <th>Mora estimada</th><th>Riesgo</th><th>Estado</th><th>Fecha</th>
                </tr></thead>
                <tbody>
                  {recientes.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.codigoSolicitud || "-"}</strong></td>
                      <td>{item.cliente || "-"}</td>
                      <td>{item.tipoCredito || "-"}</td>
                      <td><strong>{item.scoreIa == null ? "-" : `${item.scoreIa}/100`}</strong></td>
                      <td>{formatoPorcentaje(item.probabilidadMora)}</td>
                      <td><span className={`badge ${(item.nivelRiesgo || "").toLowerCase()}`}>{item.nivelRiesgo || "-"}</span></td>
                      <td>{item.estado || "Evaluada"}</td>
                      <td>{formatoFecha(item.fechaEvaluacion)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {recientes.length === 0 && <p className="dashboard-empty">Todavía no existen evaluaciones de riesgo.</p>}
          </section>
        </>
      )}
    </Layout>
  );
}

function Indicador({ titulo, valor, descripcion, tono = "" }) {
  return <div className={`card ${tono}`}><h3>{titulo}</h3><div className="number">{valor ?? 0}</div><p>{descripcion}</p></div>;
}

function IndicadorPequeno({ titulo, valor, detalle, tono = "" }) {
  return <div className={`small-card ${tono}`}><h3>{titulo}</h3><strong>{valor ?? 0}</strong>{detalle && <small>{detalle}</small>}</div>;
}
