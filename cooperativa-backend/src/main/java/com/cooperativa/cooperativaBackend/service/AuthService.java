package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.dto.LoginRequest;
import com.cooperativa.cooperativaBackend.dto.LoginResponse;
import com.cooperativa.cooperativaBackend.exception.CredencialesInvalidasException;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }


    // =========================================================
    // LOGIN
    // =========================================================

    public LoginResponse login(
            LoginRequest request
    ) {

        // -----------------------------------------------------
        // VALIDAR DATOS
        // -----------------------------------------------------

        if (
                request == null
                        ||
                request.getUsername() == null
                        ||
                request.getUsername().isBlank()
                        ||
                request.getPassword() == null
                        ||
                request.getPassword().isBlank()
        ) {

            throw new CredencialesInvalidasException(
                    "Usuario o contraseña incorrectos."
            );
        }


        String username =
                request.getUsername()
                        .trim()
                        .toLowerCase();


        // -----------------------------------------------------
        // BUSCAR USUARIO
        // -----------------------------------------------------

        Usuario usuario =
                usuarioRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new CredencialesInvalidasException(
                                        "Usuario o contraseña incorrectos."
                                )
                        );


        // -----------------------------------------------------
        // COMPROBAR USUARIO ACTIVO
        // -----------------------------------------------------

        if (
                usuario.getActivo() == null
                        ||
                !usuario.getActivo()
        ) {

            throw new CredencialesInvalidasException(
                    "Usuario o contraseña incorrectos."
            );
        }


        // -----------------------------------------------------
        // COMPROBAR CONTRASEÑA
        // -----------------------------------------------------

        boolean passwordCorrecto =
                passwordEncoder.matches(
                        request.getPassword(),
                        usuario.getPassword()
                );


        if (!passwordCorrecto) {

            throw new CredencialesInvalidasException(
                    "Usuario o contraseña incorrectos."
            );
        }


        // -----------------------------------------------------
        // GENERAR JWT
        // -----------------------------------------------------

        String token =
                jwtService.generarToken(usuario);


        // -----------------------------------------------------
        // RESPUESTA
        // -----------------------------------------------------

        return new LoginResponse(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getRol(),
                token,
                "Bearer",
                "Inicio de sesión correcto."
        );
    }
}