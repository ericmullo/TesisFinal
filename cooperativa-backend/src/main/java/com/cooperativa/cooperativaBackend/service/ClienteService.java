package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.repository.ClienteRepository;
import com.cooperativa.cooperativaBackend.exception.RecursoNoEncontradoException;
import com.cooperativa.cooperativaBackend.exception.ReglaNegocioException;
import com.cooperativa.cooperativaBackend.exception.ValidacionException;
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
        validarCliente(cliente);
        if (clienteRepository.existsByCedula(cliente.getCedula())) {
            throw new ReglaNegocioException("Ya existe un cliente con esa cédula.");
        }
        cliente.setId(null);
        cliente.setEstado("Activo");
        return clienteRepository.save(cliente);
    }

    // =========================================================
    // OBTENER CLIENTE POR ID
    // =========================================================
    public Cliente obtenerClientePorId(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Cliente no encontrado"));
    }

    // =========================================================
    // ACTUALIZAR CLIENTE
    // =========================================================
    public Cliente actualizarCliente(
            Long id,
            Cliente datosActualizados) {

        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException("Cliente no encontrado"));

        validarCliente(datosActualizados);
        if (clienteRepository.existsByCedulaAndIdNot(datosActualizados.getCedula(), id)) {
            throw new ReglaNegocioException("Ya existe otro cliente con esa cédula.");
        }

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
                        new RecursoNoEncontradoException("Cliente no encontrado"));

        clienteRepository.delete(cliente);
    }

    private void validarCliente(Cliente cliente) {
        if (cliente == null) {
            throw new ValidacionException("Ingrese los datos del cliente.");
        }
        String cedula = cliente.getCedula() == null ? "" : cliente.getCedula().trim();
        if (!cedula.matches("\\d{10}")) {
            throw new ValidacionException("La cédula debe contener exactamente 10 dígitos.");
        }
        validarCedulaEcuatoriana(cedula);
        if (cliente.getNombres() == null || cliente.getNombres().isBlank()
                || cliente.getApellidos() == null || cliente.getApellidos().isBlank()) {
            throw new ValidacionException("Ingrese nombres y apellidos del cliente.");
        }
        cliente.setCedula(cedula);
        cliente.setNombres(cliente.getNombres().trim());
        cliente.setApellidos(cliente.getApellidos().trim());
        if (cliente.getCorreo() != null) {
            cliente.setCorreo(cliente.getCorreo().trim());
        }
    }

    private void validarCedulaEcuatoriana(String cedula) {
        int codigo = Integer.parseInt(cedula.substring(0, 2));
        if (!((codigo >= 1 && codigo <= 24) || codigo == 30 || codigo == 50)) {
            throw new ValidacionException("La cédula tiene un código de provincia o emisión inválido.");
        }
        if (cedula.charAt(2) - '0' > 5) {
            throw new ValidacionException("El tercer dígito de la cédula ecuatoriana no es válido.");
        }

        int suma = 0;
        for (int i = 0; i < 9; i++) {
            int digito = cedula.charAt(i) - '0';
            int producto = digito * (i % 2 == 0 ? 2 : 1);
            suma += producto > 9 ? producto - 9 : producto;
        }
        int verificador = (10 - suma % 10) % 10;
        if (verificador != cedula.charAt(9) - '0') {
            throw new ValidacionException("El dígito verificador de la cédula ecuatoriana no es válido.");
        }
    }
}
