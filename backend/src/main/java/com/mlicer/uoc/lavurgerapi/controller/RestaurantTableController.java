package com.mlicer.uoc.lavurgerapi.controller;

import com.mlicer.uoc.lavurgerapi.dto.RestaurantTableDTO;
import com.mlicer.uoc.lavurgerapi.service.RestaurantTableService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin(origins = "*")
@Tag(name = "Restaurant Tables", description = "Endpoints for restaurant table management")
public class RestaurantTableController {

    @Autowired
    private RestaurantTableService tableService;

    @Operation(summary = "Get all tables", description = "Returns a list of all configured tables in the restaurant.")
    @ApiResponse(responseCode = "200", description = "List of tables retrieved successfully")
    @GetMapping
    public ResponseEntity<List<RestaurantTableDTO>> getAllTables() {
        List<RestaurantTableDTO> tables = tableService.findAll();
        return ResponseEntity.ok(tables);
    }

    @Operation(summary = "Create a new table", description = "Registers a new table in the restaurant.")
    @ApiResponse(responseCode = "201", description = "Table created successfully")
    @PostMapping
    public ResponseEntity<RestaurantTableDTO> createTable(@RequestBody RestaurantTableDTO dto) {
        return new ResponseEntity<>(tableService.createTable(dto), HttpStatus.CREATED);
    }
}