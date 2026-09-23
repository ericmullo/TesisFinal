package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoRequest;
import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoResponse;
import com.cooperativa.cooperativaBackend.model.Documento;
import com.cooperativa.cooperativaBackend.model.EvaluacionRiesgo;
import com.cooperativa.cooperativaBackend.model.Solicitud;
import com.cooperativa.cooperativaBackend.repository.DocumentoRepository;
import com.cooperativa.cooperativaBackend.repository.EvaluacionRiesgoRepository;
import com.cooperativa.cooperativaBackend.repository.SolicitudRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EvaluacionRiesgoService {

    private final EvaluacionRiesgoRepository evaluacionRiesgoRepository;
    private final SolicitudRepository solicitudRepository;
    private final DocumentoRepository documentoRepository;
    private final IaRiesgoService iaRiesgoService;

    public EvaluacionRiesgoService(
            EvaluacionRiesgoRepository evaluacionRiesgoRepository,
            SolicitudRepository solicitudRepository,
            DocumentoRepository documentoRepository,
            IaRiesgoService iaRiesgoService
    ) {
        this.evaluacionRiesgoRepository = evaluacionRiesgoRepository;
        this.solicitudRepository = solicitudRepository;
        this.documentoRepository = documentoRepository;
        this.iaRiesgoService = iaRiesgoService;
    }

    // =========================================================
    // OBTENER TODAS LAS EVALUACIONES
    // =========================================================

    public List<EvaluacionRiesgo> obtenerEvaluaciones() {
        return evaluacionRiesgoRepository.findAll();
    }

    // =========================================================
    // OBTENER EVALUACIÓN POR ID
    // =========================================================

    public EvaluacionRiesgo obtenerEvaluacionPorId(Long id) {
        return evaluacionRiesgoRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No se encontró la evaluación con ID: " + id
                        )
                );
    }

    // =========================================================
    // OBTENER EVALUACIONES DE UNA SOLICITUD
    // =========================================================

    public List<EvaluacionRiesgo> obtenerPorSolicitud(Long solicitudId) {
        return evaluacionRiesgoRepository.findBySolicitudId(solicitudId);
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
    // VERIFICAR DOCUMENTACIÓN
    // =========================================================

    public boolean documentacionCompleta(Long solicitudId) {

        List<Documento> documentos =
                documentoRepository.findBySolicitudId(solicitudId);

        boolean identificacion = documentos.stream()
                .anyMatch(documento ->
                        documento.getTipoDocumento() != null
                                && documento.getTipoDocumento()
                                .equalsIgnoreCase("Identificación")
                );

        boolean ingresos = documentos.stream()
                .anyMatch(documento ->
                        documento.getTipoDocumento() != null
                                && documento.getTipoDocumento()
                                .equalsIgnoreCase("Ingresos")
                );

        boolean general = documentos.stream()
                .anyMatch(documento ->
                        documento.getTipoDocumento() != null
                                && documento.getTipoDocumento()
                                .equalsIgnoreCase("General")
                );

        return identificacion && ingresos && general;
    }

    // =========================================================
    // CREAR EVALUACIÓN UTILIZANDO LA IA
    // =========================================================

    public EvaluacionRiesgo crearEvaluacion(Long solicitudId) {

        // -----------------------------------------------------
        // 1. Buscar solicitud
        // -----------------------------------------------------

        Solicitud solicitud = solicitudRepository
                .findById(solicitudId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "No se encontró la solicitud con ID: "
                                        + solicitudId
                        )
                );

        // -----------------------------------------------------
        // 2. Verificar documentación
        // -----------------------------------------------------

        if (!documentacionCompleta(solicitudId)) {
            throw new RuntimeException(
                    "La solicitud no tiene toda la documentación requerida."
            );
        }

        // -----------------------------------------------------
        // 3. Validar información financiera
        // -----------------------------------------------------

        validarDatosSolicitud(solicitud);

        // -----------------------------------------------------
        // 4. Convertir antigüedad laboral
        // -----------------------------------------------------

        Double antiguedadLaboral =
                convertirAntiguedadLaboral(
                        solicitud.getAntiguedadLaboral()
                );

        // -----------------------------------------------------
        // 5. Construir datos que enviaremos a FastAPI
        // -----------------------------------------------------

        PrediccionRiesgoRequest request =
                new PrediccionRiesgoRequest();

        request.setIngresosMensuales(
                solicitud.getIngresosMensuales()
        );

        request.setEgresosMensuales(
                solicitud.getEgresosMensuales()
        );

        request.setNivelEndeudamiento(
                solicitud.getNivelEndeudamiento()
        );

        request.setCapacidadPago(
                solicitud.getCapacidadPago()
        );

        request.setTipoCredito(
                solicitud.getTipoCredito()
        );

        request.setMontoSolicitado(
                solicitud.getMonto()
        );

        request.setPlazoMeses(
                solicitud.getPlazoMeses()
        );

        request.setAntiguedadLaboralAnios(
                antiguedadLaboral
        );

        // -----------------------------------------------------
        // 6. LLAMAR AL MICROSERVICIO PYTHON
        // -----------------------------------------------------

        PrediccionRiesgoResponse respuestaIa =
                iaRiesgoService.predecir(request);

        // -----------------------------------------------------
        // 7. Crear evaluación con resultado REAL del modelo
        // -----------------------------------------------------

        EvaluacionRiesgo evaluacion =
                new EvaluacionRiesgo();

        evaluacion.setSolicitud(solicitud);

        evaluacion.setScoreIa(
                respuestaIa.getScoreIa()
        );

        evaluacion.setProbabilidadMora(
                respuestaIa.getProbabilidadMora()
        );

        evaluacion.setNivelRiesgo(
                respuestaIa.getNivelRiesgo()
        );

        evaluacion.setRecomendacion(
                respuestaIa.getRecomendacion()
        );

        evaluacion.setModeloUtilizado(
                respuestaIa.getModelo()
        );

        evaluacion.setEstado("Completada");

        evaluacion.setExplicacion(
                generarExplicacion(
                        solicitud,
                        respuestaIa
                )
        );

        // -----------------------------------------------------
        // 8. Guardar resultado en PostgreSQL
        // -----------------------------------------------------

        return evaluacionRiesgoRepository.save(
                evaluacion
        );
    }

    // =========================================================
    // ACTUALIZAR
    // =========================================================

    public EvaluacionRiesgo actualizarEvaluacion(
            Long id,
            EvaluacionRiesgo datos
    ) {

        EvaluacionRiesgo evaluacion =
                obtenerEvaluacionPorId(id);

        if (datos.getScoreIa() != null) {
            evaluacion.setScoreIa(
                    datos.getScoreIa()
            );
        }

        if (datos.getProbabilidadMora() != null) {
            evaluacion.setProbabilidadMora(
                    datos.getProbabilidadMora()
            );
        }

        if (datos.getConfianzaModelo() != null) {
            evaluacion.setConfianzaModelo(
                    datos.getConfianzaModelo()
            );
        }

        if (datos.getNivelRiesgo() != null) {
            evaluacion.setNivelRiesgo(
                    datos.getNivelRiesgo()
            );
        }

        if (datos.getRecomendacion() != null) {
            evaluacion.setRecomendacion(
                    datos.getRecomendacion()
            );
        }

        if (datos.getModeloUtilizado() != null) {
            evaluacion.setModeloUtilizado(
                    datos.getModeloUtilizado()
            );
        }

        if (datos.getEstado() != null) {
            evaluacion.setEstado(
                    datos.getEstado()
            );
        }

        if (datos.getExplicacion() != null) {
            evaluacion.setExplicacion(
                    datos.getExplicacion()
            );
        }

        return evaluacionRiesgoRepository.save(
                evaluacion
        );
    }

    // =========================================================
    // ELIMINAR
    // =========================================================

    public void eliminarEvaluacion(Long id) {

        EvaluacionRiesgo evaluacion =
                obtenerEvaluacionPorId(id);

        evaluacionRiesgoRepository.delete(
                evaluacion
        );
    }

    // =========================================================
    // VALIDAR DATOS DE LA SOLICITUD
    // =========================================================

    private void validarDatosSolicitud(
            Solicitud solicitud
    ) {

        if (solicitud.getIngresosMensuales() == null) {
            throw new RuntimeException(
                    "La solicitud no tiene ingresos mensuales."
            );
        }

        if (solicitud.getEgresosMensuales() == null) {
            throw new RuntimeException(
                    "La solicitud no tiene egresos mensuales."
            );
        }

        if (solicitud.getNivelEndeudamiento() == null) {
            throw new RuntimeException(
                    "La solicitud no tiene nivel de endeudamiento."
            );
        }

        if (solicitud.getCapacidadPago() == null) {
            throw new RuntimeException(
                    "La solicitud no tiene capacidad de pago."
            );
        }

        if (solicitud.getTipoCredito() == null
                || solicitud.getTipoCredito().isBlank()) {

            throw new RuntimeException(
                    "La solicitud no tiene tipo de crédito."
            );
        }

        if (solicitud.getMonto() == null) {
            throw new RuntimeException(
                    "La solicitud no tiene monto solicitado."
            );
        }

        if (solicitud.getPlazoMeses() == null) {
            throw new RuntimeException(
                    "La solicitud no tiene plazo."
            );
        }

        if (solicitud.getAntiguedadLaboral() == null
                || solicitud.getAntiguedadLaboral().isBlank()) {

            throw new RuntimeException(
                    "La solicitud no tiene antigüedad laboral."
            );
        }
    }

    // =========================================================
    // CONVERTIR ANTIGÜEDAD LABORAL
    // =========================================================

    private Double convertirAntiguedadLaboral(
            String antiguedad
    ) {

        try {

            /*
             * Permite valores como:
             *
             * "4"
             * "4.5"
             * "4 años"
             * "4.5 años"
             * "4,5 años"
             */

            String valorLimpio = antiguedad
                    .trim()
                    .replace(",", ".")
                    .replaceAll("[^0-9.]", "");

            if (valorLimpio.isBlank()) {
                throw new NumberFormatException();
            }

            return Double.parseDouble(
                    valorLimpio
            );

        } catch (NumberFormatException e) {

            throw new RuntimeException(
                    "La antigüedad laboral no tiene un formato válido: "
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

        return String.format(
                "La evaluación fue realizada mediante el modelo %s. "
                        + "El modelo estimó una probabilidad de mora de %.2f%% "
                        + "y un Score IA de %d/100. "
                        + "El nivel de riesgo asignado fue %s. "
                        + "La evaluación considera ingresos mensuales, "
                        + "egresos mensuales, nivel de endeudamiento, "
                        + "capacidad de pago, tipo de crédito, monto solicitado, "
                        + "plazo y antigüedad laboral. "
                        + "El resultado constituye una recomendación preliminar "
                        + "y no reemplaza la decisión del analista de crédito.",
                respuesta.getModelo(),
                respuesta.getProbabilidadMora(),
                respuesta.getScoreIa(),
                respuesta.getNivelRiesgo()
        );
    }
}