package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.exception.ValidacionException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;
import org.springframework.stereotype.Service;

@Service
public class BuroCreditoSimuladoService {

    public Map<String, Object> consultar(Long clienteId, String cedula) {
        if (cedula == null || cedula.isBlank()) {
            throw new ValidacionException("El cliente no tiene una cédula registrada.");
        }

        // La cédula solo determina el perfil ficticio: no se envía en la respuesta.
        Random random = new Random(cedula.trim().hashCode());
        int perfil = random.nextInt(4);
        int score;
        int creditosActivos;
        int diasMora;
        String estadoReferencial;

        switch (perfil) {
            case 0 -> {
                score = 800 + random.nextInt(151);
                creditosActivos = random.nextInt(3);
                diasMora = 0;
                estadoReferencial = "SIN_ALERTAS_SIMULADAS";
            }
            case 1 -> {
                score = 650 + random.nextInt(150);
                creditosActivos = 1 + random.nextInt(3);
                diasMora = 15;
                estadoReferencial = "ATRASO_OCASIONAL_SIMULADO";
            }
            case 2 -> {
                score = 500 + random.nextInt(150);
                creditosActivos = 3 + random.nextInt(3);
                diasMora = random.nextInt(2) * 15;
                estadoReferencial = "ALTO_ENDEUDAMIENTO_SIMULADO";
            }
            default -> {
                score = 350 + random.nextInt(150);
                creditosActivos = 1 + random.nextInt(4);
                diasMora = (1 + random.nextInt(3)) * 30;
                estadoReferencial = "MORA_SIMULADA";
            }
        }

        double deudaTotal = creditosActivos * (500 + random.nextInt(5000));
        double cuotaMensual = Math.round(deudaTotal / (12 + random.nextInt(25)) * 100.0) / 100.0;

        return Map.ofEntries(
                Map.entry("clienteId", clienteId),
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
