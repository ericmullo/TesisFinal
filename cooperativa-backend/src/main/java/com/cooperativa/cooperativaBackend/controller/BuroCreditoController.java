package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.exception.RecursoNoEncontradoException;
import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.repository.ClienteRepository;
import com.cooperativa.cooperativaBackend.service.BuroCreditoSimuladoService;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/buro")
public class BuroCreditoController {

    private final BuroCreditoSimuladoService buroService;
    private final ClienteRepository clienteRepository;

    public BuroCreditoController(
            BuroCreditoSimuladoService buroService,
            ClienteRepository clienteRepository
    ) {
        this.buroService = buroService;
        this.clienteRepository = clienteRepository;
    }

    @GetMapping("/simular/cliente/{clienteId}")
    public ResponseEntity<Map<String, Object>> simular(@PathVariable Long clienteId) {
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Cliente no encontrado con ID: " + clienteId));

        return ResponseEntity.ok(buroService.consultar(clienteId, cliente.getCedula()));
    }
}
