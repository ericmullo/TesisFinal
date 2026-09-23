package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.model.EvaluacionRiesgo;
import com.cooperativa.cooperativaBackend.service.EvaluacionRiesgoService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


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
    public EvaluacionRiesgo
    crearEvaluacion(
            @RequestParam Long solicitudId
    ) {

        return evaluacionRiesgoService
                .crearEvaluacion(
                        solicitudId
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