package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.exception.RecursoNoEncontradoException;
import com.cooperativa.cooperativaBackend.exception.ReglaNegocioException;
import com.cooperativa.cooperativaBackend.exception.ValidacionException;
import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.model.EvaluacionRiesgo;
import com.cooperativa.cooperativaBackend.model.Rol;
import com.cooperativa.cooperativaBackend.model.Solicitud;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.ClienteRepository;
import com.cooperativa.cooperativaBackend.repository.EvaluacionRiesgoRepository;
import com.cooperativa.cooperativaBackend.repository.SolicitudRepository;
import com.cooperativa.cooperativaBackend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;


@Service
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;

    private final ClienteRepository clienteRepository;

    private final EvaluacionRiesgoRepository evaluacionRiesgoRepository;

    private final UsuarioRepository usuarioRepository;

    private final NotificacionService notificacionService;

    private final EmailService emailService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public SolicitudService(
            SolicitudRepository solicitudRepository,
            ClienteRepository clienteRepository,
            EvaluacionRiesgoRepository evaluacionRiesgoRepository,
            UsuarioRepository usuarioRepository,
            NotificacionService notificacionService,
            EmailService emailService
    ) {

        this.solicitudRepository =
                solicitudRepository;

        this.clienteRepository =
                clienteRepository;

        this.evaluacionRiesgoRepository =
                evaluacionRiesgoRepository;

        this.usuarioRepository =
                usuarioRepository;

        this.notificacionService =
                notificacionService;

        this.emailService =
                emailService;
    }


    // =========================================================
    // OBTENER TODAS
    // =========================================================

    public List<Solicitud> obtenerSolicitudes() {

        return solicitudRepository
                .findAll();
    }


    // =========================================================
    // OBTENER POR ID
    // =========================================================

    public Solicitud obtenerSolicitudPorId(
            Long id
    ) {

        return solicitudRepository
                .findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Solicitud no encontrada con ID: "
                                        + id
                        )
                );
    }


    // =========================================================
    // CREAR SOLICITUD
    // =========================================================

    @Transactional
    public Solicitud crearSolicitud(
            Long clienteId,
            Solicitud solicitud
    ) {

        Cliente cliente =
                clienteRepository
                        .findById(clienteId)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "Cliente no encontrado con ID: "
                                                + clienteId
                                )
                        );


        // =====================================================
        // DATOS CONTROLADOS POR BACKEND
        // =====================================================

        solicitud.setId(
                null
        );


        solicitud.setCliente(
                cliente
        );


        solicitud.setEstado(
                "Pendiente"
        );


        solicitud.setObservacionDecision(
                null
        );


        solicitud.setFechaDecision(
                null
        );


        // =====================================================
        // CLASIFICAR SUBSEGMENTO
        // =====================================================

        clasificarSubsegmentoCredito(
                solicitud
        );


        // =====================================================
        // GENERAR CÓDIGO
        // =====================================================

        Long siguienteNumero =
                solicitudRepository
                        .obtenerSiguienteCodigoSolicitud();


        String codigoSolicitud =
                String.format(
                        "SOL-%d-%06d",
                        Year.now().getValue(),
                        siguienteNumero
                );


        solicitud.setCodigoSolicitud(
                codigoSolicitud
        );


        // =====================================================
        // GUARDAR
        // =====================================================

        Solicitud solicitudGuardada =
                solicitudRepository
                        .save(
                                solicitud
                        );


        // =====================================================
        // NOTIFICACIONES
        // =====================================================

        notificarNuevaSolicitud(
                solicitudGuardada
        );


        // =====================================================
        // CORREO
        // =====================================================

        enviarCorreoSolicitudRegistrada(
                solicitudGuardada
        );


        return solicitudGuardada;
    }


    // =========================================================
    // ACTUALIZAR SOLICITUD
    // =========================================================

    @Transactional
    public Solicitud actualizarSolicitud(
            Long id,
            Long clienteId,
            Solicitud datosActualizados
    ) {

        Solicitud solicitud =
                solicitudRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "Solicitud no encontrada con ID: "
                                                + id
                                )
                        );


        Cliente cliente =
                clienteRepository
                        .findById(clienteId)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "Cliente no encontrado con ID: "
                                                + clienteId
                                )
                        );


        // =====================================================
        // DATOS PERSONALES
        // =====================================================

        solicitud.setEstadoCivil(
                datosActualizados
                        .getEstadoCivil()
        );


        solicitud.setOcupacion(
                datosActualizados
                        .getOcupacion()
        );


        solicitud.setDireccion(
                datosActualizados
                        .getDireccion()
        );


        // =====================================================
        // INFORMACIÓN FINANCIERA
        // =====================================================

        solicitud.setIngresosMensuales(
                datosActualizados
                        .getIngresosMensuales()
        );


        solicitud.setEgresosMensuales(
                datosActualizados
                        .getEgresosMensuales()
        );


        solicitud.setNivelEndeudamiento(
                datosActualizados
                        .getNivelEndeudamiento()
        );


        solicitud.setEmpresa(
                datosActualizados
                        .getEmpresa()
        );


        solicitud.setAntiguedadLaboral(
                datosActualizados
                        .getAntiguedadLaboral()
        );


        solicitud.setCapacidadPago(
                datosActualizados
                        .getCapacidadPago()
        );


        // =====================================================
        // INFORMACIÓN ECONÓMICA
        // =====================================================

        solicitud.setVentasAnuales(
                datosActualizados
                        .getVentasAnuales()
        );


        solicitud.setActividadEconomica(
                datosActualizados
                        .getActividadEconomica()
        );


        solicitud.setFuentePago(
                datosActualizados
                        .getFuentePago()
        );


        // =====================================================
        // INFORMACIÓN DEL CRÉDITO
        // =====================================================

        solicitud.setTipoCredito(
                datosActualizados
                        .getTipoCredito()
        );


        solicitud.setProductoCredito(
                datosActualizados
                        .getProductoCredito()
        );


        solicitud.setMonto(
                datosActualizados
                        .getMonto()
        );


        solicitud.setPlazoMeses(
                datosActualizados
                        .getPlazoMeses()
        );


        solicitud.setDestinoCredito(
                datosActualizados
                        .getDestinoCredito()
        );


        // =====================================================
        // RECALCULAR SUBSEGMENTO
        // =====================================================

        clasificarSubsegmentoCredito(
                solicitud
        );


        /*
         * NO modificamos:
         *
         * codigoSolicitud
         * estado
         * observacionDecision
         * fechaDecision
         *
         * La decisión final se realiza mediante
         * aprobarSolicitud() o rechazarSolicitud().
         */


        solicitud.setCliente(
                cliente
        );


        return solicitudRepository
                .save(
                        solicitud
                );
    }


    // =========================================================
    // APROBAR SOLICITUD
    // =========================================================

    @Transactional
    public Solicitud aprobarSolicitud(
            Long id,
            String observacion
    ) {

        Solicitud solicitud =
                obtenerSolicitudPorId(
                        id
                );


        verificarEvaluacionCompletada(
                id
        );


        validarObservacion(
                observacion
        );


        verificarSinDecisionFinal(
                solicitud
        );


        solicitud.setEstado(
                "Aprobado"
        );


        solicitud.setObservacionDecision(
                observacion.trim()
        );


        solicitud.setFechaDecision(
                LocalDateTime.now()
        );


        Solicitud solicitudGuardada =
                solicitudRepository
                        .save(
                                solicitud
                        );


        notificarDecisionSolicitud(
                solicitudGuardada,
                "APROBADA"
        );


        enviarCorreoSolicitudAprobada(
                solicitudGuardada
        );


        return solicitudGuardada;
    }


    // =========================================================
    // RECHAZAR SOLICITUD
    // =========================================================

    @Transactional
    public Solicitud rechazarSolicitud(
            Long id,
            String observacion
    ) {

        Solicitud solicitud =
                obtenerSolicitudPorId(
                        id
                );


        verificarEvaluacionCompletada(
                id
        );


        validarObservacion(
                observacion
        );


        verificarSinDecisionFinal(
                solicitud
        );


        solicitud.setEstado(
                "Rechazado"
        );


        solicitud.setObservacionDecision(
                observacion.trim()
        );


        solicitud.setFechaDecision(
                LocalDateTime.now()
        );


        Solicitud solicitudGuardada =
                solicitudRepository
                        .save(
                                solicitud
                        );


        notificarDecisionSolicitud(
                solicitudGuardada,
                "RECHAZADA"
        );


        enviarCorreoSolicitudRechazada(
                solicitudGuardada
        );


        return solicitudGuardada;
    }


    // =========================================================
    // CORREO - SOLICITUD REGISTRADA
    // =========================================================

    private void enviarCorreoSolicitudRegistrada(
            Solicitud solicitud
    ) {

        try {

            emailService
                    .enviarSolicitudRegistrada(
                            solicitud
                    );


            System.out.println(
                    "Correo de solicitud registrada enviado correctamente."
            );

        } catch (Exception e) {

            /*
             * Un fallo de correo no debe impedir
             * guardar la solicitud.
             */

            System.err.println(
                    "No se pudo enviar el correo de solicitud registrada: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // CORREO - APROBACIÓN
    // =========================================================

    private void enviarCorreoSolicitudAprobada(
            Solicitud solicitud
    ) {

        try {

            emailService
                    .enviarSolicitudAprobada(
                            solicitud
                    );


            System.out.println(
                    "Correo de aprobación enviado correctamente."
            );

        } catch (Exception e) {

            System.err.println(
                    "No se pudo enviar el correo de aprobación: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // CORREO - RECHAZO
    // =========================================================

    private void enviarCorreoSolicitudRechazada(
            Solicitud solicitud
    ) {

        try {

            emailService
                    .enviarSolicitudRechazada(
                            solicitud
                    );


            System.out.println(
                    "Correo de rechazo enviado correctamente."
            );

        } catch (Exception e) {

            System.err.println(
                    "No se pudo enviar el correo de rechazo: "
                            + e.getMessage()
            );
        }
    }


    // =========================================================
    // NOTIFICAR NUEVA SOLICITUD
    // =========================================================

    private void notificarNuevaSolicitud(
            Solicitud solicitud
    ) {

        String nombreCliente =
                obtenerNombreCliente(
                        solicitud
                );


        String codigo =
                solicitud
                        .getCodigoSolicitud();


        String mensaje =
                "Se registró la solicitud "
                        + codigo
                        + " del cliente "
                        + nombreCliente
                        + ".";


        // =====================================================
        // ADMINISTRADORES
        // =====================================================

        List<Usuario> administradores =
                usuarioRepository
                        .findByRolAndActivoTrue(
                                Rol.ADMIN
                        );


        for (
                Usuario usuario
                :
                administradores
        ) {

            notificacionService
                    .crearNotificacion(
                            usuario.getId(),
                            "Nueva solicitud registrada",
                            mensaje,
                            "SOLICITUD",
                            "SOLICITUD",
                            solicitud.getId(),
                            "/solicitudes"
                    );
        }


        // =====================================================
        // ANALISTAS
        // =====================================================

        List<Usuario> analistas =
                usuarioRepository
                        .findByRolAndActivoTrue(
                                Rol.ANALISTA
                        );


        for (
                Usuario usuario
                :
                analistas
        ) {

            notificacionService
                    .crearNotificacion(
                            usuario.getId(),
                            "Nueva solicitud registrada",
                            mensaje,
                            "SOLICITUD",
                            "SOLICITUD",
                            solicitud.getId(),
                            "/solicitudes"
                    );
        }
    }


    // =========================================================
    // NOTIFICAR DECISIÓN FINAL
    // =========================================================

    private void notificarDecisionSolicitud(
            Solicitud solicitud,
            String decision
    ) {

        String nombreCliente =
                obtenerNombreCliente(
                        solicitud
                );


        String codigo =
                solicitud
                        .getCodigoSolicitud();


        String titulo;

        String mensaje;


        if (
                "APROBADA"
                        .equalsIgnoreCase(
                                decision
                        )
        ) {

            titulo =
                    "Solicitud aprobada";


            mensaje =
                    "La solicitud "
                            + codigo
                            + " del cliente "
                            + nombreCliente
                            + " fue aprobada.";

        } else {

            titulo =
                    "Solicitud rechazada";


            mensaje =
                    "La solicitud "
                            + codigo
                            + " del cliente "
                            + nombreCliente
                            + " fue rechazada.";
        }


        // =====================================================
        // ADMINISTRADORES
        // =====================================================

        List<Usuario> administradores =
                usuarioRepository
                        .findByRolAndActivoTrue(
                                Rol.ADMIN
                        );


        for (
                Usuario usuario
                :
                administradores
        ) {

            notificacionService
                    .crearNotificacion(
                            usuario.getId(),
                            titulo,
                            mensaje,
                            "DECISION",
                            "SOLICITUD",
                            solicitud.getId(),
                            "/evaluacion-riesgo"
                    );
        }


        // =====================================================
        // ANALISTAS
        // =====================================================

        List<Usuario> analistas =
                usuarioRepository
                        .findByRolAndActivoTrue(
                                Rol.ANALISTA
                        );


        for (
                Usuario usuario
                :
                analistas
        ) {

            notificacionService
                    .crearNotificacion(
                            usuario.getId(),
                            titulo,
                            mensaje,
                            "DECISION",
                            "SOLICITUD",
                            solicitud.getId(),
                            "/evaluacion-riesgo"
                    );
        }


        // =====================================================
        // GERENCIA
        // =====================================================

        List<Usuario> gerencia =
                usuarioRepository
                        .findByRolAndActivoTrue(
                                Rol.GERENCIA
                        );


        for (
                Usuario usuario
                :
                gerencia
        ) {

            notificacionService
                    .crearNotificacion(
                            usuario.getId(),
                            titulo,
                            mensaje,
                            "DECISION",
                            "SOLICITUD",
                            solicitud.getId(),
                            "/evaluacion-riesgo"
                    );
        }
    }


    // =========================================================
    // OBTENER NOMBRE CLIENTE
    // =========================================================

    private String obtenerNombreCliente(
            Solicitud solicitud
    ) {

        if (
                solicitud == null
                        ||
                solicitud.getCliente() == null
        ) {

            return "Cliente";
        }


        Cliente cliente =
                solicitud
                        .getCliente();


        String nombres =
                cliente.getNombres() == null
                        ?
                        ""
                        :
                        cliente
                                .getNombres()
                                .trim();


        String apellidos =
                cliente.getApellidos() == null
                        ?
                        ""
                        :
                        cliente
                                .getApellidos()
                                .trim();


        String nombreCompleto =
                (
                        nombres
                                + " "
                                + apellidos
                )
                        .trim();


        if (
                nombreCompleto.isBlank()
        ) {

            return "Cliente";
        }


        return nombreCompleto;
    }


    // =========================================================
    // CLASIFICAR SEGMENTO / SUBSEGMENTO
    // =========================================================

    private void clasificarSubsegmentoCredito(
            Solicitud solicitud
    ) {

        if (
                solicitud.getTipoCredito() == null
                        ||
                solicitud
                        .getTipoCredito()
                        .isBlank()
        ) {

            throw new ValidacionException(
                    "Debe seleccionar un tipo de crédito."
            );
        }


        String tipoCredito =
                solicitud
                        .getTipoCredito()
                        .trim();


        // =====================================================
        // CONSUMO
        // =====================================================

        if (
                tipoCredito
                        .equalsIgnoreCase(
                                "Consumo"
                        )
        ) {

            solicitud.setSubsegmentoCredito(
                    "Consumo"
            );

            return;
        }


        // =====================================================
        // MICROCRÉDITO
        // =====================================================

        if (
                tipoCredito
                        .equalsIgnoreCase(
                                "Microcrédito"
                        )
        ) {

            Double ventasAnuales =
                    solicitud
                            .getVentasAnuales();


            if (
                    ventasAnuales == null
                            ||
                    ventasAnuales < 0
            ) {

                throw new ValidacionException(
                        "Para Microcrédito debe ingresar las ventas anuales del solicitante."
                );
            }


            // -------------------------------------------------
            // HASTA USD 20.000
            // -------------------------------------------------

            if (
                    ventasAnuales <= 20_000
            ) {

                solicitud.setSubsegmentoCredito(
                        "Microcrédito Minorista"
                );

                return;
            }


            // -------------------------------------------------
            // MÁS DE USD 20.000 HASTA USD 120.000
            // -------------------------------------------------

            if (
                    ventasAnuales <= 120_000
            ) {

                solicitud.setSubsegmentoCredito(
                        "Microcrédito de Acumulación Simple"
                );

                return;
            }


            // -------------------------------------------------
            // MÁS DE USD 120.000 HASTA USD 300.000
            // -------------------------------------------------

            if (
                    ventasAnuales <= 300_000
            ) {

                solicitud.setSubsegmentoCredito(
                        "Microcrédito de Acumulación Ampliada"
                );

                return;
            }


            throw new ValidacionException(
                    "Las ventas anuales superan el límite correspondiente a Microcrédito."
            );
        }


        // =====================================================
        // PRODUCTIVO
        // =====================================================

        if (
                tipoCredito
                        .equalsIgnoreCase(
                                "Productivo"
                        )
        ) {

            Double ventasAnuales =
                    solicitud
                            .getVentasAnuales();


            if (
                    ventasAnuales == null
                            ||
                    ventasAnuales < 0
            ) {

                throw new ValidacionException(
                        "Para crédito Productivo debe ingresar las ventas anuales."
                );
            }


            // -------------------------------------------------
            // PRODUCTIVO:
            // MÁS DE USD 300.000
            // -------------------------------------------------

            if (
                    ventasAnuales <= 300_000
            ) {

                throw new ValidacionException(
                        "Para crédito Productivo las ventas anuales deben superar los USD 300.000."
                );
            }


            // -------------------------------------------------
            // PRODUCTIVO PYMES
            // MÁS DE USD 300.000 HASTA USD 1.500.000
            // -------------------------------------------------

            if (
                    ventasAnuales <= 1_500_000
            ) {

                solicitud.setSubsegmentoCredito(
                        "Productivo PYMES"
                );

                return;
            }


            // -------------------------------------------------
            // PRODUCTIVO EMPRESARIAL
            // MÁS DE USD 1.500.000 HASTA USD 7.000.000
            // -------------------------------------------------

            if (
                    ventasAnuales <= 7_000_000
            ) {

                solicitud.setSubsegmentoCredito(
                        "Productivo Empresarial"
                );

                return;
            }


            // -------------------------------------------------
            // PRODUCTIVO CORPORATIVO
            // MÁS DE USD 7.000.000
            // -------------------------------------------------

            solicitud.setSubsegmentoCredito(
                    "Productivo Corporativo"
            );

            return;
        }


        // =====================================================
        // INMOBILIARIO
        // =====================================================

        if (
                tipoCredito
                        .equalsIgnoreCase(
                                "Inmobiliario"
                        )
        ) {

            solicitud.setSubsegmentoCredito(
                    "Inmobiliario"
            );

            return;
        }


        // =====================================================
        // VIVIENDA
        // =====================================================

        if (
                tipoCredito
                        .equalsIgnoreCase(
                                "Vivienda"
                        )
        ) {

            solicitud.setSubsegmentoCredito(
                    "Vivienda"
            );

            return;
        }


        // =====================================================
        // EDUCATIVO
        // =====================================================

        if (
                tipoCredito
                        .equalsIgnoreCase(
                                "Educativo"
                        )
        ) {

            solicitud.setSubsegmentoCredito(
                    "Educativo"
            );

            return;
        }


        // =====================================================
        // REGISTROS ANTIGUOS / OTROS
        // =====================================================

        solicitud.setSubsegmentoCredito(
                null
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
                observacion
                        .trim()
                        .length()
                        < 5
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

        if (
                solicitud.getFechaDecision() != null
                        &&
                (
                        "Aprobado"
                                .equalsIgnoreCase(
                                        solicitud.getEstado()
                                )
                                ||
                        "Rechazado"
                                .equalsIgnoreCase(
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
                evaluaciones
                        .stream()
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
    // ELIMINAR SOLICITUD
    // =========================================================

    public void eliminarSolicitud(
            Long id
    ) {

        Solicitud solicitud =
                obtenerSolicitudPorId(
                        id
                );


        solicitudRepository
                .delete(
                        solicitud
                );
    }
}