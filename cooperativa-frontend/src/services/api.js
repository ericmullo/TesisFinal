const API_URL = "http://localhost:8080/api";


// =========================================================
// AUTENTICACIÓN - TOKEN
// =========================================================

function obtenerToken() {
  return sessionStorage.getItem("token");
}


// =========================================================
// FETCH AUTENTICADO
// =========================================================

async function fetchAutenticado(url, opciones = {}) {

  const token = obtenerToken();

  const headers = new Headers(
    opciones.headers || {}
  );


  // Agregar JWT automáticamente
  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }


  const response = await fetch(
    url,
    {
      ...opciones,
      headers
    }
  );


  // =======================================================
  // TOKEN INVÁLIDO / EXPIRADO / SIN AUTORIZACIÓN
  // =======================================================

  if (
    response.status === 401
  ) {

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("usuario");


    // Evitar bucle si ya estamos en Login
    if (
      window.location.pathname !== "/" &&
      window.location.pathname !== "/login"
    ) {

      window.location.href = "/";
    }
  }


  return response;
}


// =========================================================
// PROBAR CONEXIÓN CON BACKEND
// =========================================================

export async function probarBackend() {

  const response = await fetchAutenticado(
    `${API_URL}/prueba`
  );


  if (!response.ok) {

    throw new Error(
      "Error al conectar con el backend"
    );
  }


  return await response.text();
}


// =========================================================
// CLIENTES
// =========================================================


// OBTENER TODOS LOS CLIENTES

export async function obtenerClientes() {

  const response = await fetchAutenticado(
    `${API_URL}/clientes`
  );


  if (!response.ok) {

    throw new Error(
      "Error al obtener los clientes"
    );
  }


  return await response.json();
}


// OBTENER CLIENTE POR ID

export async function obtenerClientePorId(id) {

  const response = await fetchAutenticado(
    `${API_URL}/clientes/${id}`
  );


  if (!response.ok) {

    throw new Error(
      "Error al obtener el cliente"
    );
  }


  return await response.json();
}


// CREAR CLIENTE

export async function crearCliente(cliente) {

  const response = await fetchAutenticado(
    `${API_URL}/clientes`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(cliente),
    }
  );


  if (!response.ok) {

    throw new Error(
      "Error al crear el cliente"
    );
  }


  return await response.json();
}


// ACTUALIZAR CLIENTE

export async function actualizarCliente(
  id,
  cliente
) {

  const response = await fetchAutenticado(
    `${API_URL}/clientes/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(cliente),
    }
  );


  if (!response.ok) {

    throw new Error(
      "Error al actualizar el cliente"
    );
  }


  return await response.json();
}


// ELIMINAR CLIENTE

export async function eliminarCliente(id) {

  const response = await fetchAutenticado(
    `${API_URL}/clientes/${id}`,
    {
      method: "DELETE",
    }
  );


  if (!response.ok) {

    throw new Error(
      "Error al eliminar el cliente"
    );
  }


  return true;
}


// =========================================================
// SOLICITUDES
// =========================================================


// OBTENER TODAS LAS SOLICITUDES

export async function obtenerSolicitudes() {

  const response = await fetchAutenticado(
    `${API_URL}/solicitudes`
  );


  if (!response.ok) {

    throw new Error(
      "Error al obtener las solicitudes"
    );
  }


  return await response.json();
}


// OBTENER SOLICITUD POR ID

export async function obtenerSolicitudPorId(id) {

  const response = await fetchAutenticado(
    `${API_URL}/solicitudes/${id}`
  );


  if (!response.ok) {

    throw new Error(
      "Error al obtener la solicitud"
    );
  }


  return await response.json();
}


// CREAR SOLICITUD

export async function crearSolicitud(
  clienteId,
  solicitud
) {

  const response = await fetchAutenticado(
    `${API_URL}/solicitudes?clienteId=${clienteId}`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(solicitud),
    }
  );


  if (!response.ok) {

    throw new Error(
      "Error al crear la solicitud"
    );
  }


  return await response.json();
}


// ACTUALIZAR SOLICITUD

export async function actualizarSolicitud(
  id,
  clienteId,
  solicitud
) {

  const response = await fetchAutenticado(
    `${API_URL}/solicitudes/${id}?clienteId=${clienteId}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(solicitud),
    }
  );


  if (!response.ok) {

    throw new Error(
      "Error al actualizar la solicitud"
    );
  }


  return await response.json();
}


// ELIMINAR SOLICITUD

export async function eliminarSolicitud(id) {

  const response = await fetchAutenticado(
    `${API_URL}/solicitudes/${id}`,
    {
      method: "DELETE",
    }
  );


  if (!response.ok) {

    throw new Error(
      "Error al eliminar la solicitud"
    );
  }


  return true;
}


// =========================================================
// DOCUMENTOS
// =========================================================


// OBTENER TODOS LOS DOCUMENTOS

export async function obtenerDocumentos() {

  const response = await fetchAutenticado(
    `${API_URL}/documentos`
  );


  if (!response.ok) {

    throw new Error(
      "Error al obtener los documentos"
    );
  }


  return await response.json();
}


