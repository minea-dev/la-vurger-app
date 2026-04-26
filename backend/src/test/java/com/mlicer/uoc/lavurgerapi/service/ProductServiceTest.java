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

import java.math.BigDecimal;
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
    @DisplayName("Should return all products")
    void shouldReturnAllProducts() {
        // GIVEN
        Product mockProduct = new Product();
        ProductDTO mockDTO = new ProductDTO(1L, "Burger", "Desc", new BigDecimal("10.0"), "MAIN", "", true);

        when(productRepository.findAll()).thenReturn(List.of(mockProduct));
        when(productMapper.toDTO(mockProduct)).thenReturn(mockDTO);

        // WHEN
        List<ProductDTO> result = productService.getAllProducts();

        // THEN
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(mockDTO, result.get(0));
        verify(productRepository).findAll();
    }

    @Test
    @DisplayName("Should return product by ID")
    void shouldReturnProductById() {
        // GIVEN
        Long productId = 1L;
        Product mockProduct = new Product();
        ProductDTO mockDTO = new ProductDTO(productId, "Burger", "Desc", new BigDecimal("10.0"), "MAIN", "", true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(productMapper.toDTO(mockProduct)).thenReturn(mockDTO);

        // WHEN
        ProductDTO result = productService.getProductById(productId);

        // THEN
        assertNotNull(result);
        assertEquals(mockDTO.name(), result.name());
        verify(productRepository).findById(productId);
    }

    @Test
    @DisplayName("Should save and return a new product")
    void shouldSaveProduct() {
        // GIVEN
        ProductDTO inputDTO = new ProductDTO(null, "Burger", "Desc", new BigDecimal("10.0"), "MAIN", "", true);
        Product mockEntity = new Product();
        Product savedEntity = new Product();
        ProductDTO expectedDTO = new ProductDTO(1L, "Burger", "Desc", new BigDecimal("10.0"), "MAIN", "", true);

        when(productMapper.toEntity(inputDTO)).thenReturn(mockEntity);
        when(productRepository.save(mockEntity)).thenReturn(savedEntity);
        when(productMapper.toDTO(savedEntity)).thenReturn(expectedDTO);

        // WHEN
        ProductDTO result = productService.saveProduct(inputDTO);

        // THEN
        assertNotNull(result.id());
        verify(productRepository).save(mockEntity);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when deleting non-existent product")
    void shouldThrowExceptionWhenDeletingNonExistentProduct() {
        // GIVEN
        Long productId = 99L;
        when(productRepository.existsById(productId)).thenReturn(false);

        // WHEN & THEN
        assertThrows(ResourceNotFoundException.class, () -> productService.deleteProduct(productId));
        verify(productRepository, never()).deleteById(anyLong());
    }

    @Test
    @DisplayName("Should toggle product availability successfully")
    void shouldToggleAvailability() {
        // GIVEN
        Long productId = 1L;
        Product mockProduct = new Product();
        mockProduct.setAvailable(false);

        Product savedProduct = new Product();
        savedProduct.setAvailable(true);

        ProductDTO expectedDTO = new ProductDTO(productId, "Burger", "Desc", new BigDecimal("10.0"), "MAIN", "", true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(mockProduct)).thenReturn(savedProduct);
        when(productMapper.toDTO(savedProduct)).thenReturn(expectedDTO);

        // WHEN
        ProductDTO result = productService.toggleAvailability(productId, true);

        // THEN
        assertTrue(result.isAvailable());
        verify(productRepository).findById(productId);
        verify(productRepository).save(mockProduct);
    }
}