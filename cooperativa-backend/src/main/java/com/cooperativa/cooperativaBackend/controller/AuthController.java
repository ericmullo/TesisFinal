package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.dto.LoginRequest;
import com.cooperativa.cooperativaBackend.dto.LoginResponse;
import com.cooperativa.cooperativaBackend.dto.VerificarCodigoRequest;
import com.cooperativa.cooperativaBackend.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AuthController(
            AuthService authService
    ) {

        this.authService = authService;
    }


    // =========================================================
    // PASO 1
    // USUARIO + CONTRASEÑA
    // =========================================================

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {

        LoginResponse response =
                authService.login(
                        request
                );


        return ResponseEntity.ok(
                response
        );
    }


    // =========================================================
    // PASO 2
    // VERIFICAR CÓDIGO 2FA
    // =========================================================

    @PostMapping("/verificar-codigo")
    public ResponseEntity<LoginResponse> verificarCodigo(
            @RequestBody VerificarCodigoRequest request
    ) {

        LoginResponse response =
                authService.verificarCodigo(
                        request
                );


        return ResponseEntity.ok(
                response
        );
    }


    // =========================================================
    // REENVIAR CÓDIGO 2FA
    // =========================================================

    @PostMapping("/reenviar-codigo")
    public ResponseEntity<LoginResponse> reenviarCodigo(
            @RequestBody Map<String, String> request
    ) {

        String username =
                request.get(
                        "username"
                );


        LoginResponse response =
                authService.reenviarCodigo(
                        username
                );


        return ResponseEntity.ok(
                response
        );
    }
}