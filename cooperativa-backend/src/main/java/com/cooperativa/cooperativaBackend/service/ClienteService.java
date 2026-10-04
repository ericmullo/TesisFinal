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

    // =========================================================
    // OBTENER TODOS LOS CLIENTES
    // =========================================================
    public List<Cliente> obtenerClientes() {
        return clienteRepository.findAll();
    }

    // =========================================================
    // CREAR CLIENTE
    // Todo cliente nuevo inicia automáticamente como Activo
    // =========================================================
    public Cliente guardarCliente(Cliente cliente) {

        cliente.setEstado("Activo");

        return clienteRepository.save(cliente);
    }

    // =========================================================
    // OBTENER CLIENTE POR ID
    // =========================================================
    public Cliente obtenerClientePorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado"));
    }

    // =========================================================
    // ACTUALIZAR CLIENTE
    // =========================================================
    public Cliente actualizarCliente(
            Long id,
            Cliente datosActualizados) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado"));

        cliente.setCedula(datosActualizados.getCedula());
        cliente.setNombres(datosActualizados.getNombres());
        cliente.setApellidos(datosActualizados.getApellidos());
        cliente.setCorreo(datosActualizados.getCorreo());
        cliente.setTelefono(datosActualizados.getTelefono());
        cliente.setEstado(datosActualizados.getEstado());

        return clienteRepository.save(cliente);
    }

    // =========================================================
    // ELIMINAR CLIENTE
    // =========================================================
    public void eliminarCliente(Long id) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado"));

        clienteRepository.delete(cliente);
    }
}