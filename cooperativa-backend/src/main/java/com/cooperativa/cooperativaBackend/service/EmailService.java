package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.model.Solicitud;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.util.Base64;
import java.util.List;
import java.util.Locale;
import java.util.Map;


@Service
public class EmailService {

    private final RestClient oauthClient;
    private final RestClient gmailClient;

    private final String clientId;
    private final String clientSecret;
    private final String refreshToken;
    private final String remitente;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public EmailService(

            @Value("${GMAIL_CLIENT_ID:}")
            String clientId,

            @Value("${GMAIL_CLIENT_SECRET:}")
            String clientSecret,

            @Value("${GMAIL_REFRESH_TOKEN:}")
            String refreshToken,

            @Value("${GMAIL_FROM_EMAIL:}")
            String remitente

    ) {

        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.refreshToken = refreshToken;
        this.remitente = remitente;


        this.oauthClient =
                RestClient
                        .builder()
                        .baseUrl(
                                "https://oauth2.googleapis.com"
                        )
                        .build();


        this.gmailClient =
                RestClient
                        .builder()
                        .baseUrl(
                                "https://gmail.googleapis.com"
                        )
                        .build();
    }


    // =========================================================
    // ENVÍO GENÉRICO
    // UTILIZADO TAMBIÉN POR EL 2FA
    // =========================================================

    public void enviarCorreo(
            String destinatario,
            String asunto,
            String mensaje
    ) {

        validarConfiguracionGmail();


        if (
                destinatario == null
                        ||
                destinatario.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "El destinatario del correo es obligatorio."
            );
        }


        String accessToken =
                obtenerAccessToken();


        String mensajeRaw =
                construirMensajeRaw(
                        destinatario,
                        asunto,
                        mensaje
                );


        Map<String, String> cuerpo =
                Map.of(
                        "raw",
                        mensajeRaw
                );


        gmailClient
                .post()
                .uri(
                        "/gmail/v1/users/me/messages/send"
                )
                .header(
                        HttpHeaders.AUTHORIZATION,
                        "Bearer " + accessToken
                )
                .contentType(
                        MediaType.APPLICATION_JSON
                )
                .body(
                        cuerpo
                )
                .retrieve()
                .toBodilessEntity();


