package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoRequest;
import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class IaRiesgoService {

    private final RestClient restClient;

    public IaRiesgoService() {

        this.restClient = RestClient.builder()
                .baseUrl("http://localhost:8000")
                .build();
    }

    public PrediccionRiesgoResponse predecir(
            PrediccionRiesgoRequest request
    ) {

        PrediccionRiesgoResponse respuesta = restClient
                .post()
                .uri("/predict")
                .body(request)
                .retrieve()
                .body(PrediccionRiesgoResponse.class);

        if (respuesta == null) {
            throw new RuntimeException(
                    "El microservicio de IA no devolvió una respuesta."
            );
        }

        return respuesta;
    }
}