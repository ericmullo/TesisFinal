import Layout from "../components/Layout";
import { useEffect, useState } from "react";

import {
  obtenerClientes,
  crearCliente,
  obtenerClientePorId,
  actualizarCliente,
  eliminarCliente,
  obtenerEvaluacionesPorCliente,
} from "../services/api";


function Clientes() {

  // =========================================================
  // ESTADOS
  // =========================================================

  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");

  const [
    clienteSeleccionado,
    setClienteSeleccionado
  ] = useState(null);

  const [
    historialEvaluaciones,
    setHistorialEvaluaciones
  ] = useState([]);

  const [
    cargandoHistorial,
    setCargandoHistorial
  ] = useState(false);

  const [
    clienteAEliminar,
    setClienteAEliminar
  ] = useState(null);

  const [
    clienteEditandoId,
    setClienteEditandoId
  ] = useState(null);


  // =========================================================
  // FORMULARIO
  // =========================================================

  const [formulario, setFormulario] = useState({
    cedula: "",
    nombres: "",
    apellidos: "",
    correo: "",
    telefono: "",
    estado: "Activo",
  });


  // =========================================================
  // CARGAR CLIENTES
  // =========================================================

  useEffect(() => {
    cargarClientes();
  }, []);


  const cargarClientes = () => {

    obtenerClientes()
      .then((datos) => {
        setClientes(datos);
      })
      .catch((error) => {
        console.error(
          "ERROR AL CARGAR CLIENTES:",
          error
        );
      });

  };


  // =========================================================
  // CAMBIOS DEL FORMULARIO
  // =========================================================

  const manejarCambio = (e) => {

    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });

  };


  // =========================================================
  // LIMPIAR FORMULARIO
  // =========================================================

  const limpiarFormulario = () => {

    setFormulario({
      cedula: "",
      nombres: "",
      apellidos: "",
      correo: "",
      telefono: "",
      estado: "Activo",
    });

    setClienteEditandoId(null);

  };


  // =========================================================
  // VALIDAR FORMULARIO
  // =========================================================

  const formularioValido = () => {

    return (
      formulario.cedula.trim() &&
      formulario.nombres.trim() &&
      formulario.apellidos.trim() &&
      formulario.correo.trim() &&
      formulario.telefono.trim()
    );

  };


  // =========================================================
  // CREAR CLIENTE
  // =========================================================

  const manejarCrearCliente = async () => {

    if (!formularioValido()) {

      alert(
        "Por favor completa todos los campos."
      );

      return;
    }

    try {

      const nuevoCliente =
        await crearCliente(formulario);

      setClientes((clientesActuales) => [
        ...clientesActuales,
        nuevoCliente,
      ]);

      limpiarFormulario();

      alert(
        "Cliente creado correctamente."
      );

    } catch (error) {

      console.error(
        "ERROR AL CREAR CLIENTE:",
        error
      );

      alert(
        "No se pudo crear el cliente."
      );

    }

  };


  // =========================================================
  // VER CLIENTE + HISTORIAL
  // =========================================================

  const manejarVerCliente = async (id) => {

    try {

      setCargandoHistorial(true);

      const [
        cliente,
        evaluaciones
      ] = await Promise.all([

        obtenerClientePorId(id),

        obtenerEvaluacionesPorCliente(id),

      ]);

      setClienteSeleccionado(cliente);

      setHistorialEvaluaciones(
        evaluaciones || []
      );

    } catch (error) {

      console.error(
        "ERROR AL OBTENER CLIENTE:",
        error
      );

      alert(
        "No se pudo obtener la información del cliente."
      );

    } finally {

      setCargandoHistorial(false);

    }

  };


  const cerrarModalVer = () => {

    setClienteSeleccionado(null);

    setHistorialEvaluaciones([]);

    setCargandoHistorial(false);

  };


  // =========================================================
  // EDITAR CLIENTE
  // =========================================================

  const manejarEditarCliente = async (id) => {

    try {

      const cliente =
        await obtenerClientePorId(id);

      setClienteEditandoId(
        cliente.id
      );

      setFormulario({
        cedula: cliente.cedula || "",
        nombres: cliente.nombres || "",
        apellidos: cliente.apellidos || "",
        correo: cliente.correo || "",
        telefono: cliente.telefono || "",
        estado: cliente.estado || "Activo",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {

      console.error(
        "ERROR AL CARGAR CLIENTE:",
        error
      );

      alert(
        "No se pudo cargar el cliente para editar."
      );

    }

  };


  const manejarGuardarCambios = async () => {

    if (!formularioValido()) {

      alert(
        "Por favor completa todos los campos."
      );

      return;
    }

    try {

      const clienteActualizado =
        await actualizarCliente(
          clienteEditandoId,
          formulario
        );

      setClientes((clientesActuales) =>
        clientesActuales.map((cliente) =>
          cliente.id === clienteEditandoId
            ? clienteActualizado
            : cliente
        )
      );

      limpiarFormulario();

      alert(
        "Cliente actualizado correctamente."
      );

    } catch (error) {

      console.error(
        "ERROR AL ACTUALIZAR CLIENTE:",
        error
      );

      alert(
        "No se pudo actualizar el cliente."
      );

    }

  };


  // =========================================================
  // ELIMINAR CLIENTE
  // =========================================================

  const manejarSolicitarEliminar = (
    cliente
  ) => {

    setClienteAEliminar(cliente);

  };


  const cerrarModalEliminar = () => {

    setClienteAEliminar(null);

  };


  const manejarConfirmarEliminar =
    async () => {

      if (!clienteAEliminar) {
        return;
      }

      try {

        await eliminarCliente(
          clienteAEliminar.id
        );

        setClientes((clientesActuales) =>
          clientesActuales.filter(
            (cliente) =>
              cliente.id !==
              clienteAEliminar.id
          )
        );

        if (
          clienteEditandoId ===
          clienteAEliminar.id
        ) {

          limpiarFormulario();

        }

        setClienteAEliminar(null);

      } catch (error) {

        console.error(
          "ERROR AL ELIMINAR CLIENTE:",
          error
        );

        alert(
          "No se pudo eliminar el cliente."
        );

      }

    };


  // =========================================================
  // CLASE DE ESTADO
  // =========================================================

  const obtenerClaseEstado = (
    estado
  ) => {

    if (estado === "Activo") {
      return "status active-status";
    }

    if (estado === "En revisión") {
      return "status review";
    }

    if (estado === "Alerta") {
      return "status inactive";
    }

    return "status";

  };


  // =========================================================
  // CLASE DE RIESGO
  // =========================================================

  const obtenerClaseRiesgo = (
    riesgo
  ) => {

    if (!riesgo) {
      return "cliente-risk-badge";
    }

    const valor =
      riesgo.toLowerCase();

    if (valor === "bajo") {
      return "cliente-risk-badge low";
    }

    if (valor === "medio") {
      return "cliente-risk-badge medium";
    }

    if (valor === "alto") {
      return "cliente-risk-badge high";
    }

    return "cliente-risk-badge";

  };


  // =========================================================
  // FORMATEAR DINERO
  // =========================================================

  const formatearDinero = (
    valor
  ) => {

    return new Intl.NumberFormat(
      "es-EC",
      {
        style: "currency",
        currency: "USD",
      }
    ).format(
      Number(valor || 0)
    );

  };


  // =========================================================
  // FORMATEAR PORCENTAJE
  // =========================================================

  const formatearPorcentaje = (
    valor
  ) => {

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

  const formatearFecha = (
    fecha
  ) => {

    if (!fecha) {
      return "-";
    }

    return new Date(
      fecha
    ).toLocaleString(
      "es-EC",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );

  };


  // =========================================================
  // CONTADORES GENERALES
  // =========================================================

  const totalClientes =
    clientes.length;


  const clientesActivos =
    clientes.filter(
      (cliente) =>
        cliente.estado === "Activo"
    ).length;


  const clientesRevision =
    clientes.filter(
      (cliente) =>
        cliente.estado ===
        "En revisión"
    ).length;


  const clientesAlerta =
    clientes.filter(
      (cliente) =>
        cliente.estado === "Alerta"
    ).length;


  // =========================================================
  // HISTORIAL DEL CLIENTE
  // =========================================================

  const ultimaEvaluacion =
    historialEvaluaciones.length > 0
      ? historialEvaluaciones[0]
      : null;


  // =========================================================
  // BUSCADOR
  // =========================================================

  const clientesFiltrados =
    clientes.filter((cliente) => {

      const texto =
        busqueda
          .toLowerCase()
          .trim();

      return (

        String(cliente.cedula || "")
          .toLowerCase()
          .includes(texto) ||

        String(cliente.nombres || "")
          .toLowerCase()
          .includes(texto) ||

        String(cliente.apellidos || "")
          .toLowerCase()
          .includes(texto) ||

        String(cliente.correo || "")
          .toLowerCase()
          .includes(texto) ||

        String(cliente.telefono || "")
          .toLowerCase()
          .includes(texto)

      );

    });


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <Layout title="Gestión de Clientes">


      {/* =====================================================
          TARJETAS
      ===================================================== */}

      <section className="summary-cards four">

        <div className="small-card">

          <h3>
            Total clientes
          </h3>

          <strong>
            {totalClientes}
          </strong>

        </div>


        <div className="small-card">

          <h3>
            Clientes activos
          </h3>

          <strong>
            {clientesActivos}
          </strong>

        </div>


        <div className="small-card yellow">

          <h3>
            Clientes en revisión
          </h3>

          <strong>
            {clientesRevision}
          </strong>

        </div>


        <div className="small-card red">

          <h3>
            Clientes con alerta
          </h3>

          <strong>
            {clientesAlerta}
          </strong>

        </div>

      </section>


      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <section className="panel">

        <div className="search-actions">

          <input
            className="search-box"
            type="text"
            placeholder="Buscar cliente por nombre, cédula o correo..."
            value={busqueda}
            onChange={(e) =>
              setBusqueda(
                e.target.value
              )
            }
          />


          <button

            className="btn btn-green"

            type="button"

            onClick={
              clienteEditandoId
                ? manejarGuardarCambios
                : manejarCrearCliente
            }

          >

            {clienteEditandoId
              ? "💾 Guardar cambios"
              : "➕ Crear cliente"}

          </button>

        </div>


        {/* MODO EDICIÓN */}

        {clienteEditandoId && (

          <div
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              background: "#f4f8f5",
              borderLeft:
                "4px solid #009144",
              borderRadius: "6px",
            }}
          >

            <strong>
              ✏️ Editando cliente
            </strong>

            <button
              type="button"
              onClick={
                limpiarFormulario
              }
              style={{
                marginLeft: "15px",
                border: "none",
                background:
                  "transparent",
                cursor: "pointer",
                textDecoration:
                  "underline",
              }}
            >
              Cancelar edición
            </button>

          </div>

        )}


        <div className="form-grid four">


          <div className="form-group">

            <label>
              Cédula
            </label>

            <input
              type="text"
              name="cedula"
              value={
                formulario.cedula
              }
              onChange={
                manejarCambio
              }
              placeholder="Ej. 1300000000"
            />

          </div>


          <div className="form-group">

            <label>
              Nombres
            </label>

            <input
              type="text"
              name="nombres"
              value={
                formulario.nombres
              }
              onChange={
                manejarCambio
              }
              placeholder="Nombres del cliente"
            />

          </div>


          <div className="form-group">

            <label>
              Apellidos
            </label>

            <input
              type="text"
              name="apellidos"
              value={
                formulario.apellidos
              }
              onChange={
                manejarCambio
              }
              placeholder="Apellidos del cliente"
            />

          </div>


          <div className="form-group">

            <label>
              Correo
            </label>

            <input
              type="email"
              name="correo"
              value={
                formulario.correo
              }
              onChange={
                manejarCambio
              }
              placeholder="correo@ejemplo.com"
            />

          </div>


          <div className="form-group">

            <label>
              Teléfono
            </label>

            <input
              type="text"
              name="telefono"
              value={
                formulario.telefono
              }
              onChange={
                manejarCambio
              }
              placeholder="Ej. 0991234567"
            />

          </div>


          <div className="form-group">

            <label>
              Estado
            </label>

            <select
              name="estado"
              value={
                formulario.estado
              }
              onChange={
                manejarCambio
              }
            >

              <option value="Activo">
                Activo
              </option>

              <option value="En revisión">
                En revisión
              </option>

              <option value="Alerta">
                Alerta
              </option>

            </select>

          </div>


        </div>

      </section>


      {/* =====================================================
          TABLA
      ===================================================== */}

      <section className="panel">

        <h2 className="section-title">
          Tabla de clientes registrados
        </h2>


        <table className="table">

          <thead>

            <tr>

              <th>Cédula</th>

              <th>Cliente</th>

              <th>Correo</th>

              <th>Teléfono</th>

              <th>Estado</th>

              <th>Acciones</th>

            </tr>

          </thead>


          <tbody>

            {clientesFiltrados.map(
              (cliente) => (

                <tr key={cliente.id}>

                  <td>
                    {cliente.cedula}
                  </td>

                  <td>
                    {cliente.nombres}{" "}
                    {cliente.apellidos}
                  </td>

                  <td>
                    {cliente.correo}
                  </td>

                  <td>
                    {cliente.telefono}
                  </td>

                  <td>

                    <span
                      className={
                        obtenerClaseEstado(
                          cliente.estado
                        )
                      }
                    >

                      {cliente.estado}

                    </span>

                  </td>


                  <td>

                    <button
                      className="btn-small btn-view"
                      type="button"
                      onClick={() =>
                        manejarVerCliente(
                          cliente.id
                        )
                      }
                    >
                      Ver
                    </button>


                    <button
                      className="btn-small btn-yellow"
                      type="button"
                      onClick={() =>
                        manejarEditarCliente(
                          cliente.id
                        )
                      }
                    >
                      Editar
                    </button>


                    <button
                      className="btn-small btn-delete"
                      type="button"
                      onClick={() =>
                        manejarSolicitarEliminar(
                          cliente
                        )
                      }
                    >
                      Eliminar
                    </button>

                  </td>

                </tr>

              )
            )}

          </tbody>

        </table>


        {clientesFiltrados.length === 0 && (

          <p
            style={{
              textAlign: "center",
              padding: "20px",
            }}
          >

            {busqueda
              ? "No se encontraron clientes con esa búsqueda."
              : "No hay clientes registrados."}

          </p>

        )}

      </section>


      {/* =====================================================
          MODAL VER CLIENTE
      ===================================================== */}

      {clienteSeleccionado && (

        <div
          className="modal-overlay"
          onClick={
            cerrarModalVer
          }
        >

          <div
            className="cliente-modal cliente-modal-history"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* HEADER */}

            <div className="cliente-modal-header">

              <div>

                <h2>
                  Información del cliente
                </h2>

                <p>
                  Datos generales e historial
                  crediticio interno
                </p>

              </div>


              <button
                className="modal-close"
                type="button"
                onClick={
                  cerrarModalVer
                }
              >
                ✕
              </button>

            </div>


            {/* BODY */}

            <div className="cliente-modal-scroll">


              {/* DATOS PERSONALES */}

              <div className="cliente-history-section">

                <h3 className="cliente-history-title">
                  Datos generales
                </h3>


                <div className="cliente-modal-body">

                  <div className="cliente-info">

                    <span>
                      Cédula
                    </span>

                    <strong>
                      {clienteSeleccionado.cedula}
                    </strong>

                  </div>


                  <div className="cliente-info">

                    <span>
                      Nombres
                    </span>

                    <strong>
                      {clienteSeleccionado.nombres}
                    </strong>

                  </div>


                  <div className="cliente-info">

                    <span>
                      Apellidos
                    </span>

                    <strong>
                      {clienteSeleccionado.apellidos}
                    </strong>

                  </div>


                  <div className="cliente-info">

                    <span>
                      Teléfono
                    </span>

                    <strong>
                      {clienteSeleccionado.telefono}
                    </strong>

                  </div>


                  <div className="cliente-info cliente-info-full">

                    <span>
                      Correo electrónico
                    </span>

                    <strong>
                      {clienteSeleccionado.correo}
                    </strong>

                  </div>


                  <div className="cliente-info cliente-info-full">

                    <span>
                      Estado
                    </span>

                    <div>

                      <span
                        className={
                          obtenerClaseEstado(
                            clienteSeleccionado.estado
                          )
                        }
                      >

                        {clienteSeleccionado.estado}

                      </span>

                    </div>

                  </div>

                </div>

              </div>


              {/* CARGANDO */}

              {cargandoHistorial && (

                <div className="cliente-history-loading">

                  ⏳ Cargando historial
                  crediticio...

                </div>

              )}


              {/* HISTORIAL DISPONIBLE */}

              {!cargandoHistorial &&
                historialEvaluaciones.length > 0 && (

                  <>

                    {/* RESUMEN */}

                    <div className="cliente-history-section">

                      <h3 className="cliente-history-title">
                        Historial crediticio interno
                      </h3>


                      <div className="cliente-credit-summary">


                        <div className="cliente-credit-card">

                          <span>
                            Evaluaciones
                          </span>

                          <strong>
                            {historialEvaluaciones.length}
                          </strong>

                          <small>
                            realizadas
                          </small>

                        </div>


                        <div className="cliente-credit-card">

                          <span>
                            Último Score IA
                          </span>

                          <strong>

                            {ultimaEvaluacion?.scoreIa != null
                              ? `${ultimaEvaluacion.scoreIa}/100`
                              : "-"}

                          </strong>

                          <small>
                            evaluación más reciente
                          </small>

                        </div>


                        <div className="cliente-credit-card">

                          <span>
                            Última mora estimada
                          </span>

                          <strong>

                            {formatearPorcentaje(
                              ultimaEvaluacion
                                ?.probabilidadMora
                            )}

                          </strong>

                          <small>
                            probabilidad estimada
                          </small>

                        </div>


                        <div className="cliente-credit-card">

                          <span>
                            Último nivel de riesgo
                          </span>

                          <strong
                            className={
                              obtenerClaseRiesgo(
                                ultimaEvaluacion
                                  ?.nivelRiesgo
                              )
                            }
                          >

                            {ultimaEvaluacion
                              ?.nivelRiesgo ||
                              "-"}

                          </strong>

                          <small>
                            clasificación reciente
                          </small>

                        </div>


                      </div>

                    </div>


                    {/* HISTORIAL */}

                    <div className="cliente-history-section">

                      <h3 className="cliente-history-title">
                        Historial de evaluaciones
                      </h3>


                      <div className="cliente-evaluation-list">

                        {historialEvaluaciones.map(
                          (item) => (

                            <div
                              className="cliente-evaluation-card"
                              key={item.id}
                            >


                              <div className="cliente-evaluation-header">

                                <div>

                                  <strong>

                                    Solicitud #
                                    {item.solicitud?.id}

                                  </strong>

                                  <span>

                                    {item.solicitud
                                      ?.tipoCredito ||
                                      "Tipo no registrado"}

                                  </span>

                                </div>


                                <span
                                  className={
                                    obtenerClaseRiesgo(
                                      item.nivelRiesgo
                                    )
                                  }
                                >

                                  Riesgo{" "}
                                  {item.nivelRiesgo ||
                                    "-"}

                                </span>

                              </div>


                              <div className="cliente-evaluation-credit">

                                <span>

                                  Monto solicitado:{" "}

                                  <strong>

                                    {formatearDinero(
                                      item.solicitud
                                        ?.monto
                                    )}

                                  </strong>

                                </span>


                                <span>

                                  Plazo:{" "}

                                  <strong>

                                    {item.solicitud
                                      ?.plazoMeses
                                      ? `${item.solicitud.plazoMeses} meses`
                                      : "-"}

                                  </strong>

                                </span>

                              </div>


                              <div className="cliente-evaluation-metrics">


                                <div>

                                  <span>
                                    Score IA
                                  </span>

                                  <strong>

                                    {item.scoreIa != null
                                      ? `${item.scoreIa}/100`
                                      : "-"}

                                  </strong>

                                </div>


                                <div>

                                  <span>
                                    Mora estimada
                                  </span>

                                  <strong>

                                    {formatearPorcentaje(
                                      item.probabilidadMora
                                    )}

                                  </strong>

                                </div>


                                <div>

                                  <span>
                                    Nivel de riesgo
                                  </span>

                                  <strong>

                                    {item.nivelRiesgo ||
                                      "-"}

                                  </strong>

                                </div>


                              </div>


                              <div className="cliente-evaluation-footer">

                                <span>

                                  🤖{" "}
                                  {item.modeloUtilizado ||
                                    "Modelo no registrado"}

                                </span>

                                <span>

                                  {formatearFecha(
                                    item.fechaEvaluacion
                                  )}

                                </span>

                              </div>


                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </>

                )}


              {/* SIN HISTORIAL */}

              {!cargandoHistorial &&
                historialEvaluaciones.length === 0 && (

                  <div className="cliente-no-history">

                    <div className="cliente-no-history-icon">
                      🧠
                    </div>

                    <h3>
                      Sin historial de evaluaciones
                    </h3>

                    <p>
                      Este cliente todavía no cuenta
                      con evaluaciones de riesgo
                      realizadas mediante el modelo
                      de inteligencia artificial.
                    </p>

                  </div>

                )}

            </div>


            {/* FOOTER */}

            <div className="cliente-modal-footer">

              <button
                className="btn btn-green"
                type="button"
                onClick={
                  cerrarModalVer
                }
              >
                Cerrar
              </button>

            </div>


          </div>

        </div>

      )}


      {/* =====================================================
          MODAL ELIMINAR
      ===================================================== */}

      {clienteAEliminar && (

        <div
          className="modal-overlay"
          onClick={
            cerrarModalEliminar
          }
        >

          <div
            className="cliente-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="cliente-modal-header">

              <div>

                <h2>
                  Eliminar cliente
                </h2>

                <p>
                  Confirmación de eliminación
                </p>

              </div>


              <button
                className="modal-close"
                type="button"
                onClick={
                  cerrarModalEliminar
                }
              >
                ✕
              </button>

            </div>


            <div
              style={{
                padding: "30px",
              }}
            >

              <h3
                style={{
                  marginTop: "0",
                }}
              >

                ¿Estás seguro de eliminar este cliente?

              </h3>


              <p>

                Estás a punto de eliminar a{" "}

                <strong>

                  {clienteAEliminar.nombres}{" "}
                  {clienteAEliminar.apellidos}

                </strong>.

              </p>


              <p
                style={{
                  color: "#777",
                  marginBottom: "0",
                }}
              >

                El registro será eliminado de la base de datos.

              </p>

            </div>


            <div className="cliente-modal-footer">

              <button
                className="btn-small btn-view"
                type="button"
                onClick={
                  cerrarModalEliminar
                }
              >
                Cancelar
              </button>


              <button
                className="btn-small btn-delete"
                type="button"
                onClick={
                  manejarConfirmarEliminar
                }
              >
                Eliminar
              </button>

            </div>

          </div>

        </div>

      )}

    </Layout>

  );

}


export default Clientes;