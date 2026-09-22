package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.model.Solicitud;
import com.cooperativa.cooperativaBackend.repository.ClienteRepository;
import com.cooperativa.cooperativaBackend.repository.SolicitudRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final ClienteRepository clienteRepository;

    public SolicitudService(
            SolicitudRepository solicitudRepository,
            ClienteRepository clienteRepository) {

        this.solicitudRepository = solicitudRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<Solicitud> obtenerSolicitudes() {
        return solicitudRepository.findAll();
    }

    public Solicitud obtenerSolicitudPorId(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Solicitud no encontrada"));
    }

    public Solicitud crearSolicitud(Long clienteId, Solicitud solicitud) {

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado"));

        solicitud.setId(null);
        solicitud.setCliente(cliente);

        return solicitudRepository.save(solicitud);
    }

    public Solicitud actualizarSolicitud(
            Long id,
            Long clienteId,
            Solicitud datosActualizados) {

        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Solicitud no encontrada"));

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado"));

        // Datos personales complementarios
        solicitud.setEstadoCivil(datosActualizados.getEstadoCivil());
        solicitud.setOcupacion(datosActualizados.getOcupacion());
        solicitud.setDireccion(datosActualizados.getDireccion());

        // Información financiera
        solicitud.setIngresosMensuales(
                datosActualizados.getIngresosMensuales());

        solicitud.setEgresosMensuales(
                datosActualizados.getEgresosMensuales());

        solicitud.setNivelEndeudamiento(
                datosActualizados.getNivelEndeudamiento());

        solicitud.setEmpresa(
                datosActualizados.getEmpresa());

        solicitud.setAntiguedadLaboral(
                datosActualizados.getAntiguedadLaboral());

        solicitud.setCapacidadPago(
                datosActualizados.getCapacidadPago());

        // Información del crédito
        solicitud.setTipoCredito(
                datosActualizados.getTipoCredito());

        solicitud.setMonto(
                datosActualizados.getMonto());

        solicitud.setPlazoMeses(
                datosActualizados.getPlazoMeses());

        solicitud.setEstado(
                datosActualizados.getEstado());

        solicitud.setDestinoCredito(
                datosActualizados.getDestinoCredito());

        // Cliente asociado
        solicitud.setCliente(cliente);

        return solicitudRepository.save(solicitud);
    }

    public void eliminarSolicitud(Long id) {

        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Solicitud no encontrada"));

        solicitudRepository.delete(solicitud);
    }
}