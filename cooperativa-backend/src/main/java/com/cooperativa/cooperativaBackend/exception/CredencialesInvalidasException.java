package com.cooperativa.cooperativaBackend.exception;

public class CredencialesInvalidasException
        extends RuntimeException {

    public CredencialesInvalidasException(
            String mensaje
    ) {
        super(mensaje);
    }
}