package com.cooperativa.cooperativaBackend.repository;

import com.cooperativa.cooperativaBackend.model.Solicitud;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitudRepository
        extends JpaRepository<Solicitud, Long> {

    @Query(
            value = "SELECT nextval('seq_codigo_solicitud')",
            nativeQuery = true
    )
    Long obtenerSiguienteCodigoSolicitud();
}