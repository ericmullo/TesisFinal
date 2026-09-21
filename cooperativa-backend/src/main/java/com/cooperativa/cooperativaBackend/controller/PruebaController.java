package com.cooperativa.cooperativaBackend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PruebaController {

    @GetMapping("/api/prueba")
    public String prueba() {
        return "Backend de la Cooperativa funcionando correctamente";
    }
}