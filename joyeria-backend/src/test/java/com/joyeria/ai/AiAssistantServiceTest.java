package com.joyeria.ai;

import com.joyeria.ai.client.AiChatClient;
import com.joyeria.ai.config.AiProperties;
import com.joyeria.ai.dto.AiAssistantResponse;
import com.joyeria.dto.ProductDTO;
import com.joyeria.dto.ProductImageDTO;
import com.joyeria.repository.CategoryRepository;
import com.joyeria.repository.MaterialRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiAssistantServiceTest {

    @Mock
    private ProductSearchService productSearchService;
    @Mock
    private ProductRecommendationService recommendationService;
    @Mock
    private AiChatClient aiChatClient;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private MaterialRepository materialRepository;

    private AiProperties properties;
    private AiAssistantService service;

    @BeforeEach
    void setUp() {
        properties = new AiProperties();
        service = new AiAssistantService(properties, new SearchIntentParser(), productSearchService,
                recommendationService, aiChatClient, categoryRepository, materialRepository);
    }

    private ProductDTO product(int stock) {
        return ProductDTO.builder()
                .id(1L)
                .name("Anillo Aurora")
                .slug("anillo-aurora")
                .price(new BigDecimal("185000"))
                .stock(stock)
                .soldCount(0)
                .categoryName("Anillos")
                .materialNames(List.of("Plata"))
                .images(List.of(ProductImageDTO.builder().url("u1").isPrimary(true).build(),
                        ProductImageDTO.builder().url("u2").isPrimary(false).build()))
                .build();
    }

    private ProductRecommendationService.Recommendation recommendation(ProductDTO product) {
        return new ProductRecommendationService.Recommendation(product, 40, "Recomendado para ti");
    }

    @Test
    void validQueryReturnsRealProducts() {
        ProductDTO product = product(5);
        when(aiChatClient.isEnabled()).thenReturn(false);
        when(productSearchService.findCandidates(any())).thenReturn(List.of(product));
        when(recommendationService.recommend(any(), any(), anyInt())).thenReturn(List.of(recommendation(product)));

        AiAssistantResponse response = service.assist("Busco un regalo elegante");

        assertEquals(1, response.getProducts().size());
        assertEquals("Anillo Aurora", response.getProducts().get(0).getName());
        assertEquals(new BigDecimal("185000"), response.getProducts().get(0).getPrice());
        assertTrue(response.getProducts().get(0).isAvailable());
        assertEquals("u1", response.getProducts().get(0).getImage());
        assertNotNull(response.getMessage());
    }

    @Test
    void noResultsReturnsEmptyListAndFallbackMessage() {
        when(aiChatClient.isEnabled()).thenReturn(false);
        when(productSearchService.findCandidates(any())).thenReturn(List.of());
        when(recommendationService.recommend(any(), any(), anyInt())).thenReturn(List.of());

        AiAssistantResponse response = service.assist("algo inexistente");

        assertTrue(response.getProducts().isEmpty());
        assertTrue(response.getMessage().contains("No encontré"));
    }

    @Test
    void outOfStockProductIsMarkedUnavailable() {
        ProductDTO product = product(0);
        when(aiChatClient.isEnabled()).thenReturn(false);
        when(productSearchService.findCandidates(any())).thenReturn(List.of(product));
        when(recommendationService.recommend(any(), any(), anyInt())).thenReturn(List.of(recommendation(product)));

        AiAssistantResponse response = service.assist("un anillo");

        assertFalse(response.getProducts().get(0).isAvailable());
    }

    @Test
    void aiProviderErrorFallsBackToDeterministicResults() {
        ProductDTO product = product(5);
        when(aiChatClient.isEnabled()).thenReturn(true);
        when(categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()).thenReturn(List.of());
        when(materialRepository.findByActiveTrue()).thenReturn(List.of());
        when(aiChatClient.interpretIntent(any(), anyList(), anyList()))
                .thenThrow(new AiUnavailableException("proveedor caído"));
        when(aiChatClient.composeMessage(any(), any(), anyList())).thenReturn(Optional.empty());
        when(productSearchService.findCandidates(any())).thenReturn(List.of(product));
        when(recommendationService.recommend(any(), any(), anyInt())).thenReturn(List.of(recommendation(product)));

        AiAssistantResponse response = service.assist("busco un anillo de plata");

        assertEquals(1, response.getProducts().size());
        assertNotNull(response.getMessage());
    }

    @Test
    void aiTimeoutDuringComposeFallsBackToDefaultMessage() {
        ProductDTO product = product(5);
        when(aiChatClient.isEnabled()).thenReturn(true);
        when(categoryRepository.findByActiveTrueOrderByDisplayOrderAsc()).thenReturn(List.of());
        when(materialRepository.findByActiveTrue()).thenReturn(List.of());
        when(aiChatClient.interpretIntent(any(), anyList(), anyList())).thenReturn(Optional.empty());
        when(aiChatClient.composeMessage(any(), any(), anyList()))
                .thenThrow(new AiUnavailableException("timeout"));
        when(productSearchService.findCandidates(any())).thenReturn(List.of(product));
        when(recommendationService.recommend(any(), any(), anyInt())).thenReturn(List.of(recommendation(product)));

        AiAssistantResponse response = service.assist("busco un anillo");

        assertEquals(1, response.getProducts().size());
        assertNotNull(response.getMessage());
        assertFalse(response.getMessage().isBlank());
    }

    @Test
    void emptyMessageThrows() {
        assertThrows(IllegalArgumentException.class, () -> service.assist("   "));
    }

    @Test
    void tooLongMessageThrows() {
        String tooLong = "a".repeat(properties.getMaxMessageLength() + 1);

        assertThrows(IllegalArgumentException.class, () -> service.assist(longMessage()));
    }

    private String longMessage() {
        return "a".repeat(properties.getMaxMessageLength() + 1);
    }
}
