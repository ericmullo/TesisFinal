import { NavLink, useNavigate } from "react-router-dom";

function Layout({
  title,
  children
}) {

  const navigate = useNavigate();


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
  // CERRAR SESIÓN
  // =========================================================

  const cerrarSesion = () => {

    // Eliminar JWT
    sessionStorage.removeItem("token");

    // Eliminar información del usuario
    sessionStorage.removeItem("usuario");

    // Regresar al Login
    navigate("/", {
      replace: true
    });

  };


  return (

    <div className="layout">

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


        <button
          type="button"
          className="menu-item logout"
          onClick={cerrarSesion}
        >
          🚪 Cerrar sesión
        </button>

      </aside>


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

    </div>

  );

}

export default Layout;