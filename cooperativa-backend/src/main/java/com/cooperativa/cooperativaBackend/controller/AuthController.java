package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.dto.LoginRequest;
import com.cooperativa.cooperativaBackend.dto.LoginResponse;
import com.cooperativa.cooperativaBackend.service.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;


    public AuthController(
            AuthService authService
    ) {
        this.authService = authService;
    }


    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {

        LoginResponse response =
                authService.login(request);

        return ResponseEntity.ok(response);
    }
}