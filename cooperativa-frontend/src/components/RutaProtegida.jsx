import { Navigate } from "react-router-dom";


function RutaProtegida({
  children,
  rolesPermitidos = []
}) {

  // =========================================================
  // OBTENER DATOS DE SESIÓN
  // =========================================================

  const token =
    sessionStorage.getItem("token");

  const usuarioGuardado =
    sessionStorage.getItem("usuario");


  // =========================================================
  // SIN SESIÓN
  // =========================================================

  if (!token || !usuarioGuardado) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  // =========================================================
  // CONVERTIR USUARIO GUARDADO
  // =========================================================

  let usuario = null;

  try {

    usuario =
      JSON.parse(usuarioGuardado);

  } catch (error) {

    console.error(
      "Error al leer el usuario de la sesión:",
      error
    );

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  // =========================================================
  // VALIDAR ROL
  // =========================================================

  if (
    rolesPermitidos.length > 0 &&
    !rolesPermitidos.includes(usuario?.rol)
  ) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );
  }


  // =========================================================
  // ACCESO PERMITIDO
  // =========================================================

  return children;
}


export default RutaProtegida;