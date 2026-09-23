import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import {
  obtenerSolicitudes,
  obtenerDocumentosPorSolicitud,
  obtenerEvaluacionesPorSolicitud,
  verificarDocumentacion,
  crearEvaluacion
} from "../services/api";


export default function EvaluacionRiesgo() {

  // =========================================================
  // ESTADOS
  // =========================================================

  const [solicitudes, setSolicitudes] = useState([]);

  const [
    solicitudSeleccionada,
    setSolicitudSeleccionada
  ] = useState(null);

  const [documentos, setDocumentos] = useState([]);

  const [
    documentacionCompleta,
    setDocumentacionCompleta
  ] = useState(false);

  const [evaluacion, setEvaluacion] = useState(null);

  const [cargando, setCargando] = useState(false);

  const [generando, setGenerando] = useState(false);


  // =========================================================
  // DOCUMENTOS OBLIGATORIOS
  // =========================================================

  const documentosObligatorios = [
    "Identificación",
    "Ingresos",
    "General"
  ];


  // =========================================================
  // CARGAR SOLICITUDES
  // =========================================================

  useEffect(() => {
    cargarSolicitudes();
  }, []);


  const cargarSolicitudes = async () => {

    try {

      const datos = await obtenerSolicitudes();

      setSolicitudes(datos);

    } catch (error) {

      console.error(
        "Error al cargar solicitudes:",
        error
      );

      alert(
        "No se pudieron cargar las solicitudes."
      );

    }

  };


  // =========================================================
  // SELECCIONAR SOLICITUD
  // =========================================================

  const seleccionarSolicitud = async (e) => {

    const id = e.target.value;

    if (!id) {

      setSolicitudSeleccionada(null);
      setDocumentos([]);
      setDocumentacionCompleta(false);
      setEvaluacion(null);

      return;
    }

    const solicitud = solicitudes.find(
      (item) =>
        String(item.id) === String(id)
    );

    if (!solicitud) {
      return;
    }

    setSolicitudSeleccionada(solicitud);

    await cargarInformacionSolicitud(
      solicitud.id
    );

  };


  // =========================================================
  // CARGAR INFORMACIÓN DE LA SOLICITUD
  // =========================================================

  const cargarInformacionSolicitud = async (
    solicitudId
  ) => {

    try {

      setCargando(true);

      const [
        documentosRespuesta,
        estadoDocumentacion,
        evaluacionesRespuesta
      ] = await Promise.all([

        obtenerDocumentosPorSolicitud(
          solicitudId
        ),

        verificarDocumentacion(
          solicitudId
        ),

        obtenerEvaluacionesPorSolicitud(
          solicitudId
        )

      ]);

      setDocumentos(
        documentosRespuesta
      );

      setDocumentacionCompleta(
        estadoDocumentacion.completa
      );

      /*
       * Si existen evaluaciones anteriores,
       * mostramos la más reciente.
       */

      if (
        evaluacionesRespuesta &&
        evaluacionesRespuesta.length > 0
      ) {

        setEvaluacion(
          evaluacionesRespuesta[
            evaluacionesRespuesta.length - 1
          ]
        );

      } else {

        setEvaluacion(null);

      }

    } catch (error) {

      console.error(
        "Error al cargar información:",
        error
      );

      setDocumentos([]);
      setDocumentacionCompleta(false);
      setEvaluacion(null);

    } finally {

      setCargando(false);

    }

  };


  // =========================================================
  // GENERAR EVALUACIÓN CON IA
  // =========================================================

  const generarEvaluacion = async () => {

    if (!solicitudSeleccionada) {

      alert(
        "Seleccione una solicitud."
      );

      return;
    }

    if (!documentacionCompleta) {

      alert(
        "La solicitud no tiene la documentación completa."
      );

      return;
    }

    /*
     * Evitamos generar otra evaluación
     * desde el frontend si ya existe una.
     */

    if (evaluacion) {

      alert(
        "Esta solicitud ya cuenta con una evaluación de riesgo."
      );

      return;
    }

    try {

      setGenerando(true);

      /*
       * Esta llamada ejecuta:
       *
       * React
       *   ↓
       * Spring Boot
       *   ↓
       * FastAPI
       *   ↓
       * Random Forest
       *   ↓
       * Spring Boot
       *   ↓
       * PostgreSQL
       */

      const nuevaEvaluacion =
        await crearEvaluacion(
          solicitudSeleccionada.id
        );

      setEvaluacion(
        nuevaEvaluacion
      );

      alert(
        "Evaluación de riesgo completada correctamente."
      );

    } catch (error) {

      console.error(
        "Error al realizar evaluación:",
        error
      );

      alert(
        error.message ||
        "No se pudo realizar la evaluación de riesgo."
      );

    } finally {

      setGenerando(false);

    }

  };


  // =========================================================
  // INFORMACIÓN DE DOCUMENTOS
  // =========================================================

  const tiposCargados =
    documentos.map(
      (documento) =>
        documento.tipoDocumento
    );


  const documentosFaltantes =
    documentosObligatorios.filter(
      (tipo) =>
        !tiposCargados.includes(tipo)
    );


  const cantidadDocumentosCompletos =
    documentosObligatorios.length -
    documentosFaltantes.length;


  // =========================================================
  // FORMATEAR DINERO
  // =========================================================

  const formatearDinero = (valor) => {

    const numero =
      Number(valor || 0);

    return new Intl.NumberFormat(
      "es-EC",
      {
        style: "currency",
        currency: "USD"
      }
    ).format(numero);

  };


  // =========================================================
  // FORMATEAR PORCENTAJE
  // =========================================================

  const formatearPorcentaje = (valor) => {

    if (
      valor === null ||
      valor === undefined
    ) {

      return "Pendiente";

    }

    return `${Number(valor).toLocaleString(
      "es-EC",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}%`;

  };


  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  const formatearFecha = (fecha) => {

    if (!fecha) {

      return "Pendiente";

    }

    return new Date(
      fecha
    ).toLocaleString(
      "es-EC"
    );

  };


  // =========================================================
  // NOMBRE DEL CLIENTE
  // =========================================================

  const obtenerNombreCliente = () => {

    const cliente =
      solicitudSeleccionada?.cliente;

    if (!cliente) {

      return "-";

    }

    return `${cliente.nombres || ""} ${
      cliente.apellidos || ""
    }`.trim();

  };


  // =========================================================
  // VALORES DE LA EVALUACIÓN
  // =========================================================

  const scoreIa =
    evaluacion?.scoreIa ??
    "Pendiente";


  const probabilidadMora =
    evaluacion?.probabilidadMora != null
      ? formatearPorcentaje(
          evaluacion.probabilidadMora
        )
      : "Pendiente";


  const nivelRiesgo =
    evaluacion?.nivelRiesgo ??
    "Pendiente";


  const recomendacion =
    evaluacion?.recomendacion ??
    "Pendiente";


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <Layout title="Evaluación de Riesgo Crediticio">

      {/* =====================================================
          SELECCIONAR SOLICITUD
      ===================================================== */}

      <section className="panel">

        <h2 className="section-title">
          Seleccionar solicitud
        </h2>

        <div className="form-grid">

          <div className="form-group full">

            <label>
              Solicitud de crédito
            </label>

            <select

              value={
                solicitudSeleccionada?.id ||
                ""
              }

              onChange={
                seleccionarSolicitud
              }

            >

              <option value="">
                Seleccione una solicitud
              </option>

              {solicitudes.map(
                (solicitud) => (

                  <option
                    key={solicitud.id}
                    value={solicitud.id}
                  >

                    Solicitud #{solicitud.id}

                    {" - "}

                    {solicitud.cliente
                      ? `${solicitud.cliente.nombres || ""} ${
                          solicitud.cliente.apellidos || ""
                        }`.trim()
                      : "Sin cliente"}

                    {" - "}

                    {solicitud.tipoCredito ||
                      "Sin tipo"}

                  </option>

                )
              )}

            </select>

          </div>

        </div>

      </section>


      {/* =====================================================
          SIN SOLICITUD
      ===================================================== */}

      {!solicitudSeleccionada && (

        <section className="panel">

          <div className="risk-empty">

            <div className="risk-empty-icon">
              🤖
            </div>

            <h2>
              Seleccione una solicitud
            </h2>

            <p>
              Seleccione una solicitud de crédito
              para consultar su información y
              realizar la evaluación de riesgo.
            </p>

          </div>

        </section>

      )}


      {/* =====================================================
          CARGANDO
      ===================================================== */}

      {solicitudSeleccionada &&
        cargando && (

          <section className="panel">

            <div className="risk-empty">

              <div className="risk-empty-icon">
                ⏳
              </div>

              <h2>
                Cargando información...
              </h2>

            </div>

          </section>

        )}


      {/* =====================================================
          INFORMACIÓN
      ===================================================== */}

      {solicitudSeleccionada &&
        !cargando && (

          <>

            {/* =================================================
                INFORMACIÓN SOLICITUD
            ================================================= */}

            <section className="panel">

              <h2 className="section-title">
                Información de la solicitud
              </h2>

              <div className="risk-request-header">

                <div>

                  <span>
                    Solicitud
                  </span>

                  <strong>
                    #{solicitudSeleccionada.id}
                  </strong>

                </div>


                <div>

                  <span>
                    Cliente
                  </span>

                  <strong>
                    {obtenerNombreCliente()}
                  </strong>

                </div>


                <div>

                  <span>
                    Tipo de crédito
                  </span>

                  <strong>
                    {solicitudSeleccionada.tipoCredito ||
                      "-"}
                  </strong>

                </div>


                <div>

                  <span>
                    Monto solicitado
                  </span>

                  <strong>

                    {formatearDinero(
                      solicitudSeleccionada.monto
                    )}

                  </strong>

                </div>

              </div>

            </section>


            {/* =================================================
                VALIDACIÓN DOCUMENTAL
            ================================================= */}

            <section className="panel">

              <div className="risk-section-heading">

                <div>

                  <h2 className="section-title">
                    Validación documental
                  </h2>

                  <p>
                    Documentación requerida antes
                    de ejecutar el análisis de riesgo.
                  </p>

                </div>


                <div
                  className={
                    documentacionCompleta
                      ? "risk-doc-status complete"
                      : "risk-doc-status incomplete"
                  }
                >

                  {documentacionCompleta
                    ? "✓ Documentación completa"
                    : "⚠ Documentación pendiente"}

                </div>

              </div>


              <div className="risk-document-grid">

                {documentosObligatorios.map(
                  (tipo) => {

                    const existe =
                      tiposCargados.includes(
                        tipo
                      );

                    return (

                      <div
                        key={tipo}
                        className={
                          existe
                            ? "risk-document-item completed"
                            : "risk-document-item pending"
                        }
                      >

                        <span>
                          {existe ? "✓" : "!"}
                        </span>

                        <div>

                          <strong>
                            {tipo}
                          </strong>

                          <small>

                            {existe
                              ? "Documento cargado"
                              : "Documento pendiente"}

                          </small>

                        </div>

                      </div>

                    );

                  }
                )}

              </div>


              <div className="risk-document-summary">

                Documentos completos:{" "}

                <strong>
                  {cantidadDocumentosCompletos}
                  /
                  {documentosObligatorios.length}
                </strong>

              </div>


              {!documentacionCompleta && (

                <div className="risk-warning-box">

                  ⚠ Para iniciar la evaluación de
                  riesgo deben cargarse todos los
                  documentos obligatorios desde el
                  módulo de Documentos.

                </div>

              )}

            </section>


            {/* =================================================
                INFORMACIÓN FINANCIERA
            ================================================= */}

            <section className="panel">

              <h2 className="section-title">
                Información financiera
              </h2>

              <div className="cards four-cards">

                <MetricCard

                  title="Ingresos mensuales"

                  value={
                    formatearDinero(
                      solicitudSeleccionada
                        .ingresosMensuales
                    )
                  }

                  text="Ingresos registrados en la solicitud."

                />


                <MetricCard

                  title="Egresos mensuales"

                  value={
                    formatearDinero(
                      solicitudSeleccionada
                        .egresosMensuales
                    )
                  }

                  text="Egresos registrados por el solicitante."

                  extra="orange"

                />


                <MetricCard

                  title="Nivel de endeudamiento"

                  value={
                    formatearPorcentaje(
                      solicitudSeleccionada
                        .nivelEndeudamiento
                    )
                  }

                  text="Nivel registrado en la solicitud."

                  extra="yellow"

                />


                <MetricCard

                  title="Capacidad de pago"

                  value={
                    formatearDinero(
                      solicitudSeleccionada
                        .capacidadPago
                    )
                  }

                  text="Capacidad mensual registrada."

                />

              </div>

            </section>


            {/* =================================================
                IA
            ================================================= */}

            <section className="panel">

              <div className="risk-section-heading">

                <div>

                  <h2 className="section-title">
                    🤖 Evaluación mediante Inteligencia Artificial
                  </h2>

                  <p>
                    Resultado del análisis predictivo
                    asociado a esta solicitud.
                  </p>

                </div>


                <span
                  className={`evaluation-state ${
                    evaluacion
                      ? "created"
                      : "waiting"
                  }`}
                >

                  {evaluacion
                    ? evaluacion.estado
                    : "Sin evaluación"}

                </span>

              </div>


              <div className="bureau-grid">

                <InfoItem

                  title="Modelo utilizado"

                  value={
                    evaluacion?.modeloUtilizado ||
                    "Pendiente"
                  }

                />


                <InfoItem

                  title="Estado del análisis"

                  value={
                    evaluacion?.estado ||
                    "No iniciado"
                  }

                  extra="yellow-left"

                />


                <InfoItem

                  title="Documentación"

                  value={
                    documentacionCompleta
                      ? "Validada"
                      : "Incompleta"
                  }

                  extra="orange-left"

                />


                <InfoItem

                  title="Fecha de evaluación"

                  value={
                    formatearFecha(
                      evaluacion
                        ?.fechaEvaluacion
                    )
                  }

                />

              </div>

            </section>


            {/* =================================================
                VARIABLES + RESULTADO IA
            ================================================= */}

            <section className="risk-grid">

              <div className="panel">

                <h2 className="section-title">
                  Variables para el análisis
                </h2>

                <div className="history-list">

                  <History
                    title="Ingresos mensuales"
                  >

                    {formatearDinero(
                      solicitudSeleccionada
                        .ingresosMensuales
                    )}

                  </History>


                  <History
                    title="Egresos mensuales"
                  >

                    {formatearDinero(
                      solicitudSeleccionada
                        .egresosMensuales
                    )}

                  </History>


                  <History
                    title="Nivel de endeudamiento"
                    extra="warning"
                  >

                    {formatearPorcentaje(
                      solicitudSeleccionada
                        .nivelEndeudamiento
                    )}

                  </History>


                  <History
                    title="Capacidad de pago"
                  >

                    {formatearDinero(
                      solicitudSeleccionada
                        .capacidadPago
                    )}

                  </History>


                  <History
                    title="Tipo de crédito"
                  >

                    {solicitudSeleccionada
                      .tipoCredito ||
                      "No registrado"}

                  </History>


                  <History
                    title="Monto solicitado"
                  >

                    {formatearDinero(
                      solicitudSeleccionada.monto
                    )}

                  </History>


                  <History
                    title="Antigüedad laboral"
                  >

                    {solicitudSeleccionada
                      .antiguedadLaboral ||
                      "No registrada"}

                  </History>


                  <History
                    title="Plazo solicitado"
                  >

                    {solicitudSeleccionada
                      .plazoMeses
                      ? `${solicitudSeleccionada.plazoMeses} meses`
                      : "No registrado"}

                  </History>

                </div>

              </div>


              {/* ===============================================
                  RESULTADO IA
              =============================================== */}

              <div className="panel">

                <h2 className="section-title">
                  Resultado generado por IA
                </h2>


                {!evaluacion ? (

                  <div className="risk-no-result">

                    <div>
                      🧠
                    </div>

                    <h3>
                      Aún no existe una evaluación
                    </h3>

                    <p>
                      Cuando la documentación esté
                      completa podrá iniciar el proceso
                      de evaluación.
                    </p>

                  </div>

                ) : (

                  <div className="score-box">


                    <div
                      className={
                        evaluacion.scoreIa != null
                          ? "circle"
                          : "circle circle-pending"
                      }
                    >

                      <div className="circle-inner">

                        <span>
                          {scoreIa}
                        </span>

                        <small>
                          / 100
                        </small>

                        Score IA

                      </div>

                    </div>


                    <div className="risk-current">

                      Nivel de riesgo

                      <strong>
                        {nivelRiesgo}
                      </strong>

                    </div>


                    <div className="prediction-grid">

                      <Prediction

                        value={
                          probabilidadMora
                        }

                        text="Probabilidad de mora"

                      />


                      <Prediction

                        value={
                          recomendacion
                        }

                        text="Recomendación IA"

                      />

                    </div>


                    <div className="result-box">

                      <h3>

                        {evaluacion.nivelRiesgo
                          ? `Clasificación: Riesgo ${evaluacion.nivelRiesgo}`
                          : "Evaluación pendiente de procesamiento"}

                      </h3>


                      <p>

                        {evaluacion.explicacion ||
                          "Todavía no existe una explicación generada por el modelo."}

                      </p>

                    </div>

                  </div>

                )}

              </div>

            </section>


            {/* =================================================
                VARIABLES UTILIZADAS REALMENTE POR RANDOM FOREST
            ================================================= */}

            <section className="panel">

              <h2 className="section-title">
                Variables consideradas para el modelo IA
              </h2>

              <p>
                Estas son las variables enviadas al
                microservicio de inteligencia artificial
                para realizar la predicción.
              </p>


              <div className="variables-grid">

                {[
                  "Ingresos mensuales",
                  "Egresos mensuales",
                  "Nivel de endeudamiento",
                  "Capacidad de pago",
                  "Tipo de crédito",
                  "Monto solicitado",
                  "Plazo del crédito",
                  "Antigüedad laboral"
                ].map(
                  (variable) => (

                    <div
                      className="variable"
                      key={variable}
                    >

                      ✔ {variable}

                    </div>

                  )
                )}

              </div>

            </section>


            {/* =================================================
                EXPLICACIÓN
            ================================================= */}

            <section className="panel">

              <h2 className="section-title">
                Explicación de la evaluación
              </h2>

              <div className="explain-box">

                {evaluacion ? (

                  <>

                    <p>

                      <strong>
                        Resultado del modelo:
                      </strong>{" "}

                      {evaluacion.explicacion ||
                        "La evaluación está pendiente de procesamiento."}

                    </p>


                    <p>

                      <strong>
                        Interpretación:
                      </strong>{" "}

                      El resultado generado por el
                      modelo funciona como apoyo para
                      el análisis crediticio. La
                      decisión final corresponde al
                      personal autorizado de la
                      cooperativa.

                    </p>


                    <p>

                      <strong>
                        Modelo utilizado:
                      </strong>{" "}

                      {evaluacion.modeloUtilizado ||
                        "No registrado"}

                    </p>

                  </>

                ) : (

                  <p>

                    Seleccione una solicitud con
                    documentación completa y genere
                    una evaluación para iniciar el
                    proceso de análisis.

                  </p>

                )}

              </div>

            </section>


            {/* =================================================
                ACCIONES
            ================================================= */}

            <section className="panel">

              <h2 className="section-title">
                Acciones de evaluación
              </h2>

              <div className="actions">

                <button

                  type="button"

                  className="btn btn-gray"

                  onClick={() => {

                    setSolicitudSeleccionada(
                      null
                    );

                    setDocumentos([]);

                    setEvaluacion(null);

                    setDocumentacionCompleta(
                      false
                    );

                  }}

                >

                  Cancelar

                </button>


                <button

                  type="button"

                  className="btn btn-yellow"

                  disabled={
                    !documentacionCompleta ||
                    generando ||
                    Boolean(evaluacion)
                  }

                  onClick={
                    generarEvaluacion
                  }

                >

                  {generando
                    ? "🧠 Analizando riesgo..."
                    : evaluacion
                      ? "✓ Evaluación completada"
                      : "🤖 Iniciar evaluación"}

                </button>

              </div>

            </section>

          </>

        )}

    </Layout>

  );

}


// ===========================================================
// COMPONENTES
// ===========================================================

function InfoItem({
  title,
  value,
  extra = ""
}) {

  return (

    <div
      className={`bureau-item ${extra}`}
    >

      <strong>
        {title}
      </strong>

      <span>
        {value}
      </span>

    </div>

  );

}


function MetricCard({
  title,
  value,
  text,
  extra = ""
}) {

  return (

    <div
      className={`card ${extra}`}
    >

      <h3>
        {title}
      </h3>

      <div className="number">
        {value}
      </div>

      <p>
        {text}
      </p>

    </div>

  );

}


function History({
  title,
  extra = "",
  children
}) {

  return (

    <div
      className={`history-item ${extra}`}
    >

      <strong>
        {title}
      </strong>

      {children}

    </div>

  );

}


function Prediction({
  value,
  text
}) {

  return (

    <div className="prediction-card">

      <strong>
        {value}
      </strong>

      <span>
        {text}
      </span>

    </div>

  );

}