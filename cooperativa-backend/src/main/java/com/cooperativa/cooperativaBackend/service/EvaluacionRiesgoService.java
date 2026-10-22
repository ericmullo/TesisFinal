package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoRequest;
import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoResponse;
import com.cooperativa.cooperativaBackend.exception.RecursoNoEncontradoException;
import com.cooperativa.cooperativaBackend.exception.ReglaNegocioException;
import com.cooperativa.cooperativaBackend.exception.ValidacionException;
import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.model.Documento;
import com.cooperativa.cooperativaBackend.model.EvaluacionRiesgo;
import com.cooperativa.cooperativaBackend.model.Rol;
import com.cooperativa.cooperativaBackend.model.Solicitud;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.DocumentoRepository;
import com.cooperativa.cooperativaBackend.repository.EvaluacionRiesgoRepository;
import com.cooperativa.cooperativaBackend.repository.SolicitudRepository;
import com.cooperativa.cooperativaBackend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
public class EvaluacionRiesgoService {

    private final EvaluacionRiesgoRepository evaluacionRiesgoRepository;

    private final SolicitudRepository solicitudRepository;

    private final DocumentoRepository documentoRepository;

    private final IaRiesgoService iaRiesgoService;

    private final UsuarioRepository usuarioRepository;

    private final NotificacionService notificacionService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public EvaluacionRiesgoService(
            EvaluacionRiesgoRepository evaluacionRiesgoRepository,
            SolicitudRepository solicitudRepository,
            DocumentoRepository documentoRepository,
            IaRiesgoService iaRiesgoService,
            UsuarioRepository usuarioRepository,
            NotificacionService notificacionService
    ) {

        this.evaluacionRiesgoRepository =
                evaluacionRiesgoRepository;

        this.solicitudRepository =
                solicitudRepository;

        this.documentoRepository =
                documentoRepository;

        this.iaRiesgoService =
                iaRiesgoService;

        this.usuarioRepository =
                usuarioRepository;

        this.notificacionService =
                notificacionService;
    }


    // =========================================================
    // OBTENER TODAS LAS EVALUACIONES
    // =========================================================

    public List<EvaluacionRiesgo> obtenerEvaluaciones() {

        return evaluacionRiesgoRepository
                .findAll();
    }


    // =========================================================
    // OBTENER EVALUACIÓN POR ID
    // =========================================================

