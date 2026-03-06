package com.mlicer.uoc.lavurgerapi.service;

import com.mlicer.uoc.lavurgerapi.dto.ProductDTO;
import com.mlicer.uoc.lavurgerapi.entity.Product;
import com.mlicer.uoc.lavurgerapi.mapper.ProductMapper;
import com.mlicer.uoc.lavurgerapi.repository.ProductRepository;
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
    void shouldReturnProductDTOWhenProductExists() {
        Product mockProduct = new Product();
        mockProduct.setId(1L);
        mockProduct.setName("La Vurger Clàssica");

        ProductDTO mockDto = mock(ProductDTO.class);

        when(productRepository.findById(1L)).thenReturn(Optional.of(mockProduct));
        when(productMapper.toDTO(mockProduct)).thenReturn(mockDto);

        Optional<ProductDTO> result = productService.getProductById(1L);

        assertTrue(result.isPresent(), "El producte hauria d'estar present");
        assertEquals(mockDto, result.get(), "El DTO retornat no coincideix amb l'esperat");

        verify(productRepository, times(1)).findById(1L);
        verify(productMapper, times(1)).toDTO(mockProduct);

        System.out.println("✅ Test superat: El servei integra el Repositori i el Mapper a la perfecció.");
    }

    @Test
    void shouldReturnEmptyOptionalWhenProductDoesNotExist() {
        when(productRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<ProductDTO> result = productService.getProductById(99L);

        assertFalse(result.isPresent(), "L'Optional deuria estar buit si el producte no existeix");
        verify(productRepository, times(1)).findById(99L);
        verify(productMapper, never()).toDTO(any());

        System.out.println("✅ Test superat: El servei gestiona correctament quan un producte no existeix.");
    }

    @Test
    void shouldReturnListOfProductDTOsWhenProductsExist() {
        Product mockProduct1 = new Product();
        mockProduct1.setId(1L);

        Product mockProduct2 = new Product();
        mockProduct2.setId(2L);

        List<Product> mockProducts = List.of(mockProduct1, mockProduct2);

        ProductDTO mockDto1 = mock(ProductDTO.class);
        ProductDTO mockDto2 = mock(ProductDTO.class);

        when(productRepository.findAll()).thenReturn(mockProducts);
        when(productMapper.toDTO(mockProduct1)).thenReturn(mockDto1);
        when(productMapper.toDTO(mockProduct2)).thenReturn(mockDto2);

        List<ProductDTO> result = productService.getAllProducts();

        assertNotNull(result, "La llista de productes no deuria ser nul·la");
        assertEquals(2, result.size(), "La llista deuria contindre exactament 2 productes");
        assertTrue(result.contains(mockDto1), "La llista deuria contindre el primer DTO");
        assertTrue(result.contains(mockDto2), "La llista deuria contindre el segon DTO");

        verify(productRepository, times(1)).findAll();
        verify(productMapper, times(1)).toDTO(mockProduct1);
        verify(productMapper, times(1)).toDTO(mockProduct2);

        System.out.println("✅ Test superat: El servei recupera i mapeja tota la llista de productes correctament.");
    }
}