import { useEffect, useState } from "react";
import Layout from "../components/Layout";

const API_URL = "http://localhost:8080/api";


function Usuarios() {

  // =========================================================
  // ESTADOS GENERALES
  // =========================================================

  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [usuarioProcesando, setUsuarioProcesando] =
    useState(null);

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");


  // =========================================================
  // CREAR USUARIO
  // =========================================================

  const [formulario, setFormulario] = useState({
    username: "",
    password: "",
    nombres: "",
    apellidos: "",
    correo: "",
    rol: "ANALISTA",
  });


  // =========================================================
  // EDITAR USUARIO
  // =========================================================

  const [usuarioEditando, setUsuarioEditando] =
    useState(null);

  const [guardandoEdicion, setGuardandoEdicion] =
    useState(false);

  const [formularioEdicion, setFormularioEdicion] =
    useState({
      nombres: "",
      apellidos: "",
      correo: "",
      rol: "ANALISTA",
    });


  // =========================================================
  // RESTABLECER CONTRASEÑA
  // =========================================================

  const [
    usuarioRestableciendoPassword,
    setUsuarioRestableciendoPassword
  ] = useState(null);

  const [
    guardandoPassword,
    setGuardandoPassword
  ] = useState(false);

  const [
    formularioPassword,
    setFormularioPassword
  ] = useState({
    nuevaPassword: "",
    confirmarPassword: "",
  });


  // =========================================================
  // USUARIO ACTUAL
  // =========================================================

  const obtenerUsuarioActual = () => {

    try {

      const usuarioGuardado =
        sessionStorage.getItem("usuario");

      if (!usuarioGuardado) {
        return null;
      }

      return JSON.parse(usuarioGuardado);

    } catch (error) {

      console.error(
        "Error leyendo usuario de sesión:",
        error
      );

      return null;
    }
  };


  const usuarioActual =
    obtenerUsuarioActual();


  // =========================================================
  // TOKEN
  // =========================================================

  const obtenerToken = () => {
    return sessionStorage.getItem("token");
  };


  // =========================================================
  // VERIFICAR SESIÓN
  // =========================================================

  const verificarSesion = (response) => {

    if (response.status === 401) {

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuario");

      window.location.href = "/";

      return false;
    }

    return true;
  };


  // =========================================================
  // CARGAR USUARIOS
  // =========================================================

  const cargarUsuarios = async () => {

    try {

      setCargando(true);
      setError("");

      const token =
        obtenerToken();

      const response = await fetch(
        `${API_URL}/usuarios`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (!verificarSesion(response)) {
        return;
      }


      const datos =
        await response
          .json()
          .catch(() => null);


      if (!response.ok) {

        throw new Error(
          datos?.mensaje ||
          "No se pudieron obtener los usuarios."
        );
      }


      setUsuarios(
        Array.isArray(datos)
          ? datos
          : []
      );


    } catch (error) {

      console.error(
        "Error cargando usuarios:",
        error
      );

      setError(error.message);


    } finally {

      setCargando(false);
    }
  };


  // =========================================================
  // CARGAR AL INICIAR
  // =========================================================

  useEffect(() => {

    cargarUsuarios();

  }, []);


  // =========================================================
  // FORMULARIO CREAR
  // =========================================================

  const manejarCambio = (event) => {

    const {
      name,
      value
    } = event.target;


    setFormulario(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    );
  };


  // =========================================================
  // CREAR USUARIO
  // =========================================================

  const crearUsuario = async (event) => {

    event.preventDefault();

    setError("");
    setMensaje("");


    if (
      !formulario.username.trim() ||
      !formulario.password ||
      !formulario.nombres.trim() ||
      !formulario.apellidos.trim() ||
      !formulario.rol
    ) {

      setError(
        "Completa todos los campos obligatorios."
      );

      return;
    }


    if (
      formulario.username.trim().length < 4
    ) {

      setError(
        "El nombre de usuario debe tener mínimo 4 caracteres."
      );

      return;
    }


    if (
      formulario.password.length < 8
    ) {

      setError(
        "La contraseña debe tener mínimo 8 caracteres."
      );

      return;
    }


    try {

      setGuardando(true);

      const token =
        obtenerToken();


      const response = await fetch(
        `${API_URL}/usuarios`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({

            username:
              formulario.username.trim(),

            password:
              formulario.password,

            nombres:
              formulario.nombres.trim(),

            apellidos:
              formulario.apellidos.trim(),

            correo:
              formulario.correo.trim()
                ? formulario.correo.trim()
                : null,

            rol:
              formulario.rol,
          }),
        }
      );


      if (!verificarSesion(response)) {
        return;
      }


      const datos =
        await response
          .json()
          .catch(() => null);


      if (!response.ok) {

        throw new Error(
          datos?.mensaje ||
          "No se pudo crear el usuario."
        );
      }


      setMensaje(
        `Usuario "${datos.username}" creado correctamente.`
      );


      setFormulario({
        username: "",
        password: "",
        nombres: "",
        apellidos: "",
        correo: "",
        rol: "ANALISTA",
      });


      await cargarUsuarios();


    } catch (error) {

      console.error(
        "Error creando usuario:",
        error
      );

      setError(error.message);


    } finally {

      setGuardando(false);
    }
  };


  // =========================================================
  // FORMULARIO EDICIÓN
  // =========================================================

  const manejarCambioEdicion = (event) => {

    const {
      name,
      value
    } = event.target;


    setFormularioEdicion(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    );
  };


  // =========================================================
  // ABRIR EDICIÓN
  // =========================================================

  const abrirEdicion = (usuario) => {

    setError("");
    setMensaje("");

    setUsuarioRestableciendoPassword(null);

    setUsuarioEditando(usuario);


    setFormularioEdicion({

      nombres:
        usuario.nombres || "",

      apellidos:
        usuario.apellidos || "",

      correo:
        usuario.correo || "",

      rol:
        usuario.rol || "ANALISTA",
    });


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // =========================================================
  // CANCELAR EDICIÓN
  // =========================================================

  const cancelarEdicion = () => {

    setUsuarioEditando(null);

    setFormularioEdicion({
      nombres: "",
      apellidos: "",
      correo: "",
      rol: "ANALISTA",
    });

    setError("");
  };


  // =========================================================
  // GUARDAR EDICIÓN
  // =========================================================

  const guardarEdicion = async (event) => {

    event.preventDefault();


    if (!usuarioEditando) {
      return;
    }


    setError("");
    setMensaje("");


    if (
      !formularioEdicion.nombres.trim()
    ) {

      setError(
        "Los nombres son obligatorios."
      );

      return;
    }


    if (
      !formularioEdicion.apellidos.trim()
    ) {

      setError(
        "Los apellidos son obligatorios."
      );

      return;
    }


    if (!formularioEdicion.rol) {

      setError(
        "El rol es obligatorio."
      );

      return;
    }


    try {

      setGuardandoEdicion(true);

      const token =
        obtenerToken();


      const response = await fetch(
        `${API_URL}/usuarios/${usuarioEditando.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({

            nombres:
              formularioEdicion.nombres.trim(),

            apellidos:
              formularioEdicion.apellidos.trim(),

            correo:
              formularioEdicion.correo.trim()
                ? formularioEdicion.correo.trim()
                : null,

            rol:
              formularioEdicion.rol,
          }),
        }
      );


      if (!verificarSesion(response)) {
        return;
      }


      const datos =
        await response
          .json()
          .catch(() => null);


      if (!response.ok) {

        throw new Error(
          datos?.mensaje ||
          "No se pudo actualizar el usuario."
        );
      }


      // Si el ADMIN modifica sus propios datos,
      // actualizamos también la sesión local.

      if (
        usuarioActual?.id === datos.id
      ) {

        const usuarioSesionActualizado = {

          ...usuarioActual,

          nombres:
            datos.nombres,

          apellidos:
            datos.apellidos,

          rol:
            datos.rol,
        };


        sessionStorage.setItem(
          "usuario",
          JSON.stringify(
            usuarioSesionActualizado
          )
        );
      }


      setMensaje(
        `Usuario "${datos.username}" actualizado correctamente.`
      );


      setUsuarioEditando(null);


      setFormularioEdicion({
        nombres: "",
        apellidos: "",
        correo: "",
        rol: "ANALISTA",
      });


      await cargarUsuarios();


    } catch (error) {

      console.error(
        "Error actualizando usuario:",
        error
      );

      setError(error.message);


    } finally {

      setGuardandoEdicion(false);
    }
  };


  // =========================================================
  // ACTIVAR / DESACTIVAR
  // =========================================================

  const cambiarEstadoUsuario = async (usuario) => {

    setError("");
    setMensaje("");


    const accion =
      usuario.activo
        ? "desactivar"
        : "activar";


    const textoAccion =
      usuario.activo
        ? "desactivar"
        : "activar";


    const confirmar =
      window.confirm(
        `¿Estás seguro de que deseas ${textoAccion} al usuario "${usuario.username}"?`
      );


    if (!confirmar) {
      return;
    }


    try {

      setUsuarioProcesando(
        usuario.id
      );


      const token =
        obtenerToken();


      const response = await fetch(
        `${API_URL}/usuarios/${usuario.id}/${accion}`,
        {
          method: "PUT",

          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      if (!verificarSesion(response)) {
        return;
      }


      const datos =
        await response
          .json()
          .catch(() => null);


      if (!response.ok) {

        throw new Error(
          datos?.mensaje ||
          `No se pudo ${textoAccion} el usuario.`
        );
      }


      setMensaje(
        usuario.activo
          ? `Usuario "${usuario.username}" desactivado correctamente.`
          : `Usuario "${usuario.username}" activado correctamente.`
      );


      await cargarUsuarios();


    } catch (error) {

      console.error(
        "Error cambiando estado del usuario:",
        error
      );

      setError(error.message);


    } finally {

      setUsuarioProcesando(null);
    }
  };


  // =========================================================
  // ABRIR RESTABLECER CONTRASEÑA
  // =========================================================

  const abrirRestablecerPassword = (usuario) => {

    setError("");
    setMensaje("");

    setUsuarioEditando(null);

    setUsuarioRestableciendoPassword(
      usuario
    );


    setFormularioPassword({
      nuevaPassword: "",
      confirmarPassword: "",
    });


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };


  // =========================================================
  // CANCELAR RESTABLECIMIENTO
  // =========================================================

  const cancelarRestablecerPassword = () => {

    setUsuarioRestableciendoPassword(
      null
    );


    setFormularioPassword({
      nuevaPassword: "",
      confirmarPassword: "",
    });


    setError("");
  };


  // =========================================================
  // CAMBIAR FORMULARIO CONTRASEÑA
  // =========================================================

  const manejarCambioPassword = (event) => {

    const {
      name,
      value
    } = event.target;


    setFormularioPassword(
      (anterior) => ({
        ...anterior,
        [name]: value,
      })
    );
  };


  // =========================================================
  // GUARDAR NUEVA CONTRASEÑA
  // =========================================================

  const restablecerPassword = async (event) => {

    event.preventDefault();


    if (!usuarioRestableciendoPassword) {
      return;
    }


    setError("");
    setMensaje("");


    // ---------------------------------------------------------
    // VALIDACIONES
    // ---------------------------------------------------------

    if (
      !formularioPassword.nuevaPassword
    ) {

      setError(
        "La nueva contraseña es obligatoria."
      );

      return;
    }


    if (
      formularioPassword.nuevaPassword.length < 8
    ) {

      setError(
        "La nueva contraseña debe tener mínimo 8 caracteres."
      );

      return;
    }


    if (
      !formularioPassword.confirmarPassword
    ) {

      setError(
        "Debes confirmar la nueva contraseña."
      );

      return;
    }


    if (
      formularioPassword.nuevaPassword !==
      formularioPassword.confirmarPassword
    ) {

      setError(
        "Las contraseñas no coinciden."
      );

      return;
    }


    const confirmar =
      window.confirm(
        `¿Deseas restablecer la contraseña del usuario "${usuarioRestableciendoPassword.username}"?`
      );


    if (!confirmar) {
      return;
    }


    try {

      setGuardandoPassword(true);


      const token =
        obtenerToken();


      const response = await fetch(
        `${API_URL}/usuarios/${usuarioRestableciendoPassword.id}/restablecer-password`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            nuevaPassword:
              formularioPassword.nuevaPassword,
          }),
        }
      );


      if (!verificarSesion(response)) {
        return;
      }


      // Este endpoint devuelve 204 No Content,
      // por eso NO intentamos leer response.json().

      if (!response.ok) {

        const datos =
          await response
            .json()
            .catch(() => null);


        throw new Error(
          datos?.mensaje ||
          "No se pudo restablecer la contraseña."
        );
      }


      const username =
        usuarioRestableciendoPassword.username;


      setUsuarioRestableciendoPassword(
        null
      );


      setFormularioPassword({
        nuevaPassword: "",
        confirmarPassword: "",
      });


      setMensaje(
        `Contraseña del usuario "${username}" restablecida correctamente.`
      );


    } catch (error) {

      console.error(
        "Error restableciendo contraseña:",
        error
      );


      setError(
        error.message
      );


    } finally {

      setGuardandoPassword(false);
    }
  };


  // =========================================================
  // MOSTRAR ROL
  // =========================================================

  const mostrarRol = (rol) => {

    switch (rol) {

      case "ADMIN":
        return "Administrador";

      case "ANALISTA":
        return "Analista de Crédito";

      case "GERENCIA":
        return "Gerencia";

      default:
        return rol || "-";
    }
  };


  // =========================================================
  // FORMATEAR FECHA
  // =========================================================

  const formatearFecha = (fecha) => {

    if (!fecha) {
      return "-";
    }


    try {

      return new Date(
        fecha
      ).toLocaleString(
        "es-EC",
        {
          dateStyle: "short",
          timeStyle: "short",
        }
      );

    } catch {

      return fecha;
    }
  };


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <Layout title="Gestión de Usuarios">


      {/* =====================================================
          MENSAJES
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


      {mensaje && (

        <section
          className="panel"
          style={{
            marginBottom: "20px",
            borderLeft: "4px solid #2e7d32",
          }}
        >

          <strong>
            ✅ {mensaje}
          </strong>

        </section>
      )}


      {/* =====================================================
          RESTABLECER CONTRASEÑA
      ===================================================== */}

      {usuarioRestableciendoPassword && (

        <section
          className="panel"
          style={{
            marginBottom: "24px",
            borderLeft: "5px solid #d88a00",
          }}
        >

          <h2>
            🔑 Restablecer contraseña
          </h2>


          <p
            style={{
              color: "#777",
              marginBottom: "20px",
            }}
          >

            Vas a establecer una nueva contraseña
            para el usuario{" "}

            <strong>
              {usuarioRestableciendoPassword.username}
            </strong>

            .

          </p>


          <form
            onSubmit={restablecerPassword}
            className="form-grid"
          >

            <div>

              <label>
                Nueva contraseña *
              </label>

              <input
                type="password"
                name="nuevaPassword"
                value={
                  formularioPassword.nuevaPassword
                }
                onChange={
                  manejarCambioPassword
                }
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                disabled={guardandoPassword}
              />

            </div>


            <div>

              <label>
                Confirmar contraseña *
              </label>

              <input
                type="password"
                name="confirmarPassword"
                value={
                  formularioPassword.confirmarPassword
                }
                onChange={
                  manejarCambioPassword
                }
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                disabled={guardandoPassword}
              />

            </div>


            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px",
              }}
            >

              <button
                type="submit"
                className="btn primary"
                disabled={guardandoPassword}
              >

                {guardandoPassword
                  ? "⏳ Restableciendo..."
                  : "🔑 Restablecer contraseña"}

              </button>


              <button
                type="button"
                className="btn"
                onClick={
                  cancelarRestablecerPassword
                }
                disabled={guardandoPassword}
              >

                ✖ Cancelar

              </button>

            </div>

          </form>

        </section>
      )}


      {/* =====================================================
          EDITAR USUARIO
      ===================================================== */}

      {usuarioEditando && (

        <section
          className="panel"
          style={{
            marginBottom: "24px",
            borderLeft: "5px solid #007a3d",
          }}
        >

          <h2>
            ✏️ Editar usuario
          </h2>


          <p
            style={{
              color: "#777",
              marginBottom: "20px",
            }}
          >

            Editando a{" "}

            <strong>
              {usuarioEditando.username}
            </strong>

            . El nombre de usuario y la contraseña
            no se modifican desde esta opción.

          </p>


          <form
            onSubmit={guardarEdicion}
            className="form-grid"
          >

            <div>

              <label>
                Usuario
              </label>

              <input
                type="text"
                value={usuarioEditando.username}
                disabled
              />

            </div>


            <div>

              <label>
                Nombres *
              </label>

              <input
                type="text"
                name="nombres"
                value={
                  formularioEdicion.nombres
                }
                onChange={
                  manejarCambioEdicion
                }
                disabled={guardandoEdicion}
              />

            </div>


            <div>

              <label>
                Apellidos *
              </label>

              <input
                type="text"
                name="apellidos"
                value={
                  formularioEdicion.apellidos
                }
                onChange={
                  manejarCambioEdicion
                }
                disabled={guardandoEdicion}
              />

            </div>


            <div>

              <label>
                Correo
              </label>

              <input
                type="email"
                name="correo"
                value={
                  formularioEdicion.correo
                }
                onChange={
                  manejarCambioEdicion
                }
                disabled={guardandoEdicion}
              />

            </div>


            <div>

              <label>
                Rol *
              </label>

              <select
                name="rol"
                value={
                  formularioEdicion.rol
                }
                onChange={
                  manejarCambioEdicion
                }
                disabled={guardandoEdicion}
              >

                <option value="ANALISTA">
                  Analista de Crédito
                </option>

                <option value="GERENCIA">
                  Gerencia
                </option>

                <option value="ADMIN">
                  Administrador
                </option>

              </select>

            </div>


            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "10px",
              }}
            >

              <button
                type="submit"
                className="btn primary"
                disabled={guardandoEdicion}
              >

                {guardandoEdicion
                  ? "⏳ Guardando..."
                  : "💾 Guardar cambios"}

              </button>


              <button
                type="button"
                className="btn"
                onClick={cancelarEdicion}
                disabled={guardandoEdicion}
              >

                ✖ Cancelar

              </button>

            </div>

          </form>

        </section>
      )}


      {/* =====================================================
          CREAR USUARIO
      ===================================================== */}

      <section
        className="panel"
        style={{
          marginBottom: "24px",
        }}
      >

        <h2>
          Crear nuevo usuario
        </h2>


        <p
          style={{
            color: "#777",
            marginBottom: "25px",
          }}
        >

          Registra un usuario interno y asigna
          su rol dentro del sistema.

        </p>


        <form
          onSubmit={crearUsuario}
          className="form-grid"
        >

          <div>

            <label>
              Nombres *
            </label>

            <input
              type="text"
              name="nombres"
              value={formulario.nombres}
              onChange={manejarCambio}
              placeholder="Ej. Juan Carlos"
              disabled={guardando}
            />

          </div>


          <div>

            <label>
              Apellidos *
            </label>

            <input
              type="text"
              name="apellidos"
              value={formulario.apellidos}
              onChange={manejarCambio}
              placeholder="Ej. Pérez López"
              disabled={guardando}
            />

          </div>


          <div>

            <label>
              Usuario *
            </label>

            <input
              type="text"
              name="username"
              value={formulario.username}
              onChange={manejarCambio}
              placeholder="Ej. jperez"
              autoComplete="off"
              disabled={guardando}
            />

          </div>


          <div>

            <label>
              Correo
            </label>

            <input
              type="email"
              name="correo"
              value={formulario.correo}
              onChange={manejarCambio}
              placeholder="usuario@cooperativa.com"
              disabled={guardando}
            />

          </div>


          <div>

            <label>
              Contraseña temporal *
            </label>

            <input
              type="password"
              name="password"
              value={formulario.password}
              onChange={manejarCambio}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              disabled={guardando}
            />

          </div>


          <div>

            <label>
              Rol *
            </label>

            <select
              name="rol"
              value={formulario.rol}
              onChange={manejarCambio}
              disabled={guardando}
            >

              <option value="ANALISTA">
                Analista de Crédito
              </option>

              <option value="GERENCIA">
                Gerencia
              </option>

              <option value="ADMIN">
                Administrador
              </option>

            </select>

          </div>


          <div
            style={{
              gridColumn: "1 / -1",
              marginTop: "10px",
            }}
          >

            <button
              type="submit"
              className="btn primary"
              disabled={guardando}
            >

              {guardando
                ? "⏳ Guardando..."
                : "👤 Crear usuario"}

            </button>

          </div>

        </form>

      </section>


      {/* =====================================================
          LISTADO DE USUARIOS
      ===================================================== */}

      <section className="panel">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >

          <div>

            <h2
              style={{
                marginBottom: "5px",
              }}
            >
              Usuarios registrados
            </h2>


            <p
              style={{
                margin: 0,
                color: "#777",
              }}
            >

              Administra los usuarios autorizados
              para acceder al sistema.

            </p>

          </div>


          <strong>
            Total: {usuarios.length}
          </strong>

        </div>


        {cargando ? (

          <p
            style={{
              textAlign: "center",
              padding: "30px",
            }}
          >
            ⏳ Cargando usuarios...
          </p>

        ) : (

          <>

            <div
              style={{
                overflowX: "auto",
              }}
            >

              <table className="table">

                <thead>

                  <tr>

                    <th>ID</th>
                    <th>Usuario</th>
                    <th>Nombre</th>
                    <th>Correo</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Fecha creación</th>
                    <th>Acciones</th>

                  </tr>

                </thead>


                <tbody>

                  {usuarios.map((usuario) => {

                    const esUsuarioActual =
                      usuarioActual?.id ===
                      usuario.id;


                    const procesando =
                      usuarioProcesando ===
                      usuario.id;


                    return (

                      <tr key={usuario.id}>

                        <td>
                          #{usuario.id}
                        </td>


                        <td>

                          <strong>
                            {usuario.username}
                          </strong>


                          {esUsuarioActual && (

                            <div
                              style={{
                                fontSize: "12px",
                                marginTop: "4px",
                                color: "#777",
                              }}
                            >
                              Sesión actual
                            </div>

                          )}

                        </td>


                        <td>

                          {`${usuario.nombres || ""} ${usuario.apellidos || ""}`}

                        </td>


                        <td>

                          {usuario.correo || "-"}

                        </td>


                        <td>

                          {mostrarRol(
                            usuario.rol
                          )}

                        </td>


                        <td>

                          <span
                            className={
                              usuario.activo
                                ? "badge bajo"
                                : "badge alto"
                            }
                          >

                            {usuario.activo
                              ? "Activo"
                              : "Inactivo"}

                          </span>

                        </td>


                        <td>

                          {formatearFecha(
                            usuario.fechaCreacion
                          )}

                        </td>


                        <td>

                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              flexWrap: "wrap",
                            }}
                          >

                            {/* EDITAR */}

                            <button
                              type="button"
                              className="btn"
                              onClick={() =>
                                abrirEdicion(
                                  usuario
                                )
                              }
                              disabled={
                                procesando ||
                                guardandoEdicion ||
                                guardandoPassword
                              }
                            >
                              ✏️ Editar
                            </button>


                            {/* RESTABLECER CONTRASEÑA */}

                            {!esUsuarioActual && (

                              <button
                                type="button"
                                className="btn"
                                onClick={() =>
                                  abrirRestablecerPassword(
                                    usuario
                                  )
                                }
                                disabled={
                                  procesando ||
                                  guardandoEdicion ||
                                  guardandoPassword
                                }
                              >
                                🔑 Contraseña
                              </button>

                            )}


                            {/* ACTIVAR / DESACTIVAR */}

                            {esUsuarioActual ? (

                              <button
                                type="button"
                                className="btn"
                                disabled
                                title="No puedes desactivar tu propia cuenta"
                              >
                                🔐 Sesión actual
                              </button>

                            ) : (

                              <button
                                type="button"
                                className={
                                  usuario.activo
                                    ? "btn danger"
                                    : "btn primary"
                                }
                                onClick={() =>
                                  cambiarEstadoUsuario(
                                    usuario
                                  )
                                }
                                disabled={
                                  procesando ||
                                  guardandoPassword
                                }
                              >

                                {procesando
                                  ? "⏳ Procesando..."
                                  : usuario.activo
                                    ? "🚫 Desactivar"
                                    : "✅ Activar"}

                              </button>

                            )}

                          </div>

                        </td>

                      </tr>

                    );
                  })}

                </tbody>

              </table>

            </div>


            {usuarios.length === 0 && (

              <div
                style={{
                  textAlign: "center",
                  padding: "35px",
                  color: "#777",
                }}
              >
                No existen usuarios registrados.
              </div>

            )}

          </>

        )}

      </section>

    </Layout>
  );
}


export default Usuarios;