        System.out.println(
                "Correo enviado correctamente a: "
                        + destinatario
        );
    }


    // =========================================================
    // OBTENER ACCESS TOKEN UTILIZANDO REFRESH TOKEN
    // =========================================================

    private String obtenerAccessToken() {

        MultiValueMap<String, String> formulario =
                new LinkedMultiValueMap<>();


        formulario.add(
                "client_id",
                clientId
        );

        formulario.add(
                "client_secret",
                clientSecret
        );

        formulario.add(
                "refresh_token",
                refreshToken
        );

        formulario.add(
                "grant_type",
                "refresh_token"
        );


        Map<?, ?> respuesta =
                oauthClient
                        .post()
                        .uri(
                                "/token"
                        )
                        .contentType(
                                MediaType.APPLICATION_FORM_URLENCODED
                        )
                        .body(
                                formulario
                        )
                        .retrieve()
                        .body(
                                Map.class
                        );


        if (
                respuesta == null
                        ||
                respuesta.get(
                        "access_token"
                ) == null
        ) {

            throw new RuntimeException(
                    "Google no devolvió un access token."
            );
        }


        return respuesta
                .get(
                        "access_token"
                )
                .toString();
    }


    // =========================================================
    // CONSTRUIR CORREO EN FORMATO MIME
    // =========================================================

    private String construirMensajeRaw(
            String destinatario,
            String asunto,
            String mensaje
    ) {

        String destinatarioSeguro =
                limpiarCabecera(
                        destinatario
                );


        String asuntoCodificado =
                codificarAsunto(
                        asunto
                );


        String contenido =
                "From: Cooperativa 15 de Abril <"
                        + remitente
                        + ">\r\n"

                        + "To: "
                        + destinatarioSeguro
                        + "\r\n"

                        + "Subject: "
                        + asuntoCodificado
                        + "\r\n"

                        + "MIME-Version: 1.0\r\n"

                        + "Content-Type: text/plain; charset=UTF-8\r\n"

                        + "Content-Transfer-Encoding: 8bit\r\n"

                        + "\r\n"

                        + mensaje;


        return Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(
                        contenido.getBytes(
                                StandardCharsets.UTF_8
                        )
                );
    }


    // =========================================================
    // CODIFICAR ASUNTO UTF-8
    // =========================================================

    private String codificarAsunto(
            String asunto
    ) {

        String asuntoSeguro =
                asunto == null
                        ?
                        ""
                        :
                        asunto;


        String asuntoBase64 =
                Base64
                        .getEncoder()
                        .encodeToString(
                                asuntoSeguro
                                        .getBytes(
                                                StandardCharsets.UTF_8
                                        )
                        );


        return "=?UTF-8?B?"
                + asuntoBase64
                + "?=";
    }


    // =========================================================
    // EVITAR SALTOS DE LÍNEA EN CABECERAS
    // =========================================================

    private String limpiarCabecera(
            String valor
    ) {

        if (valor == null) {
            return "";
        }


        return valor
                .replace(
                        "\r",
                        ""
                )
                .replace(
                        "\n",
                        ""
                )
                .trim();
    }


    // =========================================================
    // VALIDAR CONFIGURACIÓN DE GMAIL
    // =========================================================

    private void validarConfiguracionGmail() {

        if (
                clientId == null
                        ||
                clientId.isBlank()
        ) {

            throw new IllegalStateException(
                    "No está configurada la variable GMAIL_CLIENT_ID."
            );
        }


        if (
                clientSecret == null
                        ||
                clientSecret.isBlank()
        ) {

            throw new IllegalStateException(
                    "No está configurada la variable GMAIL_CLIENT_SECRET."
            );
        }


        if (
                refreshToken == null
                        ||
                refreshToken.isBlank()
        ) {

            throw new IllegalStateException(
                    "No está configurada la variable GMAIL_REFRESH_TOKEN."
            );
        }


        if (
                remitente == null
                        ||
                remitente.isBlank()
        ) {

            throw new IllegalStateException(
                    "No está configurada la variable GMAIL_FROM_EMAIL."
            );
        }
    }


    // =========================================================
    // SOLICITUD DE CRÉDITO REGISTRADA
    // =========================================================

    public void enviarSolicitudRegistrada(
            Solicitud solicitud
    ) {

        Cliente cliente =
                obtenerClienteValido(
                        solicitud
                );


        if (
                !tieneCorreo(
                        cliente
                )
        ) {

            System.err.println(
                    "No se envió el correo de solicitud registrada: "
                            +
                            "el cliente no tiene correo electrónico."
            );

            return;
        }


        String nombreCliente =
                obtenerNombreCliente(
                        cliente
                );


        String codigoSolicitud =
                obtenerCodigoSolicitud(
                        solicitud
                );


        String asunto =
                "Solicitud de crédito registrada - "
                        +
                        codigoSolicitud
                        +
                        " - Cooperativa 15 de Abril";


        String mensaje =
                "Estimado/a "
                        + nombreCliente
                        + ":\n\n"

                        + "Le informamos que su solicitud de crédito ha sido "
                        + "registrada correctamente en la Cooperativa 15 de Abril.\n\n"

                        + "DETALLE DE LA SOLICITUD\n"
                        + "----------------------------------------\n"

                        + "Código de solicitud: "
                        + codigoSolicitud
                        + "\n"

                        + "Tipo de crédito: "
                        + valorTexto(
                                solicitud.getTipoCredito()
                        )
                        + "\n"

                        + "Monto solicitado: "
                        + formatearDinero(
                                solicitud.getMonto()
                        )
                        + "\n"

                        + "Plazo: "
                        + formatearPlazo(
                                solicitud.getPlazoMeses()
                        )
                        + "\n"

                        + "Destino del crédito: "
                        + valorTexto(
                                solicitud.getDestinoCredito()
                        )
                        + "\n"

                        + "Estado actual: Pendiente\n"
                        + "----------------------------------------\n\n"

                        + "DOCUMENTACIÓN REQUERIDA\n\n"

                        + "Para continuar con el proceso de evaluación de su "
                        + "solicitud, es necesario acercarse con la siguiente documentacion 
                        para que uno de nuestros ascesores pueda ingresarla al sistema "
                        + "documentación necesaria:\n\n"

                        + "1. Original del Documento de identificación.\n"
                        + "2. Original del Documento de respaldo de ingresos o prueba de ingresos.\n"
                        + "3. Original de la encuesta llenada antes de la solicitud.\n\n"

                        + "La documentación deberá ser entregada y escaneada para que la "
                        + "solicitud pueda continuar con el proceso de evaluación "
                        + "de riesgo crediticio.\n\n"

                        + "Una vez completada la documentación requerida, "
                        + "la solicitud podrá avanzar a las siguientes etapas "
                        + "del proceso de análisis.\n\n"

                        + "Conserve el código de solicitud "
                        + codigoSolicitud
                        + " como referencia para cualquier consulta relacionada "
                        + "con su trámite.\n\n"

                        + "Este es un mensaje automático. Por favor, no responda "
                        + "a este correo.\n\n"

                        + "Atentamente,\n"
                        + "Cooperativa de Ahorro y Crédito 15 de Abril\n"
                        + "Seguridad y confianza.";


        enviarCorreo(
                cliente.getCorreo(),
                asunto,
                mensaje
        );
    }


    // =========================================================
    // SOLICITUD APROBADA
    // =========================================================

    public void enviarSolicitudAprobada(
            Solicitud solicitud
    ) {

        Cliente cliente =
                obtenerClienteValido(
                        solicitud
                );


        if (
                !tieneCorreo(
                        cliente
                )
        ) {

            System.err.println(
                    "No se envió el correo de aprobación: "
                            +
                            "el cliente no tiene correo electrónico."
            );

            return;
        }


        String nombreCliente =
                obtenerNombreCliente(
                        cliente
                );


        String codigoSolicitud =
                obtenerCodigoSolicitud(
                        solicitud
                );


        String asunto =
                "Solicitud de crédito aprobada - "
                        +
                        codigoSolicitud
                        +
                        " - Cooperativa 15 de Abril";


        String mensaje =
                "Estimado/a "
                        + nombreCliente
                        + ":\n\n"

                        + "Nos complace informarle que, una vez finalizado el "
                        + "proceso de análisis correspondiente, su solicitud de "
                        + "crédito ha sido APROBADA.\n\n"

                        + "DETALLE DEL CRÉDITO\n"
                        + "----------------------------------------\n"

                        + "Código de solicitud: "
                        + codigoSolicitud
                        + "\n"

                        + "Tipo de crédito: "
                        + valorTexto(
                                solicitud.getTipoCredito()
                        )
                        + "\n"

                        + "Monto solicitado: "
                        + formatearDinero(
                                solicitud.getMonto()
                        )
                        + "\n"

                        + "Plazo: "
                        + formatearPlazo(
                                solicitud.getPlazoMeses()
                        )
                        + "\n"

                        + "Destino del crédito: "
                        + valorTexto(
                                solicitud.getDestinoCredito()
                        )
                        + "\n"

                        + "Estado: APROBADO\n"
                        + "----------------------------------------\n\n"

                        + "Para continuar con las siguientes gestiones "
                        + "relacionadas con su crédito, comuníquese o acérquese "
                        + "a la Cooperativa de Ahorro y Crédito 15 de Abril.\n\n"

                        + "Para cualquier consulta relacionada con este trámite, "
                        + "utilice como referencia el código "
                        + codigoSolicitud
                        + ".\n\n"

                        + "Agradecemos la confianza depositada en nuestra institución.\n\n"

                        + "Este es un mensaje automático. Por favor, no responda "
                        + "a este correo.\n\n"

                        + "Atentamente,\n"
                        + "Cooperativa de Ahorro y Crédito 15 de Abril\n"
                        + "Seguridad y confianza.";


        enviarCorreo(
                cliente.getCorreo(),
                asunto,
                mensaje
        );
    }


    // =========================================================
    // SOLICITUD RECHAZADA
    // =========================================================

    public void enviarSolicitudRechazada(
            Solicitud solicitud
    ) {

        Cliente cliente =
                obtenerClienteValido(
                        solicitud
                );


        if (
                !tieneCorreo(
                        cliente
                )
        ) {

            System.err.println(
                    "No se envió el correo de resultado: "
                            +
                            "el cliente no tiene correo electrónico."
            );

            return;
        }


        String nombreCliente =
                obtenerNombreCliente(
                        cliente
                );


        String codigoSolicitud =
                obtenerCodigoSolicitud(
                        solicitud
                );


        String asunto =
                "Resultado de su solicitud de crédito - "
                        +
                        codigoSolicitud
                        +
                        " - Cooperativa 15 de Abril";


        String mensaje =
                "Estimado/a "
                        + nombreCliente
                        + ":\n\n"

                        + "Le informamos que, una vez finalizado el proceso de "
                        + "análisis correspondiente, su solicitud de crédito "
                        + "no ha sido aprobada.\n\n"

                        + "DETALLE DE LA SOLICITUD\n"
                        + "----------------------------------------\n"

                        + "Código de solicitud: "
                        + codigoSolicitud
                        + "\n"

                        + "Tipo de crédito: "
                        + valorTexto(
                                solicitud.getTipoCredito()
                        )
                        + "\n"

                        + "Monto solicitado: "
                        + formatearDinero(
                                solicitud.getMonto()
                        )
                        + "\n"

                        + "Plazo: "
                        + formatearPlazo(
                                solicitud.getPlazoMeses()
                        )
                        + "\n"

                        + "Destino del crédito: "
                        + valorTexto(
                                solicitud.getDestinoCredito()
                        )
                        + "\n"

                        + "Estado: NO APROBADO\n"
                        + "----------------------------------------\n\n"

                        + "Si requiere información adicional sobre el proceso, "
                        + "puede comunicarse o acercarse a la Cooperativa de "
                        + "Ahorro y Crédito 15 de Abril.\n\n"

                        + "Para cualquier consulta relacionada con este trámite, "
                        + "utilice como referencia el código "
                        + codigoSolicitud
                        + ".\n\n"

                        + "Agradecemos su interés y la confianza depositada "
                        + "en nuestra institución.\n\n"

                        + "Este es un mensaje automático. Por favor, no responda "
                        + "a este correo.\n\n"

                        + "Atentamente,\n"
                        + "Cooperativa de Ahorro y Crédito 15 de Abril\n"
                        + "Seguridad y confianza.";


        enviarCorreo(
                cliente.getCorreo(),
                asunto,
                mensaje
        );
    }


    // =========================================================
    // OBTENER CLIENTE
    // =========================================================

    private Cliente obtenerClienteValido(
            Solicitud solicitud
    ) {

        if (solicitud == null) {

            throw new IllegalArgumentException(
                    "La solicitud no puede ser nula."
            );
        }


        if (solicitud.getCliente() == null) {

            throw new IllegalArgumentException(
                    "La solicitud no tiene un cliente asociado."
            );
        }


        return solicitud.getCliente();
    }


    // =========================================================
    // VALIDAR CORREO
    // =========================================================

    private boolean tieneCorreo(
            Cliente cliente
    ) {

        return cliente.getCorreo() != null
                &&
                !cliente
                        .getCorreo()
                        .trim()
                        .isEmpty();
    }


    // =========================================================
    // NOMBRE COMPLETO DEL CLIENTE
    // =========================================================

    private String obtenerNombreCliente(
            Cliente cliente
    ) {

        String nombres =
                cliente.getNombres() != null
                        ?
                        cliente
                                .getNombres()
                                .trim()
                        :
                        "";


        String apellidos =
                cliente.getApellidos() != null
                        ?
                        cliente
                                .getApellidos()
                                .trim()
                        :
                        "";


        String nombreCompleto =
                (
                        nombres
                                + " "
                                + apellidos
                )
                        .trim();


        return nombreCompleto.isEmpty()
                ?
                "cliente"
                :
                nombreCompleto;
    }


    // =========================================================
    // CÓDIGO DE SOLICITUD
    // =========================================================

    private String obtenerCodigoSolicitud(
            Solicitud solicitud
    ) {

        if (
                solicitud.getCodigoSolicitud() == null
                        ||
                solicitud
                        .getCodigoSolicitud()
                        .trim()
                        .isEmpty()
        ) {

            return "Sin código";
        }


        return solicitud
                .getCodigoSolicitud()
                .trim();
    }


    // =========================================================
    // FORMATEAR MONTO
    // =========================================================

    private String formatearDinero(
            Double monto
    ) {

        if (monto == null) {

            return "No especificado";
        }


        NumberFormat formato =
                NumberFormat
                        .getCurrencyInstance(
                                Locale.US
                        );


        return formato.format(
                monto
        );
    }


    // =========================================================
    // FORMATEAR PLAZO
    // =========================================================

    private String formatearPlazo(
            Integer plazoMeses
    ) {

        if (plazoMeses == null) {

            return "No especificado";
        }


        return plazoMeses
                +
                " meses";
    }


    // =========================================================
    // TEXTO SEGURO
    // =========================================================

    private String valorTexto(
            String valor
    ) {

        if (
                valor == null
                        ||
                valor
                        .trim()
                        .isEmpty()
        ) {

            return "No especificado";
        }


        return valor.trim();
    }
}