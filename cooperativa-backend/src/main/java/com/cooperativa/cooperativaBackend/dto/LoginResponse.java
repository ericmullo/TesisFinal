package com.cooperativa.cooperativaBackend.dto;

import com.cooperativa.cooperativaBackend.model.Rol;

public class LoginResponse {

    private Long id;
    private String username;
    private String nombres;
    private String apellidos;
    private Rol rol;
    private String token;
    private String tipoToken;
    private String mensaje;


    public LoginResponse() {
    }


    public LoginResponse(
            Long id,
            String username,
            String nombres,
            String apellidos,
            Rol rol,
            String token,
            String tipoToken,
            String mensaje
    ) {
        this.id = id;
        this.username = username;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.rol = rol;
        this.token = token;
        this.tipoToken = tipoToken;
        this.mensaje = mensaje;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }


    public String getNombres() {
        return nombres;
    }

    public void setNombres(String nombres) {
        this.nombres = nombres;
    }


    public String getApellidos() {
        return apellidos;
    }

    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }


    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }


    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }


    public String getTipoToken() {
        return tipoToken;
    }

    public void setTipoToken(String tipoToken) {
        this.tipoToken = tipoToken;
    }


    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(String mensaje) {
        this.mensaje = mensaje;
    }
}