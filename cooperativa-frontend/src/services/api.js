const API_URL = "http://localhost:8080/api";

// Probar conexión con el backend
export async function probarBackend() {
  const response = await fetch(`${API_URL}/prueba`);

  if (!response.ok) {
    throw new Error("Error al conectar con el backend");
  }

  return await response.text();
}

// Obtener todos los clientes
export async function obtenerClientes() {
  const response = await fetch(`${API_URL}/clientes`);

  if (!response.ok) {
    throw new Error("Error al obtener los clientes");
  }

  return await response.json();
}

// Obtener un cliente por ID
export async function obtenerClientePorId(id) {
  const response = await fetch(`${API_URL}/clientes/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener el cliente");
  }

  return await response.json();
}

// Crear cliente
export async function crearCliente(cliente) {
  const response = await fetch(`${API_URL}/clientes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cliente),
  });

  if (!response.ok) {
    throw new Error("Error al crear el cliente");
  }

  return await response.json();
}

// Actualizar cliente
export async function actualizarCliente(id, cliente) {
  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cliente),
  });

  if (!response.ok) {
    throw new Error("Error al actualizar el cliente");
  }

  return await response.json();
}
export async function eliminarCliente(id) {

  const response = await fetch(`${API_URL}/clientes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar el cliente");
  }

  return true;
}

// ================================
// SOLICITUDES
// ================================

export async function obtenerSolicitudes() {
  const response = await fetch(`${API_URL}/solicitudes`);

  if (!response.ok) {
    throw new Error("Error al obtener las solicitudes");
  }

  return await response.json();
}

export async function obtenerSolicitudPorId(id) {
  const response = await fetch(`${API_URL}/solicitudes/${id}`);

  if (!response.ok) {
    throw new Error("Error al obtener la solicitud");
  }

  return await response.json();
}

export async function crearSolicitud(clienteId, solicitud) {
  const response = await fetch(
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
    throw new Error("Error al crear la solicitud");
  }

  return await response.json();
}

export async function actualizarSolicitud(id, clienteId, solicitud) {
  const response = await fetch(
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
    throw new Error("Error al actualizar la solicitud");
  }

  return await response.json();
}

export async function eliminarSolicitud(id) {
  const response = await fetch(`${API_URL}/solicitudes/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Error al eliminar la solicitud");
  }

  return true;
}

// =========================================================
// DOCUMENTOS
// =========================================================

// OBTENER TODOS LOS DOCUMENTOS
export async function obtenerDocumentos() {
  const response = await fetch(`${API_URL}/documentos`);

  if (!response.ok) {
    throw new Error("Error al obtener los documentos");
  }

  return await response.json();
}


// OBTENER DOCUMENTOS DE UNA SOLICITUD
export async function obtenerDocumentosPorSolicitud(solicitudId) {
  const response = await fetch(
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

  formData.append("solicitudId", solicitudId);
  formData.append("tipoDocumento", tipoDocumento);
  formData.append("archivo", archivo);

  const response = await fetch(
    `${API_URL}/documentos/subir`,
    {
      method: "POST",
      body: formData
    }
  );

  if (!response.ok) {
    throw new Error("Error al subir el documento");
  }

  return await response.json();
}


// ELIMINAR DOCUMENTO
export async function eliminarDocumento(id) {
  const response = await fetch(
    `${API_URL}/documentos/${id}`,
    {
      method: "DELETE"
    }
  );

  if (!response.ok) {
    throw new Error("Error al eliminar el documento");
  }

  return true;
}


// URL PARA VER EL ARCHIVO
export function obtenerUrlArchivoDocumento(id) {
  return `${API_URL}/documentos/${id}/archivo`;
}

// =========================================================
// EVALUACIONES DE RIESGO
// =========================================================


// OBTENER TODAS LAS EVALUACIONES

export async function obtenerEvaluaciones() {

  const response =
    await fetch(
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

  const response =
    await fetch(
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

  const response =
    await fetch(
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

  const response =
    await fetch(
      `${API_URL}/evaluaciones?solicitudId=${solicitudId}`,
      {
        method: "POST"
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

  const response =
    await fetch(
      `${API_URL}/evaluaciones/${id}`,
      {
        method: "PUT",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify(
          datos
        )
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
// OBTENER HISTORIAL DE EVALUACIONES DE UN CLIENTE
// =========================================================

export async function obtenerEvaluacionesPorCliente(clienteId) {

  const response = await fetch(
    `${API_URL}/evaluaciones/cliente/${clienteId}`
  );

  if (!response.ok) {
    throw new Error(
      "Error al obtener el historial de evaluaciones del cliente"
    );
  }

  return await response.json();
}