package com.joyeria.ai.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Petición del asistente de compras. El límite de tamaño es una primera
 * barrera de seguridad; el backend lo vuelve a validar contra la configuración.
 */
@Data
@NoArgsConstructor
public class AiAssistantRequest {

    @NotBlank(message = "El mensaje no puede estar vacío")
    @Size(max = 500, message = "El mensaje es demasiado largo (máximo 500 caracteres)")
    private String message;
}
