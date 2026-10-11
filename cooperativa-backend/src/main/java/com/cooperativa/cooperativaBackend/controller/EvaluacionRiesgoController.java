package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.model.EvaluacionRiesgo;
import com.cooperativa.cooperativaBackend.service.EvaluacionRiesgoService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;


@RestController
@RequestMapping("/api/evaluaciones")
public class EvaluacionRiesgoController {


    private final EvaluacionRiesgoService
            evaluacionRiesgoService;


    public EvaluacionRiesgoController(
            EvaluacionRiesgoService evaluacionRiesgoService
    ) {

        this.evaluacionRiesgoService =
                evaluacionRiesgoService;

    }


    // =========================================================
    // OBTENER TODAS
    // GET /api/evaluaciones
    // =========================================================

    @GetMapping
    public List<EvaluacionRiesgo>
    obtenerEvaluaciones() {

        return evaluacionRiesgoService
                .obtenerEvaluaciones();

    }


    // =========================================================
    // OBTENER POR ID
    // GET /api/evaluaciones/1
    // =========================================================

    @GetMapping("/{id}")
    public EvaluacionRiesgo
    obtenerEvaluacionPorId(
            @PathVariable Long id
    ) {

        return evaluacionRiesgoService
                .obtenerEvaluacionPorId(
                        id
                );

    }


    // =========================================================
    // EVALUACIONES DE UNA SOLICITUD
    // GET /api/evaluaciones/solicitud/1
    // =========================================================

    @GetMapping("/solicitud/{solicitudId}")
    public List<EvaluacionRiesgo>
    obtenerPorSolicitud(
            @PathVariable Long solicitudId
    ) {

        return evaluacionRiesgoService
                .obtenerPorSolicitud(
                        solicitudId
                );

    }


    // =========================================================
    // COMPROBAR DOCUMENTACIÓN
    // GET /api/evaluaciones/documentacion/1
    // =========================================================

    @GetMapping("/documentacion/{solicitudId}")
    public Map<String, Boolean>
    verificarDocumentacion(
            @PathVariable Long solicitudId
    ) {

        boolean completa =
                evaluacionRiesgoService
                        .documentacionCompleta(
                                solicitudId
                        );


        return Map.of(
                "completa",
                completa
        );

    }


    // =========================================================
// CREAR EVALUACIÓN
// POST /api/evaluaciones?solicitudId=1
// =========================================================

@PostMapping
public ResponseEntity<Map<String, Object>>
crearEvaluacion(
        @RequestParam Long solicitudId
) {

    EvaluacionRiesgo evaluacion =
            evaluacionRiesgoService
                    .crearEvaluacion(
                            solicitudId
                    );


    Map<String, Object> respuesta =
            new LinkedHashMap<>();


    respuesta.put(
            "id",
            evaluacion.getId()
    );

    respuesta.put(
            "scoreIa",
            evaluacion.getScoreIa()
    );

    respuesta.put(
            "probabilidadMora",
            evaluacion.getProbabilidadMora()
    );

    respuesta.put(
            "confianzaModelo",
            evaluacion.getConfianzaModelo()
    );

    respuesta.put(
            "nivelRiesgo",
            evaluacion.getNivelRiesgo()
    );

    respuesta.put(
            "recomendacion",
            evaluacion.getRecomendacion()
    );

    respuesta.put(
            "modeloUtilizado",
            evaluacion.getModeloUtilizado()
    );

    respuesta.put(
            "estado",
            evaluacion.getEstado()
    );

    respuesta.put(
            "explicacion",
            evaluacion.getExplicacion()
    );

    respuesta.put(
            "fechaEvaluacion",
            evaluacion.getFechaEvaluacion()
    );


    return ResponseEntity.ok(
            respuesta
    );
}


    // =========================================================
    // ACTUALIZAR EVALUACIÓN
    // PUT /api/evaluaciones/1
    // =========================================================

    @PutMapping("/{id}")
    public EvaluacionRiesgo
    actualizarEvaluacion(

            @PathVariable Long id,

            @RequestBody
            EvaluacionRiesgo evaluacion

    ) {

        return evaluacionRiesgoService
                .actualizarEvaluacion(
                        id,
                        evaluacion
                );

    }


    // =========================================================
    // ELIMINAR
    // DELETE /api/evaluaciones/1
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>
    eliminarEvaluacion(
            @PathVariable Long id
    ) {

        evaluacionRiesgoService
                .eliminarEvaluacion(
                        id
                );


        return ResponseEntity
                .noContent()
                .build();

    }

    @GetMapping("/cliente/{clienteId}")
public ResponseEntity<List<EvaluacionRiesgo>>
obtenerPorCliente(
        @PathVariable Long clienteId
) {

    return ResponseEntity.ok(
            evaluacionRiesgoService
                    .obtenerPorCliente(clienteId)
    );
}

}