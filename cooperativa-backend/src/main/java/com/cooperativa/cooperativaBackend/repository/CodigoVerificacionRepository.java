package com.cooperativa.cooperativaBackend.repository;

import com.cooperativa.cooperativaBackend.model.CodigoVerificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CodigoVerificacionRepository
        extends JpaRepository<CodigoVerificacion, Long> {

    Optional<CodigoVerificacion>
    findFirstByUsuarioIdAndUtilizadoFalseOrderByFechaCreacionDesc(
            Long usuarioId
    );
}