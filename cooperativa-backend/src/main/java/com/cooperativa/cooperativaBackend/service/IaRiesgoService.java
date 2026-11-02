package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoRequest;
import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoResponse;
import com.cooperativa.cooperativaBackend.exception.ServicioNoDisponibleException;

import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Service
public class IaRiesgoService {

    private final RestClient restClient;

    public IaRiesgoService(
            @Value("${IA_URL:http://localhost:8000}") String iaUrl,
            @Value("${IA_CONNECT_TIMEOUT_MS:3000}") int connectTimeoutMs,
            @Value("${IA_READ_TIMEOUT_MS:10000}") int readTimeoutMs
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMs));
        this.restClient = RestClient.builder()
                .baseUrl(iaUrl)
                .requestFactory(requestFactory)
                .build();
    }

    public PrediccionRiesgoResponse predecir(
            PrediccionRiesgoRequest request
    ) {

        try {
            PrediccionRiesgoResponse respuesta = restClient
                        .post()
                        .uri("/predict")
                        .body(request)
                        .retrieve()
                        .body(
                                PrediccionRiesgoResponse.class
                        );

            if (respuesta == null) {
                throw new ServicioNoDisponibleException(
                        "La IA no devolvió una evaluación. Intente de nuevo más tarde.", null);
            }
            return respuesta;
        } catch (RestClientException exception) {
            throw new ServicioNoDisponibleException(
                    "No se pudo consultar la IA. La solicitud permanece guardada para reintentar.",
                    exception);
        }
    }
}
