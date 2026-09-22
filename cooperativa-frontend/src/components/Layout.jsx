import { NavLink, useNavigate } from "react-router-dom";

function Layout({
  title,
  user = "Analista de Crédito",
  children
}) {

  const navigate = useNavigate();

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
          className="menu-item logout"
          onClick={() => navigate("/")}
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
            👤 {user}
          </div>

        </div>

        {children}

      </main>

    </div>
  );
}

export default Layout;