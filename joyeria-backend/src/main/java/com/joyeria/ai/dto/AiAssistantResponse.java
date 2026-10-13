package com.joyeria.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Respuesta del asistente: un mensaje y una lista de productos reales.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiAssistantResponse {
    private String message;
    private List<AiProductSuggestion> products;
}
