package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.Usuario;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;

import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expiration;


    public JwtService(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expiration
    ) {

        this.secretKey = Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expiration = expiration;
    }


    // =========================================================
    // GENERAR TOKEN
    // =========================================================

    public String generarToken(Usuario usuario) {

        Date ahora = new Date();

        Date fechaExpiracion =
                new Date(
                        ahora.getTime() + expiration
                );


        return Jwts.builder()

                // Usuario propietario del token
                .subject(
                        usuario.getUsername()
                )

                // Información adicional
                .claim(
                        "usuarioId",
                        usuario.getId()
                )

                .claim(
                        "rol",
                        usuario.getRol().name()
                )

                .claim(
                        "nombres",
                        usuario.getNombres()
                )

                .claim(
                        "apellidos",
                        usuario.getApellidos()
                )

                // Fecha creación
                .issuedAt(ahora)

                // Fecha expiración
                .expiration(fechaExpiracion)

                // Firma
                .signWith(secretKey)

                .compact();
    }


    // =========================================================
    // OBTENER USERNAME DEL TOKEN
    // =========================================================

    public String obtenerUsername(
            String token
    ) {

        return obtenerClaim(
                token,
                Claims::getSubject
        );
    }


    // =========================================================
    // OBTENER ROL
    // =========================================================

    public String obtenerRol(
            String token
    ) {

        Claims claims =
                obtenerTodosLosClaims(token);

        return claims.get(
                "rol",
                String.class
        );
    }


    // =========================================================
    // VALIDAR TOKEN
    // =========================================================

    public boolean esTokenValido(
            String token,
            Usuario usuario
    ) {

        String username =
                obtenerUsername(token);


        return username.equals(
                usuario.getUsername()
        )
                &&
                !estaExpirado(token);
    }


    // =========================================================
    // COMPROBAR EXPIRACIÓN
    // =========================================================

    private boolean estaExpirado(
            String token
    ) {

        Date expiracion =
                obtenerClaim(
                        token,
                        Claims::getExpiration
                );

        return expiracion.before(
                new Date()
        );
    }


    // =========================================================
    // OBTENER UN CLAIM
    // =========================================================

    private <T> T obtenerClaim(
            String token,
            Function<Claims, T> resolver
    ) {

        Claims claims =
                obtenerTodosLosClaims(token);

        return resolver.apply(claims);
    }


    // =========================================================
    // LEER TOKEN Y VERIFICAR FIRMA
    // =========================================================

    private Claims obtenerTodosLosClaims(
            String token
    ) {

        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}