import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);


  // =========================================================
  // INICIAR SESIÓN
  // =========================================================

  const ingresar = async () => {

    setError("");


    // ---------------------------------------------------------
    // VALIDACIONES BÁSICAS
    // ---------------------------------------------------------

    if (!username.trim() || !password) {

      setError(
        "Ingresa tu usuario y contraseña."
      );

      return;
    }


    try {

      setCargando(true);


      const response = await fetch(
        "http://localhost:8080/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: username.trim(),
            password: password,
          }),
        }
      );


      // -------------------------------------------------------
      // LOGIN INCORRECTO
      // -------------------------------------------------------

      if (!response.ok) {

        let mensaje =
          "No se pudo iniciar sesión.";


        try {

          const errorData =
            await response.json();

          if (errorData?.mensaje) {
            mensaje = errorData.mensaje;
          }

        } catch {
          // Si el backend no devuelve JSON,
          // conservamos el mensaje genérico.
        }


        setError(mensaje);

        return;
      }


      // -------------------------------------------------------
      // LOGIN CORRECTO
      // -------------------------------------------------------

      const usuario =
        await response.json();


      // Guardamos temporalmente la información
      // del usuario autenticado.
      //
      // IMPORTANTE:
      // Esto NO sustituye al JWT.
      // Más adelante guardaremos el token real.

      // Guardar JWT
sessionStorage.setItem(
  "token",
  usuario.token
);

// Guardar información del usuario
sessionStorage.setItem(
  "usuario",
  JSON.stringify({
    id: usuario.id,
    username: usuario.username,
    nombres: usuario.nombres,
    apellidos: usuario.apellidos,
    rol: usuario.rol
  })
);


      // -------------------------------------------------------
      // ENTRAR AL SISTEMA
      // -------------------------------------------------------

      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );


    } catch (error) {

      console.error(
        "Error al iniciar sesión:",
        error
      );


      setError(
        "No se pudo conectar con el servidor."
      );


    } finally {

      setCargando(false);
    }
  };


  // =========================================================
  // ENTER PARA INICIAR SESIÓN
  // =========================================================

  const manejarTecla = (event) => {

    if (event.key === "Enter") {
      ingresar();
    }
  };


  return (

    <div className="login-page">

      <div className="login-logo-top">

        <img
          src="/coop.png"
          alt="Logo Coop"
        />

      </div>


      <main className="login-main">


        {/* ===================================================
            PANEL IZQUIERDO
        =================================================== */}

        <section className="login-left">

          <div className="welcome-box">

            <div className="shield">
              🛡️
            </div>


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


        {/* ===================================================
            PANEL DERECHO
        =================================================== */}

        <section className="login-right">

          <div className="login-card">


            <div className="logo-area">

              <img
                src="/coop.png"
                alt="Logo Cooperativa 15 de Abril"
              />

            </div>


            <div className="online">

              <span className="yellow">
                15
              </span>

              <span className="green">
                online
              </span>

            </div>


            {/* USUARIO */}

            <div className="input-box">

              <input
                type="text"
                placeholder="Usuario"
                value={username}
                onChange={(e) =>
                  setUsername(
                    e.target.value
                  )
                }
                onKeyDown={manejarTecla}
                autoComplete="username"
                disabled={cargando}
              />

              <span>
                👤
              </span>

            </div>


            {/* CONTRASEÑA */}

            <div className="input-box">

              <input
                type={
                  mostrarPassword
                    ? "text"
                    : "password"
                }
                placeholder="Clave"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                onKeyDown={manejarTecla}
                autoComplete="current-password"
                disabled={cargando}
              />


              <span
                onClick={() =>
                  setMostrarPassword(
                    !mostrarPassword
                  )
                }
                style={{
                  cursor: "pointer",
                  userSelect: "none",
                }}
                title={
                  mostrarPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >

                {mostrarPassword
                  ? "🙈"
                  : "👁"}

              </span>

            </div>


            {/* ERROR */}

            {error && (

              <div
                style={{
                  color: "#b42318",
                  background: "#fef3f2",
                  border: "1px solid #fecdca",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "14px",
                  fontSize: "14px",
                }}
              >

                {error}

              </div>

            )}


            {/* BOTÓN */}

            <button
              type="button"
              className="login-btn"
              onClick={ingresar}
              disabled={cargando}
            >

              {cargando
                ? "Ingresando..."
                : "↪ Acceder"}

            </button>


            <div className="links">

              <p>
                Registrarse
              </p>


              <a
                href="#"
                onClick={(e) =>
                  e.preventDefault()
                }
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