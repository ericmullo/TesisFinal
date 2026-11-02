package com.cooperativa.cooperativaBackend.service;

import java.time.LocalDateTime;
import java.time.Year;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {
    private final JdbcTemplate jdbc;

    public DashboardService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Map<String, Object> obtenerResumen() {
        Map<String, Object> resumen = new LinkedHashMap<>();
        int anio = Year.now().getValue();
        resumen.put("anio", anio);
        resumen.put("totalClientes", contar("clientes"));
        resumen.put("totalSolicitudes", contar("solicitudes"));
        resumen.put("totalEvaluaciones", contar("evaluaciones_riesgo"));

        Map<String, Long> riesgos = new LinkedHashMap<>();
        riesgos.put("alto", 0L);
        riesgos.put("medio", 0L);
        riesgos.put("bajo", 0L);
        jdbc.query("SELECT LOWER(nivel_riesgo) AS nivel, COUNT(*) AS total "
                + "FROM evaluaciones_riesgo GROUP BY LOWER(nivel_riesgo)", rs -> {
            String nivel = rs.getString("nivel");
            if (riesgos.containsKey(nivel)) riesgos.put(nivel, rs.getLong("total"));
        });
        resumen.put("riesgos", riesgos);

        Map<String, Long> decisiones = new LinkedHashMap<>();
        decisiones.put("pendientes", jdbc.queryForObject(
                "SELECT COUNT(*) FROM solicitudes WHERE fecha_decision IS NULL", Long.class));
        decisiones.put("aprobadas", contarDecisiones("aprobado", "aprobada"));
        decisiones.put("rechazadas", contarDecisiones("rechazado", "rechazada"));
        resumen.put("decisiones", decisiones);

        long[] meses = new long[12];
        LocalDateTime inicio = LocalDateTime.of(anio, 1, 1, 0, 0);
        LocalDateTime fin = inicio.plusYears(1);
        jdbc.query("SELECT EXTRACT(MONTH FROM fecha_solicitud) AS mes, COUNT(*) AS total "
                + "FROM solicitudes WHERE fecha_solicitud >= ? AND fecha_solicitud < ? "
                + "GROUP BY EXTRACT(MONTH FROM fecha_solicitud)", rs -> {
            int mes = rs.getInt("mes");
            if (mes >= 1 && mes <= 12) meses[mes - 1] = rs.getLong("total");
        }, inicio, fin);
        List<Map<String, Object>> solicitudesPorMes = new ArrayList<>();
        String[] nombres = {"Ene", "Feb", "Mar", "Abr", "May", "Jun",
                "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"};
        for (int i = 0; i < 12; i++) {
            solicitudesPorMes.add(Map.of("mes", nombres[i], "cantidad", meses[i]));
        }
        resumen.put("solicitudesPorMes", solicitudesPorMes);

        resumen.put("evaluacionesRecientes", jdbc.query(
                "SELECT e.id, e.score_ia, e.probabilidad_mora, e.nivel_riesgo, "
                        + "e.estado, e.fecha_evaluacion, s.codigo_solicitud, s.tipo_credito, "
                        + "c.nombres, c.apellidos FROM evaluaciones_riesgo e "
                        + "JOIN solicitudes s ON s.id = e.solicitud_id "
                        + "JOIN clientes c ON c.id = s.cliente_id "
                        + "ORDER BY e.fecha_evaluacion DESC NULLS LAST LIMIT 5",
                (rs, rowNum) -> {
                    Map<String, Object> fila = new LinkedHashMap<>();
                    fila.put("id", rs.getLong("id"));
                    fila.put("scoreIa", rs.getObject("score_ia"));
                    fila.put("probabilidadMora", rs.getObject("probabilidad_mora"));
                    fila.put("nivelRiesgo", rs.getString("nivel_riesgo"));
                    fila.put("estado", rs.getString("estado"));
                    fila.put("fechaEvaluacion", rs.getTimestamp("fecha_evaluacion"));
                    fila.put("codigoSolicitud", rs.getString("codigo_solicitud"));
                    fila.put("tipoCredito", rs.getString("tipo_credito"));
                    fila.put("cliente", (rs.getString("nombres") + " "
                            + rs.getString("apellidos")).trim());
                    return fila;
                }));
        return resumen;
    }

    private long contar(String tabla) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM " + tabla, Long.class);
    }

    private long contarDecisiones(String estado1, String estado2) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM solicitudes "
                + "WHERE fecha_decision IS NOT NULL AND LOWER(estado) IN (?, ?)",
                Long.class, estado1, estado2);
    }
}
