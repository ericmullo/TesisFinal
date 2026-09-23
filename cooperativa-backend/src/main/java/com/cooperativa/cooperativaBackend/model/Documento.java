package com.cooperativa.cooperativaBackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "documentos")
public class Documento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String tipoDocumento;

    private String nombreArchivo;

    private String rutaArchivo;

    private String estado;

    private LocalDateTime fechaCarga;

    @ManyToOne
    @JoinColumn(
        name = "solicitud_id",
        nullable = false
    )
    private Solicitud solicitud;


    public Documento() {
    }


    @PrePersist
    public void prePersist() {

        fechaCarga = LocalDateTime.now();

        if (estado == null || estado.isBlank()) {
            estado = "Cargado";
        }

    }


    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public String getTipoDocumento() {
        return tipoDocumento;
    }


    public void setTipoDocumento(
        String tipoDocumento
    ) {
        this.tipoDocumento = tipoDocumento;
    }


    public String getNombreArchivo() {
        return nombreArchivo;
    }


    public void setNombreArchivo(
        String nombreArchivo
    ) {
        this.nombreArchivo = nombreArchivo;
    }


    public String getRutaArchivo() {
        return rutaArchivo;
    }


    public void setRutaArchivo(
        String rutaArchivo
    ) {
        this.rutaArchivo = rutaArchivo;
    }


    public String getEstado() {
        return estado;
    }


    public void setEstado(
        String estado
    ) {
        this.estado = estado;
    }


    public LocalDateTime getFechaCarga() {
        return fechaCarga;
    }


    public void setFechaCarga(
        LocalDateTime fechaCarga
    ) {
        this.fechaCarga = fechaCarga;
    }


    public Solicitud getSolicitud() {
        return solicitud;
    }


    public void setSolicitud(
        Solicitud solicitud
    ) {
        this.solicitud = solicitud;
    }

}