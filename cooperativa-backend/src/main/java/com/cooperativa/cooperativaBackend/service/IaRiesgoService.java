package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoRequest;
import com.cooperativa.cooperativaBackend.dto.PrediccionRiesgoResponse;
import com.cooperativa.cooperativaBackend.exception.ServicioNoDisponibleException;
import com.cooperativa.cooperativaBackend.exception.ValidacionException;

import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

@Service
public class IaRiesgoService {

    private static final Logger log = LoggerFactory.getLogger(IaRiesgoService.class);
    private final RestClient restClient;

    public IaRiesgoService(
            @Value("${IA_URL:http://localhost:8000}") String iaUrl,
            @Value("${IA_CONNECT_TIMEOUT_MS:10000}") int connectTimeoutMs,
            @Value("${IA_READ_TIMEOUT_MS:90000}") int readTimeoutMs
    ) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofMillis(connectTimeoutMs));
        requestFactory.setReadTimeout(Duration.ofMillis(readTimeoutMs));
        this.restClient = RestClient.builder()
                .baseUrl(iaUrl)
                .requestFactory(requestFactory)
                .build();
        log.info("Servicio IA configurado en {} (espera máxima de respuesta: {} ms)", iaUrl, readTimeoutMs);
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
        } catch (RestClientResponseException exception) {
            log.warn("La IA respondió con HTTP {} al evaluar la solicitud", exception.getStatusCode().value());
            if (exception.getStatusCode().value() == 400 || exception.getStatusCode().value() == 422) {
                throw new ValidacionException(
                        "La IA rechazó los datos de la solicitud. Revise los valores financieros y del crédito antes de reintentar.");
            }
            throw new ServicioNoDisponibleException(
                    "La IA no pudo completar la evaluación (HTTP " + exception.getStatusCode().value()
                            + "). La solicitud permanece guardada para reintentar.", exception);
        } catch (RestClientException exception) {
            log.warn("No se pudo conectar con la IA: {}", exception.toString());
            throw new ServicioNoDisponibleException(
                    "No se pudo conectar con la IA. Puede tardar hasta un minuto en activarse; "
                            + "la solicitud permanece guardada para reintentar.",
                    exception);
        }
    }
}
