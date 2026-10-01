package com.cooperativa.cooperativaBackend.repository;

import com.cooperativa.cooperativaBackend.model.Notificacion;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository
        extends JpaRepository<Notificacion, Long> {


    // =========================================================
    // TODAS LAS NOTIFICACIONES DE UN USUARIO
    // ORDENADAS DE MÁS RECIENTE A MÁS ANTIGUA
    // =========================================================

    List<Notificacion>
    findByUsuarioIdOrderByFechaCreacionDesc(
            Long usuarioId
    );


    // =========================================================
    // NOTIFICACIONES NO LEÍDAS
    // =========================================================

    List<Notificacion>
    findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(
            Long usuarioId
    );


    // =========================================================
    // CONTADOR DE NOTIFICACIONES NO LEÍDAS
    // PARA LA CAMPANA 🔔
    // =========================================================

    long countByUsuarioIdAndLeidaFalse(
            Long usuarioId
    );


    // =========================================================
    // COMPROBAR QUE UNA NOTIFICACIÓN PERTENECE AL USUARIO
    // =========================================================

    boolean existsByIdAndUsuarioId(
            Long id,
            Long usuarioId
    );
}