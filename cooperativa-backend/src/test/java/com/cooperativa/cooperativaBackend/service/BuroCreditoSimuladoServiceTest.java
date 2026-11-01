package com.cooperativa.cooperativaBackend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Map;
import org.junit.jupiter.api.Test;

class BuroCreditoSimuladoServiceTest {

    private final BuroCreditoSimuladoService servicio = new BuroCreditoSimuladoService();

    @Test
    void mismaCedulaConDistintosIdsConservaPerfil() {
        Map<String, Object> primera = servicio.consultar(1L, "0123456789");
        Map<String, Object> segunda = servicio.consultar(2L, "0123456789");

        for (String campo : new String[] {
                "scoreBuro", "deudaTotal", "cuotaMensualTotal",
                "creditosActivos", "diasMoraMaximos", "estadoReferencial",
                "ingresosMensuales", "egresosMensuales", "nivelEndeudamiento",
                "empresa", "antiguedadLaboral", "capacidadPago"
        }) {
            assertEquals(primera.get(campo), segunda.get(campo), campo);
        }

        assertEquals(true, primera.get("simulado"));
        assertTrue((int) primera.get("scoreBuro") >= 350);
        assertTrue((int) primera.get("scoreBuro") <= 950);
        assertTrue((double) primera.get("deudaTotal") >= 0);
        assertTrue((double) primera.get("cuotaMensualTotal") >= 0);
        assertTrue((double) primera.get("egresosMensuales") >=
                (double) primera.get("cuotaMensualTotal"));
        assertEquals(Math.max(0, (double) primera.get("ingresosMensuales")
                - (double) primera.get("egresosMensuales")),
                (double) primera.get("capacidadPago"), 0.01);
    }
}
