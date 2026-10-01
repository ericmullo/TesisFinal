package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.dto.NotificacionResponse;
import com.cooperativa.cooperativaBackend.exception.RecursoNoEncontradoException;
import com.cooperativa.cooperativaBackend.model.Notificacion;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.UsuarioRepository;
import com.cooperativa.cooperativaBackend.service.NotificacionService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final UsuarioRepository usuarioRepository;


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public NotificacionController(
            NotificacionService notificacionService,
            UsuarioRepository usuarioRepository
    ) {

        this.notificacionService =
                notificacionService;

        this.usuarioRepository =
                usuarioRepository;
    }


    // =========================================================
    // OBTENER TODAS MIS NOTIFICACIONES
    // =========================================================

    @GetMapping
    public ResponseEntity<List<NotificacionResponse>>
    obtenerMisNotificaciones(
            Authentication authentication
    ) {

        Usuario usuario =
                obtenerUsuarioAutenticado(
                        authentication
                );


        List<NotificacionResponse> respuesta =
                notificacionService
                        .obtenerNotificaciones(
                                usuario.getId()
                        )
                        .stream()
                        .map(this::convertirAResponse)
                        .toList();


        return ResponseEntity.ok(
                respuesta
        );
    }


    // =========================================================
    // OBTENER MIS NOTIFICACIONES NO LEÍDAS
    // =========================================================

    @GetMapping("/no-leidas")
    public ResponseEntity<List<NotificacionResponse>>
    obtenerMisNotificacionesNoLeidas(
            Authentication authentication
    ) {

        Usuario usuario =
                obtenerUsuarioAutenticado(
                        authentication
                );


        List<NotificacionResponse> respuesta =
                notificacionService
                        .obtenerNoLeidas(
                                usuario.getId()
                        )
                        .stream()
                        .map(this::convertirAResponse)
                        .toList();


        return ResponseEntity.ok(
                respuesta
        );
    }


    // =========================================================
    // CONTADOR DE NOTIFICACIONES NO LEÍDAS
    // =========================================================

    @GetMapping("/contador")
    public ResponseEntity<Map<String, Long>>
    contarMisNotificacionesNoLeidas(
            Authentication authentication
    ) {

        Usuario usuario =
                obtenerUsuarioAutenticado(
                        authentication
                );


        long cantidad =
                notificacionService
                        .contarNoLeidas(
                                usuario.getId()
                        );


        return ResponseEntity.ok(
                Map.of(
                        "noLeidas",
                        cantidad
                )
        );
    }


    // =========================================================
    // MARCAR UNA NOTIFICACIÓN COMO LEÍDA
    // =========================================================

    @PutMapping("/{id}/leer")
    public ResponseEntity<NotificacionResponse>
    marcarComoLeida(
            @PathVariable Long id,
            Authentication authentication
    ) {

        Usuario usuario =
                obtenerUsuarioAutenticado(
                        authentication
                );


        Notificacion notificacion =
                notificacionService
                        .marcarComoLeida(
                                id,
                                usuario.getId()
                        );


        return ResponseEntity.ok(
                convertirAResponse(
                        notificacion
                )
        );
    }


    // =========================================================
    // MARCAR TODAS MIS NOTIFICACIONES COMO LEÍDAS
    // =========================================================

    @PutMapping("/leer-todas")
    public ResponseEntity<Void>
    marcarTodasComoLeidas(
            Authentication authentication
    ) {

        Usuario usuario =
                obtenerUsuarioAutenticado(
                        authentication
                );


        notificacionService
                .marcarTodasComoLeidas(
                        usuario.getId()
                );


        return ResponseEntity
                .noContent()
                .build();
    }


    // =========================================================
    // OBTENER USUARIO AUTENTICADO
    // =========================================================

    private Usuario obtenerUsuarioAutenticado(
            Authentication authentication
    ) {

        if (
                authentication == null
                        ||
                !authentication.isAuthenticated()
                        ||
                authentication.getName() == null
                        ||
                authentication.getName().isBlank()
        ) {

            throw new RecursoNoEncontradoException(
                    "Usuario autenticado no encontrado."
            );
        }


        String username =
                authentication
                        .getName()
                        .trim()
                        .toLowerCase();


        return usuarioRepository
                .findByUsername(
                        username
                )
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Usuario autenticado no encontrado."
                        )
                );
    }


    // =========================================================
    // CONVERTIR ENTIDAD A DTO
    // =========================================================

    private NotificacionResponse convertirAResponse(
            Notificacion notificacion
    ) {

        return new NotificacionResponse(
                notificacion.getId(),
                notificacion.getTitulo(),
                notificacion.getMensaje(),
                notificacion.getTipo(),
                notificacion.getLeida(),
                notificacion.getEntidadTipo(),
                notificacion.getEntidadId(),
                notificacion.getRuta(),
                notificacion.getFechaCreacion(),
                notificacion.getFechaLectura()
        );
    }
}