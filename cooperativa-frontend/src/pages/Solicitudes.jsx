import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import {
  obtenerClientes,
  obtenerSolicitudes,
  crearSolicitud,
  actualizarSolicitud,
  eliminarSolicitud
} from "../services/api";


const initialForm = {
  clienteId: "",
  cedula: "",
  nombres: "",
  correo: "",
  telefono: "",
  estadoCivil: "Soltero/a",
  ocupacion: "",
  direccion: "",
  ingresos: "",
  egresos: "",
  endeudamiento: "",
  empresa: "",
  antiguedad: "",
  capacidadPago: "",
  tipoCredito: "Consumo",
  monto: "",
  plazo: "6 meses",
  estado: "Pendiente",
  destino: ""
};


export default function Solicitudes() {

  // =========================================================
  // ESTADOS
  // =========================================================

  const [form, setForm] = useState(initialForm);

  const [clientes, setClientes] = useState([]);

  const [solicitudes, setSolicitudes] = useState([]);

  const [guardando, setGuardando] = useState(false);

  const [solicitudSeleccionada, setSolicitudSeleccionada] =
    useState(null);

  const [modalVer, setModalVer] = useState(false);

  const [modoEdicion, setModoEdicion] = useState(false);

  const [solicitudEditandoId, setSolicitudEditandoId] =
    useState(null);


  // =========================================================
  // CARGAR DATOS AL INICIAR
  // =========================================================

  useEffect(() => {

    cargarClientes();

    cargarSolicitudes();

  }, []);


  // =========================================================
  // CARGAR CLIENTES
  // =========================================================

  const cargarClientes = async () => {

    try {

      const datos = await obtenerClientes();

      setClientes(datos);

    } catch (error) {

      console.error(
        "Error al cargar clientes:",
        error
      );

      alert(
        "No se pudieron cargar los clientes."
      );

    }

  };


  // =========================================================
  // CARGAR SOLICITUDES
  // =========================================================

  const cargarSolicitudes = async () => {

    try {

      const datos = await obtenerSolicitudes();

      setSolicitudes(datos);

    } catch (error) {

      console.error(
        "Error al cargar solicitudes:",
        error
      );

    }

  };


  // =========================================================
  // ACTUALIZAR CAMPOS DEL FORMULARIO
  // =========================================================

  const update = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });

  };


  // =========================================================
  // SELECCIONAR CLIENTE
  // =========================================================

  const seleccionarCliente = (e) => {

    const id = e.target.value;

    if (!id) {

      setForm({
        ...form,
        clienteId: "",
        cedula: "",
        nombres: "",
        correo: "",
        telefono: ""
      });

      return;

    }


    const cliente = clientes.find(
      (cliente) =>
        String(cliente.id) === String(id)
    );


    if (!cliente) {
      return;
    }


    setForm((formAnterior) => ({

      ...formAnterior,

      clienteId:
        cliente.id,

      cedula:
        cliente.cedula || "",

      nombres:
        `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim(),

      correo:
        cliente.correo || "",

      telefono:
        cliente.telefono || ""

    }));

  };


  // =========================================================
  // LIMPIAR / CANCELAR EDICIÓN
  // =========================================================

  const limpiar = () => {

    setForm(initialForm);

    setModoEdicion(false);

    setSolicitudEditandoId(null);

  };


  // =========================================================
  // CREAR OBJETO SOLICITUD
  // =========================================================

  const construirSolicitud = () => {

    return {

      estadoCivil:
        form.estadoCivil,

      ocupacion:
        form.ocupacion,

      direccion:
        form.direccion,

      ingresosMensuales:
        Number(form.ingresos),

      egresosMensuales:
        form.egresos
          ? Number(form.egresos)
          : 0,

      nivelEndeudamiento:
        form.endeudamiento
          ? Number(form.endeudamiento)
          : 0,

      empresa:
        form.empresa,

      antiguedadLaboral:
        form.antiguedad,

      capacidadPago:
        form.capacidadPago
          ? Number(form.capacidadPago)
          : 0,

      tipoCredito:
        form.tipoCredito,

      monto:
        Number(form.monto),

      plazoMeses:
        Number(
          form.plazo.replace(
            " meses",
            ""
          )
        ),

      estado:
        form.estado,

      destinoCredito:
        form.destino

    };

  };


  // =========================================================
  // GUARDAR / ACTUALIZAR SOLICITUD
  // =========================================================

  const guardar = async (e) => {

    e.preventDefault();


    // VALIDAR CLIENTE

    if (!form.clienteId) {

      alert(
        "Debe seleccionar un cliente."
      );

      return;

    }


    // VALIDAR INGRESOS

    if (!form.ingresos) {

      alert(
        "Ingrese los ingresos mensuales."
      );

      return;

    }


    // VALIDAR MONTO

    if (!form.monto) {

      alert(
        "Ingrese el monto solicitado."
      );

      return;

    }


    const solicitud =
      construirSolicitud();


    try {

      setGuardando(true);


      // =====================================================
      // EDITAR
      // =====================================================

      if (modoEdicion) {

        const solicitudActualizada =
          await actualizarSolicitud(
            solicitudEditandoId,
            form.clienteId,
            solicitud
          );


        console.log(
          "Solicitud actualizada:",
          solicitudActualizada
        );


        alert(
          "Solicitud actualizada correctamente."
        );

      }

      // =====================================================
      // CREAR
      // =====================================================

      else {

        const nuevaSolicitud =
          await crearSolicitud(
            form.clienteId,
            solicitud
          );


        console.log(
          "Solicitud registrada:",
          nuevaSolicitud
        );


        alert(
          "Solicitud registrada correctamente."
        );

      }


      // ACTUALIZAR TABLA

      await cargarSolicitudes();


      // LIMPIAR

      limpiar();


    } catch (error) {

      console.error(
        "Error al guardar la solicitud:",
        error
      );


      if (modoEdicion) {

        alert(
          "No se pudo actualizar la solicitud."
        );

      } else {

        alert(
          "No se pudo registrar la solicitud."
        );

      }


    } finally {

      setGuardando(false);

    }

  };


  // =========================================================
  // VER SOLICITUD
  // =========================================================

  const verSolicitud = (solicitud) => {

    setSolicitudSeleccionada(
      solicitud
    );

    setModalVer(true);

  };


  // =========================================================
  // CERRAR MODAL VER
  // =========================================================

  const cerrarModalVer = () => {

    setModalVer(false);

    setSolicitudSeleccionada(null);

  };


  // =========================================================
  // EDITAR SOLICITUD
  // =========================================================

  const editarSolicitud = (solicitud) => {

    const cliente =
      solicitud.cliente;


    setForm({

      clienteId:
        cliente?.id || "",

      cedula:
        cliente?.cedula || "",

      nombres:
        cliente
          ? `${cliente.nombres || ""} ${cliente.apellidos || ""}`.trim()
          : "",

      correo:
        cliente?.correo || "",

      telefono:
        cliente?.telefono || "",


      estadoCivil:
        solicitud.estadoCivil ||
        "Soltero/a",

      ocupacion:
        solicitud.ocupacion || "",

      direccion:
        solicitud.direccion || "",


      ingresos:
        solicitud.ingresosMensuales ??
        "",

      egresos:
        solicitud.egresosMensuales ??
        "",

      endeudamiento:
        solicitud.nivelEndeudamiento ??
        "",

      empresa:
        solicitud.empresa || "",

      antiguedad:
        solicitud.antiguedadLaboral ||
        "",

      capacidadPago:
        solicitud.capacidadPago ??
        "",


      tipoCredito:
        solicitud.tipoCredito ||
        "Consumo",

      monto:
        solicitud.monto ?? "",

      plazo:
        `${solicitud.plazoMeses || 6} meses`,

      estado:
        solicitud.estado ||
        "Pendiente",

      destino:
        solicitud.destinoCredito || ""

    });


    setSolicitudEditandoId(
      solicitud.id
    );


    setModoEdicion(true);


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  };


  // =========================================================
  // ELIMINAR SOLICITUD
  // =========================================================

  const borrarSolicitud = async (solicitud) => {

    const clienteNombre =
      solicitud.cliente
        ? `${solicitud.cliente.nombres || ""} ${solicitud.cliente.apellidos || ""}`.trim()
        : "este cliente";


    const confirmar =
      window.confirm(
        `¿Está seguro de eliminar la solicitud #${solicitud.id} de ${clienteNombre}?\n\nEsta acción no se puede deshacer.`
      );


    if (!confirmar) {
      return;
    }


    try {

      await eliminarSolicitud(
        solicitud.id
      );


      alert(
        "Solicitud eliminada correctamente."
      );


      // Si estábamos editando justo esa solicitud

      if (
        solicitudEditandoId ===
        solicitud.id
      ) {

        limpiar();

      }


      // Si estaba abierta en el modal

      if (
        solicitudSeleccionada?.id ===
        solicitud.id
      ) {

        cerrarModalVer();

      }


      // ACTUALIZAR TABLA

      await cargarSolicitudes();


    } catch (error) {

      console.error(
        "Error al eliminar solicitud:",
        error
      );


      alert(
        "No se pudo eliminar la solicitud."
      );

    }

  };


  // =========================================================
  // FORMATEAR DINERO
  // =========================================================

  const formatearDinero = (valor) => {

    return `$${Number(
      valor || 0
    ).toLocaleString(
      "es-EC",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;

  };


  // =========================================================
  // OBTENER CLASE DEL ESTADO
  // =========================================================

  const obtenerClaseEstado = (estado) => {

    if (estado === "Aprobado") {
      return "aprobado";
    }

    if (estado === "Rechazado") {
      return "rechazado";
    }

    if (estado === "En evaluación") {
      return "evaluacion";
    }

    return "pendiente";

  };


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <Layout title="Registro de Solicitud de Crédito">


      {/* =====================================================
          TARJETAS SUPERIORES
      ===================================================== */}

      <section className="summary-cards three">


        <div className="summary-card">

          <h3>
            Cliente seleccionado
          </h3>

          <strong>

            {form.nombres ||
              "Sin seleccionar"}

          </strong>

        </div>


        <div className="summary-card yellow">

          <h3>
            Monto solicitado
          </h3>

          <strong>

            {form.monto
              ? formatearDinero(
                  form.monto
                )
              : "$0,00"}

          </strong>

        </div>


        <div className="summary-card orange">

          <h3>
            Estado de la solicitud
          </h3>

          <strong>
            {form.estado}
          </strong>

        </div>


      </section>


      {/* =====================================================
          AVISO MODO EDICIÓN
      ===================================================== */}

      {modoEdicion && (

        <div className="editing-alert">

          <div>

            <strong>
              ✏️ Editando solicitud #{solicitudEditandoId}
            </strong>

            <span>
              Modifique los datos necesarios y presione Actualizar solicitud.
            </span>

          </div>


          <button
            type="button"
            onClick={limpiar}
          >
            Cancelar edición
          </button>

        </div>

      )}


      {/* =====================================================
          FORMULARIO
      ===================================================== */}

      <form onSubmit={guardar}>


        {/* ===================================================
            DATOS PERSONALES
        =================================================== */}

        <section className="panel">

          <h2 className="section-title">
            Datos personales
          </h2>


          <div className="form-grid">


            <div className="form-group">

              <label>
                Seleccionar cliente
              </label>

              <select
                name="clienteId"
                value={form.clienteId}
                onChange={
                  seleccionarCliente
                }
              >

                <option value="">
                  Seleccione un cliente
                </option>


                {clientes.map(
                  (cliente) => (

                    <option
                      key={cliente.id}
                      value={cliente.id}
                    >

                      {cliente.cedula}
                      {" - "}
                      {cliente.nombres}
                      {" "}
                      {cliente.apellidos}

                    </option>

                  )
                )}

              </select>

            </div>


            <div className="form-group">

              <label>
                Cédula
              </label>

              <input
                name="cedula"
                value={form.cedula}
                readOnly
                placeholder="Cédula del cliente"
              />

            </div>


            <div className="form-group">

              <label>
                Nombres completos
              </label>

              <input
                name="nombres"
                value={form.nombres}
                readOnly
                placeholder="Nombre del solicitante"
              />

            </div>


            <div className="form-group">

              <label>
                Correo electrónico
              </label>

              <input
                name="correo"
                value={form.correo}
                readOnly
                placeholder="correo@ejemplo.com"
              />

            </div>


            <div className="form-group">

              <label>
                Teléfono
              </label>

              <input
                name="telefono"
                value={form.telefono}
                readOnly
                placeholder="0999999999"
              />

            </div>


            <div className="form-group">

              <label>
                Estado civil
              </label>

              <select
                name="estadoCivil"
                value={form.estadoCivil}
                onChange={update}
              >

                <option>
                  Soltero/a
                </option>

                <option>
                  Casado/a
                </option>

                <option>
                  Unión libre
                </option>

                <option>
                  Divorciado/a
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Ocupación
              </label>

              <input
                name="ocupacion"
                value={form.ocupacion}
                onChange={update}
                placeholder="Ej. Comerciante"
              />

            </div>


            <div className="form-group full">

              <label>
                Dirección domiciliaria
              </label>

              <input
                name="direccion"
                value={form.direccion}
                onChange={update}
                placeholder="Ingrese la dirección del cliente"
              />

            </div>


          </div>

        </section>


        {/* ===================================================
            INFORMACIÓN FINANCIERA
        =================================================== */}

        <section className="panel">

          <h2 className="section-title">
            Información financiera
          </h2>


          <div className="form-grid">


            <div className="form-group">

              <label>
                Ingresos mensuales
              </label>

              <input
                name="ingresos"
                value={form.ingresos}
                onChange={update}
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej. 850.00"
              />

            </div>


            <div className="form-group">

              <label>
                Egresos mensuales
              </label>

              <input
                name="egresos"
                value={form.egresos}
                onChange={update}
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej. 420.00"
              />

            </div>


            <div className="form-group">

              <label>
                Nivel de endeudamiento
              </label>

              <input
                name="endeudamiento"
                value={form.endeudamiento}
                onChange={update}
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej. 30"
              />

            </div>


            <div className="form-group">

              <label>
                Empresa / Actividad
              </label>

              <input
                name="empresa"
                value={form.empresa}
                onChange={update}
                placeholder="Lugar de trabajo o actividad"
              />

            </div>


            <div className="form-group">

              <label>
                Antigüedad laboral
              </label>

              <input
                name="antiguedad"
                value={form.antiguedad}
                onChange={update}
                placeholder="Ej. 2 años"
              />

            </div>


            <div className="form-group">

              <label>
                Capacidad de pago estimada
              </label>

              <input
                name="capacidadPago"
                value={form.capacidadPago}
                onChange={update}
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej. 250.00"
              />

            </div>


          </div>

        </section>


        {/* ===================================================
            INFORMACIÓN DEL CRÉDITO
        =================================================== */}

        <section className="panel">

          <h2 className="section-title">
            Información del crédito
          </h2>


          <div className="form-grid">


            <div className="form-group">

              <label>
                Tipo de crédito
              </label>

              <select
                name="tipoCredito"
                value={form.tipoCredito}
                onChange={update}
              >

                <option>
                  Consumo
                </option>

                <option>
                  Microcrédito
                </option>

                <option>
                  Vivienda
                </option>

                <option>
                  Comercial
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Monto solicitado
              </label>

              <input
                name="monto"
                value={form.monto}
                onChange={update}
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej. 5000.00"
              />

            </div>


            <div className="form-group">

              <label>
                Plazo
              </label>

              <select
                name="plazo"
                value={form.plazo}
                onChange={update}
              >

                <option>
                  6 meses
                </option>

                <option>
                  12 meses
                </option>

                <option>
                  24 meses
                </option>

                <option>
                  36 meses
                </option>

                <option>
                  48 meses
                </option>

              </select>

            </div>


            <div className="form-group">

              <label>
                Estado de la solicitud
              </label>

              <select
                name="estado"
                value={form.estado}
                onChange={update}
              >

                <option>
                  Pendiente
                </option>

                <option>
                  En evaluación
                </option>

                <option>
                  Aprobado
                </option>

                <option>
                  Rechazado
                </option>

              </select>

            </div>


            <div className="form-group full">

              <label>
                Destino del crédito
              </label>

              <textarea
                name="destino"
                value={form.destino}
                onChange={update}
                placeholder="Describa para qué será utilizado el crédito solicitado..."
              />

            </div>


          </div>


          {/* =================================================
              BOTONES
          ================================================= */}

          <div className="actions">


            <button
              type="button"
              className="btn btn-cancel"
              onClick={limpiar}
            >

              {modoEdicion
                ? "Cancelar edición"
                : "Cancelar"}

            </button>


            <button
              type="button"
              className="btn btn-clean"
              onClick={limpiar}
            >
              Limpiar
            </button>


            <button
              type="submit"
              className="btn btn-save"
              disabled={guardando}
            >

              {guardando

                ? modoEdicion
                  ? "Actualizando..."
                  : "Guardando..."

                : modoEdicion
                  ? "💾 Actualizar solicitud"
                  : "💾 Guardar solicitud"}

            </button>


          </div>


        </section>


      </form>


      {/* =====================================================
          SOLICITUDES REGISTRADAS
      ===================================================== */}

      <section className="panel solicitudes-listado">


        <div className="solicitudes-header">


          <div>

            <h2 className="section-title">
              Solicitudes registradas
            </h2>

            <p className="solicitudes-subtitle">
              Historial de solicitudes de crédito registradas en el sistema.
            </p>

          </div>


          <div className="solicitudes-total">

            Total:{" "}

            <strong>
              {solicitudes.length}
            </strong>

          </div>


        </div>


        {solicitudes.length === 0 ? (

          // ===================================================
          // SIN SOLICITUDES
          // ===================================================

          <div className="empty-state">

            <span>
              📄
            </span>

            <h3>
              No existen solicitudes registradas
            </h3>

            <p>
              Las solicitudes creadas aparecerán en esta sección.
            </p>

          </div>

        ) : (

          // ===================================================
          // TABLA
          // ===================================================

          <div className="table-container">


            <table className="solicitudes-table">


              <thead>

                <tr>

                  <th>ID</th>

                  <th>Cliente</th>

                  <th>Cédula</th>

                  <th>Tipo</th>

                  <th>Monto</th>

                  <th>Plazo</th>

                  <th>Fecha</th>

                  <th>Estado</th>

                  <th>Acciones</th>

                </tr>

              </thead>


              <tbody>


                {solicitudes.map(
                  (solicitud) => (

                    <tr key={solicitud.id}>


                      {/* ID */}

                      <td>
                        #{solicitud.id}
                      </td>


                      {/* CLIENTE */}

                      <td>

                        <strong>

                          {solicitud.cliente

                            ? `${solicitud.cliente.nombres || ""} ${solicitud.cliente.apellidos || ""}`.trim()

                            : "Sin cliente"}

                        </strong>

                      </td>


                      {/* CÉDULA */}

                      <td>

                        {solicitud.cliente?.cedula ||
                          "-"}

                      </td>


                      {/* TIPO */}

                      <td>

                        {solicitud.tipoCredito ||
                          "-"}

                      </td>


                      {/* MONTO */}

                      <td className="monto-cell">

                        {formatearDinero(
                          solicitud.monto
                        )}

                      </td>


                      {/* PLAZO */}

                      <td>

                        {solicitud.plazoMeses

                          ? `${solicitud.plazoMeses} meses`

                          : "-"}

                      </td>


                      {/* FECHA */}

                      <td>

                        {solicitud.fechaSolicitud

                          ? new Date(
                              solicitud.fechaSolicitud
                            ).toLocaleDateString(
                              "es-EC"
                            )

                          : "-"}

                      </td>


                      {/* ESTADO */}

                      <td>

                        <span
                          className={`estado-badge ${obtenerClaseEstado(
                            solicitud.estado
                          )}`}
                        >

                          {solicitud.estado ||
                            "Pendiente"}

                        </span>

                      </td>


                      {/* ACCIONES */}

                      <td>


                        <div className="table-actions">


                          {/* VER */}

                          <button
                            type="button"
                            className="action-btn view"
                            title="Ver solicitud"
                            onClick={() =>
                              verSolicitud(
                                solicitud
                              )
                            }
                          >
                            👁
                          </button>


                          {/* EDITAR */}

                          <button
                            type="button"
                            className="action-btn edit"
                            title="Editar solicitud"
                            onClick={() =>
                              editarSolicitud(
                                solicitud
                              )
                            }
                          >
                            ✏️
                          </button>


                          {/* ELIMINAR */}

                          <button
                            type="button"
                            className="action-btn delete"
                            title="Eliminar solicitud"
                            onClick={() =>
                              borrarSolicitud(
                                solicitud
                              )
                            }
                          >
                            🗑️
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


      {/* =====================================================
          MODAL VER SOLICITUD
      ===================================================== */}

      {modalVer &&
        solicitudSeleccionada && (

        <div
          className="solicitud-modal-overlay"
          onClick={
            cerrarModalVer
          }
        >


          <div
            className="solicitud-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="solicitud-modal-header">


              <div>

                <h2>
                  Detalle de la solicitud
                </h2>

                <p>
                  Solicitud #{solicitudSeleccionada.id}
                </p>

              </div>


              <button
                type="button"
                className="solicitud-modal-close"
                onClick={
                  cerrarModalVer
                }
              >
                ×
              </button>


            </div>


            {/* =================================================
                BODY
            ================================================= */}

            <div className="solicitud-modal-body">


              {/* ===============================================
                  CLIENTE
              =============================================== */}

              <div className="solicitud-detail-section">


                <h3>
                  👤 Información del cliente
                </h3>


                <div className="solicitud-detail-grid">


                  <div>

                    <span>
                      Nombre completo
                    </span>

                    <strong>

                      {solicitudSeleccionada.cliente

                        ? `${solicitudSeleccionada.cliente.nombres || ""} ${solicitudSeleccionada.cliente.apellidos || ""}`.trim()

                        : "-"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Cédula
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .cliente
                        ?.cedula || "-"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Correo
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .cliente
                        ?.correo || "-"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Teléfono
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .cliente
                        ?.telefono || "-"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Estado civil
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .estadoCivil || "-"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Ocupación
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .ocupacion || "-"}

                    </strong>

                  </div>


                  <div className="detail-full">

                    <span>
                      Dirección
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .direccion || "-"}

                    </strong>

                  </div>


                </div>


              </div>


              {/* ===============================================
                  INFORMACIÓN FINANCIERA
              =============================================== */}

              <div className="solicitud-detail-section">


                <h3>
                  💰 Información financiera
                </h3>


                <div className="solicitud-detail-grid">


                  <div>

                    <span>
                      Ingresos mensuales
                    </span>

                    <strong>

                      {formatearDinero(
                        solicitudSeleccionada
                          .ingresosMensuales
                      )}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Egresos mensuales
                    </span>

                    <strong>

                      {formatearDinero(
                        solicitudSeleccionada
                          .egresosMensuales
                      )}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Nivel de endeudamiento
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .nivelEndeudamiento ??
                        0}
                      %

                    </strong>

                  </div>


                  <div>

                    <span>
                      Capacidad de pago
                    </span>

                    <strong>

                      {formatearDinero(
                        solicitudSeleccionada
                          .capacidadPago
                      )}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Empresa / Actividad
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .empresa || "-"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Antigüedad laboral
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .antiguedadLaboral ||
                        "-"}

                    </strong>

                  </div>


                </div>


              </div>


              {/* ===============================================
                  CRÉDITO
              =============================================== */}

              <div className="solicitud-detail-section">


                <h3>
                  💳 Información del crédito
                </h3>


                <div className="solicitud-detail-grid">


                  <div>

                    <span>
                      Tipo de crédito
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .tipoCredito || "-"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Monto solicitado
                    </span>

                    <strong className="detail-money">

                      {formatearDinero(
                        solicitudSeleccionada
                          .monto
                      )}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Plazo
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .plazoMeses

                        ? `${solicitudSeleccionada.plazoMeses} meses`

                        : "-"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Estado
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .estado ||
                        "Pendiente"}

                    </strong>

                  </div>


                  <div>

                    <span>
                      Fecha de solicitud
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .fechaSolicitud

                        ? new Date(
                            solicitudSeleccionada
                              .fechaSolicitud
                          ).toLocaleString(
                            "es-EC"
                          )

                        : "-"}

                    </strong>

                  </div>


                  <div className="detail-full">

                    <span>
                      Destino del crédito
                    </span>

                    <strong>

                      {solicitudSeleccionada
                        .destinoCredito ||
                        "-"}

                    </strong>

                  </div>


                </div>


              </div>


            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="solicitud-modal-footer">


              <button
                type="button"
                className="btn btn-cancel"
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


    </Layout>

  );

}