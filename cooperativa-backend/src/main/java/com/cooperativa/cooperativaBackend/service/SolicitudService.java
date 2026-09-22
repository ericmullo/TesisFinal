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

    // OBTENER TODAS
    public List<Solicitud> obtenerSolicitudes() {
        return solicitudRepository.findAll();
    }

    // OBTENER POR ID
    public Solicitud obtenerSolicitudPorId(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Solicitud no encontrada"));
    }

    // CREAR
    public Solicitud crearSolicitud(Long clienteId, Solicitud solicitud) {

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado"));

        solicitud.setId(null);
        solicitud.setCliente(cliente);

        return solicitudRepository.save(solicitud);
    }

    // ACTUALIZAR
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

        solicitud.setMonto(datosActualizados.getMonto());
        solicitud.setPlazoMeses(datosActualizados.getPlazoMeses());
        solicitud.setTipoCredito(datosActualizados.getTipoCredito());
        solicitud.setIngresosMensuales(
                datosActualizados.getIngresosMensuales()
        );
        solicitud.setDestinoCredito(
                datosActualizados.getDestinoCredito()
        );
        solicitud.setEstado(datosActualizados.getEstado());
        solicitud.setCliente(cliente);

        return solicitudRepository.save(solicitud);
    }

    // ELIMINAR
    public void eliminarSolicitud(Long id) {

        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Solicitud no encontrada"));

        solicitudRepository.delete(solicitud);
    }
}