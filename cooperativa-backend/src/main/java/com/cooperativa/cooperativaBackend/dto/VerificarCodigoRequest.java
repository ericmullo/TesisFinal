package com.cooperativa.cooperativaBackend.dto;

public class VerificarCodigoRequest {

    private String username;
    private String codigo;

    public VerificarCodigoRequest() {
    }

    public VerificarCodigoRequest(
            String username,
            String codigo
    ) {
        this.username = username;
        this.codigo = codigo;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getCodigo() {
        return codigo;
    }

    public void setCodigo(String codigo) {
        this.codigo = codigo;
    }
}