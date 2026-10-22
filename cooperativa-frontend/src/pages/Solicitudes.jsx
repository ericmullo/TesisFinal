import { useEffect, useState } from "react";
import Layout from "../components/Layout";

import {
  obtenerClientes,
  obtenerSolicitudes,
  crearSolicitud,
  actualizarSolicitud,
  eliminarSolicitud
} from "../services/api";


// =========================================================
// FORMULARIO INICIAL
// =========================================================

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

  ventasAnuales: "",
  actividadEconomica: "",
  fuentePago: "",

  tipoCredito: "Consumo",
  productoCredito: "Mi15Libre",

  monto: "",
  plazo: "6 meses",
  estado: "Pendiente",
  destino: ""
};


export default function Solicitudes() {

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

  const [form, setForm] =
    useState(initialForm);

  const [clientes, setClientes] =
    useState([]);

  const [solicitudes, setSolicitudes] =
    useState([]);

  const [guardando, setGuardando] =
    useState(false);

  const [
    solicitudSeleccionada,
    setSolicitudSeleccionada
  ] = useState(null);

  const [modalVer, setModalVer] =
    useState(false);

  const [modoEdicion, setModoEdicion] =
    useState(false);

  const [
    solicitudEditandoId,
    setSolicitudEditandoId
  ] = useState(null);


  // =========================================================
  // CARGAR DATOS
  // =========================================================

  useEffect(() => {

    cargarClientes();

    cargarSolicitudes();

  }, []);


  const cargarClientes =
    async () => {

      try {

        const datos =
          await obtenerClientes();

        setClientes(
          datos
        );

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
      }
    };


  // =========================================================
  // ACTUALIZAR FORMULARIO
  // =========================================================

  const update = (e) => {

    const {
      name,
      value
    } = e.target;


    setForm(
      (formAnterior) => ({
        ...formAnterior,
        [name]: value
      })
    );
  };


  // =========================================================
  // CAMBIAR TIPO DE CRÉDITO
  // =========================================================

  const cambiarTipoCredito = (e) => {

    const tipoCredito =
      e.target.value;


    let productoCredito = "";


    if (
      tipoCredito === "Consumo"
    ) {

      productoCredito =
        "Mi15Libre";
    }


    setForm(
      (formAnterior) => ({
        ...formAnterior,

        tipoCredito,

        productoCredito,

        ventasAnuales:
          tipoCredito === "Microcrédito" ||
          tipoCredito === "Productivo"
            ? formAnterior.ventasAnuales
            : ""
      })
    );
  };


  // =========================================================
  // CALCULAR SUBSEGMENTO VISUAL
  // =========================================================

  const calcularSubsegmento = () => {

    const tipo =
      form.tipoCredito;


    if (
      tipo === "Consumo"
    ) {

      return "Consumo";
    }


    if (
      tipo === "Inmobiliario"
    ) {

      return "Inmobiliario";
    }


    if (
      tipo === "Vivienda"
    ) {

      return "Vivienda";
    }


    if (
      tipo === "Educativo"
    ) {

      return "Educativo";
    }


    if (
      tipo !== "Microcrédito" &&
      tipo !== "Productivo"
    ) {

      return "No determinado";
    }


    if (
      form.ventasAnuales === ""
    ) {

      return "Ingrese las ventas anuales";
    }


    const ventas =
      Number(
        form.ventasAnuales
      );


    // =======================================================
    // MICROCRÉDITO
    // =======================================================

    if (
      tipo === "Microcrédito"
    ) {

      if (
        ventas <= 20000
      ) {

        return "Microcrédito Minorista";
      }


      if (
        ventas <= 120000
      ) {

        return "Microcrédito de Acumulación Simple";
      }


      if (
        ventas <= 300000
      ) {

        return "Microcrédito de Acumulación Ampliada";
      }


      return "Ventas superiores al rango de Microcrédito";
    }


    // =======================================================
    // PRODUCTIVO
    // =======================================================

    if (
      ventas <= 300000
    ) {

      return "Las ventas deben superar USD 300.000";
    }


    if (
      ventas <= 1500000
    ) {

      return "Productivo PYMES";
    }


    if (
      ventas <= 7000000
    ) {

      return "Productivo Empresarial";
    }


    return "Productivo Corporativo";
  };


  // =========================================================
  // SELECCIONAR CLIENTE
  // =========================================================

  const seleccionarCliente = (e) => {

    const id =
      e.target.value;


    if (!id) {

      setForm(
        (formAnterior) => ({
          ...formAnterior,

          clienteId: "",
          cedula: "",
          nombres: "",
          correo: "",
          telefono: ""
        })
      );

      return;
    }


    const cliente =
      clientes.find(
        (cliente) =>
          String(cliente.id) ===
          String(id)
      );


    if (!cliente) {

      return;
    }


    setForm(
      (formAnterior) => ({
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
      })
    );
  };


  // =========================================================
  // LIMPIAR
  // =========================================================

  const limpiar = () => {

    setForm(
      initialForm
    );

    setModoEdicion(
      false
    );

    setSolicitudEditandoId(
      null
    );
  };


  // =========================================================
  // CONSTRUIR SOLICITUD
  // =========================================================

  const construirSolicitud = () => {

    return {

      // -----------------------------------------------------
      // DATOS PERSONALES
      // -----------------------------------------------------

      estadoCivil:
        form.estadoCivil,

      ocupacion:
        form.ocupacion,

      direccion:
        form.direccion,


      // -----------------------------------------------------
      // INFORMACIÓN FINANCIERA
      // -----------------------------------------------------

      ingresosMensuales:
        Number(
          form.ingresos
        ),

      egresosMensuales:
        form.egresos
          ? Number(
              form.egresos
            )
          : 0,

      nivelEndeudamiento:
        form.endeudamiento
          ? Number(
              form.endeudamiento
            )
          : 0,

      empresa:
        form.empresa,

      antiguedadLaboral:
        form.antiguedad,

      capacidadPago:
        form.capacidadPago
          ? Number(
              form.capacidadPago
            )
          : 0,


      // -----------------------------------------------------
      // INFORMACIÓN ECONÓMICA
      // -----------------------------------------------------

      ventasAnuales:
        form.ventasAnuales !== ""
          ? Number(
              form.ventasAnuales
            )
          : null,

      actividadEconomica:
        form.actividadEconomica,

      fuentePago:
        form.fuentePago,


      // -----------------------------------------------------
      // CRÉDITO
      // -----------------------------------------------------

      tipoCredito:
        form.tipoCredito,

      productoCredito:
        form.productoCredito,

      /*
       * subsegmentoCredito NO se envía.
       *
       * El backend lo calcula y valida
       * automáticamente.
       */

      monto:
        Number(
          form.monto
        ),

      plazoMeses:
        Number(
          form.plazo.replace(
            " meses",
            ""
          )
        ),

      estado:
        modoEdicion
          ? form.estado
          : "Pendiente",

      destinoCredito:
        form.destino
    };
  };


  // =========================================================
  // VALIDAR FORMULARIO
  // =========================================================

  const validarFormulario = () => {

    if (
      !form.clienteId
    ) {

      alert(
        "Debe seleccionar un cliente."
      );

      return false;
    }


    if (
      form.ingresos === ""
    ) {

      alert(
        "Ingrese los ingresos mensuales."
      );

      return false;
    }


    if (
      Number(form.ingresos) < 0
    ) {

      alert(
        "Los ingresos mensuales no pueden ser negativos."
      );

      return false;
    }


    if (
      !form.antiguedad.trim()
    ) {

      alert(
        "Ingrese la antigüedad laboral o de la actividad económica."
      );

      return false;
    }


    if (
      form.monto === ""
    ) {

      alert(
        "Ingrese el monto solicitado."
      );

      return false;
    }


    if (
      Number(form.monto) <= 0
    ) {

      alert(
        "El monto solicitado debe ser mayor a cero."
      );

      return false;
    }


    if (
      !form.fuentePago
    ) {

      alert(
        "Debe indicar la fuente principal de pago."
      );

      return false;
    }


    if (
      !form.destino.trim()
    ) {

      alert(
        "Debe indicar el destino del crédito."
      );

      return false;
    }


    // -----------------------------------------------------
    // MICROCRÉDITO / PRODUCTIVO
    // -----------------------------------------------------

    if (
      form.tipoCredito === "Microcrédito" ||
      form.tipoCredito === "Productivo"
    ) {

      if (
        form.ventasAnuales === ""
      ) {

        alert(
          "Debe ingresar las ventas anuales para este tipo de crédito."
        );

        return false;
      }


      if (
        Number(form.ventasAnuales) < 0
      ) {

        alert(
          "Las ventas anuales no pueden ser negativas."
        );

        return false;
      }


      if (
        !form.actividadEconomica.trim()
      ) {

        alert(
          "Debe ingresar la actividad económica."
        );

        return false;
      }
    }


    // -----------------------------------------------------
    // MICROCRÉDITO
    // -----------------------------------------------------

    if (
      form.tipoCredito === "Microcrédito"
    ) {

      if (
        Number(form.ventasAnuales) > 300000
      ) {

        alert(
          "Las ventas anuales superan el rango de Microcrédito."
        );

        return false;
      }


      if (
        !form.productoCredito
      ) {

        alert(
          "Debe seleccionar un producto de Microcrédito."
        );

        return false;
      }
    }


    // -----------------------------------------------------
    // PRODUCTIVO
    // -----------------------------------------------------

    if (
      form.tipoCredito === "Productivo" &&
      Number(form.ventasAnuales) <= 300000
    ) {

      alert(
        "Para crédito Productivo las ventas anuales deben superar los USD 300.000."
      );

      return false;
    }


    return true;
  };


  // =========================================================
  // GUARDAR / ACTUALIZAR
  // =========================================================

  const guardar = async (e) => {

    e.preventDefault();


    if (
      !puedeModificar
    ) {

      alert(
        "No tiene permisos para modificar solicitudes."
      );

      return;
    }


    if (
      !validarFormulario()
    ) {

      return;
    }


    const solicitud =
      construirSolicitud();


    try {

      setGuardando(
        true
      );


      if (
        modoEdicion
      ) {

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

      } else {

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
          `Solicitud registrada correctamente.\n\nCódigo: ${
            nuevaSolicitud.codigoSolicitud ||
            ""
          }`
        );
      }


      await cargarSolicitudes();

      limpiar();

    } catch (error) {

      console.error(
        "Error al guardar la solicitud:",
        error
      );


      const mensajeBackend =
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        error?.message;


      if (
        mensajeBackend
      ) {

        alert(
          mensajeBackend
        );

      } else if (
        modoEdicion
      ) {

        alert(
          "No se pudo actualizar la solicitud."
        );

      } else {

        alert(
          "No se pudo registrar la solicitud."
        );
      }

    } finally {

      setGuardando(
        false
      );
    }
  };


  // =========================================================
  // VER SOLICITUD
  // =========================================================

  const verSolicitud = (
    solicitud
  ) => {

    setSolicitudSeleccionada(
      solicitud
    );

    setModalVer(
      true
    );
  };


  const cerrarModalVer = () => {

    setModalVer(
      false
    );

    setSolicitudSeleccionada(
      null
    );
  };


  // =========================================================
  // EDITAR SOLICITUD
  // =========================================================

  const editarSolicitud = (
    solicitud
  ) => {

    if (
      !puedeModificar
    ) {

      return;
    }


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
        solicitud.ocupacion ||
        "",

      direccion:
        solicitud.direccion ||
        "",


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
        solicitud.empresa ||
        "",

      antiguedad:
        solicitud.antiguedadLaboral ||
        "",

      capacidadPago:
        solicitud.capacidadPago ??
        "",


      ventasAnuales:
        solicitud.ventasAnuales ??
        "",

      actividadEconomica:
        solicitud.actividadEconomica ||
        "",

      fuentePago:
        solicitud.fuentePago ||
        "",


      tipoCredito:
        solicitud.tipoCredito ||
        "Consumo",

      productoCredito:
        solicitud.productoCredito ||
        (
          solicitud.tipoCredito === "Consumo"
            ? "Mi15Libre"
            : ""
        ),


      monto:
        solicitud.monto ??
        "",

      plazo:
        `${solicitud.plazoMeses || 6} meses`,

      estado:
        solicitud.estado ||
        "Pendiente",

      destino:
        solicitud.destinoCredito ||
        ""
    });


    setSolicitudEditandoId(
      solicitud.id
    );

    setModoEdicion(
      true
    );


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };


  // =========================================================
  // ELIMINAR SOLICITUD
  // =========================================================

  const borrarSolicitud =
    async (solicitud) => {

      if (
        !puedeModificar
      ) {

        return;
      }


      const clienteNombre =
        solicitud.cliente
          ? `${solicitud.cliente.nombres || ""} ${solicitud.cliente.apellidos || ""}`.trim()
          : "este cliente";


      const codigo =
        solicitud.codigoSolicitud ||
        "la solicitud seleccionada";


      const confirmar =
        window.confirm(
          `¿Está seguro de eliminar ${codigo} de ${clienteNombre}?\n\nEsta acción no se puede deshacer.`
        );


      if (
        !confirmar
      ) {

        return;
      }


      try {

        await eliminarSolicitud(
          solicitud.id
        );


        alert(
          "Solicitud eliminada correctamente."
        );


        if (
          solicitudEditandoId ===
          solicitud.id
        ) {

          limpiar();
        }


        if (
          solicitudSeleccionada?.id ===
          solicitud.id
        ) {

          cerrarModalVer();
        }


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

  const formatearDinero = (
    valor
  ) => {

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
  // CLASE ESTADO
  // =========================================================

  const obtenerClaseEstado = (
    estado
  ) => {

    if (
      estado === "Aprobado"
    ) {

      return "aprobado";
    }


    if (
      estado === "Rechazado"
    ) {

      return "rechazado";
    }


    if (
      estado === "En evaluación"
    ) {

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
            {form.estado ||
              "Pendiente"}
          </strong>

        </div>

      </section>


      {/* =====================================================
          FORMULARIO ADMIN / ANALISTA
      ===================================================== */}

      {puedeModificar && (

        <>

          {modoEdicion && (

            <div className="editing-alert">

              <div>

                <strong>
                  ✏️ Editando solicitud
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


          <form
            onSubmit={guardar}
          >

            {/* =================================================
                DATOS PERSONALES
            ================================================= */}

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
                    onChange={seleccionarCliente}
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

                    <option value="Soltero/a">
                      Soltero/a
                    </option>

                    <option value="Casado/a">
                      Casado/a
                    </option>

                    <option value="Unión libre">
                      Unión libre
                    </option>

                    <option value="Divorciado/a">
                      Divorciado/a
                    </option>

                    <option value="Viudo/a">
                      Viudo/a
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


            {/* =================================================
                INFORMACIÓN FINANCIERA
            ================================================= */}

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
                    Nivel de endeudamiento (%)
                  </label>

                  <input
                    name="endeudamiento"
                    value={form.endeudamiento}
                    onChange={update}
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    placeholder="Ej. 30"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Empresa / Lugar de trabajo
                  </label>

                  <input
                    name="empresa"
                    value={form.empresa}
                    onChange={update}
                    placeholder="Empresa o lugar de trabajo"
                  />

                </div>


                <div className="form-group">

                  <label>
                    Antigüedad laboral / actividad
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


            {/* =================================================
                INFORMACIÓN ECONÓMICA
            ================================================= */}

            <section className="panel">

              <h2 className="section-title">
                Información económica
              </h2>


              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Actividad económica
                  </label>

                  <input
                    name="actividadEconomica"
                    value={form.actividadEconomica}
                    onChange={update}
                    placeholder="Ej. Comercio, transporte, agricultura..."
                  />

                  <small>
                    Obligatoria para Microcrédito y Productivo.
                  </small>

                </div>


                <div className="form-group">

                  <label>
                    Fuente principal de pago
                  </label>

                  <select
                    name="fuentePago"
                    value={form.fuentePago}
                    onChange={update}
                  >

                    <option value="">
                      Seleccione
                    </option>

                    <option value="Sueldo">
                      Sueldo
                    </option>

                    <option value="Ventas del negocio">
                      Ventas del negocio
                    </option>

                    <option value="Honorarios profesionales">
                      Honorarios profesionales
                    </option>

                    <option value="Ingresos por actividad comercial">
                      Ingresos por actividad comercial
                    </option>

                    <option value="Otros ingresos">
                      Otros ingresos
                    </option>

                  </select>

                </div>


                {(
                  form.tipoCredito ===
                    "Microcrédito" ||
                  form.tipoCredito ===
                    "Productivo"
                ) && (

                  <div className="form-group">

                    <label>
                      Ventas anuales
                    </label>

                    <input
                      name="ventasAnuales"
                      value={form.ventasAnuales}
                      onChange={update}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Ej. 80000.00"
                    />

                    <small>
                      Permite determinar automáticamente el subsegmento.
                    </small>

                  </div>

                )}


                <div className="form-group">

                  <label>
                    Subsegmento calculado
                  </label>

                  <input
                    type="text"
                    value={calcularSubsegmento()}
                    readOnly
                  />

                  <small>
                    La clasificación definitiva es validada por el backend.
                  </small>

                </div>

              </div>

            </section>


            {/* =================================================
                INFORMACIÓN DEL CRÉDITO
            ================================================= */}

            <section className="panel">

              <h2 className="section-title">
                Información del crédito
              </h2>


              <div className="form-grid">

                <div className="form-group">

                  <label>
                    Segmento de crédito
                  </label>

                  <select
                    name="tipoCredito"
                    value={form.tipoCredito}
                    onChange={cambiarTipoCredito}
                  >

                    <option value="Consumo">
                      Consumo
                    </option>

                    <option value="Microcrédito">
                      Microcrédito
                    </option>

                    <option value="Productivo">
                      Productivo
                    </option>

                    <option value="Inmobiliario">
                      Inmobiliario
                    </option>

                    <option value="Vivienda">
                      Vivienda de interés social o público
                    </option>

                    <option value="Educativo">
                      Educativo
                    </option>

                    {form.tipoCredito ===
                      "Comercial" && (

                      <option
                        value="Comercial"
                        disabled
                      >
                        Comercial - registro anterior
                      </option>

                    )}

                  </select>

                </div>


                {/* =============================================
                    PRODUCTO - CONSUMO
                ============================================= */}

                {form.tipoCredito ===
                  "Consumo" && (

                  <div className="form-group">

                    <label>
                      Producto de crédito
                    </label>

                    <select
                      name="productoCredito"
                      value={form.productoCredito}
                      onChange={update}
                    >

                      <option value="Mi15Libre">
                        Mi15Libre
                      </option>

                    </select>

                  </div>

                )}


                {/* =============================================
                    PRODUCTO - MICROCRÉDITO
                ============================================= */}

                {form.tipoCredito ===
                  "Microcrédito" && (

                  <div className="form-group">

                    <label>
                      Producto de crédito
                    </label>

                    <select
                      name="productoCredito"
                      value={form.productoCredito}
                      onChange={update}
                    >

                      <option value="">
                        Seleccione un producto
                      </option>

                      <option value="Mi15">
                        Mi15
                      </option>

                      <option value="15 Contigo Mujer">
                        15 Contigo Mujer
                      </option>

                      <option value="15 Sostenible">
                        15 Sostenible
                      </option>

                      <option value="Taxista">
                        Taxista
                      </option>

                    </select>

                  </div>

                )}


                {/* =============================================
                    OTROS SEGMENTOS
                ============================================= */}

                {form.tipoCredito !==
                  "Consumo" &&
                  form.tipoCredito !==
                    "Microcrédito" && (

                  <div className="form-group">

                    <label>
                      Producto de crédito
                    </label>

                    <input
                      name="productoCredito"
                      value={form.productoCredito}
                      onChange={update}
                      placeholder="Producto institucional, si aplica"
                    />

                    <small>
                      Campo opcional hasta definir el catálogo institucional.
                    </small>

                  </div>

                )}


                <div className="form-group">

                  <label>
                    Monto solicitado
                  </label>

                  <input
                    name="monto"
                    value={form.monto}
                    onChange={update}
                    type="number"
                    min="0.01"
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

                    <option>
                      60 meses
                    </option>

                  </select>

                  <small>
                    Posteriormente se ajustará según el producto de crédito.
                  </small>

                </div>


                <div className="form-group">

                  <label>
                    Estado de la solicitud
                  </label>

                  <input
                    type="text"
                    value={
                      form.estado ||
                      "Pendiente"
                    }
                    readOnly
                  />

                  <small>
                    El estado se actualiza automáticamente según el proceso.
                  </small>

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

        </>

      )}


      {/* =====================================================
          AVISO GERENCIA
      ===================================================== */}

      {esGerencia && (

        <section className="panel">

          <div
            style={{
              padding: "14px 16px",
              background: "#f4f8f5",
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

            Gerencia puede consultar las solicitudes registradas y revisar
            su información, pero no puede crear, editar ni eliminar solicitudes.

          </div>

        </section>

      )}


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

          <div className="table-container">

            <table className="solicitudes-table">

              <thead>

                <tr>

                  <th>
                    Código
                  </th>

                  <th>
                    Cliente
                  </th>

                  <th>
                    Cédula
                  </th>

                  <th>
                    Segmento
                  </th>

                  <th>
                    Subsegmento
                  </th>

                  <th>
                    Producto
                  </th>

                  <th>
                    Monto
                  </th>

                  <th>
                    Plazo
                  </th>

                  <th>
                    Fecha
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

                {solicitudes.map(
                  (solicitud) => (

                    <tr
                      key={solicitud.id}
                    >

                      <td>

                        <strong>
                          {solicitud.codigoSolicitud ||
                            "-"}
                        </strong>

                      </td>


                      <td>

                        <strong>

                          {solicitud.cliente
                            ? `${solicitud.cliente.nombres || ""} ${solicitud.cliente.apellidos || ""}`.trim()
                            : "Sin cliente"}

                        </strong>

                      </td>


                      <td>

                        {solicitud.cliente
                          ?.cedula ||
                          "-"}

                      </td>


                      <td>

                        {solicitud.tipoCredito ||
                          "-"}

                      </td>


                      <td>

                        {solicitud.subsegmentoCredito ||
                          "-"}

                      </td>


                      <td>

                        {solicitud.productoCredito ||
                          "-"}

                      </td>


                      <td className="monto-cell">

                        {formatearDinero(
                          solicitud.monto
                        )}

                      </td>


                      <td>

                        {solicitud.plazoMeses
                          ? `${solicitud.plazoMeses} meses`
                          : "-"}

                      </td>


                      <td>

                        {solicitud.fechaSolicitud
                          ? new Date(
                              solicitud.fechaSolicitud
                            ).toLocaleDateString(
                              "es-EC"
                            )
                          : "-"}

                      </td>


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


                      <td>

                        <div className="table-actions">

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


                          {puedeModificar && (

                            <>

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

                            </>

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


      {/* =====================================================
          MODAL VER SOLICITUD
      ===================================================== */}

      {modalVer &&
        solicitudSeleccionada && (

          <div
            className="solicitud-modal-overlay"
            onClick={cerrarModalVer}
          >

            <div
              className="solicitud-modal"
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* =============================================
                  HEADER MODAL
              ============================================= */}

              <div className="solicitud-modal-header">

                <div>

                  <h2>
                    Detalle de la solicitud
                  </h2>

                  <p>

                    {solicitudSeleccionada
                      .codigoSolicitud ||
                      "Información completa del crédito"}

                  </p>

                </div>


                <button
                  type="button"
                  className="solicitud-modal-close"
                  onClick={cerrarModalVer}
                >
                  ×
                </button>

              </div>


              <div className="solicitud-modal-body">

                {/* ===========================================
                    CLIENTE
                =========================================== */}

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
                          ?.cedula ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Correo
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .cliente
                          ?.correo ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Teléfono
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .cliente
                          ?.telefono ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Estado civil
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .estadoCivil ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Ocupación
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .ocupacion ||
                          "-"}

                      </strong>

                    </div>


                    <div className="detail-full">

                      <span>
                        Dirección
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .direccion ||
                          "-"}

                      </strong>

                    </div>

                  </div>

                </div>


                {/* ===========================================
                    INFORMACIÓN FINANCIERA
                =========================================== */}

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
                        Empresa / Lugar de trabajo
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .empresa ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Antigüedad laboral / actividad
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .antiguedadLaboral ||
                          "-"}

                      </strong>

                    </div>

                  </div>

                </div>


                {/* ===========================================
                    INFORMACIÓN ECONÓMICA
                =========================================== */}

                <div className="solicitud-detail-section">

                  <h3>
                    📊 Información económica
                  </h3>


                  <div className="solicitud-detail-grid">

                    <div>

                      <span>
                        Actividad económica
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .actividadEconomica ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Fuente de pago
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .fuentePago ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Ventas anuales
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .ventasAnuales != null
                          ? formatearDinero(
                              solicitudSeleccionada
                                .ventasAnuales
                            )
                          : "No aplica"}

                      </strong>

                    </div>

                  </div>

                </div>


                {/* ===========================================
                    INFORMACIÓN DEL CRÉDITO
                =========================================== */}

                <div className="solicitud-detail-section">

                  <h3>
                    💳 Información del crédito
                  </h3>


                  <div className="solicitud-detail-grid">

                    <div>

                      <span>
                        Código de solicitud
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .codigoSolicitud ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Segmento de crédito
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .tipoCredito ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Subsegmento
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .subsegmentoCredito ||
                          "-"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Producto de crédito
                      </span>

                      <strong>

                        {solicitudSeleccionada
                          .productoCredito ||
                          "-"}

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


              {/* =============================================
                  FOOTER MODAL
              ============================================= */}

              <div className="solicitud-modal-footer">

                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={cerrarModalVer}
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