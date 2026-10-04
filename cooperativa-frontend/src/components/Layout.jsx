import {
  useEffect,
  useRef,
  useState
} from "react";

import {
  NavLink,
  useNavigate
} from "react-router-dom";


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
  // ESTADOS - NOTIFICACIONES
  // =========================================================

  const [notificaciones, setNotificaciones] =
    useState([]);

  const [contadorNoLeidas, setContadorNoLeidas] =
    useState(0);

  const [mostrarNotificaciones, setMostrarNotificaciones] =
    useState(false);

  const [cargandoNotificaciones, setCargandoNotificaciones] =
    useState(false);

  const notificacionesRef =
    useRef(null);


  // =========================================================
  // OBTENER USUARIO DE LA SESIÓN
  // =========================================================

  let usuario = null;

  try {

    const usuarioGuardado =
      sessionStorage.getItem("usuario");

    if (usuarioGuardado) {
      usuario =
        JSON.parse(usuarioGuardado);
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
  // NOTIFICACIONES - CONTADOR
  // =========================================================

  const cargarContadorNotificaciones =
    async () => {

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        return;
      }

      try {

        const response = await fetch(
          "http://localhost:8080/api/notificaciones/contador",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


        if (response.status === 401) {

          cerrarSesion();

          return;
        }


        if (!response.ok) {
          return;
        }


        const datos =
          await response.json();


        setContadorNoLeidas(
          Number(datos.noLeidas) || 0
        );

      } catch (error) {

        console.error(
          "Error al obtener contador de notificaciones:",
          error
        );
      }
    };


  // =========================================================
  // CARGAR NOTIFICACIONES
  // =========================================================

  const cargarNotificaciones =
    async () => {

      const token =
        sessionStorage.getItem("token");

      if (!token) {
        return;
      }


      try {

        setCargandoNotificaciones(
          true
        );


        const response = await fetch(
          "http://localhost:8080/api/notificaciones",
          {
            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


        if (response.status === 401) {

          cerrarSesion();

          return;
        }


        if (!response.ok) {

          throw new Error(
            "No se pudieron obtener las notificaciones."
          );
        }


        const datos =
          await response.json();


        setNotificaciones(
          Array.isArray(datos)
            ? datos
            : []
        );

      } catch (error) {

        console.error(
          "Error al cargar notificaciones:",
          error
        );

      } finally {

        setCargandoNotificaciones(
          false
        );
      }
    };


  // =========================================================
  // ABRIR / CERRAR CAMPANA
  // =========================================================

  const alternarNotificaciones =
    async () => {

      const nuevoEstado =
        !mostrarNotificaciones;


      setMostrarNotificaciones(
        nuevoEstado
      );


      if (nuevoEstado) {

        await cargarNotificaciones();

        await cargarContadorNotificaciones();
      }
    };


  // =========================================================
  // MARCAR UNA NOTIFICACIÓN COMO LEÍDA
  // =========================================================

  const abrirNotificacion =
    async (notificacion) => {

      const token =
        sessionStorage.getItem("token");


      if (!token) {

        cerrarSesion();

        return;
      }


      try {

        if (!notificacion.leida) {

          const response = await fetch(
            `http://localhost:8080/api/notificaciones/${notificacion.id}/leer`,
            {
              method: "PUT",

              headers: {
                Authorization:
                  `Bearer ${token}`
              }
            }
          );


          if (response.status === 401) {

            cerrarSesion();

            return;
          }


          if (!response.ok) {

            throw new Error(
              "No se pudo marcar la notificación como leída."
            );
          }


          setNotificaciones(
            (anteriores) =>
              anteriores.map(
                (item) =>
                  item.id ===
                  notificacion.id
                    ? {
                        ...item,
                        leida: true
                      }
                    : item
              )
          );


          setContadorNoLeidas(
            (anterior) =>
              Math.max(
                0,
                anterior - 1
              )
          );
        }


        setMostrarNotificaciones(
          false
        );


        if (notificacion.ruta) {

          navigate(
            notificacion.ruta
          );
        }

      } catch (error) {

        console.error(
          "Error al abrir la notificación:",
          error
        );
      }
    };


  // =========================================================
  // MARCAR TODAS COMO LEÍDAS
  // =========================================================

  const marcarTodasComoLeidas =
    async () => {

      const token =
        sessionStorage.getItem("token");


      if (!token) {

        cerrarSesion();

        return;
      }


      try {

        const response = await fetch(
          "http://localhost:8080/api/notificaciones/leer-todas",
          {
            method: "PUT",

            headers: {
              Authorization:
                `Bearer ${token}`
            }
          }
        );


        if (response.status === 401) {

          cerrarSesion();

          return;
        }


        if (!response.ok) {

          throw new Error(
            "No se pudieron marcar todas las notificaciones."
          );
        }


        setNotificaciones(
          (anteriores) =>
            anteriores.map(
              (item) => ({
                ...item,
                leida: true
              })
            )
        );


        setContadorNoLeidas(0);

      } catch (error) {

        console.error(
          "Error al marcar todas como leídas:",
          error
        );
      }
    };


  // =========================================================
  // FORMATEAR FECHA DE NOTIFICACIÓN
  // =========================================================

  const formatearFechaNotificacion =
    (fecha) => {

      if (!fecha) {
        return "";
      }


      try {

        return new Date(fecha)
          .toLocaleString(
            "es-EC",
            {
              dateStyle: "short",
              timeStyle: "short"
            }
          );

      } catch {

        return fecha;
      }
    };


  // =========================================================
  // CARGAR CONTADOR AUTOMÁTICAMENTE
  // =========================================================

  useEffect(() => {

    cargarContadorNotificaciones();


    const intervalo =
      setInterval(
        cargarContadorNotificaciones,
        30000
      );


    return () => {

      clearInterval(
        intervalo
      );
    };

  }, []);


  // =========================================================
  // CERRAR NOTIFICACIONES AL HACER CLIC FUERA
  // =========================================================

  useEffect(() => {

    const cerrarAlHacerClickFuera =
      (event) => {

        if (
          notificacionesRef.current
          &&
          !notificacionesRef.current.contains(
            event.target
          )
        ) {

          setMostrarNotificaciones(
            false
          );
        }
      };


    document.addEventListener(
      "mousedown",
      cerrarAlHacerClickFuera
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        cerrarAlHacerClickFuera
      );
    };

  }, []);


  // =========================================================
  // LIMPIAR FORMULARIO DE CONTRASEÑA
  // =========================================================

  const limpiarFormularioPassword =
    () => {

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
  // ABRIR MODAL CONTRASEÑA
  // =========================================================

  const abrirCambioPassword = () => {

    limpiarFormularioPassword();

    setMostrarCambioPassword(
      true
    );
  };


  // =========================================================
  // CERRAR MODAL CONTRASEÑA
  // =========================================================

  const cerrarCambioPassword = () => {

    if (cambiandoPassword) {
      return;
    }


    setMostrarCambioPassword(
      false
    );


    limpiarFormularioPassword();
  };


  // =========================================================
  // CAMBIAR CONTRASEÑA
  // =========================================================

  const cambiarPassword =
    async (event) => {

      event.preventDefault();

      setErrorPassword("");
      setMensajePassword("");


      // -------------------------------------------------------
      // CONTRASEÑA ACTUAL
      // -------------------------------------------------------

      if (!passwordActual.trim()) {

        setErrorPassword(
          "Ingresa tu contraseña actual."
        );

        return;
      }


      // -------------------------------------------------------
      // NUEVA CONTRASEÑA
      // -------------------------------------------------------

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


      // -------------------------------------------------------
      // EVITAR MISMA CONTRASEÑA
      // -------------------------------------------------------

      if (
        passwordActual ===
        nuevaPassword
      ) {

        setErrorPassword(
          "La nueva contraseña debe ser diferente a la contraseña actual."
        );

        return;
      }


      // -------------------------------------------------------
      // CONFIRMACIÓN
      // -------------------------------------------------------

      if (!confirmarPassword) {

        setErrorPassword(
          "Confirma la nueva contraseña."
        );

        return;
      }


      if (
        nuevaPassword !==
        confirmarPassword
      ) {

        setErrorPassword(
          "Las nuevas contraseñas no coinciden."
        );

        return;
      }


      // -------------------------------------------------------
      // TOKEN
      // -------------------------------------------------------

      const token =
        sessionStorage.getItem(
          "token"
        );


      if (!token) {

        cerrarSesion();

        return;
      }


      try {

        setCambiandoPassword(
          true
        );


        const response =
          await fetch(
            "http://localhost:8080/api/usuarios/mi-password",
            {
              method: "PUT",

              headers: {

                "Content-Type":
                  "application/json",

                Authorization:
                  `Bearer ${token}`
              },

              body: JSON.stringify({
                passwordActual,
                nuevaPassword
              })
            }
          );


        // -----------------------------------------------------
        // 401
        // -----------------------------------------------------

        if (
          response.status === 401
        ) {

          let datosError = null;


          try {

            datosError =
              await response.json();

          } catch {

            datosError = null;
          }


          if (
            datosError?.mensaje
              ?.toLowerCase()
              .includes(
                "contraseña actual"
              )
          ) {

            setErrorPassword(
              datosError.mensaje
            );

            return;
          }


          sessionStorage.removeItem(
            "token"
          );

          sessionStorage.removeItem(
            "usuario"
          );


          navigate(
            "/",
            {
              replace: true
            }
          );


          return;
        }


        // -----------------------------------------------------
        // OTROS ERRORES
        // -----------------------------------------------------

        if (!response.ok) {

          let datosError = null;


          try {

            datosError =
              await response.json();

          } catch {

            datosError = null;
          }


          setErrorPassword(
            datosError?.mensaje ||
            "No se pudo cambiar la contraseña."
          );


          return;
        }


        // -----------------------------------------------------
        // CORRECTO
        // -----------------------------------------------------

        setMensajePassword(
          "Contraseña actualizada correctamente."
        );


        setPasswordActual("");
        setNuevaPassword("");
        setConfirmarPassword("");

      } catch (error) {

        console.error(
          "Error al cambiar la contraseña:",
          error
        );


        setErrorPassword(
          "No fue posible conectar con el servidor."
        );

      } finally {

        setCambiandoPassword(
          false
        );
      }
    };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div className="layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="sidebar-logo">

          <img
  src="/banner_logo.png"
  alt="Cooperativa 15 de Abril"
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


        {/* SOLO ADMIN */}

        {esAdmin && (

          <NavLink
            to="/usuarios"
            className="menu-item"
          >
            👤 Gestión de usuarios
          </NavLink>

        )}


        {/* TODOS LOS USUARIOS */}

        <button
          type="button"
          className="menu-item"
          onClick={
            abrirCambioPassword
          }
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

        {/* ===================================================
            TOPBAR
        =================================================== */}

        <div className="topbar">

          <h1>
            {title}
          </h1>


          <div className="topbar-right">

            {/* ===============================================
                CAMPANA
            =============================================== */}

            <div
              className="notifications-wrapper"
              ref={notificacionesRef}
            >

              <button
                type="button"
                className="notification-bell"
                onClick={
                  alternarNotificaciones
                }
                aria-label="Notificaciones"
                title="Notificaciones"
              >

                <span className="notification-bell-icon">
                  🔔
                </span>


                {contadorNoLeidas > 0 && (

                  <span className="notification-count">

                    {contadorNoLeidas > 99
                      ? "99+"
                      : contadorNoLeidas}

                  </span>

                )}

              </button>


              {/* =============================================
                  PANEL DE NOTIFICACIONES
              ============================================= */}

              {mostrarNotificaciones && (

                <div className="notifications-panel">

                  {/* CABECERA */}

                  <div className="notifications-header">

                    <div>

                      <h3>
                        Notificaciones
                      </h3>

                      <span>
                        {contadorNoLeidas} sin leer
                      </span>

                    </div>


                    {contadorNoLeidas > 0 && (

                      <button
                        type="button"
                        className="notifications-read-all"
                        onClick={
                          marcarTodasComoLeidas
                        }
                      >
                        Marcar todas como leídas
                      </button>

                    )}

                  </div>


                  {/* LISTADO */}

                  <div className="notifications-list">

                    {cargandoNotificaciones ? (

                      <div className="notifications-empty">

                        Cargando notificaciones...

                      </div>

                    ) : notificaciones.length === 0 ? (

                      <div className="notifications-empty">

                        <span>
                          🔔
                        </span>

                        <strong>
                          Sin notificaciones
                        </strong>

                        <p>
                          No tienes notificaciones
                          por el momento.
                        </p>

                      </div>

                    ) : (

                      notificaciones.map(
                        (notificacion) => (

                          <button
                            type="button"
                            key={
                              notificacion.id
                            }
                            className={
                              `notification-item ${
                                notificacion.leida
                                  ? "read"
                                  : "unread"
                              }`
                            }
                            onClick={() =>
                              abrirNotificacion(
                                notificacion
                              )
                            }
                          >

                            {/* ICONO */}

                            <div className="notification-item-icon">

                              {
                                notificacion.tipo ===
                                "DECISION"
                                  ? "⚖️"
                                  :
                                notificacion.tipo ===
                                "EVALUACION"
                                  ? "📊"
                                  : "📝"
                              }

                            </div>


                            {/* TEXTO */}

                            <div className="notification-item-content">

                              <div className="notification-item-title">

                                <strong>
                                  {
                                    notificacion.titulo
                                  }
                                </strong>


                                {!notificacion.leida && (

                                  <span
                                    className="notification-unread-dot"
                                  />

                                )}

                              </div>


                              <p>
                                {
                                  notificacion.mensaje
                                }
                              </p>


                              <small>

                                {
                                  formatearFechaNotificacion(
                                    notificacion.fechaCreacion
                                  )
                                }

                              </small>

                            </div>

                          </button>

                        )
                      )

                    )}

                  </div>

                </div>

              )}

            </div>


            {/* ===============================================
                USUARIO
            =============================================== */}

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

        </div>


        {/* CONTENIDO DE CADA PÁGINA */}

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
              event.target ===
              event.currentTarget
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
                onClick={
                  cerrarCambioPassword
                }
                disabled={
                  cambiandoPassword
                }
              >
                ×
              </button>

            </div>


            {/* INFORMACIÓN USUARIO */}

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
                    value={
                      passwordActual
                    }
                    onChange={(event) =>
                      setPasswordActual(
                        event.target.value
                      )
                    }
                    placeholder="Ingresa tu contraseña actual"
                    autoComplete="current-password"
                    disabled={
                      cambiandoPassword
                    }
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

                    {
                      mostrarPasswordActual
                        ? "🙈"
                        : "👁"
                    }

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
                    value={
                      nuevaPassword
                    }
                    onChange={(event) =>
                      setNuevaPassword(
                        event.target.value
                      )
                    }
                    placeholder="Mínimo 8 caracteres"
                    autoComplete="new-password"
                    disabled={
                      cambiandoPassword
                    }
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

                    {
                      mostrarNuevaPassword
                        ? "🙈"
                        : "👁"
                    }

                  </button>

                </div>

              </div>


              {/* CONFIRMAR CONTRASEÑA */}

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
                    value={
                      confirmarPassword
                    }
                    onChange={(event) =>
                      setConfirmarPassword(
                        event.target.value
                      )
                    }
                    placeholder="Repite la nueva contraseña"
                    autoComplete="new-password"
                    disabled={
                      cambiandoPassword
                    }
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

                    {
                      mostrarConfirmacion
                        ? "🙈"
                        : "👁"
                    }

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
                  onClick={
                    cerrarCambioPassword
                  }
                  disabled={
                    cambiandoPassword
                  }
                >
                  Cancelar
                </button>


                <button
                  type="submit"
                  className="password-btn primary"
                  disabled={
                    cambiandoPassword
                  }
                >

                  {
                    cambiandoPassword
                      ? "Actualizando..."
                      : "Cambiar contraseña"
                  }

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