import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import {
  obtenerSolicitudes,
  obtenerDocumentosPorSolicitud,
  subirDocumento,
  eliminarDocumento,
  obtenerUrlArchivoDocumento
} from "../services/api";


export default function Documentos() {

  // =========================================================
  // ESTADOS
  // =========================================================

  const [solicitudes, setSolicitudes] = useState([]);

  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState(null);

  const [documentos, setDocumentos] = useState([]);

  const [cargando, setCargando] = useState(false);

  const [subiendo, setSubiendo] = useState(false);


  // =========================================================
  // DOCUMENTOS OBLIGATORIOS
  // =========================================================

  const documentosObligatorios = [
    "Identificación",
    "Ingresos",
    "General"
  ];


  // =========================================================
  // CALCULAR DOCUMENTACIÓN COMPLETA
  // =========================================================

  const tiposCargados = documentos.map(
    (documento) => documento.tipoDocumento
  );


  const documentosFaltantes =
    documentosObligatorios.filter(
      (tipo) => !tiposCargados.includes(tipo)
    );


  const documentosCompletados =
    documentosObligatorios.length -
    documentosFaltantes.length;


  const documentacionCompleta =
    documentosFaltantes.length === 0;


  const porcentajeDocumentacion =
    (
      documentosCompletados /
      documentosObligatorios.length
    ) * 100;


  // =========================================================
  // CARGAR SOLICITUDES
  // =========================================================

  useEffect(() => {

    cargarSolicitudes();

  }, []);


  const cargarSolicitudes = async () => {

    try {

      const datos =
        await obtenerSolicitudes();

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

      return;

    }


    const solicitud =
      solicitudes.find(
        (solicitud) =>
          String(solicitud.id) === String(id)
      );


    if (!solicitud) {
      return;
    }


    setSolicitudSeleccionada(
      solicitud
    );


    await cargarDocumentos(
      solicitud.id
    );

  };


  // =========================================================
  // CARGAR DOCUMENTOS
  // =========================================================

  const cargarDocumentos = async (
    solicitudId
  ) => {

    try {

      setCargando(true);


      const datos =
        await obtenerDocumentosPorSolicitud(
          solicitudId
        );


      setDocumentos(datos);


    } catch (error) {

      console.error(
        "Error al cargar documentos:",
        error
      );


      setDocumentos([]);


    } finally {

      setCargando(false);

    }

  };


  // =========================================================
  // SUBIR DOCUMENTO
  // =========================================================

  const agregarArchivo = async (
    tipoDocumento,
    archivo
  ) => {

    if (!solicitudSeleccionada) {

      alert(
        "Primero debe seleccionar una solicitud."
      );

      return;

    }


    if (!archivo) {
      return;
    }


    // =======================================================
    // VALIDAR EXTENSIÓN
    // =======================================================

    const nombre =
      archivo.name.toLowerCase();


    const permitido =
      nombre.endsWith(".pdf") ||
      nombre.endsWith(".jpg") ||
      nombre.endsWith(".jpeg") ||
      nombre.endsWith(".png");


    if (!permitido) {

      alert(
        "Solo se permiten archivos PDF, JPG, JPEG o PNG."
      );

      return;

    }


    // =======================================================
    // VALIDAR TAMAÑO - 10 MB
    // =======================================================

    const maximo =
      10 * 1024 * 1024;


    if (archivo.size > maximo) {

      alert(
        "El archivo no puede superar los 10 MB."
      );

      return;

    }


    try {

      setSubiendo(true);


      await subirDocumento(
        solicitudSeleccionada.id,
        tipoDocumento,
        archivo
      );


      await cargarDocumentos(
        solicitudSeleccionada.id
      );


      alert(
        "Documento cargado correctamente."
      );


    } catch (error) {

      console.error(
        "Error al subir documento:",
        error
      );


      alert(
        "No se pudo cargar el documento."
      );


    } finally {

      setSubiendo(false);

    }

  };


  // =========================================================
  // ELIMINAR DOCUMENTO
  // =========================================================

  const eliminar = async (
    documento
  ) => {

    const confirmar =
      window.confirm(
        `¿Está seguro de eliminar "${documento.nombreArchivo}"?\n\nEsta acción eliminará también el archivo almacenado.`
      );


    if (!confirmar) {
      return;
    }


    try {

      await eliminarDocumento(
        documento.id
      );


      if (solicitudSeleccionada) {

        await cargarDocumentos(
          solicitudSeleccionada.id
        );

      }


      alert(
        "Documento eliminado correctamente."
      );


    } catch (error) {

      console.error(
        "Error al eliminar documento:",
        error
      );


      alert(
        "No se pudo eliminar el documento."
      );

    }

  };


  // =========================================================
  // VER DOCUMENTO
  // =========================================================

  const verDocumento = (
    documento
  ) => {

    const url =
      obtenerUrlArchivoDocumento(
        documento.id
      );


    window.open(
      url,
      "_blank",
      "noopener,noreferrer"
    );

  };


  // =========================================================
  // OBTENER FORMATO
  // =========================================================

  const obtenerFormato = (
    nombreArchivo
  ) => {

    if (!nombreArchivo) {
      return "-";
    }


    const partes =
      nombreArchivo.split(".");


    if (partes.length < 2) {
      return "-";
    }


    return partes
      .pop()
      .toUpperCase();

  };


  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  const formatearFecha = (
    fecha
  ) => {

    if (!fecha) {
      return "-";
    }


    return new Date(
      fecha
    ).toLocaleDateString(
      "es-EC"
    );

  };


  // =========================================================
  // NOMBRE DEL CLIENTE
  // =========================================================

  const obtenerNombreCliente = () => {

    if (
      !solicitudSeleccionada?.cliente
    ) {

      return "-";

    }


    const cliente =
      solicitudSeleccionada.cliente;


    return `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim();

  };


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <Layout title="Carga de Documentos">


      {/* =====================================================
          SELECCIÓN DE SOLICITUD
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
                      ? `${solicitud.cliente.nombres || ""} ${solicitud.cliente.apellidos || ""}`.trim()
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
          DOCUMENTOS DEL SOLICITANTE
      ===================================================== */}

      <section className="panel">


        <h2 className="section-title">
          Documentos del solicitante
        </h2>


        {/* ===================================================
            INFORMACIÓN DE LA SOLICITUD
        =================================================== */}

        {solicitudSeleccionada ? (

          <>

            <div className="info-box">

              Solicitud:{" "}

              <strong>
                #{solicitudSeleccionada.id}
              </strong>

              {" | "}

              Cliente:{" "}

              <strong>
                {obtenerNombreCliente()}
              </strong>

              {" | "}

              Documentación:{" "}

              <strong
                className={
                  documentacionCompleta
                    ? "docs-completos"
                    : "docs-pendientes"
                }
              >

                {documentacionCompleta
                  ? "Completa"
                  : "Pendiente"}

              </strong>

            </div>


            {/* ===============================================
                PROGRESO DE DOCUMENTACIÓN
            =============================================== */}

            <div className="document-progress">


              <div className="document-progress-header">

                <span>
                  Documentación requerida
                </span>

                <strong>

                  {documentosCompletados}
                  /
                  {documentosObligatorios.length}

                </strong>

              </div>


              <div className="document-progress-bar">

                <div
                  className="document-progress-value"
                  style={{
                    width:
                      `${porcentajeDocumentacion}%`
                  }}
                />

              </div>


              {documentacionCompleta ? (

                <div className="document-complete-message">

                  ✅ Documentación completa. La solicitud está lista
                  para continuar con la evaluación de riesgo.

                </div>

              ) : (

                <div className="document-missing">


                  <strong>
                    Documentos pendientes:
                  </strong>


                  {documentosFaltantes.map(
                    (tipo) => (

                      <span key={tipo}>

                        • {tipo}

                      </span>

                    )
                  )}


                </div>

              )}


            </div>

          </>

        ) : (

          <div className="info-box">

            Seleccione una solicitud para cargar sus documentos.

          </div>

        )}


        {/* ===================================================
            TARJETAS DE CARGA
        =================================================== */}

        <div className="upload-grid">


          {/* DOCUMENTO GENERAL */}

          <UploadCard

            icon="📄"

            title="Documento general"

            text="Adjuntar documentos generales relacionados con la solicitud."

            accept=".pdf,.jpg,.jpeg,.png"

            label={
              tiposCargados.includes("General")
                ? "Agregar otro archivo"
                : "Seleccionar archivo"
            }

            completed={
              tiposCargados.includes(
                "General"
              )
            }

            disabled={
              !solicitudSeleccionada ||
              subiendo
            }

            onFile={(archivo) =>
              agregarArchivo(
                "General",
                archivo
              )
            }

          />


          {/* IDENTIFICACIÓN */}

          <UploadCard

            icon="🪪"

            title="Cédula"

            text="Adjuntar imagen o PDF de la cédula del cliente."

            accept=".pdf,.jpg,.jpeg,.png"

            label={
              tiposCargados.includes(
                "Identificación"
              )
                ? "Agregar otro archivo"
                : "Seleccionar cédula"
            }

            completed={
              tiposCargados.includes(
                "Identificación"
              )
            }

            disabled={
              !solicitudSeleccionada ||
              subiendo
            }

            onFile={(archivo) =>
              agregarArchivo(
                "Identificación",
                archivo
              )
            }

          />


          {/* INGRESOS */}

          <UploadCard

            icon="💼"

            title="Certificado laboral"

            text="Adjuntar certificado laboral o respaldo de ingresos."

            accept=".pdf,.jpg,.jpeg,.png"

            label={
              tiposCargados.includes(
                "Ingresos"
              )
                ? "Agregar otro archivo"
                : "Seleccionar archivo"
            }

            completed={
              tiposCargados.includes(
                "Ingresos"
              )
            }

            disabled={
              !solicitudSeleccionada ||
              subiendo
            }

            onFile={(archivo) =>
              agregarArchivo(
                "Ingresos",
                archivo
              )
            }

          />


        </div>


        {/* ===================================================
            MENSAJE SUBIENDO
        =================================================== */}

        {subiendo && (

          <div className="document-upload-message">

            ⏳ Subiendo documento...

          </div>

        )}


      </section>


      {/* =====================================================
          LISTA DE DOCUMENTOS
      ===================================================== */}

      <section className="panel">


        <div className="document-list-header">


          <div>


            <h2 className="section-title">
              Lista de documentos cargados
            </h2>


            {solicitudSeleccionada && (

              <p className="document-list-subtitle">

                Documentos correspondientes a la solicitud #

                {solicitudSeleccionada.id}

              </p>

            )}


          </div>


          <div className="document-count">

            Total:{" "}

            <strong>
              {documentos.length}
            </strong>

          </div>


        </div>


        {/* ===================================================
            NO HAY SOLICITUD SELECCIONADA
        =================================================== */}

        {!solicitudSeleccionada ? (

          <div className="document-empty">

            <span>
              📁
            </span>

            <h3>
              Seleccione una solicitud
            </h3>

            <p>
              Los documentos asociados aparecerán aquí.
            </p>

          </div>


        ) : cargando ? (


          /* =================================================
             CARGANDO
          ================================================= */

          <div className="document-empty">

            <span>
              ⏳
            </span>

            <h3>
              Cargando documentos...
            </h3>

          </div>


        ) : documentos.length === 0 ? (


          /* =================================================
             SIN DOCUMENTOS
          ================================================= */

          <div className="document-empty">

            <span>
              📄
            </span>

            <h3>
              No existen documentos cargados
            </h3>

            <p>
              Utilice las opciones superiores para adjuntar documentos.
            </p>

          </div>


        ) : (


          /* =================================================
             TABLA DE DOCUMENTOS
          ================================================= */

          <div className="table-container">


            <table className="table">


              <thead>


                <tr>

                  <th>
                    Documento
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    Formato
                  </th>

                  <th>
                    Fecha de carga
                  </th>

                  <th>
                    Estado
                  </th>

                  <th>
                    Acciones
                  </th>

                </tr>


              </thead>


              <tbody>


                {documentos.map(
                  (documento) => (

                    <tr
                      key={
                        documento.id
                      }
                    >


                      {/* DOCUMENTO */}

                      <td>

                        <strong>

                          {documento.nombreArchivo}

                        </strong>

                      </td>


                      {/* TIPO */}

                      <td>

                        {documento.tipoDocumento}

                      </td>


                      {/* FORMATO */}

                      <td>

                        {obtenerFormato(
                          documento.nombreArchivo
                        )}

                      </td>


                      {/* FECHA */}

                      <td>

                        {formatearFecha(
                          documento.fechaCarga
                        )}

                      </td>


                      {/* ESTADO */}

                      <td>

                        <span className="status uploaded">

                          {documento.estado ||
                            "Cargado"}

                        </span>

                      </td>


                      {/* ACCIONES */}

                      <td>


                        <div className="document-actions">


                          <button

                            type="button"

                            className="btn-small btn-view"

                            onClick={() =>
                              verDocumento(
                                documento
                              )
                            }

                          >

                            👁 Ver

                          </button>


                          <button

                            type="button"

                            className="btn-small btn-delete"

                            onClick={() =>
                              eliminar(
                                documento
                              )
                            }

                          >

                            🗑️ Eliminar

                          </button>


                        </div>


                      </td>


                    </tr>

                  )
                )}


              </tbody>


            </table>


          </div>

        )}


      </section>


    </Layout>

  );

}


// ===========================================================
// COMPONENTE TARJETA DE CARGA
// ===========================================================

function UploadCard({

  icon,

  title,

  text,

  accept,

  label,

  onFile,

  disabled,

  completed

}) {


  const seleccionarArchivo = (
    e
  ) => {

    const archivo =
      e.target.files?.[0];


    if (archivo) {

      onFile(archivo);

    }


    /*
     * Permite seleccionar nuevamente
     * el mismo archivo.
     */

    e.target.value = "";

  };


  return (

    <div
      className={`upload-card ${
        disabled
          ? "upload-card-disabled"
          : ""
      } ${
        completed
          ? "upload-card-completed"
          : ""
      }`}
    >


      {/* =====================================================
          INDICADOR COMPLETADO
      ===================================================== */}

      {completed && (

        <div className="upload-completed-badge">

          ✓ Cargado

        </div>

      )}


      <div className="upload-icon">

        {icon}

      </div>


      <h3>
        {title}
      </h3>


      <p>
        {text}
      </p>


      <label className="upload-btn">

        {label}


        <input

          type="file"

          accept={accept}

          disabled={disabled}

          onChange={
            seleccionarArchivo
          }

        />


      </label>


    </div>

  );

}