package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.dto.UsuarioRequest;
import com.cooperativa.cooperativaBackend.dto.UsuarioResponse;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.service.UsuarioService;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.cooperativa.cooperativaBackend.dto.RestablecerPasswordRequest;
import com.cooperativa.cooperativaBackend.dto.CambiarPasswordRequest;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;


    public UsuarioController(
            UsuarioService usuarioService
    ) {
        this.usuarioService = usuarioService;
    }


    // =========================================================
    // LISTAR USUARIOS
    // =========================================================

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {

        List<UsuarioResponse> usuarios =
                usuarioService
                        .obtenerUsuarios()
                        .stream()
                        .map(this::convertirAResponse)
                        .toList();

        return ResponseEntity.ok(usuarios);
    }


    // =========================================================
    // OBTENER USUARIO
    // =========================================================

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> obtenerUsuario(
            @PathVariable Long id
    ) {

        Usuario usuario =
                usuarioService.obtenerUsuarioPorId(id);

        return ResponseEntity.ok(
                convertirAResponse(usuario)
        );
    }


    // =========================================================
    // CREAR USUARIO
    // =========================================================

    @PostMapping
    public ResponseEntity<UsuarioResponse> crearUsuario(
            @RequestBody UsuarioRequest request
    ) {

        Usuario usuario = new Usuario();

        usuario.setUsername(
                request.getUsername()
        );

        usuario.setPassword(
                request.getPassword()
        );

        usuario.setNombres(
                request.getNombres()
        );

        usuario.setApellidos(
                request.getApellidos()
        );

        usuario.setCorreo(
                request.getCorreo()
        );

        usuario.setRol(
                request.getRol()
        );


        Usuario usuarioGuardado =
                usuarioService.crearUsuario(usuario);


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        convertirAResponse(
                                usuarioGuardado
                        )
                );
    }

    // =========================================================
// ACTUALIZAR USUARIO
// =========================================================

@PutMapping("/{id}")
public ResponseEntity<UsuarioResponse> actualizarUsuario(
        @PathVariable Long id,
        @RequestBody UsuarioRequest request,
        Authentication authentication
) {

    Usuario datosActualizados =
            new Usuario();


    datosActualizados.setNombres(
            request.getNombres()
    );


    datosActualizados.setApellidos(
            request.getApellidos()
    );


    datosActualizados.setCorreo(
            request.getCorreo()
    );


    datosActualizados.setRol(
            request.getRol()
    );


    String usernameAutenticado =
            authentication.getName();


    Usuario usuarioActualizado =
            usuarioService.actualizarUsuario(
                    id,
                    datosActualizados,
                    usernameAutenticado
            );


    return ResponseEntity.ok(
            convertirAResponse(
                    usuarioActualizado
            )
    );
}

// =========================================================
// RESTABLECER CONTRASEÑA
// =========================================================

@PutMapping("/{id}/restablecer-password")
public ResponseEntity<Void> restablecerPassword(
        @PathVariable Long id,
        @RequestBody RestablecerPasswordRequest request,
        Authentication authentication
) {

    String usernameAutenticado =
            authentication.getName();


    usuarioService.restablecerPassword(
            id,
            request.getNuevaPassword(),
            usernameAutenticado
    );


    return ResponseEntity.noContent().build();
}

// =========================================================
// CAMBIAR MI CONTRASEÑA
// =========================================================

@PutMapping("/mi-password")
public ResponseEntity<Void> cambiarMiPassword(
        @RequestBody CambiarPasswordRequest request,
        Authentication authentication
) {

    String usernameAutenticado =
            authentication.getName();


    usuarioService.cambiarMiPassword(
            usernameAutenticado,
            request.getPasswordActual(),
            request.getNuevaPassword()
    );


    return ResponseEntity.noContent().build();
}


    // =========================================================
    // ACTIVAR USUARIO
    // =========================================================

    @PutMapping("/{id}/activar")
    public ResponseEntity<UsuarioResponse> activarUsuario(
            @PathVariable Long id
    ) {

        Usuario usuario =
                usuarioService.activarUsuario(id);


        return ResponseEntity.ok(
                convertirAResponse(usuario)
        );
    }


    // =========================================================
    // DESACTIVAR USUARIO
    // =========================================================

    @PutMapping("/{id}/desactivar")
    public ResponseEntity<UsuarioResponse> desactivarUsuario(
            @PathVariable Long id,
            Authentication authentication
    ) {

        String usernameAutenticado =
                authentication.getName();


        Usuario usuario =
                usuarioService.desactivarUsuario(
                        id,
                        usernameAutenticado
                );


        return ResponseEntity.ok(
                convertirAResponse(usuario)
        );
    }


    // =========================================================
    // CONVERTIR ENTIDAD A DTO
    // =========================================================

    private UsuarioResponse convertirAResponse(
            Usuario usuario
    ) {

        UsuarioResponse response =
                new UsuarioResponse();

        response.setId(
                usuario.getId()
        );

        response.setUsername(
                usuario.getUsername()
        );

        response.setNombres(
                usuario.getNombres()
        );

        response.setApellidos(
                usuario.getApellidos()
        );

        response.setCorreo(
                usuario.getCorreo()
        );

        response.setRol(
                usuario.getRol()
        );

        response.setActivo(
                usuario.getActivo()
        );

        response.setFechaCreacion(
                usuario.getFechaCreacion()
        );


        return response;
    }
}