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
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private ImageStorageService imageStorageService;

    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("Should return all products")
    void shouldReturnAllProducts() {
        Product mockProduct = new Product();
        ProductDTO mockDTO = new ProductDTO(1L, "Burger", "Desc", "Long Desc", new BigDecimal("10.0"), "MAIN", "", true);

        when(productRepository.findAll()).thenReturn(List.of(mockProduct));
        when(productMapper.toDTO(mockProduct)).thenReturn(mockDTO);

        List<ProductDTO> result = productService.getAllProducts();

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(mockDTO, result.get(0));
        verify(productRepository).findAll();
    }

    @Test
    @DisplayName("Should return product by ID")
    void shouldReturnProductById() {
        Long productId = 1L;
        Product mockProduct = new Product();
        ProductDTO mockDTO = new ProductDTO(productId, "Burger", "Desc", "Long Desc", new BigDecimal("10.0"), "MAIN", "", true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(productMapper.toDTO(mockProduct)).thenReturn(mockDTO);

        ProductDTO result = productService.getProductById(productId);

        assertNotNull(result);
        assertEquals(mockDTO.name(), result.name());
        verify(productRepository).findById(productId);
    }

    @Test
    @DisplayName("Should save and return a new product")
    void shouldSaveProduct() {
        ProductDTO inputDTO = new ProductDTO(null, "Burger", "Desc", "Long Desc", new BigDecimal("10.0"), "MAIN", "", true);
        Product mockEntity = new Product();
        Product savedEntity = new Product();
        ProductDTO expectedDTO = new ProductDTO(1L, "Burger", "Desc", "Long Desc", new BigDecimal("10.0"), "MAIN", "", true);

        when(productMapper.toEntity(inputDTO)).thenReturn(mockEntity);
        when(productRepository.save(mockEntity)).thenReturn(savedEntity);
        when(productMapper.toDTO(savedEntity)).thenReturn(expectedDTO);

        ProductDTO result = productService.saveProduct(inputDTO);

        assertNotNull(result.id());
        verify(productRepository).save(mockEntity);
    }

    @Test
    @DisplayName("Should throw RuntimeException when deleting non-existent product")
    void shouldThrowExceptionWhenDeletingNonExistentProduct() {
        Long productId = 99L;
        when(productRepository.findById(productId)).thenReturn(Optional.empty());

        RuntimeException exception = assertThrows(RuntimeException.class, () -> productService.deleteProduct(productId));
        assertEquals("Product not found", exception.getMessage());
        verify(productRepository, never()).delete(any(Product.class));
    }

    @Test
    @DisplayName("Should toggle product availability successfully")
    void shouldToggleAvailability() {
        Long productId = 1L;
        Product mockProduct = new Product();
        mockProduct.setAvailable(false);

        Product savedProduct = new Product();
        savedProduct.setAvailable(true);

        ProductDTO expectedDTO = new ProductDTO(productId, "Burger", "Desc", "Long Desc", new BigDecimal("10.0"), "MAIN", "", true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(productRepository.save(mockProduct)).thenReturn(savedProduct);
        when(productMapper.toDTO(savedProduct)).thenReturn(expectedDTO);

        ProductDTO result = productService.toggleAvailability(productId, true);

        assertTrue(result.isAvailable());
        verify(productRepository).findById(productId);
        verify(productRepository).save(mockProduct);
    }

    @Test
    @DisplayName("Should return products filtered by category")
    void shouldReturnProductsByCategory() {
        Product mockProduct = new Product();
        ProductDTO mockDTO = new ProductDTO(1L, "Burger", "Desc", "Long Desc", new BigDecimal("10.0"), "BURGERS", "", true);

        when(productRepository.findByCategory("BURGERS")).thenReturn(List.of(mockProduct));
        when(productMapper.toDTO(mockProduct)).thenReturn(mockDTO);

        List<ProductDTO> result = productService.getProductsByCategory("BURGERS");

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        verify(productRepository).findByCategory("BURGERS");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist by ID")
    void shouldThrowExceptionWhenProductNotFoundById() {
        when(productRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(1L));
        verify(productRepository).findById(1L);
    }

    @Test
    @DisplayName("Should delete product and trigger S3 image cleanup if it exists")
    void shouldDeleteProductAndCleanS3Image() {
        Long productId = 1L;
        Product mockProduct = new Product();
        mockProduct.setId(productId);
        mockProduct.setImageUrl("https://s3.amazonaws.com/bucket/image.jpg");

        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));

        productService.deleteProduct(productId);

        verify(imageStorageService).deleteImage("https://s3.amazonaws.com/bucket/image.jpg");
        verify(productRepository).delete(mockProduct);
    }

    @Test
    @DisplayName("Should update product image by deleting old one and uploading new one")
    void shouldUpdateProductImageSuccessfully() {
        Long productId = 1L;
        Product mockProduct = new Product();
        mockProduct.setId(productId);
        mockProduct.setImageUrl("https://s3.amazonaws.com/bucket/old.jpg");

        MultipartFile mockFile = mock(MultipartFile.class);
        ProductDTO expectedDTO = new ProductDTO(productId, "Burger", "Desc", "Long Desc", new BigDecimal("10.0"), "BURGERS", "https://s3.amazonaws.com/bucket/new.jpg", true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(mockProduct));
        when(imageStorageService.uploadImage(mockFile)).thenReturn("https://s3.amazonaws.com/bucket/new.jpg");
        when(productRepository.save(mockProduct)).thenReturn(mockProduct);
        when(productMapper.toDTO(mockProduct)).thenReturn(expectedDTO);

        ProductDTO result = productService.updateProductImage(productId, mockFile);

        assertNotNull(result);
        assertEquals("https://s3.amazonaws.com/bucket/new.jpg", result.imageUrl());
        verify(imageStorageService).deleteImage("https://s3.amazonaws.com/bucket/old.jpg");
        verify(imageStorageService).uploadImage(mockFile);
        verify(productRepository).save(mockProduct);
    }
}