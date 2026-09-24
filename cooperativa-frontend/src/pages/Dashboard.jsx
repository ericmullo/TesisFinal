import Layout from "../components/Layout";
import { useEffect, useState } from "react";

import {
  obtenerClientes,
  obtenerSolicitudes,
  obtenerEvaluaciones,
} from "../services/api";

function Dashboard() {
  // =========================================================
  // ESTADOS
  // =========================================================

  const [clientes, setClientes] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [evaluaciones, setEvaluaciones] = useState([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");


  // =========================================================
  // CARGAR INFORMACIÓN DEL DASHBOARD
  // =========================================================

  useEffect(() => {
    cargarDashboard();
  }, []);


  const cargarDashboard = async () => {
    try {
      setCargando(true);
      setError("");

      const [
        datosClientes,
        datosSolicitudes,
        datosEvaluaciones,
      ] = await Promise.all([
        obtenerClientes(),
        obtenerSolicitudes(),
        obtenerEvaluaciones(),
      ]);

      setClientes(datosClientes || []);
      setSolicitudes(datosSolicitudes || []);
      setEvaluaciones(datosEvaluaciones || []);

    } catch (error) {
      console.error(
        "ERROR AL CARGAR DASHBOARD:",
        error
      );

      setError(
        "No se pudo cargar la información del dashboard."
      );

    } finally {
      setCargando(false);
    }
  };


  // =========================================================
  // CONTADORES GENERALES
  // =========================================================

  const totalClientes = clientes.length;

  const totalSolicitudes = solicitudes.length;

  const totalEvaluaciones = evaluaciones.length;


  // =========================================================
  // DISTRIBUCIÓN DE RIESGO
  // =========================================================

  const riesgoAlto = evaluaciones.filter(
    (evaluacion) =>
      String(evaluacion.nivelRiesgo || "")
        .toLowerCase() === "alto"
  ).length;


  const riesgoMedio = evaluaciones.filter(
    (evaluacion) =>
      String(evaluacion.nivelRiesgo || "")
        .toLowerCase() === "medio"
  ).length;


  const riesgoBajo = evaluaciones.filter(
    (evaluacion) =>
      String(evaluacion.nivelRiesgo || "")
        .toLowerCase() === "bajo"
  ).length;


  // =========================================================
  // SOLICITUDES APROBADAS / RECHAZADAS
  // =========================================================

  const solicitudesAprobadas = solicitudes.filter(
    (solicitud) =>
      String(solicitud.estado || "")
        .toLowerCase() === "aprobado" ||
      String(solicitud.estado || "")
        .toLowerCase() === "aprobada"
  ).length;


  const solicitudesRechazadas = solicitudes.filter(
    (solicitud) =>
      String(solicitud.estado || "")
        .toLowerCase() === "rechazado" ||
      String(solicitud.estado || "")
        .toLowerCase() === "rechazada"
  ).length;


  // =========================================================
  // SOLICITUDES PENDIENTES / EN EVALUACIÓN
  // =========================================================

  const solicitudesPendientes = solicitudes.filter(
    (solicitud) => {
      const estado = String(
        solicitud.estado || ""
      ).toLowerCase();

      return (
        estado === "pendiente" ||
        estado === "en evaluación" ||
        estado === "en evaluacion"
      );
    }
  ).length;


  // =========================================================
  // SOLICITUDES POR MES
  // =========================================================

  const obtenerSolicitudesPorMes = () => {
    const meses = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const conteo = Array(12).fill(0);

    solicitudes.forEach((solicitud) => {
      if (!solicitud.fechaSolicitud) {
        return;
      }

      const fecha = new Date(
        solicitud.fechaSolicitud
      );

      if (Number.isNaN(fecha.getTime())) {
        return;
      }

      const mes = fecha.getMonth();

      conteo[mes] += 1;
    });

    return meses.map((mes, index) => ({
      mes,
      cantidad: conteo[index],
    }));
  };


  const solicitudesPorMes =
    obtenerSolicitudesPorMes();


  // =========================================================
  // ALTURA DE LAS BARRAS
  // =========================================================

  const maximoSolicitudesMes = Math.max(
    ...solicitudesPorMes.map(
      (item) => item.cantidad
    ),
    1
  );


  const calcularAlturaBarra = (cantidad) => {
    if (cantidad === 0) {
      return "10px";
    }

    const alturaMinima = 35;
    const alturaMaxima = 220;

    const altura =
      (cantidad / maximoSolicitudesMes) *
      alturaMaxima;

    return `${Math.max(
      altura,
      alturaMinima
    )}px`;
  };


  // =========================================================
  // ÚLTIMAS EVALUACIONES
  // =========================================================

  const evaluacionesRecientes = [
    ...evaluaciones,
  ]
    .sort((a, b) => {
      const fechaA = a.fechaEvaluacion
        ? new Date(a.fechaEvaluacion).getTime()
        : 0;

      const fechaB = b.fechaEvaluacion
        ? new Date(b.fechaEvaluacion).getTime()
        : 0;

      return fechaB - fechaA;
    })
    .slice(0, 5);


  // =========================================================
  // FORMATEAR PORCENTAJE
  // =========================================================

  const formatearPorcentaje = (valor) => {
    if (
      valor === null ||
      valor === undefined
    ) {
      return "-";
    }

    return `${Number(valor).toLocaleString(
      "es-EC",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}%`;
  };


  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  const formatearFecha = (fecha) => {
    if (!fecha) {
      return "-";
    }

    return new Date(fecha).toLocaleDateString(
      "es-EC",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };


  // =========================================================
  // CLASE DEL BADGE DE RIESGO
  // =========================================================

  const obtenerClaseRiesgo = (riesgo) => {
    const valor = String(
      riesgo || ""
    ).toLowerCase();

    if (valor === "bajo") {
      return "badge bajo";
    }

    if (valor === "medio") {
      return "badge medio";
    }

    if (valor === "alto") {
      return "badge alto";
    }

    return "badge";
  };


  // =========================================================
  // ESTADO VISUAL DE LA EVALUACIÓN
  // =========================================================

  const obtenerTextoEstado = (evaluacion) => {
    if (evaluacion.estado) {
      return evaluacion.estado;
    }

    return "Evaluada";
  };


  // =========================================================
  // CARGANDO
  // =========================================================

  if (cargando) {
    return (
      <Layout title="Dashboard Principal">

        <section className="panel">

          <p
            style={{
              textAlign: "center",
              padding: "40px",
            }}
          >
            ⏳ Cargando información del dashboard...
          </p>

        </section>

      </Layout>
    );
  }


  // =========================================================
  // RETURN
  // =========================================================

  return (
    <Layout title="Dashboard Principal">

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <section
          className="panel"
          style={{
            marginBottom: "20px",
            borderLeft: "4px solid #c62828",
          }}
        >
          <strong>
            ⚠️ {error}
          </strong>
        </section>
      )}


      {/* =====================================================
          TARJETAS PRINCIPALES
      ===================================================== */}

      <section className="cards five">

        {/* CLIENTES */}

        <div className="card">

          <h3>
            Total clientes
          </h3>

          <div className="number">
            {totalClientes}
          </div>

          <p>
            Clientes registrados
          </p>

        </div>


        {/* SOLICITUDES */}

        <div className="card">

          <h3>
            Total solicitudes
          </h3>

          <div className="number">
            {totalSolicitudes}
          </div>

          <p>
            Solicitudes registradas
          </p>

        </div>


        {/* RIESGO ALTO */}

        <div className="card red">

          <h3>
            Riesgo alto
          </h3>

          <div className="number">
            {riesgoAlto}
          </div>

          <p>
            Evaluaciones de riesgo alto
          </p>

        </div>


        {/* RIESGO MEDIO */}

        <div className="card orange">

          <h3>
            Riesgo medio
          </h3>

          <div className="number">
            {riesgoMedio}
          </div>

          <p>
            Evaluaciones de riesgo medio
          </p>

        </div>


        {/* RIESGO BAJO */}

        <div className="card yellow">

          <h3>
            Riesgo bajo
          </h3>

          <div className="number">
            {riesgoBajo}
          </div>

          <p>
            Evaluaciones de riesgo bajo
          </p>

        </div>

      </section>


      {/* =====================================================
          SEGUNDA FILA DE INDICADORES
      ===================================================== */}

      <section
        className="summary-cards four"
        style={{
          marginBottom: "24px",
        }}
      >

        <div className="small-card">

          <h3>
            Evaluaciones IA
          </h3>

          <strong>
            {totalEvaluaciones}
          </strong>

        </div>


        <div className="small-card yellow">

          <h3>
            Pendientes / En evaluación
          </h3>

          <strong>
            {solicitudesPendientes}
          </strong>

        </div>


        <div className="small-card">

          <h3>
            Solicitudes aprobadas
          </h3>

          <strong>
            {solicitudesAprobadas}
          </strong>

        </div>


        <div className="small-card red">

          <h3>
            Solicitudes rechazadas
          </h3>

          <strong>
            {solicitudesRechazadas}
          </strong>

        </div>

      </section>


      {/* =====================================================
          GRÁFICO + RESUMEN DE RIESGO
      ===================================================== */}

      <section className="dashboard-grid">

        {/* SOLICITUDES POR MES */}

        <div className="panel">

          <h2>
            Solicitudes por mes
          </h2>

          <p
            style={{
              color: "#777",
              marginTop: "-5px",
              marginBottom: "25px",
            }}
          >
            Distribución mensual de solicitudes registradas
          </p>


          <div className="bar-chart">

            {solicitudesPorMes.map(
              (item) => (

                <div
                  className="bar"
                  style={{
                    height:
                      calcularAlturaBarra(
                        item.cantidad
                      ),
                  }}
                  key={item.mes}
                  title={`${item.mes}: ${item.cantidad} solicitudes`}
                >

                  <small>
                    {item.cantidad}
                  </small>

                  <span>
                    {item.mes}
                  </span>

                </div>

              )
            )}

          </div>

        </div>


        {/* RESUMEN DE RIESGO */}

        <div className="panel">

          <h2>
            Resumen de riesgo
          </h2>

          <p
            style={{
              color: "#777",
              marginTop: "-5px",
              marginBottom: "20px",
            }}
          >
            Clasificación de las evaluaciones realizadas
          </p>


          <div className="risk-list">

            <div className="risk-item high">

              <strong>
                Riesgo alto ({riesgoAlto})
              </strong>

              Requiere revisión detallada del analista.

            </div>


            <div className="risk-item medium">

              <strong>
                Riesgo medio ({riesgoMedio})
              </strong>

              Solicitudes que requieren revisión adicional.

            </div>


            <div className="risk-item low">

              <strong>
                Riesgo bajo ({riesgoBajo})
              </strong>

              Solicitudes con menor riesgo estimado por el modelo.

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ÚLTIMAS EVALUACIONES
      ===================================================== */}

      <section className="panel footer-panel">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            marginBottom: "20px",
          }}
        >

          <div>

            <h2
              style={{
                marginBottom: "5px",
              }}
            >
              Últimas solicitudes evaluadas
            </h2>

            <p
              style={{
                margin: 0,
                color: "#777",
              }}
            >
              Resultados más recientes generados por el modelo de IA
            </p>

          </div>


          <span
            style={{
              fontSize: "13px",
              color: "#777",
            }}
          >
            Mostrando las últimas{" "}
            {evaluacionesRecientes.length}
          </span>

        </div>


        <table className="table">

          <thead>

            <tr>

              <th>
                Solicitud
              </th>

              <th>
                Cliente
              </th>

              <th>
                Tipo de crédito
              </th>

              <th>
                Score IA
              </th>

              <th>
                Mora estimada
              </th>

              <th>
                Riesgo
              </th>

              <th>
                Estado
              </th>

              <th>
                Fecha
              </th>

            </tr>

          </thead>


          <tbody>

            {evaluacionesRecientes.map(
              (evaluacion) => {

                const solicitud =
                  evaluacion.solicitud;

                const cliente =
                  solicitud?.cliente;

                return (

                  <tr key={evaluacion.id}>

                    <td>
                      #{solicitud?.id || "-"}
                    </td>


                    <td>

                      {cliente
                        ? `${cliente.nombres || ""} ${cliente.apellidos || ""}`
                        : "-"}

                    </td>


                    <td>

                      {solicitud?.tipoCredito ||
                        "-"}

                    </td>


                    <td>

                      <strong>

                        {evaluacion.scoreIa != null
                          ? `${evaluacion.scoreIa}/100`
                          : "-"}

                      </strong>

                    </td>


                    <td>

                      {formatearPorcentaje(
                        evaluacion.probabilidadMora
                      )}

                    </td>


                    <td>

                      <span
                        className={
                          obtenerClaseRiesgo(
                            evaluacion.nivelRiesgo
                          )
                        }
                      >

                        {evaluacion.nivelRiesgo ||
                          "-"}

                      </span>

                    </td>


                    <td>

                      {obtenerTextoEstado(
                        evaluacion
                      )}

                    </td>


                    <td>

                      {formatearFecha(
                        evaluacion.fechaEvaluacion
                      )}

                    </td>

                  </tr>

                );

              }
            )}

          </tbody>

        </table>


        {evaluacionesRecientes.length === 0 && (

          <div
            style={{
              padding: "35px",
              textAlign: "center",
              color: "#777",
            }}
          >

            <div
              style={{
                fontSize: "32px",
                marginBottom: "10px",
              }}
            >
              🧠
            </div>

            <strong>
              No existen evaluaciones de riesgo todavía.
            </strong>

            <p>
              Cuando una solicitud sea evaluada mediante
              el modelo de IA, aparecerá aquí.
            </p>

          </div>

        )}

      </section>

    </Layout>
  );
}

export default Dashboard;