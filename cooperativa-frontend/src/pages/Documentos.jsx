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
  // USUARIO Y PERMISOS
  // =========================================================

  let usuario = null;

  try {

    const usuarioGuardado =
      sessionStorage.getItem("usuario");

    if (usuarioGuardado) {

      usuario =
        JSON.parse(
          usuarioGuardado
        );
    }

  } catch (error) {

    console.error(
      "Error al obtener usuario:",
      error
    );
  }


  const puedeModificar =
    usuario?.rol === "ADMIN" ||
    usuario?.rol === "ANALISTA";


  const esGerencia =
    usuario?.rol === "GERENCIA";


  // =========================================================
  // ESTADOS
  // =========================================================

  const [
    solicitudes,
    setSolicitudes
  ] = useState([]);


  const [
    solicitudSeleccionada,
    setSolicitudSeleccionada
  ] = useState(null);


  const [
    documentos,
    setDocumentos
  ] = useState([]);


  const [
    cargando,
    setCargando
  ] = useState(false);


  const [
    subiendo,
    setSubiendo
  ] = useState(false);


  const [
    abriendoDocumento,
    setAbriendoDocumento
  ] = useState(null);


  // =========================================================
  // DOCUMENTOS OBLIGATORIOS
  // =========================================================

  const documentosObligatorios = [
    "Cédula",
    "Certificado de votación",
    "Respaldo de ingresos o ventas"
  ];


  // =========================================================
  // DOCUMENTOS ADICIONALES
  // =========================================================

  const documentosAdicionales = [
    "Respaldo de activos"
  ];


  // =========================================================
  // TIPOS CARGADOS
  // =========================================================

  const tiposCargados =
    documentos.map(
      (documento) =>
        documento.tipoDocumento
    );


  // =========================================================
  // COMPATIBILIDAD CON DOCUMENTOS ANTERIORES
  // =========================================================

  const documentoCargado = (
    tipoNuevo
  ) => {

    if (
      tiposCargados.includes(
        tipoNuevo
      )
    ) {

      return true;
    }


    /*
     * Permite que documentos cargados
     * antes de esta actualización continúen
     * siendo reconocidos parcialmente.
     */

    if (
      tipoNuevo === "Cédula" &&
      tiposCargados.includes(
        "Identificación"
      )
    ) {

      return true;
    }


    if (
      tipoNuevo ===
        "Respaldo de ingresos o ventas" &&
      tiposCargados.includes(
        "Ingresos"
      )
    ) {

      return true;
    }


    return false;
  };


  // =========================================================
  // CALCULAR DOCUMENTACIÓN COMPLETA
  // =========================================================

  const documentosFaltantes =
    documentosObligatorios.filter(
      (tipo) =>
        !documentoCargado(
          tipo
        )
    );


  const documentosCompletados =
    documentosObligatorios.length -
    documentosFaltantes.length;


  const documentacionCompleta =
    documentosFaltantes.length === 0;


  const porcentajeDocumentacion =
    documentosObligatorios.length > 0
      ? (
          documentosCompletados /
          documentosObligatorios.length
        ) * 100
      : 0;


  // =========================================================
  // CARGAR SOLICITUDES
  // =========================================================

  useEffect(() => {

    cargarSolicitudes();

  }, []);


  const cargarSolicitudes =
    async () => {

      try {

        const datos =
          await obtenerSolicitudes();


        setSolicitudes(
          datos
        );

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

  const seleccionarSolicitud =
    async (e) => {

      const id =
        e.target.value;


      if (!id) {

        setSolicitudSeleccionada(
          null
        );

        setDocumentos(
          []
        );

        return;
      }


      const solicitud =
        solicitudes.find(
          (solicitud) =>
            String(
              solicitud.id
            ) ===
            String(
              id
            )
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

  const cargarDocumentos =
    async (solicitudId) => {

      try {

        setCargando(
          true
        );


        const datos =
          await obtenerDocumentosPorSolicitud(
            solicitudId
          );


        setDocumentos(
          datos
        );

      } catch (error) {

        console.error(
          "Error al cargar documentos:",
          error
        );


        setDocumentos(
          []
        );

      } finally {

        setCargando(
          false
        );
      }
    };


  // =========================================================
  // SUBIR DOCUMENTO
  // =========================================================

  const agregarArchivo =
    async (
      tipoDocumento,
      archivo
    ) => {

      if (
        !puedeModificar
      ) {

        alert(
          "No tiene permisos para cargar documentos."
        );

        return;
      }


      if (
        !solicitudSeleccionada
      ) {

        alert(
          "Primero debe seleccionar una solicitud."
        );

        return;
      }


      if (
        !archivo
      ) {

        return;
      }


      // =====================================================
      // VALIDAR EXTENSIÓN
      // =====================================================

      const nombre =
        archivo.name
          .toLowerCase();


      const permitido =
        nombre.endsWith(".pdf") ||
        nombre.endsWith(".jpg") ||
        nombre.endsWith(".jpeg") ||
        nombre.endsWith(".png");


      if (
        !permitido
      ) {

        alert(
          "Solo se permiten archivos PDF, JPG, JPEG o PNG."
        );

        return;
      }


      // =====================================================
      // VALIDAR TAMAÑO - 10 MB
      // =====================================================

      const maximo =
        10 *
        1024 *
        1024;


      if (
        archivo.size >
        maximo
      ) {

        alert(
          "El archivo no puede superar los 10 MB."
        );

        return;
      }


      try {

        setSubiendo(
          true
        );


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

        setSubiendo(
          false
        );
      }
    };


  // =========================================================
  // ELIMINAR DOCUMENTO
  // =========================================================

  const eliminar =
    async (documento) => {

      if (
        !puedeModificar
      ) {

        alert(
          "No tiene permisos para eliminar documentos."
        );

        return;
      }


      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar "${documento.nombreArchivo}"?\n\nEsta acción eliminará también el archivo almacenado.`
        );


      if (
        !confirmar
      ) {

        return;
      }


      try {

        await eliminarDocumento(
          documento.id
        );


        if (
          solicitudSeleccionada
        ) {

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
  // VER DOCUMENTO PROTEGIDO CON JWT
  // =========================================================

  const verDocumento =
    async (documento) => {

      try {

        setAbriendoDocumento(
          documento.id
        );


        const token =
          sessionStorage.getItem(
            "token"
          );


        if (
          !token
        ) {

          alert(
            "La sesión ha expirado. Inicie sesión nuevamente."
          );


          sessionStorage.removeItem(
            "usuario"
          );


          window.location.href =
            "/";


          return;
        }


        const url =
          obtenerUrlArchivoDocumento(
            documento.id
          );


        const response =
          await fetch(
            url,
            {
              method: "GET",

              headers: {

                Authorization:
                  `Bearer ${token}`
              }
            }
          );


        // ===================================================
        // TOKEN VENCIDO
        // ===================================================

        if (
          response.status === 401
        ) {

          sessionStorage.removeItem(
            "token"
          );

          sessionStorage.removeItem(
            "usuario"
          );


          alert(
            "Su sesión ha expirado. Inicie sesión nuevamente."
          );


          window.location.href =
            "/";


          return;
        }


        // ===================================================
        // SIN PERMISOS
        // ===================================================

        if (
          response.status === 403
        ) {

          alert(
            "No tiene permisos para visualizar este documento."
          );

          return;
        }


        if (
          !response.ok
        ) {

          throw new Error(
            `Error HTTP ${response.status}`
          );
        }


        const blob =
          await response.blob();


        const urlTemporal =
          URL.createObjectURL(
            blob
          );


        const nuevaVentana =
          window.open(
            urlTemporal,
            "_blank",
            "noopener,noreferrer"
          );


        if (
          !nuevaVentana
        ) {

          const enlace =
            document.createElement(
              "a"
            );


          enlace.href =
            urlTemporal;

          enlace.target =
            "_blank";

          enlace.rel =
            "noopener noreferrer";


          document.body.appendChild(
            enlace
          );


          enlace.click();


          document.body.removeChild(
            enlace
          );
        }


        setTimeout(
          () => {

            URL.revokeObjectURL(
              urlTemporal
            );

          },
          60000
        );

      } catch (error) {

        console.error(
          "Error al abrir documento:",
          error
        );


        alert(
          "No se pudo abrir el documento."
        );

      } finally {

        setAbriendoDocumento(
          null
        );
      }
    };


  // =========================================================
  // OBTENER FORMATO
  // =========================================================

  const obtenerFormato =
    (nombreArchivo) => {

      if (
        !nombreArchivo
      ) {

        return "-";
      }


      const partes =
        nombreArchivo.split(
          "."
        );


      if (
        partes.length < 2
      ) {

        return "-";
      }


      return partes
        .pop()
        .toUpperCase();
    };


  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  const formatearFecha =
    (fecha) => {

      if (
        !fecha
      ) {

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

  const obtenerNombreCliente =
    () => {

      if (
        !solicitudSeleccionada
          ?.cliente
      ) {

        return "-";
      }


      const cliente =
        solicitudSeleccionada
          .cliente;


      return `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim();
    };


  // =========================================================
  // DESCRIPCIÓN DEL SEGMENTO
  // =========================================================

  const obtenerDescripcionSegmento =
    () => {

      if (
        !solicitudSeleccionada
      ) {

        return "";
      }


      const tipo =
        solicitudSeleccionada
          .tipoCredito;


      if (
        tipo === "Consumo"
      ) {

        return "El respaldo debe demostrar los ingresos fijos utilizados para pagar el crédito.";
      }


      if (
        tipo === "Microcrédito"
      ) {

        return "El respaldo debe permitir verificar los ingresos o ventas generadas por el negocio.";
      }


      if (
        tipo === "Productivo"
      ) {

        return "El respaldo debe permitir verificar las ventas y la actividad productiva de la empresa o negocio.";
      }


      if (
        tipo === "Inmobiliario" ||
        tipo === "Vivienda"
      ) {

        return "Además de los documentos básicos, pueden adjuntarse respaldos relacionados con el inmueble.";
      }


      return "Adjunte documentación que permita respaldar la información económica declarada.";
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
                solicitudSeleccionada
                  ?.id ||
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
                    key={
                      solicitud.id
                    }
                    value={
                      solicitud.id
                    }
                  >

                    {solicitud.codigoSolicitud ||
                      "Sin código"}

                    {" - "}

                    {solicitud.cliente
                      ? `${solicitud.cliente.nombres || ""} ${solicitud.cliente.apellidos || ""}`.trim()
                      : "Sin cliente"}

                    {" - "}

                    {solicitud.tipoCredito ||
                      "Sin segmento"}

                  </option>

                )
              )}

            </select>

          </div>

        </div>

      </section>


      {/* =====================================================
          AVISO GERENCIA
      ===================================================== */}

      {esGerencia && (

        <section className="panel">

          <div
            style={{
              padding:
                "14px 16px",
              background:
                "#f4f8f5",
              borderLeft:
                "4px solid #009144",
              borderRadius:
                "6px"
            }}
          >

            👁️{" "}

            <strong>
              Modo consulta:
            </strong>{" "}

            Gerencia puede revisar la documentación asociada a las
            solicitudes y visualizar los archivos cargados, pero no
            puede subir ni eliminar documentos.

          </div>

        </section>

      )}


      {/* =====================================================
          INFORMACIÓN DE LA SOLICITUD
      ===================================================== */}

      {solicitudSeleccionada && (

        <section className="panel">

          <h2 className="section-title">
            Información de la solicitud
          </h2>


          <div className="info-box">

            Solicitud:{" "}

            <strong>
              {solicitudSeleccionada
                .codigoSolicitud ||
                "Sin código"}
            </strong>


            {" | "}


            Cliente:{" "}

            <strong>
              {obtenerNombreCliente()}
            </strong>


            {" | "}


            Segmento:{" "}

            <strong>
              {solicitudSeleccionada
                .tipoCredito ||
                "-"}
            </strong>


            {solicitudSeleccionada
              .subsegmentoCredito && (

              <>

                {" | "}

                Subsegmento:{" "}

                <strong>
                  {solicitudSeleccionada
                    .subsegmentoCredito}
                </strong>

              </>

            )}

          </div>


          <div
            className="info-box"
            style={{
              marginTop:
                "12px"
            }}
          >

            💡{" "}

            {obtenerDescripcionSegmento()}

          </div>

        </section>

      )}


      {/* =====================================================
          DOCUMENTOS DEL SOLICITANTE
      ===================================================== */}

      <section className="panel">

        <h2 className="section-title">
          Documentos del solicitante
        </h2>


        {solicitudSeleccionada ? (

          <>

            {/* ===============================================
                ESTADO DOCUMENTACIÓN
            =============================================== */}

            <div className="info-box">

              Estado de documentación:{" "}

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
                PROGRESO
            =============================================== */}

            <div className="document-progress">

              <div className="document-progress-header">

                <span>
                  Documentación obligatoria
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

                  ✅ Documentación básica completa. La solicitud puede
                  continuar al proceso de evaluación de riesgo.

                </div>

              ) : (

                <div className="document-missing">

                  <strong>
                    Documentos pendientes:
                  </strong>


                  {documentosFaltantes.map(
                    (tipo) => (

                      <span
                        key={
                          tipo
                        }
                      >
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

            Seleccione una solicitud para consultar y cargar sus documentos.

          </div>

        )}


        {/* ===================================================
            DOCUMENTOS OBLIGATORIOS
        =================================================== */}

        {puedeModificar && (

          <>

            <h3
              style={{
                marginTop:
                  "24px",
                marginBottom:
                  "12px"
              }}
            >
              Documentos obligatorios
            </h3>


            <div className="upload-grid">

              {/* =============================================
                  CÉDULA
              ============================================= */}

              <UploadCard
                icon="🪪"
                title="Copia de cédula"
                text="Adjuntar una copia legible de la cédula de identidad del solicitante."
                accept=".pdf,.jpg,.jpeg,.png"
                label={
                  documentoCargado(
                    "Cédula"
                  )
                    ? "Agregar otra copia"
                    : "Seleccionar cédula"
                }
                completed={
                  documentoCargado(
                    "Cédula"
                  )
                }
                disabled={
                  !solicitudSeleccionada ||
                  subiendo
                }
                onFile={
                  (archivo) =>
                    agregarArchivo(
                      "Cédula",
                      archivo
                    )
                }
              />


              {/* =============================================
                  CERTIFICADO DE VOTACIÓN
              ============================================= */}

              <UploadCard
                icon="🗳️"
                title="Certificado de votación"
                text="Adjuntar una copia legible del certificado de votación vigente del solicitante."
                accept=".pdf,.jpg,.jpeg,.png"
                label={
                  documentoCargado(
                    "Certificado de votación"
                  )
                    ? "Agregar otro certificado"
                    : "Seleccionar certificado"
                }
                completed={
                  documentoCargado(
                    "Certificado de votación"
                  )
                }
                disabled={
                  !solicitudSeleccionada ||
                  subiendo
                }
                onFile={
                  (archivo) =>
                    agregarArchivo(
                      "Certificado de votación",
                      archivo
                    )
                }
              />


              {/* =============================================
                  RESPALDO INGRESOS / VENTAS
              ============================================= */}

              <UploadCard
                icon="💼"
                title="Respaldo de ingresos o ventas"
                text={
                  solicitudSeleccionada
                    ?.tipoCredito ===
                    "Microcrédito" ||
                  solicitudSeleccionada
                    ?.tipoCredito ===
                    "Productivo"

                    ? "Adjuntar documentos que permitan comprobar las ventas o ingresos de la actividad económica."

                    : "Adjuntar certificado laboral, rol de pagos u otro documento que permita comprobar los ingresos."
                }
                accept=".pdf,.jpg,.jpeg,.png"
                label={
                  documentoCargado(
                    "Respaldo de ingresos o ventas"
                  )
                    ? "Agregar otro respaldo"
                    : "Seleccionar respaldo"
                }
                completed={
                  documentoCargado(
                    "Respaldo de ingresos o ventas"
                  )
                }
                disabled={
                  !solicitudSeleccionada ||
                  subiendo
                }
                onFile={
                  (archivo) =>
                    agregarArchivo(
                      "Respaldo de ingresos o ventas",
                      archivo
                    )
                }
              />

            </div>


            {/* =================================================
                DOCUMENTOS ADICIONALES
            ================================================= */}

            <h3
              style={{
                marginTop:
                  "30px",
                marginBottom:
                  "6px"
              }}
            >
              Documentación de respaldo de activos
            </h3>


            <p
              style={{
                marginTop:
                  0,
                marginBottom:
                  "15px"
              }}
            >

              Estos documentos permiten justificar los activos o patrimonio
              declarados por el solicitante. Se pueden cargar varios archivos.

            </p>


            <div className="upload-grid">

              <UploadCard
                icon="🏦"
                title="Respaldo de activos"
                text="Ejemplos: certificado o estado de cuenta bancario, pago predial, documento de vehículo u otro respaldo patrimonial."
                accept=".pdf,.jpg,.jpeg,.png"
                label={
                  documentoCargado(
                    "Respaldo de activos"
                  )
                    ? "Agregar otro respaldo"
                    : "Seleccionar respaldo"
                }
                completed={
                  documentoCargado(
                    "Respaldo de activos"
                  )
                }
                disabled={
                  !solicitudSeleccionada ||
                  subiendo
                }
                onFile={
                  (archivo) =>
                    agregarArchivo(
                      "Respaldo de activos",
                      archivo
                    )
                }
              />

            </div>


            <div
              className="info-box"
              style={{
                marginTop:
                  "20px"
              }}
            >

              ℹ️ <strong>Pasivos:</strong>{" "}
              no se solicita documentación específica en esta sección.
              La información de obligaciones y endeudamiento será obtenida
              mediante la herramienta de Buró de Crédito.

            </div>

          </>

        )}


        {/* ===================================================
            MENSAJE SUBIENDO
        =================================================== */}

        {puedeModificar &&
          subiendo && (

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

                Documentos correspondientes a la solicitud{" "}

                <strong>

                  {solicitudSeleccionada
                    .codigoSolicitud ||
                    "Sin código"}

                </strong>

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
            SIN SOLICITUD
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

              {puedeModificar
                ? "Utilice las opciones superiores para adjuntar documentos."
                : "Esta solicitud todavía no tiene documentos registrados."}

            </p>

          </div>


        ) : (

          /* =================================================
             TABLA
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

                      <td>

                        <strong>
                          {documento.nombreArchivo}
                        </strong>

                      </td>


                      <td>
                        {documento.tipoDocumento}
                      </td>


                      <td>

                        {obtenerFormato(
                          documento.nombreArchivo
                        )}

                      </td>


                      <td>

                        {formatearFecha(
                          documento.fechaCarga
                        )}

                      </td>


                      <td>

                        <span className="status uploaded">

                          {documento.estado ||
                            "Cargado"}

                        </span>

                      </td>


                      <td>

                        <div className="document-actions">

                          <button
                            type="button"
                            className="btn-small btn-view"
                            disabled={
                              abriendoDocumento ===
                              documento.id
                            }
                            onClick={
                              () =>
                                verDocumento(
                                  documento
                                )
                            }
                          >

                            {abriendoDocumento ===
                            documento.id
                              ? "⏳ Abriendo..."
                              : "👁 Ver"}

                          </button>


                          {puedeModificar && (

                            <button
                              type="button"
                              className="btn-small btn-delete"
                              onClick={
                                () =>
                                  eliminar(
                                    documento
                                  )
                              }
                            >
                              🗑️ Eliminar
                            </button>

                          )}

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

  const seleccionarArchivo =
    (e) => {

      const archivo =
        e.target.files?.[0];


      if (
        archivo
      ) {

        onFile(
          archivo
        );
      }


      /*
       * Permite volver a seleccionar
       * el mismo archivo posteriormente.
       */

      e.target.value =
        "";
    };


  return (

    <div
      className={
        `upload-card ${
          disabled
            ? "upload-card-disabled"
            : ""
        } ${
          completed
            ? "upload-card-completed"
            : ""
        }`
      }
    >

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