// OBTENER DOCUMENTOS DE UNA SOLICITUD

export async function obtenerDocumentosPorSolicitud(
  solicitudId
) {

  const response = await fetchAutenticado(
    `${API_URL}/documentos/solicitud/${solicitudId}`
  );


  if (!response.ok) {

    throw new Error(
      "Error al obtener los documentos de la solicitud"
    );
  }


  return await response.json();
}


// SUBIR DOCUMENTO

export async function subirDocumento(
  solicitudId,
  tipoDocumento,
  archivo
) {

  const formData = new FormData();


  formData.append(
    "solicitudId",
    solicitudId
  );


  formData.append(
    "tipoDocumento",
    tipoDocumento
  );


  formData.append(
    "archivo",
    archivo
  );


  const response = await fetchAutenticado(
    `${API_URL}/documentos/subir`,
    {
      method: "POST",

      // IMPORTANTE:
      // No agregar Content-Type aquí.
      // El navegador configura multipart/form-data
      // automáticamente.

      body: formData,
    }
  );


  if (!response.ok) {

    throw new Error(
      "Error al subir el documento"
    );
  }


  return await response.json();
}


// ELIMINAR DOCUMENTO

export async function eliminarDocumento(id) {

  const response = await fetchAutenticado(
    `${API_URL}/documentos/${id}`,
    {
      method: "DELETE",
    }
  );


  if (!response.ok) {

    throw new Error(
      "Error al eliminar el documento"
    );
  }


  return true;
}


// =========================================================
// URL PARA VER ARCHIVO
// =========================================================
//
// IMPORTANTE:
// Esta función únicamente construye una URL.
// No envía el JWT.
//
// Por ahora la mantenemos porque tus componentes
// actuales pueden depender de ella.
//
// Después adaptaremos la visualización/descarga
// de documentos protegidos.
// =========================================================

export function obtenerUrlArchivoDocumento(id) {

  return `${API_URL}/documentos/${id}/archivo`;
}


// =========================================================
// EVALUACIONES DE RIESGO
// =========================================================


// OBTENER TODAS LAS EVALUACIONES

export async function obtenerEvaluaciones() {

  const response = await fetchAutenticado(
    `${API_URL}/evaluaciones`
  );


  if (!response.ok) {

    throw new Error(
      "Error al obtener las evaluaciones"
    );
  }


  return await response.json();
}


// OBTENER EVALUACIONES DE UNA SOLICITUD

export async function obtenerEvaluacionesPorSolicitud(
  solicitudId
) {

  const response = await fetchAutenticado(
    `${API_URL}/evaluaciones/solicitud/${solicitudId}`
  );


  if (!response.ok) {

    throw new Error(
      "Error al obtener la evaluación"
    );
  }


  return await response.json();
}


// VERIFICAR DOCUMENTACIÓN

export async function verificarDocumentacion(
  solicitudId
) {

  const response = await fetchAutenticado(
    `${API_URL}/evaluaciones/documentacion/${solicitudId}`
  );


  if (!response.ok) {

    throw new Error(
      "Error al verificar la documentación"
    );
  }


  return await response.json();
}


// CREAR EVALUACIÓN

export async function crearEvaluacion(
  solicitudId
) {

  const response = await fetchAutenticado(
    `${API_URL}/evaluaciones?solicitudId=${solicitudId}`,
    {
      method: "POST",
    }
  );


  if (!response.ok) {

    throw new Error(
      "No se pudo crear la evaluación"
    );
  }


  return await response.json();
}


// ACTUALIZAR EVALUACIÓN

export async function actualizarEvaluacion(
  id,
  datos
) {

  const response = await fetchAutenticado(
    `${API_URL}/evaluaciones/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(datos),
    }
  );


  if (!response.ok) {

    throw new Error(
      "No se pudo actualizar la evaluación"
    );
  }


  return await response.json();
}


// =========================================================
// HISTORIAL DE EVALUACIONES DE UN CLIENTE
// =========================================================

export async function obtenerEvaluacionesPorCliente(
  clienteId
) {

  const response = await fetchAutenticado(
    `${API_URL}/evaluaciones/cliente/${clienteId}`
  );


  if (!response.ok) {

    throw new Error(
      "Error al obtener el historial de evaluaciones del cliente"
    );
  }


  return await response.json();
}


// =========================================================
// DECISIÓN FINAL DEL ANALISTA
// =========================================================


// APROBAR SOLICITUD

export async function aprobarSolicitud(
  id,
  observacion
) {

  const response = await fetchAutenticado(
    `${API_URL}/solicitudes/${id}/aprobar`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        observacion,
      }),
    }
  );


  if (!response.ok) {

    throw new Error(
      "No se pudo aprobar la solicitud."
    );
  }


  return await response.json();
}


// RECHAZAR SOLICITUD

export async function rechazarSolicitud(
  id,
  observacion
) {

  const response = await fetchAutenticado(
    `${API_URL}/solicitudes/${id}/rechazar`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        observacion,
      }),
    }
  );


  if (!response.ok) {

    throw new Error(
      "No se pudo rechazar la solicitud."
    );
  }


  return await response.json();
}