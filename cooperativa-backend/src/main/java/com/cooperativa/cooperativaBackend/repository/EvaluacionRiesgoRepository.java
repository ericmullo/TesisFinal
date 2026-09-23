package com.cooperativa.cooperativaBackend.repository;

import com.cooperativa.cooperativaBackend.model.EvaluacionRiesgo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EvaluacionRiesgoRepository
        extends JpaRepository<EvaluacionRiesgo, Long> {

    List<EvaluacionRiesgo> findBySolicitudId(Long solicitudId);

    List<EvaluacionRiesgo>
    findBySolicitudClienteIdOrderByFechaEvaluacionDesc(
            Long clienteId
    );
}