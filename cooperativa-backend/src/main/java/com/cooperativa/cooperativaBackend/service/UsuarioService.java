package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.exception.RecursoNoEncontradoException;
import com.cooperativa.cooperativaBackend.exception.ReglaNegocioException;
import com.cooperativa.cooperativaBackend.exception.ValidacionException;
import com.cooperativa.cooperativaBackend.model.Rol;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;


    public UsuarioService(
            UsuarioRepository usuarioRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }


    // =========================================================
    // OBTENER TODOS
    // =========================================================

    public List<Usuario> obtenerUsuarios() {

        return usuarioRepository.findAll();
    }


    // =========================================================
    // OBTENER POR ID
    // =========================================================

    public Usuario obtenerUsuarioPorId(Long id) {

        return usuarioRepository.findById(id)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Usuario no encontrado con ID: " + id
                        )
                );
    }


    // =========================================================
    // OBTENER POR USERNAME
    // =========================================================

    public Usuario obtenerPorUsername(String username) {

        return usuarioRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RecursoNoEncontradoException(
                                "Usuario no encontrado."
                        )
                );
    }


    // =========================================================
    // CREAR USUARIO
    // =========================================================

    public Usuario crearUsuario(Usuario usuario) {

        validarUsuario(usuario);


        String username =
                usuario.getUsername()
                        .trim()
                        .toLowerCase();


        // -----------------------------------------------------
        // VALIDAR USERNAME DUPLICADO
        // -----------------------------------------------------

        if (usuarioRepository.existsByUsername(username)) {

            throw new ReglaNegocioException(
                    "El nombre de usuario ya se encuentra registrado."
            );
        }


        // -----------------------------------------------------
        // VALIDAR CORREO DUPLICADO
        // -----------------------------------------------------

        if (
                usuario.getCorreo() != null
                        &&
                !usuario.getCorreo().isBlank()
                        &&
                usuarioRepository.existsByCorreo(
                        usuario.getCorreo().trim()
                )
        ) {

            throw new ReglaNegocioException(
                    "El correo ya se encuentra registrado."
            );
        }


        usuario.setId(null);

        usuario.setUsername(username);

        usuario.setNombres(
                usuario.getNombres().trim()
        );

        usuario.setApellidos(
                usuario.getApellidos().trim()
        );


        if (
                usuario.getCorreo() != null
                        &&
                !usuario.getCorreo().isBlank()
        ) {

            usuario.setCorreo(
                    usuario.getCorreo().trim()
            );
        }


        // -----------------------------------------------------
        // CIFRAR CONTRASEÑA CON BCRYPT
        // -----------------------------------------------------

        usuario.setPassword(
                passwordEncoder.encode(
                        usuario.getPassword()
                )
        );


        // Un usuario nuevo comienza activo.
        usuario.setActivo(true);


        return usuarioRepository.save(
                usuario
        );
    }


    // =========================================================
    // VALIDAR DATOS
    // =========================================================

    private void validarUsuario(Usuario usuario) {

        if (usuario == null) {

            throw new ValidacionException(
                    "Los datos del usuario son obligatorios."
            );
        }


        // USERNAME

        if (
                usuario.getUsername() == null
                        ||
                usuario.getUsername().isBlank()
        ) {

            throw new ValidacionException(
                    "El nombre de usuario es obligatorio."
            );
        }


        if (usuario.getUsername().trim().length() < 4) {

            throw new ValidacionException(
                    "El nombre de usuario debe contener al menos 4 caracteres."
            );
        }


        // CONTRASEÑA

        if (
                usuario.getPassword() == null
                        ||
                usuario.getPassword().isBlank()
        ) {

            throw new ValidacionException(
                    "La contraseña es obligatoria."
            );
        }


        if (usuario.getPassword().length() < 8) {

            throw new ValidacionException(
                    "La contraseña debe contener al menos 8 caracteres."
            );
        }


        // NOMBRES

        if (
                usuario.getNombres() == null
                        ||
                usuario.getNombres().isBlank()
        ) {

            throw new ValidacionException(
                    "Los nombres son obligatorios."
            );
        }


        // APELLIDOS

        if (
                usuario.getApellidos() == null
                        ||
                usuario.getApellidos().isBlank()
        ) {

            throw new ValidacionException(
                    "Los apellidos son obligatorios."
            );
        }


        // ROL

        if (usuario.getRol() == null) {

            throw new ValidacionException(
                    "El rol del usuario es obligatorio."
            );
        }


        boolean rolValido =
                usuario.getRol() == Rol.ADMIN
                        ||
                usuario.getRol() == Rol.ANALISTA
                        ||
                usuario.getRol() == Rol.GERENCIA;


        if (!rolValido) {

            throw new ValidacionException(
                    "El rol seleccionado no es válido."
            );
        }
    }
}