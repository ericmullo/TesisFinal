package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.exception.RecursoNoEncontradoException;
import com.cooperativa.cooperativaBackend.exception.ReglaNegocioException;
import com.cooperativa.cooperativaBackend.exception.ValidacionException;
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
                        new RecursoNoEncontradoException(
                                "Solicitud no encontrada con ID: " + id
                        )
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
                        new RecursoNoEncontradoException(
                                "Cliente no encontrado con ID: " + clienteId
                        )
                );

        /*
         * Una solicitud nueva:
         *
         * - No puede traer un ID manual.
         * - Siempre empieza Pendiente.
         * - No puede tener decisión final.
         *
         * Aunque el frontend intente enviar "Aprobado",
         * "Rechazado" o "En evaluación", el backend
         * lo reemplaza por "Pendiente".
         */

        solicitud.setId(null);
        solicitud.setCliente(cliente);

        solicitud.setEstado("Pendiente");

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
                        new RecursoNoEncontradoException(
                                "Solicitud no encontrada con ID: " + id
                        )
                );

        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Cliente no encontrado con ID: " + clienteId
                        )
                );


        // =====================================================
        // DATOS PERSONALES COMPLEMENTARIOS
        // =====================================================

        solicitud.setEstadoCivil(
                datosActualizados.getEstadoCivil()
        );

        solicitud.setOcupacion(
                datosActualizados.getOcupacion()
        );

        solicitud.setDireccion(
                datosActualizados.getDireccion()
        );


        // =====================================================
        // INFORMACIÓN FINANCIERA
        // =====================================================

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


        // =====================================================
        // INFORMACIÓN DEL CRÉDITO
        // =====================================================

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
         * MUY IMPORTANTE:
         *
         * NO hacemos:
         *
         * solicitud.setEstado(...)
         * solicitud.setObservacionDecision(...)
         * solicitud.setFechaDecision(...)
         *
         * Por lo tanto, aunque alguien envíe mediante Postman:
         *
         * "estado": "Aprobado"
         *
         * este método lo ignora.
         *
         * La decisión final solamente puede realizarse
         * mediante aprobarSolicitud() o rechazarSolicitud().
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

        Solicitud solicitud =
                obtenerSolicitudPorId(id);


        // Debe existir evaluación IA completada
        verificarEvaluacionCompletada(id);


        // Debe existir una observación válida
        validarObservacion(observacion);


        // No puede existir una decisión anterior
        verificarSinDecisionFinal(solicitud);


        solicitud.setEstado(
                "Aprobado"
        );


        solicitud.setObservacionDecision(
                observacion.trim()
        );


        solicitud.setFechaDecision(
                LocalDateTime.now()
        );


        return solicitudRepository.save(
                solicitud
        );
    }


    // =========================================================
    // RECHAZAR SOLICITUD
    // =========================================================

    public Solicitud rechazarSolicitud(
            Long id,
            String observacion
    ) {

        Solicitud solicitud =
                obtenerSolicitudPorId(id);


        // Debe existir evaluación IA completada
        verificarEvaluacionCompletada(id);


        // Debe existir una observación válida
        validarObservacion(observacion);


        // No puede existir una decisión anterior
        verificarSinDecisionFinal(solicitud);


        solicitud.setEstado(
                "Rechazado"
        );


        solicitud.setObservacionDecision(
                observacion.trim()
        );


        solicitud.setFechaDecision(
                LocalDateTime.now()
        );


        return solicitudRepository.save(
                solicitud
        );
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

            throw new ValidacionException(
                    "Debe ingresar una observación para registrar la decisión."
            );
        }


        if (
                observacion.trim().length() < 5
        ) {

            throw new ValidacionException(
                    "La observación debe contener al menos 5 caracteres."
            );
        }
    }


    // =========================================================
    // VERIFICAR QUE NO EXISTA DECISIÓN FINAL
    // =========================================================

    private void verificarSinDecisionFinal(
            Solicitud solicitud
    ) {

        /*
         * Usamos fechaDecision como parte fundamental
         * para identificar una decisión formal.
         */

        if (
                solicitud.getFechaDecision() != null
                        &&
                (
                        "Aprobado".equalsIgnoreCase(
                                solicitud.getEstado()
                        )
                                ||
                        "Rechazado".equalsIgnoreCase(
                                solicitud.getEstado()
                        )
                )
        ) {

            throw new ReglaNegocioException(
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
                        .findBySolicitudId(
                                solicitudId
                        );


        if (
                evaluaciones.isEmpty()
        ) {

            throw new ValidacionException(
                    "La solicitud todavía no tiene una evaluación de riesgo."
            );
        }


        boolean completada =
                evaluaciones.stream()
                        .anyMatch(
                                evaluacion ->
                                        evaluacion.getEstado() != null
                                                &&
                                        evaluacion
                                                .getEstado()
                                                .equalsIgnoreCase(
                                                        "Completada"
                                                )
                        );


        if (
                !completada
        ) {

            throw new ValidacionException(
                    "La evaluación de riesgo todavía no ha sido completada."
            );
        }
    }


    // =========================================================
    // ELIMINAR
    // =========================================================

    public void eliminarSolicitud(
            Long id
    ) {

        Solicitud solicitud =
                obtenerSolicitudPorId(id);

        solicitudRepository.delete(
                solicitud
        );
    }
}