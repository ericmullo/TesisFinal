import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


function Login() {

  const navigate = useNavigate();


  // =========================================================
  // DATOS LOGIN
  // =========================================================

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  // =========================================================
  // DATOS 2FA
  // =========================================================

  const [codigo, setCodigo] = useState("");
  const [esperandoCodigo, setEsperandoCodigo] = useState(false);

  const [segundosReenvio, setSegundosReenvio] = useState(60);
  const [reenviando, setReenviando] = useState(false);


  // =========================================================
  // ESTADO GENERAL
  // =========================================================

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);


  // =========================================================
  // CONTADOR PARA REENVIAR CÓDIGO
  // =========================================================

  useEffect(() => {

    if (!esperandoCodigo) {
      return;
    }


    if (segundosReenvio <= 0) {
      return;
    }


    const temporizador = setInterval(() => {

      setSegundosReenvio(
        (segundosActuales) => {

          if (segundosActuales <= 1) {

            clearInterval(temporizador);

            return 0;
          }

          return segundosActuales - 1;
        }
      );

    }, 1000);


    return () => {

      clearInterval(temporizador);

    };

  }, [
    esperandoCodigo,
    segundosReenvio,
  ]);


  // =========================================================
  // OBTENER MENSAJE DEL BACKEND
  // =========================================================

  const obtenerMensajeError = async (
    response,
    mensajePorDefecto
  ) => {

    try {

      const errorData = await response.json();


      if (errorData?.mensaje) {

        return errorData.mensaje;

      }

    } catch {

      // Si el backend no devuelve JSON,
      // usamos el mensaje por defecto.

    }


    return mensajePorDefecto;
  };


  // =========================================================
  // PASO 1
  // USUARIO + CONTRASEÑA
  // =========================================================

  const ingresar = async () => {

    setError("");
    setMensaje("");


    // ---------------------------------------------------------
    // VALIDACIONES
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

        const mensajeError =
          await obtenerMensajeError(
            response,
            "No se pudo iniciar sesión."
          );


        setError(mensajeError);

        return;
      }


      // -------------------------------------------------------
      // LOGIN CORRECTO
      // -------------------------------------------------------

      const respuesta = await response.json();


      // -------------------------------------------------------
      // IMPORTANTE:
      // TODAVÍA NO GUARDAMOS JWT
      // -------------------------------------------------------

      sessionStorage.removeItem("token");
      sessionStorage.removeItem("usuario");


      // -------------------------------------------------------
      // PASAR A VERIFICACIÓN 2FA
      // -------------------------------------------------------

      setEsperandoCodigo(true);

      setCodigo("");

      setSegundosReenvio(60);

      setMensaje(
        respuesta?.mensaje ||
        "Código de verificación enviado al correo registrado."
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
  // PASO 2
  // VERIFICAR CÓDIGO
  // =========================================================

  const verificarCodigo = async () => {

    setError("");
    setMensaje("");


    // ---------------------------------------------------------
    // VALIDAR CÓDIGO
    // ---------------------------------------------------------

    if (!codigo.trim()) {

      setError(
        "Ingresa el código de verificación."
      );

      return;
    }


    if (!/^\d{6}$/.test(codigo.trim())) {

      setError(
        "El código debe contener 6 dígitos."
      );

      return;
    }


    try {

      setCargando(true);


      const response = await fetch(
        "http://localhost:8080/api/auth/verificar-codigo",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            username: username.trim(),
            codigo: codigo.trim(),

          }),

        }
      );


      // -------------------------------------------------------
      // CÓDIGO INCORRECTO
      // -------------------------------------------------------

      if (!response.ok) {

        const mensajeError =
          await obtenerMensajeError(
            response,
            "Código de verificación incorrecto o expirado."
          );


        setError(mensajeError);

        return;
      }


      // -------------------------------------------------------
      // CÓDIGO CORRECTO
      // -------------------------------------------------------

      const usuario = await response.json();


      // -------------------------------------------------------
      // COMPROBAR QUE EL BACKEND DEVOLVIÓ JWT
      // -------------------------------------------------------

      if (!usuario?.token) {

        setError(
          "No se recibió el token de autenticación."
        );

        return;
      }


      // -------------------------------------------------------
      // GUARDAR JWT
      // -------------------------------------------------------

      sessionStorage.setItem(
        "token",
        usuario.token
      );


      // -------------------------------------------------------
      // GUARDAR DATOS DEL USUARIO
      // -------------------------------------------------------

      sessionStorage.setItem(
        "usuario",
        JSON.stringify({

          id: usuario.id,
          username: usuario.username,
          nombres: usuario.nombres,
          apellidos: usuario.apellidos,
          rol: usuario.rol,

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
        "Error al verificar código:",
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
  // REENVIAR CÓDIGO
  // =========================================================

  const reenviarCodigo = async () => {

    if (
      segundosReenvio > 0 ||
      reenviando ||
      cargando
    ) {

      return;
    }


    setError("");
    setMensaje("");


    try {

      setReenviando(true);


      const response = await fetch(
        "http://localhost:8080/api/auth/reenviar-codigo",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({

            username: username.trim(),

          }),

        }
      );


      // -------------------------------------------------------
      // ERROR AL REENVIAR
      // -------------------------------------------------------

      if (!response.ok) {

        const mensajeError =
          await obtenerMensajeError(
            response,
            "No se pudo reenviar el código."
          );


        setError(mensajeError);

        return;
      }


      // -------------------------------------------------------
      // CÓDIGO REENVIADO
      // -------------------------------------------------------

      const respuesta = await response.json();


      // Borramos cualquier código que el usuario
      // hubiera escrito anteriormente.

      setCodigo("");


      // Reiniciamos el contador.

      setSegundosReenvio(60);


      setMensaje(
        respuesta?.mensaje ||
        "Se envió un nuevo código de verificación."
      );


    } catch (error) {

      console.error(
        "Error al reenviar código:",
        error
      );


      setError(
        "No se pudo conectar con el servidor."
      );


    } finally {

      setReenviando(false);

    }

  };


  // =========================================================
  // VOLVER AL LOGIN
  // =========================================================

  const volverLogin = () => {

    if (
      cargando ||
      reenviando
    ) {

      return;
    }


    setEsperandoCodigo(false);

    setCodigo("");

    setPassword("");

    setError("");

    setMensaje("");

    setSegundosReenvio(60);

  };


  // =========================================================
  // ENTER
  // =========================================================

  const manejarTecla = (event) => {

    if (event.key !== "Enter") {

      return;

    }


    if (
      cargando ||
      reenviando
    ) {

      return;

    }


    if (esperandoCodigo) {

      verificarCodigo();

    } else {

      ingresar();

    }

  };


  // =========================================================
  // CAMBIO DEL CÓDIGO
  // SOLO PERMITE NÚMEROS Y MÁXIMO 6 DÍGITOS
  // =========================================================

  const cambiarCodigo = (event) => {

    const valor =
      event.target.value
        .replace(/\D/g, "")
        .slice(0, 6);


    setCodigo(valor);

  };


  // =========================================================
  // RECUPERACIÓN DE CONTRASEÑA
  // =========================================================

  const recuperarPassword = (event) => {

    event.preventDefault();

    setMensaje("");

    setError(
      "Si olvidaste tu contraseña, solicita al administrador del sistema que la restablezca."
    );

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


            {/* =================================================
                PASO 1 - USUARIO + CONTRASEÑA
            ================================================= */}

            {!esperandoCodigo && (

              <>

                <div className="input-box">

                  <input
                    type="text"
                    placeholder="Usuario"
                    value={username}
                    onChange={(event) =>
                      setUsername(
                        event.target.value
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


                <div className="input-box">

                  <input
                    type={
                      mostrarPassword
                        ? "text"
                        : "password"
                    }
                    placeholder="Clave"
                    value={password}
                    onChange={(event) =>
                      setPassword(
                        event.target.value
                      )
                    }
                    onKeyDown={manejarTecla}
                    autoComplete="current-password"
                    disabled={cargando}
                  />


                  <span
                    onClick={() => {

                      if (!cargando) {

                        setMostrarPassword(
                          !mostrarPassword
                        );

                      }

                    }}
                    style={{
                      cursor: cargando
                        ? "default"
                        : "pointer",
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

              </>

            )}


            {/* =================================================
                PASO 2 - VERIFICACIÓN 2FA
            ================================================= */}

            {esperandoCodigo && (

              <>

                <div
                  style={{
                    textAlign: "center",
                    marginBottom: "18px",
                  }}
                >

                  <div
                    style={{
                      fontSize: "34px",
                      marginBottom: "8px",
                    }}
                  >
                    🔐
                  </div>


                  <h3
                    style={{
                      margin: "0 0 7px 0",
                      color: "#1f2937",
                    }}
                  >
                    Verificación de seguridad
                  </h3>


                  <p
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      color: "#667085",
                      lineHeight: "1.5",
                    }}
                  >
                    Ingresa el código de 6 dígitos
                    enviado a tu correo registrado.
                  </p>

                </div>


                <div className="input-box">

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Código de 6 dígitos"
                    value={codigo}
                    onChange={cambiarCodigo}
                    onKeyDown={manejarTecla}
                    autoComplete="one-time-code"
                    maxLength={6}
                    disabled={
                      cargando ||
                      reenviando
                    }
                    autoFocus
                    style={{
                      letterSpacing: "4px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  />

                  <span>
                    🔑
                  </span>

                </div>


                {/* =============================================
                    REENVÍO DEL CÓDIGO
                ============================================= */}

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "-2px",
                    marginBottom: "16px",
                    fontSize: "13px",
                  }}
                >

                  {segundosReenvio > 0 ? (

                    <span
                      style={{
                        color: "#667085",
                      }}
                    >
                      Podrás reenviar el código en{" "}

                      <strong>
                        {segundosReenvio} s
                      </strong>

                    </span>

                  ) : (

                    <button
                      type="button"
                      onClick={reenviarCodigo}
                      disabled={
                        reenviando ||
                        cargando
                      }
                      style={{
                        border: "none",
                        background: "transparent",
                        color: "#027a48",
                        cursor:
                          reenviando ||
                          cargando
                            ? "default"
                            : "pointer",
                        fontWeight: "600",
                        fontSize: "13px",
                        padding: "4px 8px",
                        textDecoration: "underline",
                      }}
                    >

                      {reenviando
                        ? "Reenviando..."
                        : "📩 Reenviar código"}

                    </button>

                  )}

                </div>

              </>

            )}


            {/* =================================================
                MENSAJE CORRECTO
            ================================================= */}

            {mensaje && (

              <div
                style={{
                  color: "#027a48",
                  background: "#ecfdf3",
                  border: "1px solid #abefc6",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "14px",
                  fontSize: "14px",
                }}
              >

                {mensaje}

              </div>

            )}


            {/* =================================================
                ERROR
            ================================================= */}

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


            {/* =================================================
                BOTÓN PRINCIPAL
            ================================================= */}

            {!esperandoCodigo ? (

              <button
                type="button"
                className="login-btn"
                onClick={ingresar}
                disabled={cargando}
              >

                {cargando
                  ? "Enviando código..."
                  : "↪ Acceder"}

              </button>

            ) : (

              <button
                type="button"
                className="login-btn"
                onClick={verificarCodigo}
                disabled={
                  cargando ||
                  reenviando ||
                  codigo.length !== 6
                }
              >

                {cargando
                  ? "Verificando..."
                  : "🔐 Verificar código"}

              </button>

            )}


            {/* =================================================
                OPCIONES
            ================================================= */}

            {!esperandoCodigo ? (

              <div className="links">

                <a
                  href="#"
                  onClick={recuperarPassword}
                >
                  ¿Olvidaste tu contraseña?
                </a>

              </div>

            ) : (

              <div
                className="links"
                style={{
                  marginTop: "14px",
                }}
              >

                <a
                  href="#"
                  onClick={(event) => {

                    event.preventDefault();

                    volverLogin();

                  }}
                >
                  ← Volver al inicio de sesión
                </a>

              </div>

            )}

          </div>

        </section>

      </main>

    </div>

  );

}


export default Login;