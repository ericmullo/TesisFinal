package com.cooperativa.cooperativaBackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PrediccionRiesgoRequest {

    @JsonProperty("ingresos_mensuales")
    private Double ingresosMensuales;

    @JsonProperty("egresos_mensuales")
    private Double egresosMensuales;

    @JsonProperty("nivel_endeudamiento")
    private Double nivelEndeudamiento;

    @JsonProperty("capacidad_pago")
    private Double capacidadPago;

    @JsonProperty("tipo_credito")
    private String tipoCredito;

    @JsonProperty("monto_solicitado")
    private Double montoSolicitado;

    @JsonProperty("plazo_meses")
    private Integer plazoMeses;

    @JsonProperty("antiguedad_laboral_anios")
    private Double antiguedadLaboralAnios;


    public Double getIngresosMensuales() {
        return ingresosMensuales;
    }

    public void setIngresosMensuales(Double ingresosMensuales) {
        this.ingresosMensuales = ingresosMensuales;
    }

    public Double getEgresosMensuales() {
        return egresosMensuales;
    }

    public void setEgresosMensuales(Double egresosMensuales) {
        this.egresosMensuales = egresosMensuales;
    }

    public Double getNivelEndeudamiento() {
        return nivelEndeudamiento;
    }

    public void setNivelEndeudamiento(Double nivelEndeudamiento) {
        this.nivelEndeudamiento = nivelEndeudamiento;
    }

    public Double getCapacidadPago() {
        return capacidadPago;
    }

    public void setCapacidadPago(Double capacidadPago) {
        this.capacidadPago = capacidadPago;
    }

    public String getTipoCredito() {
        return tipoCredito;
    }

    public void setTipoCredito(String tipoCredito) {
        this.tipoCredito = tipoCredito;
    }

    public Double getMontoSolicitado() {
        return montoSolicitado;
    }

    public void setMontoSolicitado(Double montoSolicitado) {
        this.montoSolicitado = montoSolicitado;
    }

    public Integer getPlazoMeses() {
        return plazoMeses;
    }

    public void setPlazoMeses(Integer plazoMeses) {
        this.plazoMeses = plazoMeses;
    }

    public Double getAntiguedadLaboralAnios() {
        return antiguedadLaboralAnios;
    }

    public void setAntiguedadLaboralAnios(Double antiguedadLaboralAnios) {
        this.antiguedadLaboralAnios = antiguedadLaboralAnios;
    }
}