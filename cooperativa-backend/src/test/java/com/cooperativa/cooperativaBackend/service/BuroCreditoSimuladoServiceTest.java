package com.cooperativa.cooperativaBackend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
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
                "creditosActivos", "diasMoraMaximos", "estadoReferencial", "sinHistorial"
        }) {
            assertEquals(primera.get(campo), segunda.get(campo), campo);
        }

        assertEquals(true, primera.get("simulado"));
        if (Boolean.TRUE.equals(primera.get("sinHistorial"))) {
            assertNull(primera.get("scoreBuro"));
        } else {
            assertTrue((int) primera.get("scoreBuro") >= 350);
            assertTrue((int) primera.get("scoreBuro") <= 950);
        }
        assertTrue((double) primera.get("deudaTotal") >= 0);
        assertTrue((double) primera.get("cuotaMensualTotal") >= 0);
        assertTrue(!primera.containsKey("ingresosMensuales"));
        assertTrue(!primera.containsKey("empresa"));
    }

    @Test
    void devuelveSinHistorialSinInventarScore() {
        boolean encontrado = false;
        for (int i = 0; i < 1000; i++) {
            Map<String, Object> perfil = servicio.consultar(1L, String.format("%010d", i));
            if (Boolean.TRUE.equals(perfil.get("sinHistorial"))) {
                assertNull(perfil.get("scoreBuro"));
                assertEquals(0, perfil.get("creditosActivos"));
                encontrado = true;
                break;
            }
        }
        assertTrue(encontrado);
    }
}
