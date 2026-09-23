package com.cooperativa.cooperativaBackend.controller;

import com.cooperativa.cooperativaBackend.model.Documento;
import com.cooperativa.cooperativaBackend.service.DocumentoService;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;


@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    private final DocumentoService documentoService;


    public DocumentoController(
            DocumentoService documentoService
    ) {

        this.documentoService =
                documentoService;

    }


    // =========================================================
    // OBTENER TODOS
    // GET /api/documentos
    // =========================================================

    @GetMapping
    public List<Documento> obtenerDocumentos() {

        return documentoService
                .obtenerDocumentos();

    }


    // =========================================================
    // OBTENER POR ID
    // GET /api/documentos/1
    // =========================================================

    @GetMapping("/{id}")
    public Documento obtenerDocumentoPorId(
            @PathVariable Long id
    ) {

        return documentoService
                .obtenerDocumentoPorId(id);

    }


    // =========================================================
    // OBTENER DOCUMENTOS POR SOLICITUD
    // GET /api/documentos/solicitud/2
    // =========================================================

    @GetMapping("/solicitud/{solicitudId}")
    public List<Documento> obtenerPorSolicitud(
            @PathVariable Long solicitudId
    ) {

        return documentoService
                .obtenerPorSolicitud(
                        solicitudId
                );

    }


    // =========================================================
    // SUBIR DOCUMENTO
    // POST /api/documentos/subir
    // =========================================================

    @PostMapping(
            value = "/subir",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Documento subirDocumento(

            @RequestParam Long solicitudId,

            @RequestParam String tipoDocumento,

            @RequestParam("archivo")
            MultipartFile archivo

    ) {

        return documentoService
                .subirDocumento(
                        solicitudId,
                        tipoDocumento,
                        archivo
                );

    }


    // =========================================================
    // ACTUALIZAR DOCUMENTO
    // PUT /api/documentos/1
    // =========================================================

    @PutMapping("/{id}")
    public Documento actualizarDocumento(

            @PathVariable Long id,

            @RequestBody Documento documento

    ) {

        return documentoService
                .actualizarDocumento(
                        id,
                        documento
                );

    }


    // =========================================================
    // VER / ABRIR ARCHIVO
    // GET /api/documentos/1/archivo
    // =========================================================

    @GetMapping("/{id}/archivo")
    public ResponseEntity<Resource> obtenerArchivo(
            @PathVariable Long id
    ) {

        try {

            // OBTENER INFORMACIÓN DEL DOCUMENTO

            Documento documento =
                    documentoService
                            .obtenerDocumentoPorId(id);


            // OBTENER ARCHIVO FÍSICO

            Path archivo =
                    documentoService
                            .obtenerArchivo(id);


            // CONVERTIRLO EN RESOURCE

            Resource resource =
                    new UrlResource(
                            archivo.toUri()
                    );


            // DEVOLVER ARCHIVO AL NAVEGADOR

            return ResponseEntity
                    .ok()

                    .header(
                            HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" +
                                    documento.getNombreArchivo() +
                                    "\""
                    )

                    .contentType(
                            obtenerTipoContenido(
                                    documento.getNombreArchivo()
                            )
                    )

                    .body(resource);


        } catch (MalformedURLException e) {

            throw new RuntimeException(
                    "No se pudo abrir el archivo",
                    e
            );

        }

    }


    // =========================================================
    // OBTENER TIPO DE CONTENIDO
    // =========================================================

    private MediaType obtenerTipoContenido(
            String nombreArchivo
    ) {

        if (nombreArchivo == null) {

            return MediaType
                    .APPLICATION_OCTET_STREAM;

        }


        String nombre =
                nombreArchivo.toLowerCase();


        if (nombre.endsWith(".pdf")) {

            return MediaType
                    .APPLICATION_PDF;

        }


        if (
                nombre.endsWith(".jpg") ||
                nombre.endsWith(".jpeg")
        ) {

            return MediaType
                    .IMAGE_JPEG;

        }


        if (nombre.endsWith(".png")) {

            return MediaType
                    .IMAGE_PNG;

        }


        return MediaType
                .APPLICATION_OCTET_STREAM;

    }


    // =========================================================
    // ELIMINAR DOCUMENTO
    // DELETE /api/documentos/1
    // =========================================================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarDocumento(
            @PathVariable Long id
    ) {

        documentoService
                .eliminarDocumento(id);


        return ResponseEntity
                .noContent()
                .build();

    }

}