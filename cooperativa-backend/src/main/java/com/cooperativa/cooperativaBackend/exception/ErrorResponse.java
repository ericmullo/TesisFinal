package com.cooperativa.cooperativaBackend.exception;

import java.time.LocalDateTime;

public class ErrorResponse {

    private int status;
    private String error;
    private String mensaje;
    private LocalDateTime fecha;

    public ErrorResponse(
            int status,
            String error,
            String mensaje
    ) {
        this.status = status;
        this.error = error;
        this.mensaje = mensaje;
        this.fecha = LocalDateTime.now();
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }

    public LocalDateTime getFecha() {
        return fecha;
    }

    public void setFecha(LocalDateTime fecha) {
        this.fecha = fecha;
    }
}