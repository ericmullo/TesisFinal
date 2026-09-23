package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.Documento;
import com.cooperativa.cooperativaBackend.model.Solicitud;
import com.cooperativa.cooperativaBackend.repository.DocumentoRepository;
import com.cooperativa.cooperativaBackend.repository.SolicitudRepository;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class DocumentoService {

    private final DocumentoRepository documentoRepository;
    private final SolicitudRepository solicitudRepository;

    /*
     * Carpeta donde se almacenarán físicamente
     * los documentos.
     */
    private final Path directorioDocumentos =
            Paths.get("uploads", "documentos");


    public DocumentoService(
            DocumentoRepository documentoRepository,
            SolicitudRepository solicitudRepository
    ) {

        this.documentoRepository =
                documentoRepository;

        this.solicitudRepository =
                solicitudRepository;

        try {

            Files.createDirectories(
                    directorioDocumentos
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "No se pudo crear el directorio de documentos",
                    e
            );

        }

    }


    // =========================================================
    // OBTENER TODOS
    // =========================================================

    public List<Documento> obtenerDocumentos() {

        return documentoRepository.findAll();

    }


    // =========================================================
    // OBTENER POR ID
    // =========================================================

    public Documento obtenerDocumentoPorId(Long id) {

        return documentoRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Documento no encontrado"
                        )
                );

    }


    // =========================================================
    // OBTENER POR SOLICITUD
    // =========================================================

    public List<Documento> obtenerPorSolicitud(
            Long solicitudId
    ) {

        return documentoRepository
                .findBySolicitudId(
                        solicitudId
                );

    }


    // =========================================================
    // SUBIR ARCHIVO
    // =========================================================

    public Documento subirDocumento(
            Long solicitudId,
            String tipoDocumento,
            MultipartFile archivo
    ) {

        // -----------------------------------------------------
        // BUSCAR SOLICITUD
        // -----------------------------------------------------

        Solicitud solicitud =
                solicitudRepository
                        .findById(solicitudId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Solicitud no encontrada"
                                )
                        );


        // -----------------------------------------------------
        // VALIDAR ARCHIVO
        // -----------------------------------------------------

        if (
                archivo == null ||
                archivo.isEmpty()
        ) {

            throw new RuntimeException(
                    "Debe seleccionar un archivo"
            );

        }


        // -----------------------------------------------------
        // VALIDAR TIPO DE DOCUMENTO
        // -----------------------------------------------------

        if (
                tipoDocumento == null ||
                tipoDocumento.isBlank()
        ) {

            throw new RuntimeException(
                    "Debe seleccionar el tipo de documento"
            );

        }


        // -----------------------------------------------------
        // VALIDAR EXTENSIÓN
        // -----------------------------------------------------

        String nombreOriginal =
                archivo.getOriginalFilename();


        if (
                nombreOriginal == null ||
                nombreOriginal.isBlank()
        ) {

            throw new RuntimeException(
                    "El archivo no tiene un nombre válido"
            );

        }


        String nombreMinuscula =
                nombreOriginal.toLowerCase();


        boolean extensionPermitida =
                nombreMinuscula.endsWith(".pdf") ||
                nombreMinuscula.endsWith(".jpg") ||
                nombreMinuscula.endsWith(".jpeg") ||
                nombreMinuscula.endsWith(".png");


        if (!extensionPermitida) {

            throw new RuntimeException(
                    "Solo se permiten archivos PDF, JPG, JPEG o PNG"
            );

        }


        // -----------------------------------------------------
        // CREAR NOMBRE ÚNICO
        // -----------------------------------------------------

        String extension =
                obtenerExtension(
                        nombreOriginal
                );


        String nombreGuardado =
                UUID.randomUUID()
                        + extension;


        Path rutaDestino =
                directorioDocumentos
                        .resolve(nombreGuardado)
                        .normalize();


        /*
         * Protección adicional para impedir que una ruta
         * manipulada salga de uploads/documentos.
         */

        Path directorioAbsoluto =
                directorioDocumentos
                        .toAbsolutePath()
                        .normalize();


        Path destinoAbsoluto =
                rutaDestino
                        .toAbsolutePath()
                        .normalize();


        if (
                !destinoAbsoluto.startsWith(
                        directorioAbsoluto
                )
        ) {

            throw new RuntimeException(
                    "Ruta de archivo no válida"
            );

        }


        // -----------------------------------------------------
        // GUARDAR ARCHIVO
        // -----------------------------------------------------

        try {

            Files.copy(
                    archivo.getInputStream(),
                    destinoAbsoluto,
                    StandardCopyOption.REPLACE_EXISTING
            );

        } catch (IOException e) {

            throw new RuntimeException(
                    "No se pudo guardar el archivo",
                    e
            );

        }


        // -----------------------------------------------------
        // GUARDAR INFORMACIÓN EN POSTGRESQL
        // -----------------------------------------------------

        Documento documento =
                new Documento();


        documento.setTipoDocumento(
                tipoDocumento
        );


        documento.setNombreArchivo(
                nombreOriginal
        );


        documento.setRutaArchivo(
                nombreGuardado
        );


        documento.setEstado(
                "Cargado"
        );


        documento.setSolicitud(
                solicitud
        );


        try {

            return documentoRepository
                    .save(documento);

        } catch (RuntimeException e) {

            /*
             * Si PostgreSQL falla, eliminamos el archivo
             * físico para no dejar archivos huérfanos.
             */

            try {

                Files.deleteIfExists(
                        destinoAbsoluto
                );

            } catch (IOException ignored) {
            }


            throw e;

        }

    }


    // =========================================================
    // ACTUALIZAR INFORMACIÓN
    // =========================================================

    public Documento actualizarDocumento(
            Long id,
            Documento datos
    ) {

        Documento documento =
                documentoRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Documento no encontrado"
                                )
                        );


        documento.setTipoDocumento(
                datos.getTipoDocumento()
        );


        documento.setEstado(
                datos.getEstado()
        );


        return documentoRepository
                .save(documento);

    }


    // =========================================================
    // ELIMINAR DOCUMENTO
    // =========================================================

    public void eliminarDocumento(Long id) {

        Documento documento =
                documentoRepository
                        .findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Documento no encontrado"
                                )
                        );


        String rutaArchivo =
                documento.getRutaArchivo();


        documentoRepository.delete(
                documento
        );


        // ELIMINAR ARCHIVO FÍSICO

        if (
                rutaArchivo != null &&
                !rutaArchivo.isBlank()
        ) {

            try {

                Path archivo =
                        directorioDocumentos
                                .resolve(rutaArchivo)
                                .normalize();


                Files.deleteIfExists(
                        archivo
                );

            } catch (IOException e) {

                System.err.println(
                        "No se pudo eliminar el archivo físico: "
                                + e.getMessage()
                );

            }

        }

    }


    // =========================================================
    // OBTENER ARCHIVO FÍSICO
    // =========================================================

    public Path obtenerArchivo(Long id) {

        Documento documento =
                obtenerDocumentoPorId(id);


        if (
                documento.getRutaArchivo() == null ||
                documento.getRutaArchivo().isBlank()
        ) {

            throw new RuntimeException(
                    "El documento no tiene un archivo asociado"
            );

        }


        Path archivo =
                directorioDocumentos
                        .resolve(
                                documento.getRutaArchivo()
                        )
                        .normalize();


        if (!Files.exists(archivo)) {

            throw new RuntimeException(
                    "El archivo físico no existe"
            );

        }


        return archivo;

    }


    // =========================================================
    // EXTENSIÓN
    // =========================================================

    private String obtenerExtension(
            String nombreArchivo
    ) {

        int posicion =
                nombreArchivo.lastIndexOf(".");


        if (
                posicion == -1 ||
                posicion == nombreArchivo.length() - 1
        ) {

            return "";

        }


        return nombreArchivo
                .substring(posicion)
                .toLowerCase();

    }

}