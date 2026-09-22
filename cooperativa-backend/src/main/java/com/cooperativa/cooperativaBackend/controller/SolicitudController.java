package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.model.Solicitud;
import com.cooperativa.cooperativaBackend.service.SolicitudService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
public class SolicitudController {

    private final SolicitudService solicitudService;

    public SolicitudController(SolicitudService solicitudService) {
        this.solicitudService = solicitudService;
    }

    // LISTAR TODAS
    @GetMapping
    public List<Solicitud> obtenerSolicitudes() {
        return solicitudService.obtenerSolicitudes();
    }

    // OBTENER UNA
    @GetMapping("/{id}")
    public Solicitud obtenerSolicitudPorId(@PathVariable Long id) {
        return solicitudService.obtenerSolicitudPorId(id);
    }

    // CREAR
    @PostMapping
    public Solicitud crearSolicitud(
            @RequestParam Long clienteId,
            @RequestBody Solicitud solicitud) {

        return solicitudService.crearSolicitud(
                clienteId,
                solicitud
        );
    }

    // ACTUALIZAR
    @PutMapping("/{id}")
    public Solicitud actualizarSolicitud(
            @PathVariable Long id,
            @RequestParam Long clienteId,
            @RequestBody Solicitud solicitud) {

        return solicitudService.actualizarSolicitud(
                id,
                clienteId,
                solicitud
        );
    }

    // ELIMINAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSolicitud(
            @PathVariable Long id) {

        solicitudService.eliminarSolicitud(id);

        return ResponseEntity.noContent().build();
    }
}