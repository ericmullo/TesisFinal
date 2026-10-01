package com.cooperativa.cooperativaBackend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "notificaciones",
        indexes = {
                @Index(
                        name = "idx_notificacion_usuario",
                        columnList = "usuario_id"
                ),
                @Index(
                        name = "idx_notificacion_usuario_leida",
                        columnList = "usuario_id, leida"
                )
        }
)
public class Notificacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    // =========================================================
    // USUARIO DESTINATARIO
    // =========================================================

    @ManyToOne(
            fetch = FetchType.LAZY,
            optional = false
    )
    @JoinColumn(
            name = "usuario_id",
            nullable = false
    )
    private Usuario usuario;


    // =========================================================
    // INFORMACIÓN DE LA NOTIFICACIÓN
    // =========================================================

    @Column(
            nullable = false,
            length = 150
    )
    private String titulo;


    @Column(
            nullable = false,
            length = 1000
    )
    private String mensaje;


    @Column(
            nullable = false,
            length = 50
    )
    private String tipo;


    // =========================================================
    // ESTADO
    // =========================================================

    @Column(nullable = false)
    private Boolean leida = false;


    // =========================================================
    // INFORMACIÓN PARA NAVEGACIÓN
    // =========================================================

    @Column(
            name = "entidad_tipo",
            length = 50
    )
    private String entidadTipo;


    @Column(
            name = "entidad_id"
    )
    private Long entidadId;


    @Column(
            length = 255
    )
    private String ruta;


    // =========================================================
    // FECHAS
    // =========================================================

    @Column(
            name = "fecha_creacion",
            nullable = false,
            updatable = false
    )
    private LocalDateTime fechaCreacion;


    @Column(
            name = "fecha_lectura"
    )
    private LocalDateTime fechaLectura;


    // =========================================================
    // PRE PERSIST
    // =========================================================

    @PrePersist
    public void prePersist() {

        if (leida == null) {
            leida = false;
        }

        if (fechaCreacion == null) {
            fechaCreacion = LocalDateTime.now();
        }
    }


    // =========================================================
    // CONSTRUCTOR VACÍO
    // =========================================================

    public Notificacion() {
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


    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(
            Usuario usuario
    ) {
        this.usuario = usuario;
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