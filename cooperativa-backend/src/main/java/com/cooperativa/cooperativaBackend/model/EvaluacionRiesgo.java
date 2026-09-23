package com.cooperativa.cooperativaBackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "evaluaciones_riesgo")
public class EvaluacionRiesgo {


    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // SOLICITUD
    // =========================================================

    @ManyToOne
    @JoinColumn(
            name = "solicitud_id",
            nullable = false
    )
    private Solicitud solicitud;


    // =========================================================
    // RESULTADOS DE LA EVALUACIÓN
    // =========================================================

    private Integer scoreIa;


    private Double probabilidadMora;


    private Double confianzaModelo;


    private String nivelRiesgo;


    private String recomendacion;


    // =========================================================
    // MODELO UTILIZADO
    // =========================================================

    private String modeloUtilizado;


    // =========================================================
    // ESTADO
    // =========================================================

    private String estado;


    // =========================================================
    // EXPLICACIÓN
    // =========================================================

    @Column(length = 2000)
    private String explicacion;


    // =========================================================
    // FECHA
    // =========================================================

    private LocalDateTime fechaEvaluacion;


    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    public void prePersist() {

        if (fechaEvaluacion == null) {
            fechaEvaluacion =
                    LocalDateTime.now();
        }

        if (estado == null) {
            estado =
                    "Pendiente";
        }

    }


    // =========================================================
    // GETTERS Y SETTERS
    // =========================================================

    public Long getId() {
        return id;
    }


    public void setId(Long id) {
        this.id = id;
    }


    public Solicitud getSolicitud() {
        return solicitud;
    }


    public void setSolicitud(
            Solicitud solicitud
    ) {
        this.solicitud = solicitud;
    }


    public Integer getScoreIa() {
        return scoreIa;
    }


    public void setScoreIa(
            Integer scoreIa
    ) {
        this.scoreIa = scoreIa;
    }


    public Double getProbabilidadMora() {
        return probabilidadMora;
    }


    public void setProbabilidadMora(
            Double probabilidadMora
    ) {
        this.probabilidadMora =
                probabilidadMora;
    }


    public Double getConfianzaModelo() {
        return confianzaModelo;
    }


    public void setConfianzaModelo(
            Double confianzaModelo
    ) {
        this.confianzaModelo =
                confianzaModelo;
    }


    public String getNivelRiesgo() {
        return nivelRiesgo;
    }


    public void setNivelRiesgo(
            String nivelRiesgo
    ) {
        this.nivelRiesgo =
                nivelRiesgo;
    }


    public String getRecomendacion() {
        return recomendacion;
    }


    public void setRecomendacion(
            String recomendacion
    ) {
        this.recomendacion =
                recomendacion;
    }


    public String getModeloUtilizado() {
        return modeloUtilizado;
    }


    public void setModeloUtilizado(
            String modeloUtilizado
    ) {
        this.modeloUtilizado =
                modeloUtilizado;
    }


    public String getEstado() {
        return estado;
    }


    public void setEstado(
            String estado
    ) {
        this.estado = estado;
    }


    public String getExplicacion() {
        return explicacion;
    }


    public void setExplicacion(
            String explicacion
    ) {
        this.explicacion =
                explicacion;
    }


    public LocalDateTime getFechaEvaluacion() {
        return fechaEvaluacion;
    }


    public void setFechaEvaluacion(
            LocalDateTime fechaEvaluacion
    ) {
        this.fechaEvaluacion =
                fechaEvaluacion;
    }

}