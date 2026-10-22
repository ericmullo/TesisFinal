package com.cooperativa.cooperativaBackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class PrediccionRiesgoRequest {

    // =========================================================
    // INFORMACIÓN FINANCIERA
    // =========================================================

    @JsonProperty("ingresos_mensuales")
    private Double ingresosMensuales;

    @JsonProperty("egresos_mensuales")
    private Double egresosMensuales;

    @JsonProperty("nivel_endeudamiento")
    private Double nivelEndeudamiento;

    @JsonProperty("capacidad_pago")
    private Double capacidadPago;


    // =========================================================
    // INFORMACIÓN DEL CRÉDITO
    // =========================================================

    @JsonProperty("tipo_credito")
    private String tipoCredito;

    @JsonProperty("subsegmento_credito")
    private String subsegmentoCredito;

    @JsonProperty("producto_credito")
    private String productoCredito;

    @JsonProperty("monto_solicitado")
    private Double montoSolicitado;

    @JsonProperty("plazo_meses")
    private Integer plazoMeses;


    // =========================================================
    // INFORMACIÓN ECONÓMICA
    // =========================================================

    @JsonProperty("ventas_anuales")
    private Double ventasAnuales;

    @JsonProperty("fuente_pago")
    private String fuentePago;


    // =========================================================
    // ANTIGÜEDAD
    // =========================================================

    @JsonProperty("antiguedad_laboral_anios")
    private Double antiguedadLaboralAnios;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public PrediccionRiesgoRequest() {

    }


    // =========================================================
    // GETTERS Y SETTERS
    // =========================================================

    public Double getIngresosMensuales() {

        return ingresosMensuales;
    }


    public void setIngresosMensuales(
            Double ingresosMensuales
    ) {

        this.ingresosMensuales =
                ingresosMensuales;
    }


    public Double getEgresosMensuales() {

        return egresosMensuales;
    }


    public void setEgresosMensuales(
            Double egresosMensuales
    ) {

        this.egresosMensuales =
                egresosMensuales;
    }


    public Double getNivelEndeudamiento() {

        return nivelEndeudamiento;
    }


    public void setNivelEndeudamiento(
            Double nivelEndeudamiento
    ) {

        this.nivelEndeudamiento =
                nivelEndeudamiento;
    }


    public Double getCapacidadPago() {

        return capacidadPago;
    }


    public void setCapacidadPago(
            Double capacidadPago
    ) {

        this.capacidadPago =
                capacidadPago;
    }


    public String getTipoCredito() {

        return tipoCredito;
    }


    public void setTipoCredito(
            String tipoCredito
    ) {

        this.tipoCredito =
                tipoCredito;
    }


    public String getSubsegmentoCredito() {

        return subsegmentoCredito;
    }


    public void setSubsegmentoCredito(
            String subsegmentoCredito
    ) {

        this.subsegmentoCredito =
                subsegmentoCredito;
    }


    public String getProductoCredito() {

        return productoCredito;
    }


    public void setProductoCredito(
            String productoCredito
    ) {

        this.productoCredito =
                productoCredito;
    }


    public Double getMontoSolicitado() {

        return montoSolicitado;
    }


    public void setMontoSolicitado(
            Double montoSolicitado
    ) {

        this.montoSolicitado =
                montoSolicitado;
    }


    public Integer getPlazoMeses() {

        return plazoMeses;
    }


    public void setPlazoMeses(
            Integer plazoMeses
    ) {

        this.plazoMeses =
                plazoMeses;
    }


    public Double getVentasAnuales() {

        return ventasAnuales;
    }


    public void setVentasAnuales(
            Double ventasAnuales
    ) {

        this.ventasAnuales =
                ventasAnuales;
    }


    public String getFuentePago() {

        return fuentePago;
    }


    public void setFuentePago(
            String fuentePago
    ) {

        this.fuentePago =
                fuentePago;
    }


    public Double getAntiguedadLaboralAnios() {

        return antiguedadLaboralAnios;
    }


    public void setAntiguedadLaboralAnios(
            Double antiguedadLaboralAnios
    ) {

        this.antiguedadLaboralAnios =
                antiguedadLaboralAnios;
    }
}