package com.cooperativa.cooperativaBackend.config;

import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.UsuarioRepository;
import com.cooperativa.cooperativaBackend.service.JwtService;

import io.jsonwebtoken.JwtException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter
        extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;


    public JwtAuthenticationFilter(
            JwtService jwtService,
            UsuarioRepository usuarioRepository
    ) {
        this.jwtService = jwtService;
        this.usuarioRepository = usuarioRepository;
    }


    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");


        // =====================================================
        // NO HAY TOKEN
        // =====================================================

        if (
                authorizationHeader == null
                        ||
                !authorizationHeader.startsWith("Bearer ")
        ) {

            filterChain.doFilter(
                    request,
                    response
            );

            return;
        }


        // =====================================================
        // EXTRAER TOKEN
        // =====================================================

        String token =
                authorizationHeader.substring(7);


        try {

            String username =
                    jwtService.obtenerUsername(token);


            // Si todavía no existe autenticación en Spring
            if (
                    username != null
                            &&
                    SecurityContextHolder
                            .getContext()
                            .getAuthentication() == null
            ) {

                Usuario usuario =
                        usuarioRepository
                                .findByUsername(username)
                                .orElse(null);


                // =============================================
                // VALIDAR USUARIO Y TOKEN
                // =============================================

                if (
                        usuario != null
                                &&
                        Boolean.TRUE.equals(
                                usuario.getActivo()
                        )
                                &&
                        jwtService.esTokenValido(
                                token,
                                usuario
                        )
                ) {

                    // ROLE_ADMIN
                    // ROLE_ANALISTA
                    // ROLE_GERENCIA

                    SimpleGrantedAuthority authority =
                            new SimpleGrantedAuthority(
                                    "ROLE_"
                                            + usuario
                                                .getRol()
                                                .name()
                            );


                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    usuario.getUsername(),
                                    null,
                                    List.of(authority)
                            );


                    SecurityContextHolder
                            .getContext()
                            .setAuthentication(
                                    authentication
                            );
                }
            }

        } catch (JwtException | IllegalArgumentException exception) {

            // Token inválido, alterado o expirado.
            //
            // No autenticamos al usuario.
            // SecurityConfig decidirá si el endpoint
            // permite o rechaza la petición.

            SecurityContextHolder.clearContext();
        }


        filterChain.doFilter(
                request,
                response
        );
    }
}