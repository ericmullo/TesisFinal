package com.cooperativa.cooperativaBackend.repository;

import com.cooperativa.cooperativaBackend.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}