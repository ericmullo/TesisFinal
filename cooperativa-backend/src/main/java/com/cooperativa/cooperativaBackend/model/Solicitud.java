package com.cooperativa.cooperativaBackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
public class Solicitud {

    // =========================================================
    // ID
    // =========================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // CÓDIGO DE NEGOCIO VISIBLE
    // =========================================================

    @Column(
            name = "CODIGO_SOLICITUD",
            nullable = false,
            unique = true,
            length = 30
    )
    private String codigoSolicitud;


    // =========================================================
    // INFORMACIÓN PERSONAL COMPLEMENTARIA
    // =========================================================

    private String estadoCivil;

    private String ocupacion;

    private String direccion;


    // =========================================================
    // INFORMACIÓN FINANCIERA
    // =========================================================

    private Double ingresosMensuales;

    private Double egresosMensuales;

    private Double nivelEndeudamiento;

    private String empresa;

    private String antiguedadLaboral;

    private Double capacidadPago;


    // =========================================================
    // INFORMACIÓN ECONÓMICA DEL SOLICITANTE
    // =========================================================

    /*
     * Ventas anuales del solicitante.
     *
     * Principalmente utilizada para diferenciar:
     *
     * - Microcrédito
     * - Productivo PYMES
     * - Productivo Empresarial
     * - Productivo Corporativo
     *
     * Para créditos de consumo puede permanecer en null.
     */
    private Double ventasAnuales;


    /*
     * Actividad económica principal.
     *
     * Ejemplos:
     *
     * - Comercio de ropa
     * - Transporte
     * - Restaurante
     * - Agricultura
     * - Servicios profesionales
     */
    private String actividadEconomica;


    /*
     * Fuente principal con la que el cliente
     * pagará el crédito.
     *
     * Ejemplos:
     *
     * - Sueldo
     * - Ventas del negocio
     * - Honorarios profesionales
     * - Ingresos por actividad comercial
     */
    private String fuentePago;


    // =========================================================
    // INFORMACIÓN DEL CRÉDITO
    // =========================================================

    /*
     * Segmento principal.
     *
     * Ejemplos:
     *
     * - Consumo
     * - Microcrédito
     * - Productivo
     * - Inmobiliario
     */
    private String tipoCredito;


    /*
     * Subsegmento calculado de acuerdo
     * con la información del solicitante.
     *
     * Ejemplos:
     *
     * - Microcrédito Minorista
     * - Microcrédito de Acumulación Simple
     * - Microcrédito de Acumulación Ampliada
     * - Productivo PYMES
     * - Productivo Empresarial
     * - Productivo Corporativo
     */
    private String subsegmentoCredito;


    /*
     * Producto comercial de la cooperativa.
     *
     * Ejemplos:
     *
     * - Mi15
     * - Mi15Libre
     * - 15 Contigo Mujer
     * - 15 Sostenible
     * - Taxista
     */
    private String productoCredito;


    private Double monto;

    private Integer plazoMeses;

    private String estado;

    private String destinoCredito;

    private LocalDateTime fechaSolicitud;


    // =========================================================
    // DECISIÓN FINAL DEL ANALISTA
    // =========================================================

    @Column(length = 1500)
    private String observacionDecision;

    private LocalDateTime fechaDecision;


    // =========================================================
    // RELACIÓN CON CLIENTE
    // =========================================================

    @ManyToOne
    @JoinColumn(
            name = "cliente_id",
            nullable = false
    )
    private Cliente cliente;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public Solicitud() {

    }


    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    public void prePersist() {

        fechaSolicitud =
                LocalDateTime.now();


        if (
                estado == null
                        ||
                estado.isBlank()
        ) {

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


    public void setId(
            Long id
    ) {

        this.id = id;
    }


    public String getCodigoSolicitud() {

        return codigoSolicitud;
    }


    public void setCodigoSolicitud(
            String codigoSolicitud
    ) {

        this.codigoSolicitud =
                codigoSolicitud;
    }


    // =========================================================
    // DATOS PERSONALES
    // =========================================================

    public String getEstadoCivil() {

        return estadoCivil;
    }


    public void setEstadoCivil(
            String estadoCivil
    ) {

        this.estadoCivil =
                estadoCivil;
    }


    public String getOcupacion() {

        return ocupacion;
    }


    public void setOcupacion(
            String ocupacion
    ) {

        this.ocupacion =
                ocupacion;
    }


    public String getDireccion() {

        return direccion;
    }


    public void setDireccion(
            String direccion
    ) {

        this.direccion =
                direccion;
    }


    // =========================================================
    // DATOS FINANCIEROS
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


    public String getEmpresa() {

        return empresa;
    }


    public void setEmpresa(
            String empresa
    ) {

        this.empresa =
                empresa;
    }


    public String getAntiguedadLaboral() {

        return antiguedadLaboral;
    }


    public void setAntiguedadLaboral(
            String antiguedadLaboral
    ) {

        this.antiguedadLaboral =
                antiguedadLaboral;
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


    // =========================================================
    // INFORMACIÓN ECONÓMICA
    // =========================================================

    public Double getVentasAnuales() {

        return ventasAnuales;
    }


    public void setVentasAnuales(
            Double ventasAnuales
    ) {

        this.ventasAnuales =
                ventasAnuales;
    }


    public String getActividadEconomica() {

        return actividadEconomica;
    }


    public void setActividadEconomica(
            String actividadEconomica
    ) {

        this.actividadEconomica =
                actividadEconomica;
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


    // =========================================================
    // INFORMACIÓN DEL CRÉDITO
    // =========================================================

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


    public Double getMonto() {

        return monto;
    }


    public void setMonto(
            Double monto
    ) {

        this.monto =
                monto;
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


    public String getEstado() {

        return estado;
    }


    public void setEstado(
            String estado
    ) {

        this.estado =
                estado;
    }


    public String getDestinoCredito() {

        return destinoCredito;
    }


    public void setDestinoCredito(
            String destinoCredito
    ) {

        this.destinoCredito =
                destinoCredito;
    }


    public LocalDateTime getFechaSolicitud() {

        return fechaSolicitud;
    }


    public void setFechaSolicitud(
            LocalDateTime fechaSolicitud
    ) {

        this.fechaSolicitud =
                fechaSolicitud;
    }


    // =========================================================
    // DECISIÓN FINAL
    // =========================================================

    public String getObservacionDecision() {

        return observacionDecision;
    }


    public void setObservacionDecision(
            String observacionDecision
    ) {

        this.observacionDecision =
                observacionDecision;
    }


    public LocalDateTime getFechaDecision() {

        return fechaDecision;
    }


    public void setFechaDecision(
            LocalDateTime fechaDecision
    ) {

        this.fechaDecision =
                fechaDecision;
    }


    // =========================================================
    // CLIENTE
    // =========================================================

    public Cliente getCliente() {

        return cliente;
    }


    public void setCliente(
            Cliente cliente
    ) {

        this.cliente =
                cliente;
    }
}