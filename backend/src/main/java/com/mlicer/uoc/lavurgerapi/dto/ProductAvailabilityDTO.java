package com.mlicer.uoc.lavurgerapi.dto;

import jakarta.validation.constraints.NotNull;

public record ProductAvailabilityDTO(
        @NotNull(message = "Availability status is required")
        Boolean isAvailable
) {}