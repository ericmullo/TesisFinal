package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.repository.ClienteRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;

    public ClienteService(ClienteRepository clienteRepository) {
        this.clienteRepository = clienteRepository;
    }

    // Obtener todos
    public List<Cliente> obtenerClientes() {
        return clienteRepository.findAll();
    }

    // Guardar
    public Cliente guardarCliente(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    // Obtener por ID
    public Cliente obtenerClientePorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
    }

    // Actualizar
    public Cliente actualizarCliente(Long id, Cliente datosActualizados) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        cliente.setCedula(datosActualizados.getCedula());
        cliente.setNombres(datosActualizados.getNombres());
        cliente.setApellidos(datosActualizados.getApellidos());
        cliente.setCorreo(datosActualizados.getCorreo());
        cliente.setTelefono(datosActualizados.getTelefono());
        cliente.setEstado(datosActualizados.getEstado());

        return clienteRepository.save(cliente);
    }

    // Eliminar
    public void eliminarCliente(Long id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        clienteRepository.delete(cliente);
    }
}