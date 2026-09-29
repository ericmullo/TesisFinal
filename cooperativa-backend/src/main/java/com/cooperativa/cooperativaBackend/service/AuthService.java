package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.dto.LoginRequest;
import com.cooperativa.cooperativaBackend.dto.LoginResponse;
import com.cooperativa.cooperativaBackend.dto.VerificarCodigoRequest;
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
    private final CodigoVerificacionService codigoVerificacionService;

    public AuthService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            CodigoVerificacionService codigoVerificacionService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.codigoVerificacionService = codigoVerificacionService;
    }

    // =========================================================
    // PASO 1 - LOGIN USUARIO + CONTRASEÑA
    // =========================================================

    public LoginResponse login(LoginRequest request) {

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
        // COMPROBAR QUE TENGA CORREO
        // -----------------------------------------------------

        if (
                usuario.getCorreo() == null
                        ||
                usuario.getCorreo().isBlank()
        ) {
            throw new CredencialesInvalidasException(
                    "El usuario no tiene un correo registrado. Contacte al administrador."
            );
        }

        // -----------------------------------------------------
        // GENERAR Y ENVIAR CÓDIGO 2FA
        // -----------------------------------------------------

        codigoVerificacionService
                .generarYEnviarCodigo(usuario);

        // -----------------------------------------------------
        // IMPORTANTE:
        // TODAVÍA NO GENERAMOS JWT
        // -----------------------------------------------------

        return new LoginResponse(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getNombres(),
                usuario.getApellidos(),
                usuario.getRol(),
                null,
                null,
                "Código de verificación enviado al correo registrado."
        );
    }

    // =========================================================
    // PASO 2 - VERIFICAR CÓDIGO 2FA
    // =========================================================

    public LoginResponse verificarCodigo(
            VerificarCodigoRequest request
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
                request.getCodigo() == null
                        ||
                request.getCodigo().isBlank()
        ) {
            throw new CredencialesInvalidasException(
                    "Código de verificación inválido."
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
                                        "Código de verificación inválido."
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
                    "Código de verificación inválido."
            );
        }

        // -----------------------------------------------------
        // VERIFICAR CÓDIGO
        // -----------------------------------------------------

        boolean codigoCorrecto =
                codigoVerificacionService
                        .verificarCodigo(
                                usuario,
                                request.getCodigo().trim()
                        );

        if (!codigoCorrecto) {
            throw new CredencialesInvalidasException(
                    "Código incorrecto, expirado o sin intentos disponibles."
            );
        }

        // -----------------------------------------------------
        // RECIÉN AQUÍ GENERAMOS EL JWT
        // -----------------------------------------------------

        String token =
                jwtService.generarToken(usuario);

        // -----------------------------------------------------
        // RESPUESTA FINAL
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