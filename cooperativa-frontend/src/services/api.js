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