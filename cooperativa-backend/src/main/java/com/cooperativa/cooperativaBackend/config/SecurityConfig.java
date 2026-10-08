package com.cooperativa.cooperativaBackend.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final String frontendUrl;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            @Value("${FRONTEND_URL:http://localhost:5173}") String frontendUrl
    ) {
        this.jwtAuthenticationFilter =
                jwtAuthenticationFilter;

        this.frontendUrl =
                frontendUrl;
    }


    // =========================================================
    // SECURITY FILTER CHAIN
    // =========================================================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http
    ) throws Exception {

        http

                // =================================================
                // CORS
                // =================================================

                .cors(cors -> {})


                // =================================================
                // CSRF
                // =================================================

                .csrf(csrf ->
                        csrf.disable()
                )


                // =================================================
                // JWT - SIN SESIONES DE SPRING
                // =================================================

                .sessionManagement(session ->
                        session.sessionCreationPolicy(
                                SessionCreationPolicy.STATELESS
                        )
                )


                // =================================================
                // AUTORIZACIÓN
                // =================================================

                .authorizeHttpRequests(auth -> auth


                        // ---------------------------------------------
                        // PREFLIGHT CORS
                        // ---------------------------------------------

                        .requestMatchers(
                                HttpMethod.OPTIONS,
                                "/**"
                        )
                        .permitAll()


                        // ---------------------------------------------
                        // AUTENTICACIÓN
                        // LOGIN + VERIFICACIÓN 2FA + REENVÍO
                        // ---------------------------------------------

                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/verificar-codigo",
                                "/api/auth/reenviar-codigo"
                        )
                        .permitAll()


                        // ---------------------------------------------
                        // CAMBIAR MI PROPIA CONTRASEÑA
                        // ---------------------------------------------

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/usuarios/mi-password"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA",
                                "GERENCIA"
                        )


                        // =============================================
                        // USUARIOS
                        // SOLO ADMIN
                        // =============================================

                        .requestMatchers(
                                "/api/usuarios/**"
                        )
                        .hasRole("ADMIN")


                        // =============================================
                        // DECISIÓN FINAL
                        // ADMIN + ANALISTA
                        // =============================================

                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/solicitudes/*/aprobar",
                                "/api/solicitudes/*/rechazar"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // =============================================
                        // CLIENTES
                        // =============================================

                        // Crear
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/clientes/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Modificar
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/clientes/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Eliminar
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/clientes/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Consultar
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/clientes/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA",
                                "GERENCIA"
                        )


                        // =============================================
                        // SOLICITUDES
                        // =============================================

                        // Crear
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/solicitudes/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Modificar
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/solicitudes/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Eliminar
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/solicitudes/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Consultar
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/solicitudes/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA",
                                "GERENCIA"
                        )


                        // =============================================
                        // DOCUMENTOS
                        // =============================================

                        // Subir
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/documentos/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Modificar
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/documentos/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Eliminar
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/documentos/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Consultar
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/documentos/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA",
                                "GERENCIA"
                        )


                        // =============================================
                        // EVALUACIONES DE RIESGO
                        // =============================================

                        // Ejecutar evaluación IA
                        .requestMatchers(
                                HttpMethod.POST,
                                "/api/evaluaciones/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Modificar
                        .requestMatchers(
                                HttpMethod.PUT,
                                "/api/evaluaciones/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Eliminar
                        .requestMatchers(
                                HttpMethod.DELETE,
                                "/api/evaluaciones/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA"
                        )


                        // Consultar
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/evaluaciones/**"
                        )
                        .hasAnyRole(
                                "ADMIN",
                                "ANALISTA",
                                "GERENCIA"
                        )


                        // =============================================
                        // CUALQUIER OTRA API
                        // =============================================

                        .anyRequest()
                        .authenticated()
                )


                // =================================================
                // LOGIN TRADICIONAL DESACTIVADO
                // =================================================

                .formLogin(form ->
                        form.disable()
                )


                // =================================================
                // HTTP BASIC DESACTIVADO
                // =================================================

                .httpBasic(basic ->
                        basic.disable()
                )


                // =================================================
                // FILTRO JWT
                // =================================================

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );


        return http.build();
    }


    // =========================================================
    // PASSWORD ENCODER
    // =========================================================

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }


    // =========================================================
    // CORS
    // =========================================================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config =
                new CorsConfiguration();


        config.setAllowedOrigins(
        List.of(
                "http://localhost:5173",
                frontendUrl
        )
);


        config.setAllowedMethods(
                List.of(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "PATCH",
                        "OPTIONS"
                )
        );


        config.setAllowedHeaders(
                List.of("*")
        );


        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();


        source.registerCorsConfiguration(
                "/**",
                config
        );


        return source;
    }
}