package com.mlicer.uoc.lavurgerapi.controller;

import com.mlicer.uoc.lavurgerapi.dto.ProductDTO;
import com.mlicer.uoc.lavurgerapi.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@Tag(name = "Products", description = "Endpoints for the product catalog")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Operation(summary = "Get all products", description = "Returns the complete product catalog.")
    @GetMapping
    public List<ProductDTO> getAll() {
        return productService.getAllProducts();
    }

    @Operation(summary = "Get product by ID", description = "Returns the details of a specific product.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product found"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getById(@Parameter(description = "Product ID") @PathVariable Long id) {
        ProductDTO product = productService.getProductById(id);
        return ResponseEntity.ok(product);
    }

    @Operation(summary = "Get products by category", description = "Returns a list of products filtered by a specific category.")
    @GetMapping("/category/{category}")
    public List<ProductDTO> getByCategory(@Parameter(description = "Category (e.g., BURGERS, DRINKS)") @PathVariable String category) {
        return productService.getProductsByCategory(category);
    }

    @Operation(summary = "Create a product", description = "Adds a new product to the catalog.")
    @ApiResponse(responseCode = "201", description = "Product created successfully")
    @PostMapping
    public ResponseEntity<ProductDTO> create(@Valid @RequestBody ProductDTO productDTO) {
        return new ResponseEntity<>(productService.saveProduct(productDTO), HttpStatus.CREATED);
    }

    @Operation(summary = "Update a product", description = "Updates the information of an existing product by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Product updated successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> update(
            @Parameter(description = "ID of the product to update") @PathVariable Long id,
            @Valid @RequestBody ProductDTO productDTO) {
        productService.getProductById(id);

        ProductDTO toUpdate = new ProductDTO(
                id,
                productDTO.name(),
                productDTO.description(),
                productDTO.price(),
                productDTO.category(),
                productDTO.imageUrl(),
                productDTO.isAvailable()
        );

        return ResponseEntity.ok(productService.saveProduct(toUpdate));
    }

    @Operation(summary = "Delete a product", description = "Deletes a product from the catalog by its ID.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Product deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@Parameter(description = "ID of the product to delete") @PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }
}