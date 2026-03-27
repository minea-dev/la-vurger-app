package com.mlicer.uoc.lavurgerapi.controller;

import com.mlicer.uoc.lavurgerapi.dto.OrderDTO;
import com.mlicer.uoc.lavurgerapi.service.OrderService;
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
@RequestMapping("/api/orders")
@Tag(name = "Orders", description = "Endpoints for order management")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Operation(summary = "Create a new order", description = "Creates a new order with its details and items.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Order created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid input data")
    })
    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@Valid @RequestBody OrderDTO orderDTO) {
        OrderDTO savedOrder = orderService.createOrder(orderDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedOrder);
    }

    @Operation(summary = "Get orders", description = "Retrieves a list of orders. Optionally filterable by status.")
    @ApiResponse(responseCode = "200", description = "List of orders retrieved successfully")
    @GetMapping
    public ResponseEntity<List<OrderDTO>> getOrders(
            @Parameter(description = "Order status to filter by (e.g., RECEIVED, PREPARING)")
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(orderService.getAllOrders(status));
    }

    @Operation(summary = "Update order status", description = "Updates the status of an existing order by its ID.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    @PatchMapping("/{id}/status")
    public ResponseEntity<OrderDTO> updateStatus(
            @Parameter(description = "ID of the order to update") @PathVariable Long id,
            @RequestBody String status) {

        String cleanStatus = status.replace("\"", "").trim();

        OrderDTO updatedOrder = orderService.updateOrderStatus(id, cleanStatus);
        return ResponseEntity.ok(updatedOrder);
    }
}