import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const ingresar = () => {
    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      <div className="login-logo-top">
        <img src="/coop.png" alt="Logo Coop" />
      </div>

      <main className="login-main">

        <section className="login-left">
          <div className="welcome-box">

            <div className="shield">🛡️</div>

            <h2>
              Bienvenido al portal oficial de la
              <br />

              <span>
                Cooperativa 15 de Abril Ltda.
              </span>

              <br />
              Ingresa con seguridad y confianza.
            </h2>

            <button
              type="button"
              className="security-btn"
            >
              🛡 Ver guía de seguridad
            </button>

          </div>
        </section>

        <section className="login-right">

          <div className="login-card">

            <div className="logo-area">
              <img
                src="/coop.png"
                alt="Logo Cooperativa 15 de Abril"
              />
            </div>

            <div className="online">
              <span className="yellow">15</span>
              <span className="green">online</span>
            </div>

            <div className="input-box">
              <input
                type="text"
                placeholder="Usuario"
              />

              <span>👤</span>
            </div>

            <div className="input-box">
              <input
                type="password"
                placeholder="Clave"
              />

              <span>👁</span>
            </div>

            <button
              type="button"
              className="login-btn"
              onClick={ingresar}
            >
              ↪ Acceder
            </button>

            <div className="links">
              <p>Registrarse</p>

              <a
                href="#"
                onClick={(e) => e.preventDefault()}
              >
                ¿Olvidaste tu contraseña o usuario?
              </a>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default Login;