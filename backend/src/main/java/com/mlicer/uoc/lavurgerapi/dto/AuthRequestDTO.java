package com.mlicer.uoc.lavurgerapi.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AuthRequestDTO(
        @NotBlank(message = "El correu electrònic és obligatori")
        @Email(message = "El format del correu electrònic és invàlid")
        String email,

        @NotBlank(message = "La contrasenya és obligatòria")
        String password
) {}