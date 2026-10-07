package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.model.Solicitud;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.text.NumberFormat;
import java.util.Locale;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remitente;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // =========================================================
    // ENVÍO GENÉRICO
    // También utilizado actualmente por el 2FA
    // =========================================================
    public void enviarCorreo(
            String destinatario,
            String asunto,
            String mensaje
    ) {
        SimpleMailMessage correo = new SimpleMailMessage();

        correo.setFrom(remitente);
        correo.setTo(destinatario);
        correo.setSubject(asunto);
        correo.setText(mensaje);

        mailSender.send(correo);
    }

    // =========================================================
    // SOLICITUD DE CRÉDITO REGISTRADA
    // =========================================================
    public void enviarSolicitudRegistrada(
            Solicitud solicitud
    ) {
        Cliente cliente =
                obtenerClienteValido(solicitud);

        if (!tieneCorreo(cliente)) {
            System.err.println(
                    "No se envió el correo de solicitud registrada: " +
                    "el cliente no tiene correo electrónico."
            );
            return;
        }

        String nombreCliente =
                obtenerNombreCliente(cliente);

        String codigoSolicitud =
                obtenerCodigoSolicitud(solicitud);

        String asunto =
                "Solicitud de crédito registrada - " +
                codigoSolicitud +
                " - Cooperativa 15 de Abril";

        String mensaje =
                "Estimado/a " + nombreCliente + ":\n\n" +

                "Le informamos que su solicitud de crédito ha sido " +
                "registrada correctamente en la Cooperativa 15 de Abril.\n\n" +

                "DETALLE DE LA SOLICITUD\n" +
                "----------------------------------------\n" +

                "Código de solicitud: " +
                codigoSolicitud + "\n" +

                "Tipo de crédito: " +
                valorTexto(
                        solicitud.getTipoCredito()
                ) + "\n" +

                "Monto solicitado: " +
                formatearDinero(
                        solicitud.getMonto()
                ) + "\n" +

                "Plazo: " +
                formatearPlazo(
                        solicitud.getPlazoMeses()
                ) + "\n" +

                "Destino del crédito: " +
                valorTexto(
                        solicitud.getDestinoCredito()
                ) + "\n" +

                "Estado actual: Pendiente\n" +
                "----------------------------------------\n\n" +

                "DOCUMENTACIÓN REQUERIDA\n\n" +

                "Para continuar con el proceso de evaluación de su " +
                "solicitud, es necesario presentar la siguiente " +
                "documentación:\n\n" +

                "1. Documento de identificación.\n" +
                "2. Documento de respaldo de ingresos.\n" +
                "3. Documento general requerido para la solicitud.\n\n" +

                "La documentación deberá ser entregada para que la " +
                "solicitud pueda continuar con el proceso de evaluación " +
                "de riesgo crediticio.\n\n" +

                "Una vez completada la documentación requerida, " +
                "la solicitud podrá avanzar a las siguientes etapas " +
                "del proceso de análisis.\n\n" +

                "Conserve el código de solicitud " +
                codigoSolicitud +
                " como referencia para cualquier consulta relacionada " +
                "con su trámite.\n\n" +

                "Este es un mensaje automático. Por favor, no responda " +
                "a este correo.\n\n" +

                "Atentamente,\n" +
                "Cooperativa de Ahorro y Crédito 15 de Abril\n" +
                "Seguridad y confianza.";

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
                obtenerClienteValido(solicitud);

        if (!tieneCorreo(cliente)) {
            System.err.println(
                    "No se envió el correo de aprobación: " +
                    "el cliente no tiene correo electrónico."
            );
            return;
        }

        String nombreCliente =
                obtenerNombreCliente(cliente);

        String codigoSolicitud =
                obtenerCodigoSolicitud(solicitud);

        String asunto =
                "Solicitud de crédito aprobada - " +
                codigoSolicitud +
                " - Cooperativa 15 de Abril";

        String mensaje =
                "Estimado/a " + nombreCliente + ":\n\n" +

                "Nos complace informarle que, una vez finalizado el " +
                "proceso de análisis correspondiente, su solicitud de " +
                "crédito ha sido APROBADA.\n\n" +

                "DETALLE DEL CRÉDITO\n" +
                "----------------------------------------\n" +

                "Código de solicitud: " +
                codigoSolicitud + "\n" +

                "Tipo de crédito: " +
                valorTexto(
                        solicitud.getTipoCredito()
                ) + "\n" +

                "Monto solicitado: " +
                formatearDinero(
                        solicitud.getMonto()
                ) + "\n" +

                "Plazo: " +
                formatearPlazo(
                        solicitud.getPlazoMeses()
                ) + "\n" +

                "Destino del crédito: " +
                valorTexto(
                        solicitud.getDestinoCredito()
                ) + "\n" +

                "Estado: APROBADO\n" +
                "----------------------------------------\n\n" +

                "Para continuar con las siguientes gestiones " +
                "relacionadas con su crédito, comuníquese o acérquese " +
                "a la Cooperativa de Ahorro y Crédito 15 de Abril.\n\n" +

                "Para cualquier consulta relacionada con este trámite, " +
                "utilice como referencia el código " +
                codigoSolicitud + ".\n\n" +

                "Agradecemos la confianza depositada en nuestra institución.\n\n" +

                "Este es un mensaje automático. Por favor, no responda " +
                "a este correo.\n\n" +

                "Atentamente,\n" +
                "Cooperativa de Ahorro y Crédito 15 de Abril\n" +
                "Seguridad y confianza.";

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
                obtenerClienteValido(solicitud);

        if (!tieneCorreo(cliente)) {
            System.err.println(
                    "No se envió el correo de resultado: " +
                    "el cliente no tiene correo electrónico."
            );
            return;
        }

        String nombreCliente =
                obtenerNombreCliente(cliente);

        String codigoSolicitud =
                obtenerCodigoSolicitud(solicitud);

        String asunto =
                "Resultado de su solicitud de crédito - " +
                codigoSolicitud +
                " - Cooperativa 15 de Abril";

        String mensaje =
                "Estimado/a " + nombreCliente + ":\n\n" +

                "Le informamos que, una vez finalizado el proceso de " +
                "análisis correspondiente, su solicitud de crédito " +
                "no ha sido aprobada.\n\n" +

                "DETALLE DE LA SOLICITUD\n" +
                "----------------------------------------\n" +

                "Código de solicitud: " +
                codigoSolicitud + "\n" +

                "Tipo de crédito: " +
                valorTexto(
                        solicitud.getTipoCredito()
                ) + "\n" +

                "Monto solicitado: " +
                formatearDinero(
                        solicitud.getMonto()
                ) + "\n" +

                "Plazo: " +
                formatearPlazo(
                        solicitud.getPlazoMeses()
                ) + "\n" +

                "Destino del crédito: " +
                valorTexto(
                        solicitud.getDestinoCredito()
                ) + "\n" +

                "Estado: NO APROBADO\n" +
                "----------------------------------------\n\n" +

                "Si requiere información adicional sobre el proceso, " +
                "puede comunicarse o acercarse a la Cooperativa de " +
                "Ahorro y Crédito 15 de Abril.\n\n" +

                "Para cualquier consulta relacionada con este trámite, " +
                "utilice como referencia el código " +
                codigoSolicitud + ".\n\n" +

                "Agradecemos su interés y la confianza depositada " +
                "en nuestra institución.\n\n" +

                "Este es un mensaje automático. Por favor, no responda " +
                "a este correo.\n\n" +

                "Atentamente,\n" +
                "Cooperativa de Ahorro y Crédito 15 de Abril\n" +
                "Seguridad y confianza.";

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
        return cliente.getCorreo() != null &&
                !cliente.getCorreo()
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
                        ? cliente.getNombres().trim()
                        : "";

        String apellidos =
                cliente.getApellidos() != null
                        ? cliente.getApellidos().trim()
                        : "";

        String nombreCompleto =
                (nombres + " " + apellidos)
                        .trim();

        return nombreCompleto.isEmpty()
                ? "cliente"
                : nombreCompleto;
    }

    // =========================================================
    // CÓDIGO DE SOLICITUD
    // =========================================================
    private String obtenerCodigoSolicitud(
            Solicitud solicitud
    ) {
        if (
                solicitud.getCodigoSolicitud() == null ||
                solicitud.getCodigoSolicitud().trim().isEmpty()
        ) {
            return "Sin código";
        }

        return solicitud.getCodigoSolicitud().trim();
    }

    // =========================================================
    // FORMATEAR MONTO
    // Solicitud utiliza Double para monto
    // =========================================================
    private String formatearDinero(
            Double monto
    ) {
        if (monto == null) {
            return "No especificado";
        }

        NumberFormat formato =
                NumberFormat.getCurrencyInstance(
                        Locale.US
                );

        return formato.format(
                monto
        );
    }

    // =========================================================
    // FORMATEAR PLAZO
    // Solicitud utiliza Integer para plazoMeses
    // =========================================================
    private String formatearPlazo(
            Integer plazoMeses
    ) {
        if (plazoMeses == null) {
            return "No especificado";
        }

        return plazoMeses + " meses";
    }

    // =========================================================
    // TEXTO SEGURO
    // =========================================================
    private String valorTexto(
            String valor
    ) {
        if (
                valor == null ||
                valor.trim().isEmpty()
        ) {
            return "No especificado";
        }

        return valor.trim();
    }
}