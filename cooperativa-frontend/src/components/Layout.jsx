import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

function Layout({
  title,
  children
}) {

  const navigate = useNavigate();


  // =========================================================
  // ESTADOS - CAMBIO DE CONTRASEÑA
  // =========================================================

  const [mostrarCambioPassword, setMostrarCambioPassword] =
    useState(false);

  const [passwordActual, setPasswordActual] =
    useState("");

  const [nuevaPassword, setNuevaPassword] =
    useState("");

  const [confirmarPassword, setConfirmarPassword] =
    useState("");

  const [mostrarPasswordActual, setMostrarPasswordActual] =
    useState(false);

  const [mostrarNuevaPassword, setMostrarNuevaPassword] =
    useState(false);

  const [mostrarConfirmacion, setMostrarConfirmacion] =
    useState(false);

  const [cambiandoPassword, setCambiandoPassword] =
    useState(false);

  const [errorPassword, setErrorPassword] =
    useState("");

  const [mensajePassword, setMensajePassword] =
    useState("");


  // =========================================================
  // OBTENER USUARIO DE LA SESIÓN
  // =========================================================

  let usuario = null;

  try {

    const usuarioGuardado =
      sessionStorage.getItem("usuario");

    if (usuarioGuardado) {
      usuario = JSON.parse(usuarioGuardado);
    }

  } catch (error) {

    console.error(
      "Error al obtener el usuario de la sesión:",
      error
    );

  }


  // =========================================================
  // NOMBRE DEL USUARIO
  // =========================================================

  const nombreUsuario = usuario
    ? `${usuario.nombres} ${usuario.apellidos}`
    : "Usuario";


  // =========================================================
  // ROL DEL USUARIO
  // =========================================================

  const obtenerNombreRol = (rol) => {

    switch (rol) {

      case "ADMIN":
        return "Administrador";

      case "ANALISTA":
        return "Analista de Crédito";

      case "GERENCIA":
        return "Gerencia";

      default:
        return "Usuario";
    }

  };


  const nombreRol =
    obtenerNombreRol(usuario?.rol);


  // =========================================================
  // PERMISOS
  // =========================================================

  const esAdmin =
    usuario?.rol === "ADMIN";


  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  const cerrarSesion = () => {

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    navigate("/", {
      replace: true
    });

  };


  // =========================================================
  // LIMPIAR FORMULARIO DE CONTRASEÑA
  // =========================================================

  const limpiarFormularioPassword = () => {

    setPasswordActual("");
    setNuevaPassword("");
    setConfirmarPassword("");

    setMostrarPasswordActual(false);
    setMostrarNuevaPassword(false);
    setMostrarConfirmacion(false);

    setErrorPassword("");
    setMensajePassword("");

  };


  // =========================================================
  // ABRIR MODAL
  // =========================================================

  const abrirCambioPassword = () => {

    limpiarFormularioPassword();

    setMostrarCambioPassword(true);

  };


  // =========================================================
  // CERRAR MODAL
  // =========================================================

  const cerrarCambioPassword = () => {

    if (cambiandoPassword) {
      return;
    }

    setMostrarCambioPassword(false);

    limpiarFormularioPassword();

  };


  // =========================================================
  // CAMBIAR CONTRASEÑA
  // =========================================================

  const cambiarPassword = async (event) => {

    event.preventDefault();

    setErrorPassword("");
    setMensajePassword("");


    // ---------------------------------------------------------
    // VALIDAR CONTRASEÑA ACTUAL
    // ---------------------------------------------------------

    if (!passwordActual.trim()) {

      setErrorPassword(
        "Ingresa tu contraseña actual."
      );

      return;
    }


    // ---------------------------------------------------------
    // VALIDAR NUEVA CONTRASEÑA
    // ---------------------------------------------------------

    if (!nuevaPassword) {

      setErrorPassword(
        "Ingresa una nueva contraseña."
      );

      return;
    }


    if (nuevaPassword.length < 8) {

      setErrorPassword(
        "La nueva contraseña debe contener al menos 8 caracteres."
      );

      return;
    }


    // ---------------------------------------------------------
    // EVITAR MISMA CONTRASEÑA
    // ---------------------------------------------------------

    if (passwordActual === nuevaPassword) {

      setErrorPassword(
        "La nueva contraseña debe ser diferente a la contraseña actual."
      );

      return;
    }


    // ---------------------------------------------------------
    // VALIDAR CONFIRMACIÓN
    // ---------------------------------------------------------

    if (!confirmarPassword) {

      setErrorPassword(
        "Confirma la nueva contraseña."
      );

      return;
    }


    if (nuevaPassword !== confirmarPassword) {

      setErrorPassword(
        "Las nuevas contraseñas no coinciden."
      );

      return;
    }


    // ---------------------------------------------------------
    // OBTENER TOKEN
    // ---------------------------------------------------------

    const token =
      sessionStorage.getItem("token");


    if (!token) {

      cerrarSesion();

      return;
    }


    try {

      setCambiandoPassword(true);


      const response = await fetch(
        "http://localhost:8080/api/usuarios/mi-password",
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify({
            passwordActual,
            nuevaPassword
          })
        }
      );


      // -------------------------------------------------------
      // SESIÓN EXPIRADA
      // -------------------------------------------------------

      if (response.status === 401) {

        let datosError = null;

        try {
          datosError = await response.json();
        } catch {
          datosError = null;
        }


        /*
         * Si el backend específicamente nos dice que la
         * contraseña actual es incorrecta, NO cerramos sesión.
         *
         * El mismo código HTTP 401 también puede representar
         * un JWT inválido/expirado.
         */

        if (
          datosError?.mensaje
            ?.toLowerCase()
            .includes("contraseña actual")
        ) {

          setErrorPassword(
            datosError.mensaje
          );

          return;
        }


        sessionStorage.removeItem("token");
        sessionStorage.removeItem("usuario");

        navigate("/", {
          replace: true
        });

        return;
      }


      // -------------------------------------------------------
      // OTROS ERRORES
      // -------------------------------------------------------

      if (!response.ok) {

        let datosError = null;

        try {
          datosError = await response.json();
        } catch {
          datosError = null;
        }


        setErrorPassword(
          datosError?.mensaje ||
          "No se pudo cambiar la contraseña."
        );

        return;
      }


      // -------------------------------------------------------
      // CAMBIO CORRECTO
      // -------------------------------------------------------

      setMensajePassword(
        "Contraseña actualizada correctamente."
      );


      setPasswordActual("");
      setNuevaPassword("");
      setConfirmarPassword("");


      /*
       * No cerramos sesión automáticamente.
       *
       * El JWT actual sigue representando al mismo usuario.
       * La próxima vez que inicie sesión deberá utilizar
       * la nueva contraseña.
       */

    } catch (error) {

      console.error(
        "Error al cambiar la contraseña:",
        error
      );


      setErrorPassword(
        "No fue posible conectar con el servidor."
      );

    } finally {

      setCambiandoPassword(false);

    }

  };


  return (

    <div className="layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <img
            src="/coop.png"
            alt="Logo Coop"
          />

        </div>


        <div className="menu-title">
          MENÚ PRINCIPAL
        </div>


        <NavLink
          to="/dashboard"
          className="menu-item"
        >
          📊 Dashboard
        </NavLink>


        <NavLink
          to="/clientes"
          className="menu-item"
        >
          👥 Clientes
        </NavLink>


        <NavLink
          to="/solicitudes"
          className="menu-item"
        >
          📝 Solicitudes
        </NavLink>


        <NavLink
          to="/documentos"
          className="menu-item"
        >
          📁 Documentos
        </NavLink>


        <NavLink
          to="/evaluacion-riesgo"
          className="menu-item"
        >
          ⚖ Evaluación de riesgo
        </NavLink>


        <NavLink
          to="/reportes"
          className="menu-item"
        >
          📄 Reportes
        </NavLink>


        {/* =====================================================
            SOLO ADMINISTRADOR
        ===================================================== */}

        {esAdmin && (

          <NavLink
            to="/usuarios"
            className="menu-item"
          >
            👤 Gestión de usuarios
          </NavLink>

        )}


        {/* =====================================================
            TODOS LOS USUARIOS AUTENTICADOS
        ===================================================== */}

        <button
          type="button"
          className="menu-item"
          onClick={abrirCambioPassword}
        >
          🔐 Cambiar contraseña
        </button>


        <button
          type="button"
          className="menu-item logout"
          onClick={cerrarSesion}
        >
          🚪 Cerrar sesión
        </button>

      </aside>


      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <main className="content">

        <div className="topbar">

          <h1>
            {title}
          </h1>


          <div className="user">

            <span>
              👤 {nombreUsuario}
            </span>

            <span>
              {" · "}
              {nombreRol}
            </span>

          </div>

        </div>


        {children}

      </main>


      {/* =====================================================
          MODAL CAMBIAR CONTRASEÑA
      ===================================================== */}

      {mostrarCambioPassword && (

        <div
          className="password-modal-overlay"
          onMouseDown={(event) => {

            if (
              event.target === event.currentTarget
            ) {

              cerrarCambioPassword();

            }

          }}
        >

          <div className="password-modal">

            {/* CABECERA */}

            <div className="password-modal-header">

              <div>

                <h2>
                  🔐 Cambiar contraseña
                </h2>

                <p>
                  Actualiza la contraseña de tu cuenta.
                </p>

              </div>


              <button
                type="button"
                className="password-modal-close"
                onClick={cerrarCambioPassword}
                disabled={cambiandoPassword}
              >
                ×
              </button>

            </div>


            {/* INFORMACIÓN DEL USUARIO */}

            <div className="password-user-info">

              <strong>
                {nombreUsuario}
              </strong>

              <span>
                {nombreRol}
              </span>

            </div>


            {/* FORMULARIO */}

            <form
              onSubmit={cambiarPassword}
              className="password-form"
            >

              {/* CONTRASEÑA ACTUAL */}

              <div className="password-field">

                <label>
                  Contraseña actual
                </label>


                <div className="password-input-container">

                  <input
                    type={
                      mostrarPasswordActual
                        ? "text"
                        : "password"
                    }
                    value={passwordActual}
                    onChange={(event) =>
                      setPasswordActual(
                        event.target.value
                      )
                    }
                    placeholder="Ingresa tu contraseña actual"
                    autoComplete="current-password"
                    disabled={cambiandoPassword}
                  />


                  <button
                    type="button"
                    className="password-eye"
                    onClick={() =>
                      setMostrarPasswordActual(
                        !mostrarPasswordActual
                      )
                    }
                    tabIndex="-1"
                  >
                    {mostrarPasswordActual
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

              </div>


              {/* NUEVA CONTRASEÑA */}

              <div className="password-field">

                <label>
                  Nueva contraseña
                </label>


                <div className="password-input-container">

                  <input
                    type={
                      mostrarNuevaPassword
                        ? "text"
                        : "password"
                    }
                    value={nuevaPassword}
                    onChange={(event) =>
                      setNuevaPassword(
                        event.target.value
                      )
                    }
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    disabled={cambiandoPassword}
                  />


                  <button
                    type="button"
                    className="password-eye"
                    onClick={() =>
                      setMostrarNuevaPassword(
                        !mostrarNuevaPassword
                      )
                    }
                    tabIndex="-1"
                  >
                    {mostrarNuevaPassword
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

              </div>


              {/* CONFIRMAR */}

              <div className="password-field">

                <label>
                  Confirmar nueva contraseña
                </label>


                <div className="password-input-container">

                  <input
                    type={
                      mostrarConfirmacion
                        ? "text"
                        : "password"
                    }
                    value={confirmarPassword}
                    onChange={(event) =>
                      setConfirmarPassword(
                        event.target.value
                      )
                    }
                    placeholder="Repite la nueva contraseña"
                    autoComplete="new-password"
                    disabled={cambiandoPassword}
                  />


                  <button
                    type="button"
                    className="password-eye"
                    onClick={() =>
                      setMostrarConfirmacion(
                        !mostrarConfirmacion
                      )
                    }
                    tabIndex="-1"
                  >
                    {mostrarConfirmacion
                      ? "🙈"
                      : "👁"}
                  </button>

                </div>

              </div>


              {/* AYUDA */}

              <div className="password-help">

                La nueva contraseña debe contener
                al menos 8 caracteres.

              </div>


              {/* ERROR */}

              {errorPassword && (

                <div className="password-message error">
                  ⚠️ {errorPassword}
                </div>

              )}


              {/* ÉXITO */}

              {mensajePassword && (

                <div className="password-message success">
                  ✅ {mensajePassword}
                </div>

              )}


              {/* BOTONES */}

              <div className="password-actions">

                <button
                  type="button"
                  className="password-btn secondary"
                  onClick={cerrarCambioPassword}
                  disabled={cambiandoPassword}
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="password-btn primary"
                  disabled={cambiandoPassword}
                >

                  {cambiandoPassword
                    ? "Actualizando..."
                    : "Cambiar contraseña"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}

export default Layout;