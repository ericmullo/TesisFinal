package com.cooperativa.cooperativaBackend.service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

import org.springframework.stereotype.Service;

@Service
public class BuroCreditoSimuladoService {

    public Map<String, Object> consultar(Long solicitudId) {
        // Datos ficticios reproducibles por solicitud; no consulta un buró real.
        Random random = new Random(solicitudId);

        int score = 400 + random.nextInt(551);
        int creditosActivos = random.nextInt(5);
        int diasMora = random.nextInt(4) * 15;
        double deudaTotal = creditosActivos * (500 + random.nextInt(2500));
        double cuotaMensual = creditosActivos * (50 + random.nextInt(200));

        String estadoReferencial = diasMora >= 30
                ? "REQUIERE_REVISION"
                : "SIN_ALERTAS_SIMULADAS";

        return Map.ofEntries(
                Map.entry("solicitudId", solicitudId),
                Map.entry("proveedor", "SIMULADOR_ACADEMICO"),
                Map.entry("simulado", true),
                Map.entry("scoreBuro", score),
                Map.entry("escalaMinima", 0),
                Map.entry("escalaMaxima", 999),
                Map.entry("creditosActivos", creditosActivos),
                Map.entry("deudaTotal", deudaTotal),
                Map.entry("cuotaMensualTotal", cuotaMensual),
                Map.entry("diasMoraMaximos", diasMora),
                Map.entry("estadoReferencial", estadoReferencial),
                Map.entry("fechaConsulta", LocalDateTime.now())
        );
    }
}
