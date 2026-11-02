package com.cooperativa.cooperativaBackend.service;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cooperativa.cooperativaBackend.exception.ValidacionException;
import com.cooperativa.cooperativaBackend.model.Solicitud;
import com.cooperativa.cooperativaBackend.repository.DocumentoRepository;
import com.cooperativa.cooperativaBackend.repository.SolicitudRepository;
import java.nio.file.Path;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import static org.mockito.Mockito.mock;

class DocumentoServiceTest {
    @TempDir
    Path temporal;

    @Test
    void rechazaArchivoConExtensionPdfPeroContenidoDistinto() {
        DocumentoRepository documentos = mock(DocumentoRepository.class);
        SolicitudRepository solicitudes = mock(SolicitudRepository.class);
        when(solicitudes.findById(1L)).thenReturn(Optional.of(new Solicitud()));
        DocumentoService servicio = new DocumentoService(documentos, solicitudes, temporal.toString());
        MockMultipartFile archivo = new MockMultipartFile(
                "archivo", "contrato.pdf", "application/pdf", "contenido falso".getBytes());

        assertThrows(ValidacionException.class,
                () -> servicio.subirDocumento(1L, "Contrato", archivo));
        verify(documentos, never()).save(org.mockito.ArgumentMatchers.any());
    }
}
