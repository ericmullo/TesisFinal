package com.cooperativa.cooperativaBackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

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
    // INFORMACIÓN DEL CRÉDITO
    // =========================================================

    private String tipoCredito;

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
    @JoinColumn(name = "cliente_id", nullable = false)
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

        fechaSolicitud = LocalDateTime.now();

        if (estado == null || estado.isBlank()) {

            estado = "Pendiente";

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


    public String getEstadoCivil() {

        return estadoCivil;
    }

    public void setEstadoCivil(String estadoCivil) {

        this.estadoCivil = estadoCivil;
    }


    public String getOcupacion() {

        return ocupacion;
    }

    public void setOcupacion(String ocupacion) {

        this.ocupacion = ocupacion;
    }


    public String getDireccion() {

        return direccion;
    }

    public void setDireccion(String direccion) {

        this.direccion = direccion;
    }


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


    public String getEmpresa() {

        return empresa;
    }

    public void setEmpresa(String empresa) {

        this.empresa = empresa;
    }


    public String getAntiguedadLaboral() {

        return antiguedadLaboral;
    }

    public void setAntiguedadLaboral(String antiguedadLaboral) {

        this.antiguedadLaboral = antiguedadLaboral;
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


    public Double getMonto() {

        return monto;
    }

    public void setMonto(Double monto) {

        this.monto = monto;
    }


    public Integer getPlazoMeses() {

        return plazoMeses;
    }

    public void setPlazoMeses(Integer plazoMeses) {

        this.plazoMeses = plazoMeses;
    }


    public String getEstado() {

        return estado;
    }

    public void setEstado(String estado) {

        this.estado = estado;
    }


    public String getDestinoCredito() {

        return destinoCredito;
    }

    public void setDestinoCredito(String destinoCredito) {

        this.destinoCredito = destinoCredito;
    }


    public LocalDateTime getFechaSolicitud() {

        return fechaSolicitud;
    }

    public void setFechaSolicitud(LocalDateTime fechaSolicitud) {

        this.fechaSolicitud = fechaSolicitud;
    }


    public String getObservacionDecision() {

        return observacionDecision;
    }

    public void setObservacionDecision(
            String observacionDecision
    ) {

        this.observacionDecision = observacionDecision;
    }


    public LocalDateTime getFechaDecision() {

        return fechaDecision;
    }

    public void setFechaDecision(
            LocalDateTime fechaDecision
    ) {

        this.fechaDecision = fechaDecision;
    }


    public Cliente getCliente() {

        return cliente;
    }

    public void setCliente(Cliente cliente) {

        this.cliente = cliente;
    }
}