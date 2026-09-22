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