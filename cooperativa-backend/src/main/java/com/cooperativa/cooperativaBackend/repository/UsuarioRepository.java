package com.cooperativa.cooperativaBackend.repository;

import com.cooperativa.cooperativaBackend.model.Rol;
import com.cooperativa.cooperativaBackend.model.Usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository
        extends JpaRepository<Usuario, Long> {

    // =========================================================
    // BUSCAR POR USERNAME
    // =========================================================

    Optional<Usuario> findByUsername(
            String username
    );


    // =========================================================
    // VALIDAR USERNAME EXISTENTE
    // =========================================================

    boolean existsByUsername(
            String username
    );


    // =========================================================
    // VALIDAR CORREO EXISTENTE
    // =========================================================

    boolean existsByCorreo(
            String correo
    );


    // =========================================================
    // BUSCAR USUARIOS ACTIVOS POR ROL
    // =========================================================

    List<Usuario> findByRolAndActivoTrue(
            Rol rol
    );
}