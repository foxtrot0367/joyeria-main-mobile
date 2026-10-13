package com.joyeria.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Construye los prompts del asistente y traduce la respuesta JSON del modelo
 * en un {@link SearchIntent}. La IA nunca recibe ni devuelve datos comerciales
 * más allá de lo estrictamente necesario.
 */
@Service
@RequiredArgsConstructor
public class AiPromptService {

    private static final int MAX_KEYWORDS = 8;

    private final ObjectMapper objectMapper;

    public String intentSystemPrompt(List<String> categories, List<String> materials) {
        return """
                Eres un analizador de intención de compra de una joyería.
                Dado el mensaje del usuario, responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, con esta forma:
                {"category": string|null, "material": string|null, "minPrice": number|null, "maxPrice": number|null,
                 "color": string|null, "style": string|null, "occasion": string|null, "gender": string|null,
                 "gift": boolean, "keywords": string[]}
                Reglas estrictas:
                - Nunca inventes productos, precios, stock, SKU, descuentos ni disponibilidad.
                - Si no detectas un campo, usa null (o false / []).
                - Los precios son enteros en pesos colombianos (COP), sin separadores de miles.
                - Para "category", prefiere una de estas: %s
                - Para "material", prefiere uno de estos: %s
                """.formatted(categories, materials);
    }

    public String composeSystemPrompt() {
        return """
                Eres un asistente de compras de una joyería premium.
                Redacta en español, con tono cálido y profesional, una respuesta breve (máximo 2 frases)
                que recomiende los productos reales que se te entregan.
                Reglas estrictas:
                - Solo puedes mencionar productos, precios y materiales de la lista proporcionada.
                - Nunca inventes productos, precios, stock, descuentos ni disponibilidad.
                - No inventes enlaces ni SKU.
                """;
    }

    public String composeUserPrompt(String userMessage, SearchIntent intent, List<Map<String, Object>> products) {
        return """
                Mensaje del usuario: %s
                Intención interpretada: %s
                Productos reales disponibles:
                %s
                """.formatted(userMessage, describeIntent(intent), toJson(products));
    }

    /**
     * Parsea el contenido devuelto por el modelo. Devuelve {@code null} si el
     * texto no contiene un JSON de intención válido (nunca lanza).
     */
    public SearchIntent parseIntentJson(String rawContent) {
        if (rawContent == null || rawContent.isBlank()) {
            return null;
        }
        String json = stripCodeFences(rawContent.trim());
        try {
            JsonNode node = objectMapper.readTree(json);
            if (node == null || !node.isObject()) {
                return null;
            }
            SearchIntent intent = new SearchIntent();
            intent.setCategory(textOrNull(node, "category"));
            intent.setMaterial(textOrNull(node, "material"));
            intent.setMinPrice(decimalOrNull(node, "minPrice"));
            intent.setMaxPrice(decimalOrNull(node, "maxPrice"));
            intent.setColor(textOrNull(node, "color"));
            intent.setStyle(textOrNull(node, "style"));
            intent.setOccasion(textOrNull(node, "occasion"));
            intent.setGender(textOrNull(node, "gender"));
            intent.setGift(node.path("gift").asBoolean(false));
            intent.setKeywords(keywords(node.path("keywords")));
            return intent;
        } catch (Exception e) {
            return null;
        }
    }

    private String describeIntent(SearchIntent intent) {
        if (intent == null) {
            return "{}";
        }
        Map<String, Object> description = new java.util.LinkedHashMap<>();
        description.put("category", nullToEmpty(intent.getCategory()));
        description.put("material", nullToEmpty(intent.getMaterial()));
        description.put("minPrice", intent.getMinPrice());
        description.put("maxPrice", intent.getMaxPrice());
        description.put("color", nullToEmpty(intent.getColor()));
        description.put("style", nullToEmpty(intent.getStyle()));
        description.put("occasion", nullToEmpty(intent.getOccasion()));
        description.put("gender", nullToEmpty(intent.getGender()));
        description.put("gift", intent.isGift());
        return toJson(description);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return String.valueOf(value);
        }
    }

    private String stripCodeFences(String value) {
        String result = value.trim();
        if (result.startsWith("```")) {
            int firstBreak = result.indexOf('\n');
            if (firstBreak >= 0) {
                result = result.substring(firstBreak + 1);
            }
            int lastFence = result.lastIndexOf("```");
            if (lastFence >= 0) {
                result = result.substring(0, lastFence);
            }
        }
        return result.trim();
    }

    private String textOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull() || !value.isTextual()) {
            return null;
        }
        String text = value.asText().trim();
        return text.isEmpty() ? null : text;
    }

    private BigDecimal decimalOrNull(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || value.isNull()) {
            return null;
        }
        if (value.isNumber()) {
            return value.decimalValue();
        }
        if (value.isTextual()) {
            try {
                return new BigDecimal(value.asText().replace(".", "").replace(",", "").trim());
            } catch (NumberFormatException e) {
                return null;
            }
        }
        return null;
    }

    private Set<String> keywords(JsonNode node) {
        Set<String> keywords = new LinkedHashSet<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                if (item.isTextual() && !item.asText().isBlank()) {
                    keywords.add(item.asText().trim());
                    if (keywords.size() >= MAX_KEYWORDS) {
                        break;
                    }
                }
            }
        }
        return keywords;
    }

    private String nullToEmpty(String value) {
        return value == null ? "" : value;
    }
}
