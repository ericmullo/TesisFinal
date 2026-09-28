import { Navigate } from "react-router-dom";


function RutaProtegida({ children }) {

  // =========================================================
  // OBTENER DATOS DE SESIÓN
  // =========================================================

  const token =
    sessionStorage.getItem("token");

  const usuario =
    sessionStorage.getItem("usuario");


  // =========================================================
  // SIN SESIÓN
  // =========================================================

  if (!token || !usuario) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  // =========================================================
  // SESIÓN EXISTENTE
  // =========================================================

  return children;
}


export default RutaProtegida;