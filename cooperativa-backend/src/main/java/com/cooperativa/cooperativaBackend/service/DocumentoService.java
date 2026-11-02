package com.cooperativa.cooperativaBackend.service;

import com.cooperativa.cooperativaBackend.model.Documento;
import com.cooperativa.cooperativaBackend.model.Solicitud;
import com.cooperativa.cooperativaBackend.exception.ValidacionException;
import com.cooperativa.cooperativaBackend.repository.DocumentoRepository;
import com.cooperativa.cooperativaBackend.repository.SolicitudRepository;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
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
    private final Path directorioDocumentos;


    public DocumentoService(
            DocumentoRepository documentoRepository,
            SolicitudRepository solicitudRepository,
            @Value("${DOCUMENTS_DIR:uploads/documentos}") String documentsDir
    ) {

        this.documentoRepository =
                documentoRepository;

        this.solicitudRepository =
                solicitudRepository;

        this.directorioDocumentos = Paths.get(documentsDir).toAbsolutePath().normalize();

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

        validarContenido(archivo, extension);


        String nombreGuardado =
                UUID.randomUUID()
                        + extension;


        Path rutaDestino = resolverRutaSegura(nombreGuardado);


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

                Path archivo = resolverRutaSegura(rutaArchivo);


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


        Path archivo = resolverRutaSegura(documento.getRutaArchivo());


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

    private Path resolverRutaSegura(String nombreArchivo) {
        Path ruta = directorioDocumentos.resolve(nombreArchivo).normalize();
        if (!ruta.startsWith(directorioDocumentos)) {
            throw new ValidacionException("Ruta de documento no válida.");
        }
        return ruta;
    }

    private void validarContenido(MultipartFile archivo, String extension) {
        byte[] cabecera;
        try (InputStream entrada = archivo.getInputStream()) {
            cabecera = entrada.readNBytes(8);
        } catch (IOException exception) {
            throw new ValidacionException("No se pudo leer el documento.");
        }

        boolean pdf = cabecera.length >= 5 && cabecera[0] == '%'
                && cabecera[1] == 'P' && cabecera[2] == 'D'
                && cabecera[3] == 'F' && cabecera[4] == '-';
        boolean jpeg = cabecera.length >= 3 && (cabecera[0] & 0xff) == 0xff
                && (cabecera[1] & 0xff) == 0xd8 && (cabecera[2] & 0xff) == 0xff;
        boolean png = cabecera.length >= 8 && (cabecera[0] & 0xff) == 0x89
                && cabecera[1] == 'P' && cabecera[2] == 'N' && cabecera[3] == 'G'
                && (cabecera[4] & 0xff) == 0x0d && (cabecera[5] & 0xff) == 0x0a
                && (cabecera[6] & 0xff) == 0x1a && (cabecera[7] & 0xff) == 0x0a;
        if (!(".pdf".equals(extension) && pdf)
                && !((".jpg".equals(extension) || ".jpeg".equals(extension)) && jpeg)
                && !(".png".equals(extension) && png)) {
            throw new ValidacionException("El contenido no coincide con el tipo de archivo permitido.");
        }
    }

}
