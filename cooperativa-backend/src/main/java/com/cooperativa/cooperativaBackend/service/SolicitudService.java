package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.model.EvaluacionRiesgo;
import com.cooperativa.cooperativaBackend.model.Solicitud;
import com.cooperativa.cooperativaBackend.repository.ClienteRepository;
import com.cooperativa.cooperativaBackend.repository.EvaluacionRiesgoRepository;
import com.cooperativa.cooperativaBackend.repository.SolicitudRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final ClienteRepository clienteRepository;
    private final EvaluacionRiesgoRepository evaluacionRiesgoRepository;

    public SolicitudService(
            SolicitudRepository solicitudRepository,
            ClienteRepository clienteRepository,
            EvaluacionRiesgoRepository evaluacionRiesgoRepository
    ) {
        this.solicitudRepository = solicitudRepository;
        this.clienteRepository = clienteRepository;
        this.evaluacionRiesgoRepository = evaluacionRiesgoRepository;
    }


    // =========================================================
    // OBTENER TODAS
    // =========================================================

    public List<Solicitud> obtenerSolicitudes() {
        return solicitudRepository.findAll();
    }


    // =========================================================
    // OBTENER POR ID
    // =========================================================

    public Solicitud obtenerSolicitudPorId(Long id) {

        return solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Solicitud no encontrada")
                );
    }


    // =========================================================
    // CREAR
    // =========================================================

    public Solicitud crearSolicitud(
            Long clienteId,
            Solicitud solicitud
    ) {

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado")
                );

        solicitud.setId(null);
        solicitud.setCliente(cliente);

        // Una nueva solicitud todavía no tiene decisión.
        solicitud.setObservacionDecision(null);
        solicitud.setFechaDecision(null);

        return solicitudRepository.save(solicitud);
    }


    // =========================================================
    // ACTUALIZAR
    // =========================================================

    public Solicitud actualizarSolicitud(
            Long id,
            Long clienteId,
            Solicitud datosActualizados
    ) {

        Solicitud solicitud = solicitudRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Solicitud no encontrada")
                );

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() ->
                        new RuntimeException("Cliente no encontrado")
                );


        // Datos personales complementarios

        solicitud.setEstadoCivil(
                datosActualizados.getEstadoCivil()
        );

        solicitud.setOcupacion(
                datosActualizados.getOcupacion()
        );

        solicitud.setDireccion(
                datosActualizados.getDireccion()
        );


        // Información financiera

        solicitud.setIngresosMensuales(
                datosActualizados.getIngresosMensuales()
        );

        solicitud.setEgresosMensuales(
                datosActualizados.getEgresosMensuales()
        );

        solicitud.setNivelEndeudamiento(
                datosActualizados.getNivelEndeudamiento()
        );

        solicitud.setEmpresa(
                datosActualizados.getEmpresa()
        );

        solicitud.setAntiguedadLaboral(
                datosActualizados.getAntiguedadLaboral()
        );

        solicitud.setCapacidadPago(
                datosActualizados.getCapacidadPago()
        );


        // Información del crédito

        solicitud.setTipoCredito(
                datosActualizados.getTipoCredito()
        );

        solicitud.setMonto(
                datosActualizados.getMonto()
        );

        solicitud.setPlazoMeses(
                datosActualizados.getPlazoMeses()
        );

        solicitud.setDestinoCredito(
                datosActualizados.getDestinoCredito()
        );


        /*
         * IMPORTANTE:
         *
         * No actualizamos aquí:
         *
         * estado
         * observacionDecision
         * fechaDecision
         *
         * La decisión final se administra exclusivamente
         * mediante aprobarSolicitud() y rechazarSolicitud().
         */

        solicitud.setCliente(cliente);

        return solicitudRepository.save(solicitud);
    }


    // =========================================================
    // APROBAR SOLICITUD
    // =========================================================

    public Solicitud aprobarSolicitud(
            Long id,
            String observacion
    ) {

        Solicitud solicitud = obtenerSolicitudPorId(id);

        // Verificar que la IA ya haya terminado
        verificarEvaluacionCompletada(id);

        // Verificar observación del analista
        validarObservacion(observacion);

        // Evitar volver a decidir una solicitud
        verificarSinDecisionFinal(solicitud);

        solicitud.setEstado("Aprobado");

        solicitud.setObservacionDecision(
                observacion.trim()
        );

        solicitud.setFechaDecision(
                LocalDateTime.now()
        );

        return solicitudRepository.save(solicitud);
    }


    // =========================================================
    // RECHAZAR SOLICITUD
    // =========================================================

    public Solicitud rechazarSolicitud(
            Long id,
            String observacion
    ) {

        Solicitud solicitud = obtenerSolicitudPorId(id);

        // Verificar que la IA ya haya terminado
        verificarEvaluacionCompletada(id);

        // Verificar observación del analista
        validarObservacion(observacion);

        // Evitar volver a decidir una solicitud
        verificarSinDecisionFinal(solicitud);

        solicitud.setEstado("Rechazado");

        solicitud.setObservacionDecision(
                observacion.trim()
        );

        solicitud.setFechaDecision(
                LocalDateTime.now()
        );

        return solicitudRepository.save(solicitud);
    }


    // =========================================================
    // VALIDAR OBSERVACIÓN
    // =========================================================

    private void validarObservacion(
            String observacion
    ) {

        if (
                observacion == null
                        ||
                observacion.isBlank()
        ) {

            throw new RuntimeException(
                    "Debe ingresar una observación para registrar la decisión."
            );
        }

        if (observacion.trim().length() < 5) {

            throw new RuntimeException(
                    "La observación debe contener al menos 5 caracteres."
            );
        }
    }


    // =========================================================
    // VERIFICAR QUE TODAVÍA NO EXISTA DECISIÓN FINAL
    // =========================================================

    private void verificarSinDecisionFinal(
            Solicitud solicitud
    ) {

        if (
                "Aprobado".equalsIgnoreCase(
                        solicitud.getEstado()
                )
                        ||
                "Rechazado".equalsIgnoreCase(
                        solicitud.getEstado()
                )
        ) {

            throw new RuntimeException(
                    "Esta solicitud ya tiene una decisión final registrada."
            );
        }
    }


    // =========================================================
    // VERIFICAR EVALUACIÓN IA COMPLETADA
    // =========================================================

    private void verificarEvaluacionCompletada(
            Long solicitudId
    ) {

        List<EvaluacionRiesgo> evaluaciones =
                evaluacionRiesgoRepository
                        .findBySolicitudId(solicitudId);

        if (evaluaciones.isEmpty()) {

            throw new RuntimeException(
                    "La solicitud todavía no tiene una evaluación de riesgo."
            );
        }

        boolean completada =
                evaluaciones.stream()
                        .anyMatch(evaluacion ->
                                evaluacion.getEstado() != null
                                        &&
                                evaluacion.getEstado()
                                        .equalsIgnoreCase("Completada")
                        );

        if (!completada) {

            throw new RuntimeException(
                    "La evaluación de riesgo todavía no ha sido completada."
            );
        }
    }


    // =========================================================
    // ELIMINAR
    // =========================================================

    public void eliminarSolicitud(Long id) {

        Solicitud solicitud =
                obtenerSolicitudPorId(id);

        solicitudRepository.delete(solicitud);
    }
}