    public EvaluacionRiesgo obtenerEvaluacionPorId(
            Long id
    ) {

        return evaluacionRiesgoRepository
                .findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "No se encontró la evaluación con ID: "
                                        + id
                        )
                );
    }


    // =========================================================
    // OBTENER EVALUACIONES DE UNA SOLICITUD
    // =========================================================

    public List<EvaluacionRiesgo> obtenerPorSolicitud(
            Long solicitudId
    ) {

        return evaluacionRiesgoRepository
                .findBySolicitudId(
                        solicitudId
                );
    }


    // =========================================================
    // OBTENER HISTORIAL DE EVALUACIONES DE UN CLIENTE
    // =========================================================

    public List<EvaluacionRiesgo> obtenerPorCliente(
            Long clienteId
    ) {

        return evaluacionRiesgoRepository
                .findBySolicitudClienteIdOrderByFechaEvaluacionDesc(
                        clienteId
                );
    }


    // =========================================================
    // VERIFICAR SI EXISTE UN TIPO DE DOCUMENTO
    // =========================================================

    private boolean existeTipoDocumento(
            List<Documento> documentos,
            String tipoDocumento
    ) {

        return documentos
                .stream()
                .anyMatch(
                        documento ->
                                documento.getTipoDocumento() != null
                                        &&
                                documento
                                        .getTipoDocumento()
                                        .equalsIgnoreCase(
                                                tipoDocumento
                                        )
                );
    }


    // =========================================================
    // VERIFICAR DOCUMENTACIÓN COMPLETA
    // =========================================================

    public boolean documentacionCompleta(
            Long solicitudId
    ) {

        List<Documento> documentos =
                documentoRepository
                        .findBySolicitudId(
                                solicitudId
                        );


        // =====================================================
        // NUEVO ESQUEMA
        // =====================================================

        boolean cedulaNueva =
                existeTipoDocumento(
                        documentos,
                        "Cédula"
                );


        boolean certificadoVotacion =
                existeTipoDocumento(
                        documentos,
                        "Certificado de votación"
                );


        boolean respaldoIngresos =
                existeTipoDocumento(
                        documentos,
                        "Respaldo de ingresos o ventas"
                );


        boolean documentacionNuevaCompleta =
                cedulaNueva
                        &&
                certificadoVotacion
                        &&
                respaldoIngresos;


        // =====================================================
        // COMPATIBILIDAD CON DOCUMENTOS ANTIGUOS
        // =====================================================

        boolean identificacionAnterior =
                existeTipoDocumento(
                        documentos,
                        "Identificación"
                );


        boolean ingresosAnterior =
                existeTipoDocumento(
                        documentos,
                        "Ingresos"
                );


        boolean generalAnterior =
                existeTipoDocumento(
                        documentos,
                        "General"
                );


        boolean documentacionAnteriorCompleta =
                identificacionAnterior
                        &&
                ingresosAnterior
                        &&
                generalAnterior;


        // =====================================================
        // COMPATIBILIDAD MIXTA
        // =====================================================

        boolean cedulaCompatible =
                cedulaNueva
                        ||
                identificacionAnterior;


        boolean ingresosCompatible =
                respaldoIngresos
                        ||
                ingresosAnterior;


        boolean documentacionMixtaCompleta =
                cedulaCompatible
                        &&
                certificadoVotacion
                        &&
                ingresosCompatible;


        return documentacionNuevaCompleta
                ||
                documentacionAnteriorCompleta
                ||
                documentacionMixtaCompleta;
    }


    // =========================================================
    // CREAR EVALUACIÓN UTILIZANDO IA
    // =========================================================

    @Transactional
    public EvaluacionRiesgo crearEvaluacion(
            Long solicitudId
    ) {

        // -----------------------------------------------------
        // 1. BUSCAR SOLICITUD
        // -----------------------------------------------------

        Solicitud solicitud =
                solicitudRepository
                        .findById(
                                solicitudId
                        )
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "No se encontró la solicitud con ID: "
                                                + solicitudId
                                )
                        );


        // -----------------------------------------------------
        // 2. EVITAR EVALUACIONES DUPLICADAS
        // -----------------------------------------------------

        List<EvaluacionRiesgo> evaluacionesExistentes =
                evaluacionRiesgoRepository
                        .findBySolicitudId(
                                solicitudId
                        );


        if (
                !evaluacionesExistentes.isEmpty()
        ) {

            throw new ReglaNegocioException(
                    "Esta solicitud ya cuenta con una evaluación de riesgo."
            );
        }


        // -----------------------------------------------------
        // 3. VERIFICAR DOCUMENTACIÓN
        // -----------------------------------------------------

        if (
                !documentacionCompleta(
                        solicitudId
                )
        ) {

            throw new ValidacionException(
                    "La solicitud no tiene toda la documentación requerida. "
                            + "Debe contar con cédula, certificado de votación "
                            + "y respaldo de ingresos o ventas."
            );
        }


        // -----------------------------------------------------
        // 4. VALIDAR DATOS
        // -----------------------------------------------------

        validarDatosSolicitud(
                solicitud
        );


        // -----------------------------------------------------
        // 5. CONVERTIR ANTIGÜEDAD
        // -----------------------------------------------------

        Double antiguedadLaboral =
                convertirAntiguedadLaboral(
                        solicitud
                                .getAntiguedadLaboral()
                );


        // -----------------------------------------------------
        // 6. CONSTRUIR REQUEST PARA FASTAPI V2
        // -----------------------------------------------------

        PrediccionRiesgoRequest request =
                new PrediccionRiesgoRequest();


        // =====================================================
        // VARIABLES FINANCIERAS
        // =====================================================

        request.setIngresosMensuales(
                solicitud
                        .getIngresosMensuales()
        );


        request.setEgresosMensuales(
                solicitud
                        .getEgresosMensuales()
        );


        request.setNivelEndeudamiento(
                solicitud
                        .getNivelEndeudamiento()
        );


        request.setCapacidadPago(
                solicitud
                        .getCapacidadPago()
        );


        // =====================================================
        // SEGMENTACIÓN DEL CRÉDITO
        // =====================================================

        request.setTipoCredito(
                normalizarTextoIa(
                        solicitud
                                .getTipoCredito()
                )
        );


        request.setSubsegmentoCredito(
                normalizarTextoIa(
                        solicitud
                                .getSubsegmentoCredito()
                )
        );


        request.setProductoCredito(
                normalizarTextoIa(
                        solicitud
                                .getProductoCredito()
                )
        );


        // =====================================================
        // MONTO Y PLAZO
        // =====================================================

        request.setMontoSolicitado(
                solicitud
                        .getMonto()
        );


        request.setPlazoMeses(
                solicitud
                        .getPlazoMeses()
        );


        // =====================================================
        // INFORMACIÓN ECONÓMICA NUEVA
        // =====================================================

        /*
         * Para segmentos como Consumo, Vivienda o Educativo
         * las ventas anuales pueden no aplicar.
         *
         * En ese caso enviamos 0.0 para mantener una entrada
         * numérica consistente para el modelo.
         */

        request.setVentasAnuales(
                solicitud.getVentasAnuales() == null
                        ?
                        0.0
                        :
                        solicitud.getVentasAnuales()
        );


        request.setFuentePago(
                normalizarTextoIa(
                        solicitud
                                .getFuentePago()
                )
        );


        // =====================================================
        // ANTIGÜEDAD
        // =====================================================

        request.setAntiguedadLaboralAnios(
                antiguedadLaboral
        );


        // -----------------------------------------------------
        // 7. LLAMAR AL MICROSERVICIO DE IA
        // -----------------------------------------------------

        PrediccionRiesgoResponse respuestaIa =
                iaRiesgoService
                        .predecir(
                                request
                        );


        // -----------------------------------------------------
        // 8. CREAR EVALUACIÓN
        // -----------------------------------------------------

        EvaluacionRiesgo evaluacion =
                new EvaluacionRiesgo();


        evaluacion.setSolicitud(
                solicitud
        );


        evaluacion.setScoreIa(
                respuestaIa
                        .getScoreIa()
        );


        evaluacion.setProbabilidadMora(
                respuestaIa
                        .getProbabilidadMora()
        );


        /*
         * confianzaModelo permanece en null.
         *
         * El modelo actual no devuelve una métrica
         * independiente para esta propiedad.
         */


        evaluacion.setNivelRiesgo(
                respuestaIa
                        .getNivelRiesgo()
        );


        evaluacion.setRecomendacion(
                respuestaIa
                        .getRecomendacion()
        );


        evaluacion.setModeloUtilizado(
                respuestaIa
                        .getModelo()
        );


        evaluacion.setEstado(
                "Completada"
        );


        evaluacion.setExplicacion(
                generarExplicacion(
                        solicitud,
                        respuestaIa
                )
        );


        // -----------------------------------------------------
        // 9. GUARDAR EN POSTGRESQL
        // -----------------------------------------------------

        EvaluacionRiesgo evaluacionGuardada =
                evaluacionRiesgoRepository
                        .save(
                                evaluacion
                        );


        // -----------------------------------------------------
        // 10. ACTUALIZAR ESTADO DE LA SOLICITUD
        // -----------------------------------------------------

        if (
                solicitud.getFechaDecision() == null
                        &&
                !"Aprobado".equalsIgnoreCase(
                        solicitud.getEstado()
                )
                        &&
                !"Rechazado".equalsIgnoreCase(
                        solicitud.getEstado()
                )
        ) {

            solicitud.setEstado(
                    "En evaluación"
            );


            solicitudRepository
                    .save(
                            solicitud
                    );
        }


        // -----------------------------------------------------
        // 11. NOTIFICAR
        // -----------------------------------------------------

        notificarEvaluacionCompletada(
                evaluacionGuardada
        );


        return evaluacionGuardada;
    }


    // =========================================================
    // NORMALIZAR TEXTO PARA LA IA
    // =========================================================

    private String normalizarTextoIa(
            String valor
    ) {

        if (
                valor == null
                        ||
                valor.isBlank()
        ) {

            return "No aplica";
        }


        return valor.trim();
    }


    // =========================================================
    // NOTIFICAR EVALUACIÓN COMPLETADA
    // =========================================================

    private void notificarEvaluacionCompletada(
            EvaluacionRiesgo evaluacion
    ) {

        Solicitud solicitud =
                evaluacion
                        .getSolicitud();


        String nombreCliente =
                obtenerNombreCliente(
                        solicitud
                );


        String nivelRiesgo =
                evaluacion.getNivelRiesgo() == null
                        ||
                evaluacion
                        .getNivelRiesgo()
                        .isBlank()
                        ?
                        "No determinado"
                        :
                        evaluacion
                                .getNivelRiesgo();


        String mensaje =
                "La evaluación de riesgo del cliente "
                        + nombreCliente
                        + " ha sido completada. "
                        + "Nivel de riesgo: "
                        + nivelRiesgo
                        + ".";


        // -----------------------------------------------------
        // ADMIN
        // -----------------------------------------------------

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
                            "Evaluación de riesgo completada",
                            mensaje,
                            "EVALUACION",
                            "EVALUACION",
                            evaluacion.getId(),
                            "/evaluacion-riesgo"
                    );
        }


        // -----------------------------------------------------
        // ANALISTAS
        // -----------------------------------------------------

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
                            "Evaluación de riesgo completada",
                            mensaje,
                            "EVALUACION",
                            "EVALUACION",
                            evaluacion.getId(),
                            "/evaluacion-riesgo"
                    );
        }
    }


    // =========================================================
    // OBTENER NOMBRE DEL CLIENTE
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
    // ACTUALIZAR EVALUACIÓN
    // =========================================================

    public EvaluacionRiesgo actualizarEvaluacion(
            Long id,
            EvaluacionRiesgo datos
    ) {

        EvaluacionRiesgo evaluacion =
                obtenerEvaluacionPorId(
                        id
                );


        if (
                datos.getScoreIa() != null
        ) {

            evaluacion.setScoreIa(
                    datos.getScoreIa()
            );
        }


        if (
                datos.getProbabilidadMora() != null
        ) {

            evaluacion.setProbabilidadMora(
                    datos.getProbabilidadMora()
            );
        }


        if (
                datos.getConfianzaModelo() != null
        ) {

            evaluacion.setConfianzaModelo(
                    datos.getConfianzaModelo()
            );
        }


        if (
                datos.getNivelRiesgo() != null
        ) {

            evaluacion.setNivelRiesgo(
                    datos.getNivelRiesgo()
            );
        }


        if (
                datos.getRecomendacion() != null
        ) {

            evaluacion.setRecomendacion(
                    datos.getRecomendacion()
            );
        }


        if (
                datos.getModeloUtilizado() != null
        ) {

            evaluacion.setModeloUtilizado(
                    datos.getModeloUtilizado()
            );
        }


        if (
                datos.getEstado() != null
        ) {

            evaluacion.setEstado(
                    datos.getEstado()
            );
        }


        if (
                datos.getExplicacion() != null
        ) {

            evaluacion.setExplicacion(
                    datos.getExplicacion()
            );
        }


        return evaluacionRiesgoRepository
                .save(
                        evaluacion
                );
    }


    // =========================================================
    // ELIMINAR EVALUACIÓN
    // =========================================================

    public void eliminarEvaluacion(
            Long id
    ) {

        EvaluacionRiesgo evaluacion =
                obtenerEvaluacionPorId(
                        id
                );


        evaluacionRiesgoRepository
                .delete(
                        evaluacion
                );
    }


    // =========================================================
    // VALIDAR DATOS DE LA SOLICITUD
    // =========================================================

    private void validarDatosSolicitud(
            Solicitud solicitud
    ) {

        // -----------------------------------------------------
        // INGRESOS
        // -----------------------------------------------------

        if (
                solicitud.getIngresosMensuales() == null
        ) {

            throw new ValidacionException(
                    "La solicitud no tiene ingresos mensuales."
            );
        }


        if (
                solicitud.getIngresosMensuales() < 0
        ) {

            throw new ValidacionException(
                    "Los ingresos mensuales no pueden ser negativos."
            );
        }


        // -----------------------------------------------------
        // EGRESOS
        // -----------------------------------------------------

        if (
                solicitud.getEgresosMensuales() == null
        ) {

            throw new ValidacionException(
                    "La solicitud no tiene egresos mensuales."
            );
        }


        if (
                solicitud.getEgresosMensuales() < 0
        ) {

            throw new ValidacionException(
                    "Los egresos mensuales no pueden ser negativos."
            );
        }


        // -----------------------------------------------------
        // ENDEUDAMIENTO
        // -----------------------------------------------------

        if (
                solicitud.getNivelEndeudamiento() == null
        ) {

            throw new ValidacionException(
                    "La solicitud no tiene nivel de endeudamiento."
            );
        }


        if (
                solicitud.getNivelEndeudamiento() < 0
                        ||
                solicitud.getNivelEndeudamiento() > 100
        ) {

            throw new ValidacionException(
                    "El nivel de endeudamiento debe encontrarse entre 0 y 100."
            );
        }


        // -----------------------------------------------------
        // CAPACIDAD DE PAGO
        // -----------------------------------------------------

        if (
                solicitud.getCapacidadPago() == null
        ) {

            throw new ValidacionException(
                    "La solicitud no tiene capacidad de pago."
            );
        }


        // -----------------------------------------------------
        // TIPO DE CRÉDITO
        // -----------------------------------------------------

        if (
                solicitud.getTipoCredito() == null
                        ||
                solicitud
                        .getTipoCredito()
                        .isBlank()
        ) {

            throw new ValidacionException(
                    "La solicitud no tiene tipo de crédito."
            );
        }


        // -----------------------------------------------------
        // MONTO
        // -----------------------------------------------------

        if (
                solicitud.getMonto() == null
        ) {

            throw new ValidacionException(
                    "La solicitud no tiene monto solicitado."
            );
        }


        if (
                solicitud.getMonto() <= 0
        ) {

            throw new ValidacionException(
                    "El monto solicitado debe ser mayor a cero."
            );
        }


        // -----------------------------------------------------
        // PLAZO
        // -----------------------------------------------------

        if (
                solicitud.getPlazoMeses() == null
                        ||
                solicitud.getPlazoMeses() <= 0
        ) {

            throw new ValidacionException(
                    "La solicitud no tiene un plazo válido."
            );
        }


        // -----------------------------------------------------
        // ANTIGÜEDAD
        // -----------------------------------------------------

        if (
                solicitud.getAntiguedadLaboral() == null
                        ||
                solicitud
                        .getAntiguedadLaboral()
                        .isBlank()
        ) {

            throw new ValidacionException(
                    "La solicitud no tiene antigüedad laboral o de la actividad."
            );
        }


        // -----------------------------------------------------
        // MICROCRÉDITO
        // -----------------------------------------------------

        if (
                "Microcrédito"
                        .equalsIgnoreCase(
                                solicitud.getTipoCredito()
                        )
        ) {

            if (
                    solicitud.getVentasAnuales() == null
            ) {

                throw new ValidacionException(
                        "La solicitud de Microcrédito no tiene ventas anuales registradas."
                );
            }


            if (
                    solicitud.getVentasAnuales() < 0
            ) {

                throw new ValidacionException(
                        "Las ventas anuales no pueden ser negativas."
                );
            }


            if (
                    solicitud.getVentasAnuales() > 300000
            ) {

                throw new ValidacionException(
                        "Las ventas anuales superan el rango de Microcrédito."
                );
            }


            if (
                    solicitud.getActividadEconomica() == null
                            ||
                    solicitud
                            .getActividadEconomica()
                            .isBlank()
            ) {

                throw new ValidacionException(
                        "La solicitud de Microcrédito no tiene actividad económica registrada."
                );
            }
        }


        // -----------------------------------------------------
        // PRODUCTIVO
        // -----------------------------------------------------

        if (
                "Productivo"
                        .equalsIgnoreCase(
                                solicitud.getTipoCredito()
                        )
        ) {

            if (
                    solicitud.getVentasAnuales() == null
            ) {

                throw new ValidacionException(
                        "La solicitud de crédito Productivo no tiene ventas anuales registradas."
                );
            }


            if (
                    solicitud.getVentasAnuales() <= 300000
            ) {

                throw new ValidacionException(
                        "Para crédito Productivo las ventas anuales deben superar los USD 300.000."
                );
            }


            if (
                    solicitud.getActividadEconomica() == null
                            ||
                    solicitud
                            .getActividadEconomica()
                            .isBlank()
            ) {

                throw new ValidacionException(
                        "La solicitud de crédito Productivo no tiene actividad económica registrada."
                );
            }
        }
    }


    // =========================================================
    // CONVERTIR ANTIGÜEDAD LABORAL
    // =========================================================

    private Double convertirAntiguedadLaboral(
            String antiguedad
    ) {

        try {

            String valorLimpio =
                    antiguedad
                            .trim()
                            .replace(
                                    ",",
                                    "."
                            )
                            .replaceAll(
                                    "[^0-9.]",
                                    ""
                            );


            if (
                    valorLimpio.isBlank()
            ) {

                throw new NumberFormatException();
            }


            return Double.parseDouble(
                    valorLimpio
            );

        } catch (
                NumberFormatException e
        ) {

            throw new ValidacionException(
                    "La antigüedad laboral o de la actividad no tiene un formato válido: "
                            + antiguedad
            );
        }
    }


    // =========================================================
    // GENERAR EXPLICACIÓN
    // =========================================================

    private String generarExplicacion(
            Solicitud solicitud,
            PrediccionRiesgoResponse respuesta
    ) {

        String segmento =
                normalizarTextoIa(
                        solicitud
                                .getTipoCredito()
                );


        String subsegmento =
                normalizarTextoIa(
                        solicitud
                                .getSubsegmentoCredito()
                );


        String producto =
                normalizarTextoIa(
                        solicitud
                                .getProductoCredito()
                );


        String fuentePago =
                normalizarTextoIa(
                        solicitud
                                .getFuentePago()
                );


        return String.format(
                "La evaluación fue realizada mediante el modelo %s. "
                        + "El modelo estimó una probabilidad de mora de %.2f%% "
                        + "y un Score IA de %d/100. "
                        + "El nivel de riesgo asignado fue %s. "
                        + "La solicitud pertenece al segmento %s, "
                        + "subsegmento %s y producto %s. "
                        + "La evaluación considera ingresos mensuales, "
                        + "egresos mensuales, nivel de endeudamiento, "
                        + "capacidad de pago, segmento de crédito, "
                        + "subsegmento, producto, monto solicitado, "
                        + "plazo, ventas anuales, fuente de pago "
                        + "y antigüedad laboral o de la actividad. "
                        + "La fuente principal de pago registrada es %s. "
                        + "El resultado constituye una recomendación preliminar "
                        + "y no reemplaza la decisión del analista de crédito.",

                respuesta.getModelo(),
                respuesta.getProbabilidadMora(),
                respuesta.getScoreIa(),
                respuesta.getNivelRiesgo(),
                segmento,
                subsegmento,
                producto,
                fuentePago
        );
    }
}