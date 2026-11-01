package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.service.BuroCreditoSimuladoService;
import com.cooperativa.cooperativaBackend.service.SolicitudService;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/buro")
public class BuroCreditoController {

    private final BuroCreditoSimuladoService buroService;
    private final SolicitudService solicitudService;

    public BuroCreditoController(
            BuroCreditoSimuladoService buroService,
            SolicitudService solicitudService
    ) {
        this.buroService = buroService;
        this.solicitudService = solicitudService;
    }

    @PostMapping("/simular/{solicitudId}")
    public ResponseEntity<Map<String, Object>> simular(@PathVariable Long solicitudId) {
        solicitudService.obtenerSolicitudPorId(solicitudId);
        return ResponseEntity.ok(buroService.consultar(solicitudId));
    }
}
