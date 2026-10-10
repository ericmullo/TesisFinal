package com.cooperativa.cooperativaBackend.config;

import com.cooperativa.cooperativaBackend.model.Rol;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.UsuarioRepository;
import com.cooperativa.cooperativaBackend.service.UsuarioService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrap implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    @Value("${BOOTSTRAP_ADMIN_USERNAME:}")
    private String username;

    @Value("${BOOTSTRAP_ADMIN_PASSWORD:}")
    private String password;

    @Value("${BOOTSTRAP_ADMIN_EMAIL:}")
    private String correo;

    @Value("${BOOTSTRAP_ADMIN_NOMBRES:Administrador}")
    private String nombres;

    @Value("${BOOTSTRAP_ADMIN_APELLIDOS:Sistema}")
    private String apellidos;

    public AdminBootstrap(
            UsuarioRepository usuarioRepository,
            UsuarioService usuarioService
    ) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    @Override
    public void run(String... args) {

        if (
                username == null || username.isBlank()
                || password == null || password.isBlank()
                || correo == null || correo.isBlank()
        ) {
            return;
        }

        String usernameNormalizado =
                username.trim().toLowerCase();

        if (
                usuarioRepository.existsByUsername(
                        usernameNormalizado
                )
        ) {
            System.out.println(
                    "ADMIN inicial ya existe. Bootstrap omitido."
            );
            return;
        }

        Usuario administrador =
                new Usuario();

        administrador.setUsername(
                usernameNormalizado
        );

        administrador.setPassword(
                password
        );

        administrador.setNombres(
                nombres.trim()
        );

        administrador.setApellidos(
                apellidos.trim()
        );

        administrador.setCorreo(
                correo.trim().toLowerCase()
        );

        administrador.setRol(
                Rol.ADMIN
        );

        administrador.setActivo(true);

        usuarioService.crearUsuario(
                administrador
        );

        System.out.println(
                "ADMIN inicial creado correctamente."
        );
    }
}