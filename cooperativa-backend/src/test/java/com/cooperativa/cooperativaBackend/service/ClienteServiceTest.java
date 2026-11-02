package com.cooperativa.cooperativaBackend.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.cooperativa.cooperativaBackend.exception.ReglaNegocioException;
import com.cooperativa.cooperativaBackend.exception.ValidacionException;
import com.cooperativa.cooperativaBackend.model.Cliente;
import com.cooperativa.cooperativaBackend.repository.ClienteRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

class ClienteServiceTest {
    @Mock
    private ClienteRepository repositorio;
    private ClienteService servicio;

    @BeforeEach
    void preparar() {
        MockitoAnnotations.openMocks(this);
        servicio = new ClienteService(repositorio);
    }

    @Test
    void rechazaCedulaMalFormadaAntesDeGuardar() {
        Cliente cliente = new Cliente();
        cliente.setCedula("123");
        cliente.setNombres("Ana");
        cliente.setApellidos("Pérez");

        assertThrows(ValidacionException.class, () -> servicio.guardarCliente(cliente));
        verify(repositorio, never()).save(cliente);
    }

    @Test
    void rechazaCedulaDuplicada() {
        Cliente cliente = new Cliente();
        cliente.setCedula("0123456789");
        cliente.setNombres("Ana");
        cliente.setApellidos("Pérez");
        when(repositorio.existsByCedula("0123456789")).thenReturn(true);

        assertThrows(ReglaNegocioException.class, () -> servicio.guardarCliente(cliente));
        verify(repositorio, never()).save(cliente);
    }

    @Test
    void normalizaCedulaYGuardaClienteValido() {
        Cliente cliente = new Cliente();
        cliente.setCedula(" 0123456789 ");
        cliente.setNombres(" Ana ");
        cliente.setApellidos(" Pérez ");
        when(repositorio.save(cliente)).thenReturn(cliente);

        Cliente guardado = servicio.guardarCliente(cliente);

        assertEquals("0123456789", guardado.getCedula());
        assertEquals("Ana", guardado.getNombres());
        assertEquals("Activo", guardado.getEstado());
    }
}
