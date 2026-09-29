package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.exception.ReglaNegocioException;
import com.cooperativa.cooperativaBackend.model.CodigoVerificacion;
import com.cooperativa.cooperativaBackend.model.Usuario;
import com.cooperativa.cooperativaBackend.repository.CodigoVerificacionRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class CodigoVerificacionService {

    private static final int MINUTOS_EXPIRACION = 5;
    private static final int MAX_INTENTOS = 5;
    private static final int SEGUNDOS_REENVIO = 60;

    private final CodigoVerificacionRepository codigoRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    private final SecureRandom secureRandom =
            new SecureRandom();


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
    // GENERAR CÓDIGO INICIAL
    // =========================================================

    public void generarYEnviarCodigo(
            Usuario usuario
    ) {

        validarCorreoUsuario(usuario);

        invalidarCodigoAnterior(usuario);

        crearYEnviarCodigo(usuario);
    }


    // =========================================================
    // REENVIAR CÓDIGO
    // =========================================================

    public void reenviarCodigo(
            Usuario usuario
    ) {

        validarCorreoUsuario(usuario);


        Optional<CodigoVerificacion> ultimoCodigo =
                codigoRepository
                        .findFirstByUsuarioIdAndUtilizadoFalseOrderByFechaCreacionDesc(
                                usuario.getId()
                        );


        // -----------------------------------------------------
        // COOLDOWN DE 60 SEGUNDOS
        // -----------------------------------------------------

        if (ultimoCodigo.isPresent()) {

            CodigoVerificacion codigoAnterior =
                    ultimoCodigo.get();


            long segundosTranscurridos =
                    Duration.between(
                            codigoAnterior.getFechaCreacion(),
                            LocalDateTime.now()
                    ).getSeconds();


            if (
                    segundosTranscurridos
                            < SEGUNDOS_REENVIO
            ) {

                long segundosRestantes =
                        SEGUNDOS_REENVIO
                                - segundosTranscurridos;


                throw new ReglaNegocioException(
                        "Espera "
                                + segundosRestantes
                                + " segundos antes de solicitar otro código."
                );
            }


            // El código anterior deja de ser válido.

            codigoAnterior.setUtilizado(true);

            codigoRepository.save(
                    codigoAnterior
            );
        }


        crearYEnviarCodigo(usuario);
    }


    // =========================================================
    // CREAR Y ENVIAR CÓDIGO
    // =========================================================

    private void crearYEnviarCodigo(
            Usuario usuario
    ) {

        // -----------------------------------------------------
        // GENERAR CÓDIGO DE 6 DÍGITOS
        // -----------------------------------------------------

        int numero =
                secureRandom.nextInt(
                        1_000_000
                );


        String codigo =
                String.format(
                        "%06d",
                        numero
                );


        // -----------------------------------------------------
        // GUARDAR HASH DEL CÓDIGO
        // -----------------------------------------------------

        CodigoVerificacion verificacion =
                new CodigoVerificacion();


        verificacion.setUsuario(
                usuario
        );


        verificacion.setCodigoHash(
                passwordEncoder.encode(
                        codigo
                )
        );


        verificacion.setFechaCreacion(
                LocalDateTime.now()
        );


        verificacion.setFechaExpiracion(
                LocalDateTime.now()
                        .plusMinutes(
                                MINUTOS_EXPIRACION
                        )
        );


        verificacion.setIntentos(0);

        verificacion.setUtilizado(false);


        codigoRepository.save(
                verificacion
        );


        // -----------------------------------------------------
        // PREPARAR CORREO
        // -----------------------------------------------------

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


        try {

            emailService.enviarCorreo(
                    usuario.getCorreo(),
                    "Código de verificación - Sistema de Riesgo Crediticio",
                    mensaje
            );

        } catch (Exception exception) {

            // Si el correo no pudo enviarse,
            // invalidamos el código que acabamos de guardar.

            verificacion.setUtilizado(true);

            codigoRepository.save(
                    verificacion
            );


            throw new ReglaNegocioException(
                    "No se pudo enviar el código de verificación. Intenta nuevamente."
            );
        }
    }


    // =========================================================
    // INVALIDAR CÓDIGO ANTERIOR
    // =========================================================

    private void invalidarCodigoAnterior(
            Usuario usuario
    ) {

        Optional<CodigoVerificacion> codigoAnterior =
                codigoRepository
                        .findFirstByUsuarioIdAndUtilizadoFalseOrderByFechaCreacionDesc(
                                usuario.getId()
                        );


        codigoAnterior.ifPresent(
                codigo -> {

                    codigo.setUtilizado(true);

                    codigoRepository.save(
                            codigo
                    );
                }
        );
    }


    // =========================================================
    // VALIDAR CÓDIGO
    // =========================================================

    public boolean verificarCodigo(
            Usuario usuario,
            String codigoIngresado
    ) {

        if (
                codigoIngresado == null
                        ||
                !codigoIngresado.matches("\\d{6}")
        ) {

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


        // -----------------------------------------------------
        // YA UTILIZADO
        // -----------------------------------------------------

        if (
                Boolean.TRUE.equals(
                        verificacion.getUtilizado()
                )
        ) {

            return false;
        }


        // -----------------------------------------------------
        // EXPIRADO
        // -----------------------------------------------------

        if (
                LocalDateTime.now()
                        .isAfter(
                                verificacion.getFechaExpiracion()
                        )
        ) {

            verificacion.setUtilizado(true);

            codigoRepository.save(
                    verificacion
            );

            return false;
        }


        // -----------------------------------------------------
        // MÁXIMO DE INTENTOS
        // -----------------------------------------------------

        if (
                verificacion.getIntentos()
                        >= MAX_INTENTOS
        ) {

            verificacion.setUtilizado(true);

            codigoRepository.save(
                    verificacion
            );

            return false;
        }


        // -----------------------------------------------------
        // COMPROBAR HASH
        // -----------------------------------------------------

        boolean correcto =
                passwordEncoder.matches(
                        codigoIngresado,
                        verificacion.getCodigoHash()
                );


        // -----------------------------------------------------
        // CÓDIGO INCORRECTO
        // -----------------------------------------------------

        if (!correcto) {

            verificacion.setIntentos(
                    verificacion.getIntentos() + 1
            );


            if (
                    verificacion.getIntentos()
                            >= MAX_INTENTOS
            ) {

                verificacion.setUtilizado(true);
            }


            codigoRepository.save(
                    verificacion
            );


            return false;
        }


        // -----------------------------------------------------
        // CÓDIGO CORRECTO
        // -----------------------------------------------------

        verificacion.setUtilizado(true);

        codigoRepository.save(
                verificacion
        );


        return true;
    }


    // =========================================================
    // VALIDAR CORREO
    // =========================================================

    private void validarCorreoUsuario(
            Usuario usuario
    ) {

        if (
                usuario == null
                        ||
                usuario.getCorreo() == null
                        ||
                usuario.getCorreo().isBlank()
        ) {

            throw new ReglaNegocioException(
                    "El usuario no tiene un correo electrónico registrado."
            );
        }
    }
}