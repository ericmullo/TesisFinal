package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.CodigoVerificacion;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.CodigoVerificacionRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CodigoVerificacionService {

    private static final int MINUTOS_EXPIRACION = 5;
    private static final int MAX_INTENTOS = 5;

    private final CodigoVerificacionRepository codigoRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom secureRandom = new SecureRandom();

    public CodigoVerificacionService(
            CodigoVerificacionRepository codigoRepository,
            PasswordEncoder passwordEncoder,
            EmailService emailService
    ) {
        this.codigoRepository = codigoRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    // =========================================================
    // GENERAR Y ENVIAR CÓDIGO
    // =========================================================

    public void generarYEnviarCodigo(Usuario usuario) {

        if (usuario.getCorreo() == null ||
                usuario.getCorreo().isBlank()) {

            throw new IllegalArgumentException(
                    "El usuario no tiene un correo registrado."
            );
        }

        // Invalidar código anterior si todavía existe
        Optional<CodigoVerificacion> codigoAnterior =
                codigoRepository
                        .findFirstByUsuarioIdAndUtilizadoFalseOrderByFechaCreacionDesc(
                                usuario.getId()
                        );

        codigoAnterior.ifPresent(codigo -> {
            codigo.setUtilizado(true);
            codigoRepository.save(codigo);
        });

        // Código entre 000000 y 999999
        int numero = secureRandom.nextInt(1_000_000);

        String codigo = String.format("%06d", numero);

        // Guardamos solamente el hash
        CodigoVerificacion verificacion =
                new CodigoVerificacion();

        verificacion.setUsuario(usuario);
        verificacion.setCodigoHash(
                passwordEncoder.encode(codigo)
        );

        verificacion.setFechaCreacion(
                LocalDateTime.now()
        );

        verificacion.setFechaExpiracion(
                LocalDateTime.now()
                        .plusMinutes(MINUTOS_EXPIRACION)
        );

        verificacion.setIntentos(0);
        verificacion.setUtilizado(false);

        codigoRepository.save(verificacion);

        // El código real únicamente viaja por correo
        String mensaje =
                """
                Hola %s,

                Se solicitó un inicio de sesión en el
                Sistema de Evaluación de Riesgo Crediticio.

                Tu código de verificación es:

                %s

                Este código tiene una vigencia de %d minutos.

                Si no intentaste iniciar sesión, puedes ignorar
                este mensaje.

                Por seguridad, no compartas este código con nadie.

                Sistema de Evaluación de Riesgo Crediticio
                """.formatted(
                        usuario.getNombres(),
                        codigo,
                        MINUTOS_EXPIRACION
                );

        emailService.enviarCorreo(
                usuario.getCorreo(),
                "Código de verificación - Sistema de Riesgo Crediticio",
                mensaje
        );
    }

    // =========================================================
    // VERIFICAR CÓDIGO
    // =========================================================

    public boolean verificarCodigo(
            Usuario usuario,
            String codigoIngresado
    ) {

        if (codigoIngresado == null ||
                !codigoIngresado.matches("\\d{6}")) {

            return false;
        }

        Optional<CodigoVerificacion> resultado =
                codigoRepository
                        .findFirstByUsuarioIdAndUtilizadoFalseOrderByFechaCreacionDesc(
                                usuario.getId()
                        );

        if (resultado.isEmpty()) {
            return false;
        }

        CodigoVerificacion verificacion =
                resultado.get();

        // Ya fue utilizado
        if (Boolean.TRUE.equals(
                verificacion.getUtilizado()
        )) {
            return false;
        }

        // Código expirado
        if (LocalDateTime.now()
                .isAfter(verificacion.getFechaExpiracion())) {

            verificacion.setUtilizado(true);
            codigoRepository.save(verificacion);

            return false;
        }

        // Demasiados intentos
        if (verificacion.getIntentos() >= MAX_INTENTOS) {

            verificacion.setUtilizado(true);
            codigoRepository.save(verificacion);

            return false;
        }

        // Verificar BCrypt
        boolean correcto =
                passwordEncoder.matches(
                        codigoIngresado,
                        verificacion.getCodigoHash()
                );

        if (!correcto) {

            verificacion.setIntentos(
                    verificacion.getIntentos() + 1
            );

            if (verificacion.getIntentos() >= MAX_INTENTOS) {
                verificacion.setUtilizado(true);
            }

            codigoRepository.save(verificacion);

            return false;
        }

        // Código correcto: queda inutilizable
        verificacion.setUtilizado(true);

        codigoRepository.save(verificacion);

        return true;
    }
}