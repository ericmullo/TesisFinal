package com.cooperativa.cooperativaBackend.repository;

import com.cooperativa.cooperativaBackend.model.Solicitud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
}