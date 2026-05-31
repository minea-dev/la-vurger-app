package com.mlicer.uoc.lavurgerapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mlicer.uoc.lavurgerapi.dto.RestaurantTableDTO;
import com.mlicer.uoc.lavurgerapi.entity.RestaurantTable;
import com.mlicer.uoc.lavurgerapi.repository.RestaurantTableRepository;
import com.mlicer.uoc.lavurgerapi.security.JwtUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "aws.s3.bucket-name=lavurger-test-bucket",
                "aws.s3.region=eu-west-3",
                "aws.s3.access-key=mock-access-key",
                "aws.s3.secret-key=mock-secret-key"
        }
)
@ActiveProfiles("test")
@AutoConfigureMockMvc(addFilters = false)
@WithMockUser(roles = "ADMIN")
public class RestaurantTableControllerIT {

    @MockitoBean
    private JwtUtils jwtUtils;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RestaurantTableRepository tableRepository;

    @BeforeEach
    void setUp() {
        tableRepository.deleteAll();

        RestaurantTable defaultTable = new RestaurantTable();
        defaultTable.setTableNumber(5);
        defaultTable.setQrCode("QR_CONFIG_05");
        tableRepository.save(defaultTable);
    }

    @Test
    @DisplayName("Should return all configured restaurant tables with 200 OK")
    void shouldGetAllTables() throws Exception {
        mockMvc.perform(get("/api/tables"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].tableNumber").value(5))
                .andExpect(jsonPath("$[0].qrCode").value("QR_CONFIG_05"));
    }

    @Test
    @DisplayName("Should register a new table configuration and return 201 Created")
    void shouldCreateTableSuccessfully() throws Exception {
        RestaurantTableDTO requestPayload = new RestaurantTableDTO(null, 12, "QR_CONFIG_12");

        mockMvc.perform(post("/api/tables")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestPayload)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.tableNumber").value(12))
                .andExpect(jsonPath("$.qrCode").value("QR_CONFIG_12"));
    }
}