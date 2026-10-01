package com.cooperativa.cooperativaBackend.dto;

import java.time.LocalDateTime;

public class NotificacionResponse {

    private Long id;

    private String titulo;

    private String mensaje;

    private String tipo;

    private Boolean leida;

    private String entidadTipo;

    private Long entidadId;

    private String ruta;

    private LocalDateTime fechaCreacion;

    private LocalDateTime fechaLectura;


    // =========================================================
    // CONSTRUCTOR VACÍO
    // =========================================================

    public NotificacionResponse() {
    }


    // =========================================================
    // CONSTRUCTOR COMPLETO
    // =========================================================

    public NotificacionResponse(
            Long id,
            String titulo,
            String mensaje,
            String tipo,
            Boolean leida,
            String entidadTipo,
            Long entidadId,
            String ruta,
            LocalDateTime fechaCreacion,
            LocalDateTime fechaLectura
    ) {

        this.id = id;
        this.titulo = titulo;
        this.mensaje = mensaje;
        this.tipo = tipo;
        this.leida = leida;
        this.entidadTipo = entidadTipo;
        this.entidadId = entidadId;
        this.ruta = ruta;
        this.fechaCreacion = fechaCreacion;
        this.fechaLectura = fechaLectura;
    }


    // =========================================================
    // GETTERS Y SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public void setId(
            Long id
    ) {
        this.id = id;
    }


    public String getTitulo() {
        return titulo;
    }

    public void setTitulo(
            String titulo
    ) {
        this.titulo = titulo;
    }


    public String getMensaje() {
        return mensaje;
    }

    public void setMensaje(
            String mensaje
    ) {
        this.mensaje = mensaje;
    }


    public String getTipo() {
        return tipo;
    }

    public void setTipo(
            String tipo
    ) {
        this.tipo = tipo;
    }


    public Boolean getLeida() {
        return leida;
    }

    public void setLeida(
            Boolean leida
    ) {
        this.leida = leida;
    }


    public String getEntidadTipo() {
        return entidadTipo;
    }

    public void setEntidadTipo(
            String entidadTipo
    ) {
        this.entidadTipo = entidadTipo;
    }


    public Long getEntidadId() {
        return entidadId;
    }

    public void setEntidadId(
            Long entidadId
    ) {
        this.entidadId = entidadId;
    }


    public String getRuta() {
        return ruta;
    }

    public void setRuta(
            String ruta
    ) {
        this.ruta = ruta;
    }


    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(
            LocalDateTime fechaCreacion
    ) {
        this.fechaCreacion = fechaCreacion;
    }


    public LocalDateTime getFechaLectura() {
        return fechaLectura;
    }

    public void setFechaLectura(
            LocalDateTime fechaLectura
    ) {
        this.fechaLectura = fechaLectura;
    }
}