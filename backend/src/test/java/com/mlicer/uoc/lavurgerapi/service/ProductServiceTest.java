package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.ProductDTO;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.exception.ResourceNotFoundException;
import com.mlicer.uoc.lavurgerapi.mapper.ProductMapper;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("Hauria de retornar ProductDTO quan el producte existeix")
    void shouldReturnProductDTOWhenProductExists() {
        Product mockProduct = new Product();
        mockProduct.setId(1L);
        mockProduct.setName("La Vurger Clàssica");
        ProductDTO mockDto = mock(ProductDTO.class);

        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(productMapper.toDTO(mockProduct)).thenReturn(mockDto);

        ProductDTO result = productService.getProductById(1L);

        assertNotNull(result, "El producte no deuria ser nul");
        assertEquals(mockDto, result, "El DTO retornat no coincideix");

        verify(productRepository, times(1)).findById(1L);
        verify(productMapper, times(1)).toDTO(mockProduct);
        System.out.println("✅ Test superat: El servei retorna el DTO directament.");
    }

    @Test
    @DisplayName("Hauria de llançar ResourceNotFoundException quan el producte no existeix")
    void shouldThrowExceptionWhenProductDoesNotExist() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            productService.getProductById(99L);
        }, "Deuria llançar ResourceNotFoundException si el producte no existeix");

        verify(productRepository, times(1)).findById(99L);
        verify(productMapper, never()).toDTO(any());
        System.out.println("✅ Test superat: El servei llança l'excepció correcta.");
    }

    @Test
    @DisplayName("Hauria de retornar llista de DTOs quan hi ha productes")
    void shouldReturnListOfProductDTOsWhenProductsExist() {
        Product p1 = new Product(); p1.setId(1L);
        Product p2 = new Product(); p2.setId(2L);
        List<Product> mockProducts = List.of(p1, p2);

        ProductDTO d1 = mock(ProductDTO.class);
        ProductDTO d2 = mock(ProductDTO.class);

        when(productRepository.findAll()).thenReturn(mockProducts);
        when(productMapper.toDTO(p1)).thenReturn(d1);
        when(productMapper.toDTO(p2)).thenReturn(d2);

        List<ProductDTO> result = productService.getAllProducts();

        assertEquals(2, result.size());
        assertTrue(result.contains(d1));
        assertTrue(result.contains(d2));

        verify(productRepository, times(1)).findAll();
        System.out.println("✅ Test superat: Llistat de productes validat.");
    }
}