package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.exception.CredencialesInvalidasException;
import com.cooperativa.cooperativaBackend.exception.RecursoNoEncontradoException;
import com.cooperativa.cooperativaBackend.exception.ReglaNegocioException;
import com.cooperativa.cooperativaBackend.exception.ValidacionException;
import com.cooperativa.cooperativaBackend.model.Rol;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.UsuarioRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Pattern;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    // =========================================================
    // EXPRESIÓN REGULAR PARA VALIDAR CORREO
    // =========================================================

    private static final Pattern PATRON_CORREO =
            Pattern.compile(
                    "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$"
            );


    // =========================================================
    // CONSTRUCTOR
    // =========================================================

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

        return usuarioRepository
                .findById(id)
                .orElseThrow(
                        () -> new RecursoNoEncontradoException(
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
                .orElseThrow(
                        () -> new RecursoNoEncontradoException(
                                "Usuario no encontrado."
                        )
                );
    }


    // =========================================================
    // CREAR USUARIO
    // =========================================================

    public Usuario crearUsuario(Usuario usuario) {

        validarUsuario(usuario);


        // -----------------------------------------------------
        // NORMALIZAR USERNAME
        // -----------------------------------------------------

        String username =
                usuario
                        .getUsername()
                        .trim()
                        .toLowerCase();


        // -----------------------------------------------------
        // NORMALIZAR CORREO
        // -----------------------------------------------------

        String correo =
                usuario
                        .getCorreo()
                        .trim()
                        .toLowerCase();


        // -----------------------------------------------------
        // VALIDAR USERNAME DUPLICADO
        // -----------------------------------------------------

        if (
                usuarioRepository.existsByUsername(
                        username
                )
        ) {

            throw new ReglaNegocioException(
                    "El nombre de usuario ya se encuentra registrado."
            );
        }


        // -----------------------------------------------------
        // VALIDAR CORREO DUPLICADO
        // -----------------------------------------------------

        if (
                usuarioRepository.existsByCorreo(
                        correo
                )
        ) {

            throw new ReglaNegocioException(
                    "El correo ya se encuentra registrado."
            );
        }


        // -----------------------------------------------------
        // PREPARAR DATOS
        // -----------------------------------------------------

        usuario.setId(null);

        usuario.setUsername(
                username
        );

        usuario.setNombres(
                usuario
                        .getNombres()
                        .trim()
        );

        usuario.setApellidos(
                usuario
                        .getApellidos()
                        .trim()
        );

        usuario.setCorreo(
                correo
        );


        // -----------------------------------------------------
        // CIFRAR CONTRASEÑA CON BCRYPT
        // -----------------------------------------------------

        usuario.setPassword(
                passwordEncoder.encode(
                        usuario.getPassword()
                )
        );


        // -----------------------------------------------------
        // USUARIO NUEVO ACTIVO
        // -----------------------------------------------------

        usuario.setActivo(true);


        return usuarioRepository.save(
                usuario
        );
    }


    // =========================================================
    // ACTUALIZAR USUARIO
    // =========================================================

    public Usuario actualizarUsuario(
            Long id,
            Usuario datosActualizados,
            String usernameAutenticado
    ) {

        Usuario usuario =
                obtenerUsuarioPorId(id);


        // -----------------------------------------------------
        // VALIDAR NOMBRES
        // -----------------------------------------------------

        if (
                datosActualizados.getNombres() == null
                        ||
                datosActualizados.getNombres().isBlank()
        ) {

            throw new ValidacionException(
                    "Los nombres son obligatorios."
            );
        }


        // -----------------------------------------------------
        // VALIDAR APELLIDOS
        // -----------------------------------------------------

        if (
                datosActualizados.getApellidos() == null
                        ||
                datosActualizados.getApellidos().isBlank()
        ) {

            throw new ValidacionException(
                    "Los apellidos son obligatorios."
            );
        }


        // -----------------------------------------------------
        // VALIDAR CORREO OBLIGATORIO
        // -----------------------------------------------------

        validarCorreo(
                datosActualizados.getCorreo()
        );


        String correoNuevo =
                datosActualizados
                        .getCorreo()
                        .trim()
                        .toLowerCase();


        // -----------------------------------------------------
        // VALIDAR ROL
        // -----------------------------------------------------

        if (
                datosActualizados.getRol() == null
        ) {

            throw new ValidacionException(
                    "El rol del usuario es obligatorio."
            );
        }


        boolean rolValido =
                datosActualizados.getRol() == Rol.ADMIN
                        ||
                datosActualizados.getRol() == Rol.ANALISTA
                        ||
                datosActualizados.getRol() == Rol.GERENCIA;


        if (!rolValido) {

            throw new ValidacionException(
                    "El rol seleccionado no es válido."
            );
        }


        // -----------------------------------------------------
        // SABER SI ESTÁ EDITANDO SU PROPIA CUENTA
        // -----------------------------------------------------

        boolean esUsuarioActual =
                usernameAutenticado != null
                        &&
                usuario
                        .getUsername()
                        .equalsIgnoreCase(
                                usernameAutenticado
                        );


        // -----------------------------------------------------
        // EVITAR QUE ADMIN CAMBIE SU PROPIO ROL
        // -----------------------------------------------------

        if (
                esUsuarioActual
                        &&
                usuario.getRol() == Rol.ADMIN
                        &&
                datosActualizados.getRol() != Rol.ADMIN
        ) {

            throw new ReglaNegocioException(
                    "No puedes cambiar tu propio rol de administrador."
            );
        }


        // -----------------------------------------------------
        // VALIDAR CORREO DUPLICADO
        // -----------------------------------------------------

        boolean correoCambio =
                usuario.getCorreo() == null
                        ||
                !usuario
                        .getCorreo()
                        .equalsIgnoreCase(
                                correoNuevo
                        );


        if (
                correoCambio
                        &&
                usuarioRepository.existsByCorreo(
                        correoNuevo
                )
        ) {

            throw new ReglaNegocioException(
                    "El correo ya se encuentra registrado."
            );
        }


        // -----------------------------------------------------
        // ACTUALIZAR CAMPOS PERMITIDOS
        // -----------------------------------------------------

        usuario.setNombres(
                datosActualizados
                        .getNombres()
                        .trim()
        );

        usuario.setApellidos(
                datosActualizados
                        .getApellidos()
                        .trim()
        );

        usuario.setCorreo(
                correoNuevo
        );

        usuario.setRol(
                datosActualizados.getRol()
        );


        /*
         * IMPORTANTE:
         *
         * Aquí NO modificamos:
         *
         * - username
         * - password
         * - activo
         * - fechaCreacion
         */


        return usuarioRepository.save(
                usuario
        );
    }


    // =========================================================
    // RESTABLECER CONTRASEÑA DE OTRO USUARIO
    // =========================================================

    public void restablecerPassword(
            Long id,
            String nuevaPassword,
            String usernameAutenticado
    ) {

        Usuario usuario =
                obtenerUsuarioPorId(id);


        // -----------------------------------------------------
        // EVITAR RESTABLECER LA PROPIA CONTRASEÑA
        // DESDE ADMINISTRACIÓN DE USUARIOS
        // -----------------------------------------------------

        if (
                usernameAutenticado != null
                        &&
                usuario
                        .getUsername()
                        .equalsIgnoreCase(
                                usernameAutenticado
                        )
        ) {

            throw new ReglaNegocioException(
                    "No puedes restablecer tu propia contraseña desde la administración de usuarios."
            );
        }


        // -----------------------------------------------------
        // VALIDAR NUEVA CONTRASEÑA
        // -----------------------------------------------------

        if (
                nuevaPassword == null
                        ||
                nuevaPassword.isBlank()
        ) {

            throw new ValidacionException(
                    "La nueva contraseña es obligatoria."
            );
        }


        if (
                nuevaPassword.length() < 8
        ) {

            throw new ValidacionException(
                    "La nueva contraseña debe contener al menos 8 caracteres."
            );
        }


        // -----------------------------------------------------
        // CIFRAR NUEVA CONTRASEÑA
        // -----------------------------------------------------

        usuario.setPassword(
                passwordEncoder.encode(
                        nuevaPassword
                )
        );


        usuarioRepository.save(
                usuario
        );
    }


    // =========================================================
    // CAMBIAR MI CONTRASEÑA
    // =========================================================

    public void cambiarMiPassword(
            String usernameAutenticado,
            String passwordActual,
            String nuevaPassword
    ) {

        // -----------------------------------------------------
        // OBTENER USUARIO AUTENTICADO
        // -----------------------------------------------------

        Usuario usuario =
                usuarioRepository
                        .findByUsername(
                                usernameAutenticado
                        )
                        .orElseThrow(
                                () ->
                                        new RecursoNoEncontradoException(
                                                "Usuario no encontrado."
                                        )
                        );


        // -----------------------------------------------------
        // VALIDAR CONTRASEÑA ACTUAL
        // -----------------------------------------------------

        if (
                passwordActual == null
                        ||
                passwordActual.isBlank()
        ) {

            throw new ValidacionException(
                    "La contraseña actual es obligatoria."
            );
        }


        if (
                !passwordEncoder.matches(
                        passwordActual,
                        usuario.getPassword()
                )
        ) {

            throw new CredencialesInvalidasException(
                    "La contraseña actual es incorrecta."
            );
        }


        // -----------------------------------------------------
        // VALIDAR NUEVA CONTRASEÑA
        // -----------------------------------------------------

        if (
                nuevaPassword == null
                        ||
                nuevaPassword.isBlank()
        ) {

            throw new ValidacionException(
                    "La nueva contraseña es obligatoria."
            );
        }


        if (
                nuevaPassword.length() < 8
        ) {

            throw new ValidacionException(
                    "La nueva contraseña debe contener al menos 8 caracteres."
            );
        }


        // -----------------------------------------------------
        // EVITAR USAR LA MISMA CONTRASEÑA
        // -----------------------------------------------------

        if (
                passwordEncoder.matches(
                        nuevaPassword,
                        usuario.getPassword()
                )
        ) {

            throw new ReglaNegocioException(
                    "La nueva contraseña debe ser diferente a la contraseña actual."
            );
        }


        // -----------------------------------------------------
        // CIFRAR NUEVA CONTRASEÑA
        // -----------------------------------------------------

        usuario.setPassword(
                passwordEncoder.encode(
                        nuevaPassword
                )
        );


        // -----------------------------------------------------
        // GUARDAR
        // -----------------------------------------------------

        usuarioRepository.save(
                usuario
        );
    }


    // =========================================================
    // ACTIVAR USUARIO
    // =========================================================

    public Usuario activarUsuario(Long id) {

        Usuario usuario =
                obtenerUsuarioPorId(id);


        if (
                Boolean.TRUE.equals(
                        usuario.getActivo()
                )
        ) {

            throw new ReglaNegocioException(
                    "El usuario ya se encuentra activo."
            );
        }


        usuario.setActivo(true);


        return usuarioRepository.save(
                usuario
        );
    }


    // =========================================================
    // DESACTIVAR USUARIO
    // =========================================================

    public Usuario desactivarUsuario(
            Long id,
            String usernameAutenticado
    ) {

        Usuario usuario =
                obtenerUsuarioPorId(id);


        // -----------------------------------------------------
        // EVITAR QUE EL USUARIO SE DESACTIVE A SÍ MISMO
        // -----------------------------------------------------

        if (
                usernameAutenticado != null
                        &&
                usuario
                        .getUsername()
                        .equalsIgnoreCase(
                                usernameAutenticado
                        )
        ) {

            throw new ReglaNegocioException(
                    "No puedes desactivar tu propia cuenta mientras tienes la sesión iniciada."
            );
        }


        if (
                Boolean.FALSE.equals(
                        usuario.getActivo()
                )
        ) {

            throw new ReglaNegocioException(
                    "El usuario ya se encuentra inactivo."
            );
        }


        usuario.setActivo(false);


        return usuarioRepository.save(
                usuario
        );
    }


    // =========================================================
    // VALIDAR DATOS DE NUEVO USUARIO
    // =========================================================

    private void validarUsuario(
            Usuario usuario
    ) {

        // -----------------------------------------------------
        // OBJETO
        // -----------------------------------------------------

        if (
                usuario == null
        ) {

            throw new ValidacionException(
                    "Los datos del usuario son obligatorios."
            );
        }


        // -----------------------------------------------------
        // USERNAME
        // -----------------------------------------------------

        if (
                usuario.getUsername() == null
                        ||
                usuario.getUsername().isBlank()
        ) {

            throw new ValidacionException(
                    "El nombre de usuario es obligatorio."
            );
        }


        if (
                usuario
                        .getUsername()
                        .trim()
                        .length() < 4
        ) {

            throw new ValidacionException(
                    "El nombre de usuario debe contener al menos 4 caracteres."
            );
        }


        // -----------------------------------------------------
        // CONTRASEÑA
        // -----------------------------------------------------

        if (
                usuario.getPassword() == null
                        ||
                usuario.getPassword().isBlank()
        ) {

            throw new ValidacionException(
                    "La contraseña es obligatoria."
            );
        }


        if (
                usuario
                        .getPassword()
                        .length() < 8
        ) {

            throw new ValidacionException(
                    "La contraseña debe contener al menos 8 caracteres."
            );
        }


        // -----------------------------------------------------
        // NOMBRES
        // -----------------------------------------------------

        if (
                usuario.getNombres() == null
                        ||
                usuario.getNombres().isBlank()
        ) {

            throw new ValidacionException(
                    "Los nombres son obligatorios."
            );
        }


        // -----------------------------------------------------
        // APELLIDOS
        // -----------------------------------------------------

        if (
                usuario.getApellidos() == null
                        ||
                usuario.getApellidos().isBlank()
        ) {

            throw new ValidacionException(
                    "Los apellidos son obligatorios."
            );
        }


        // -----------------------------------------------------
        // CORREO OBLIGATORIO PARA 2FA
        // -----------------------------------------------------

        validarCorreo(
                usuario.getCorreo()
        );


        // -----------------------------------------------------
        // ROL
        // -----------------------------------------------------

        if (
                usuario.getRol() == null
        ) {

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


    // =========================================================
    // VALIDAR CORREO
    // =========================================================

    private void validarCorreo(
            String correo
    ) {

        if (
                correo == null
                        ||
                correo.isBlank()
        ) {

            throw new ValidacionException(
                    "El correo electrónico es obligatorio para la verificación en dos pasos."
            );
        }


        String correoNormalizado =
                correo.trim();


        if (
                !PATRON_CORREO
                        .matcher(correoNormalizado)
                        .matches()
        ) {

            throw new ValidacionException(
                    "Ingresa un correo electrónico válido."
            );
        }
    }
}