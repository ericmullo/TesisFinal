package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.exception.RecursoNoEncontradoException;
import com.cooperativa.cooperativaBackend.model.Notificacion;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.NotificacionRepository;
import com.cooperativa.cooperativaBackend.repository.UsuarioRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public NotificacionService(
            NotificacionRepository notificacionRepository,
            UsuarioRepository usuarioRepository
    ) {

        this.notificacionRepository =
                notificacionRepository;

        this.usuarioRepository =
                usuarioRepository;
    }


    // =========================================================
    // CREAR NOTIFICACIÓN
    // =========================================================

    @Transactional
    public Notificacion crearNotificacion(
            Long usuarioId,
            String titulo,
            String mensaje,
            String tipo,
            String entidadTipo,
            Long entidadId,
            String ruta
    ) {

        // -----------------------------------------------------
        // BUSCAR USUARIO DESTINATARIO
        // -----------------------------------------------------

        Usuario usuario =
                usuarioRepository
                        .findById(usuarioId)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "Usuario no encontrado."
                                )
                        );


        // -----------------------------------------------------
        // VALIDACIONES
        // -----------------------------------------------------

        if (
                titulo == null
                        ||
                titulo.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "El título de la notificación es obligatorio."
            );
        }


        if (
                mensaje == null
                        ||
                mensaje.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "El mensaje de la notificación es obligatorio."
            );
        }


        if (
                tipo == null
                        ||
                tipo.isBlank()
        ) {

            throw new IllegalArgumentException(
                    "El tipo de notificación es obligatorio."
            );
        }


        // -----------------------------------------------------
        // CREAR NOTIFICACIÓN
        // -----------------------------------------------------

        Notificacion notificacion =
                new Notificacion();


        notificacion.setUsuario(
                usuario
        );

        notificacion.setTitulo(
                titulo.trim()
        );

        notificacion.setMensaje(
                mensaje.trim()
        );

        notificacion.setTipo(
                tipo.trim().toUpperCase()
        );

        notificacion.setEntidadTipo(
                entidadTipo == null
                        || entidadTipo.isBlank()
                        ? null
                        : entidadTipo.trim().toUpperCase()
        );

        notificacion.setEntidadId(
                entidadId
        );

        notificacion.setRuta(
                ruta == null
                        || ruta.isBlank()
                        ? null
                        : ruta.trim()
        );

        notificacion.setLeida(
                false
        );

        notificacion.setFechaCreacion(
                LocalDateTime.now()
        );


        // -----------------------------------------------------
        // GUARDAR
        // -----------------------------------------------------

        return notificacionRepository.save(
                notificacion
        );
    }


    // =========================================================
    // OBTENER TODAS LAS NOTIFICACIONES DEL USUARIO
    // =========================================================

    @Transactional(readOnly = true)
    public List<Notificacion> obtenerNotificaciones(
            Long usuarioId
    ) {

        validarUsuario(
                usuarioId
        );


        return notificacionRepository
                .findByUsuarioIdOrderByFechaCreacionDesc(
                        usuarioId
                );
    }


    // =========================================================
    // OBTENER SOLO NOTIFICACIONES NO LEÍDAS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Notificacion> obtenerNoLeidas(
            Long usuarioId
    ) {

        validarUsuario(
                usuarioId
        );


        return notificacionRepository
                .findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(
                        usuarioId
                );
    }


    // =========================================================
    // CONTAR NOTIFICACIONES NO LEÍDAS
    // =========================================================

    @Transactional(readOnly = true)
    public long contarNoLeidas(
            Long usuarioId
    ) {

        validarUsuario(
                usuarioId
        );


        return notificacionRepository
                .countByUsuarioIdAndLeidaFalse(
                        usuarioId
                );
    }


    // =========================================================
    // MARCAR UNA NOTIFICACIÓN COMO LEÍDA
    // =========================================================

    @Transactional
    public Notificacion marcarComoLeida(
            Long notificacionId,
            Long usuarioId
    ) {

        Notificacion notificacion =
                obtenerNotificacionDelUsuario(
                        notificacionId,
                        usuarioId
                );


        // -----------------------------------------------------
        // SI YA ESTÁ LEÍDA, NO HACEMOS NADA
        // -----------------------------------------------------

        if (
                Boolean.TRUE.equals(
                        notificacion.getLeida()
                )
        ) {

            return notificacion;
        }


        // -----------------------------------------------------
        // MARCAR COMO LEÍDA
        // -----------------------------------------------------

        notificacion.setLeida(
                true
        );

        notificacion.setFechaLectura(
                LocalDateTime.now()
        );


        return notificacionRepository.save(
                notificacion
        );
    }


    // =========================================================
    // MARCAR TODAS COMO LEÍDAS
    // =========================================================

    @Transactional
    public void marcarTodasComoLeidas(
            Long usuarioId
    ) {

        validarUsuario(
                usuarioId
        );


        List<Notificacion> notificaciones =
                notificacionRepository
                        .findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(
                                usuarioId
                        );


        LocalDateTime fechaLectura =
                LocalDateTime.now();


        for (
                Notificacion notificacion
                :
                notificaciones
        ) {

            notificacion.setLeida(
                    true
            );

            notificacion.setFechaLectura(
                    fechaLectura
            );
        }


        if (!notificaciones.isEmpty()) {

            notificacionRepository.saveAll(
                    notificaciones
            );
        }
    }


    // =========================================================
    // OBTENER NOTIFICACIÓN
    // VALIDANDO QUE PERTENEZCA AL USUARIO
    // =========================================================

    @Transactional(readOnly = true)
    public Notificacion obtenerNotificacionDelUsuario(
            Long notificacionId,
            Long usuarioId
    ) {

        Notificacion notificacion =
                notificacionRepository
                        .findById(notificacionId)
                        .orElseThrow(() ->
                                new RecursoNoEncontradoException(
                                        "Notificación no encontrada."
                                )
                        );


        // -----------------------------------------------------
        // SEGURIDAD:
        // LA NOTIFICACIÓN DEBE PERTENECER AL USUARIO
        // -----------------------------------------------------

        if (
                notificacion.getUsuario() == null
                        ||
                !notificacion
                        .getUsuario()
                        .getId()
                        .equals(usuarioId)
        ) {

            // No revelamos que la notificación existe
            // pero pertenece a otra persona.

            throw new RecursoNoEncontradoException(
                    "Notificación no encontrada."
            );
        }


        return notificacion;
    }


    // =========================================================
    // VALIDAR USUARIO
    // =========================================================

    private void validarUsuario(
            Long usuarioId
    ) {

        if (usuarioId == null) {

            throw new RecursoNoEncontradoException(
                    "Usuario no encontrado."
            );
        }


        if (
                !usuarioRepository.existsById(
                        usuarioId
                )
        ) {

            throw new RecursoNoEncontradoException(
                    "Usuario no encontrado."
            );
        }
    }
}