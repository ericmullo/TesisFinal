package com.cooperativa.cooperativaBackend.dto;

public class RestablecerPasswordRequest {

    private String nuevaPassword;


    public RestablecerPasswordRequest() {
    }


    public String getNuevaPassword() {
        return nuevaPassword;
    }


    public void setNuevaPassword(
            String nuevaPassword
    ) {
        this.nuevaPassword = nuevaPassword;
    }
}