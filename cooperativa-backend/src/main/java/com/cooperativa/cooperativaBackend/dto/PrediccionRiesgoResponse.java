package com.cooperativa.cooperativaBackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PrediccionRiesgoResponse {

    @JsonProperty("probabilidad_mora")
    private Double probabilidadMora;

    @JsonProperty("score_ia")
    private Integer scoreIa;

    @JsonProperty("nivel_riesgo")
    private String nivelRiesgo;

    private String recomendacion;

    private String modelo;


    public Double getProbabilidadMora() {
        return probabilidadMora;
    }

    public void setProbabilidadMora(Double probabilidadMora) {
        this.probabilidadMora = probabilidadMora;
    }

    public Integer getScoreIa() {
        return scoreIa;
    }

    public void setScoreIa(Integer scoreIa) {
        this.scoreIa = scoreIa;
    }

    public String getNivelRiesgo() {
        return nivelRiesgo;
    }

    public void setNivelRiesgo(String nivelRiesgo) {
        this.nivelRiesgo = nivelRiesgo;
    }

    public String getRecomendacion() {
        return recomendacion;
    }

    public void setRecomendacion(String recomendacion) {
        this.recomendacion = recomendacion;
    }

    public String getModelo() {
        return modelo;
    }

    public void setModelo(String modelo) {
        this.modelo = modelo;
    }
}