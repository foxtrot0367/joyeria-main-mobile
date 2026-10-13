package com.joyeria.ai;

import com.joyeria.dto.ProductDTO;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ProductRecommendationServiceTest {

    private final ProductRecommendationService service = new ProductRecommendationService();

    private ProductDTO product(long id, String name, String category, List<String> materials,
                               String price, int stock, String description) {
        return ProductDTO.builder()
                .id(id)
                .name(name)
                .categoryName(category)
                .materialNames(materials)
                .price(new BigDecimal(price))
                .stock(stock)
                .soldCount(0)
                .description(description)
                .build();
    }

    @Test
    void materialMatchRanksHigher() {
        ProductDTO plata = product(1, "Anillo Luna", "Anillos", List.of("Plata"), "150000", 5, "Elegante anillo");
        ProductDTO oro = product(2, "Anillo Sol", "Anillos", List.of("Oro"), "150000", 5, "Elegante anillo");

        SearchIntent intent = SearchIntent.builder().material("plata").build();

        List<ProductRecommendationService.Recommendation> result =
                service.recommend(List.of(oro, plata), intent, 2);

        assertEquals(1L, result.get(0).product().getId());
        assertTrue(result.get(0).score() > result.get(1).score());
    }

    @Test
    void budgetAddsReasonAndScore() {
        ProductDTO product = product(1, "Collar", "Collares", List.of("Plata"), "120000", 3, "Collar fino");
        SearchIntent intent = SearchIntent.builder().maxPrice(new BigDecimal("200000")).build();

        ProductRecommendationService.Recommendation recommendation =
                service.recommend(List.of(product), intent, 1).get(0);

        assertTrue(recommendation.reason().toLowerCase().contains("presupuesto"));
    }

    @Test
    void outOfStockScoresLowerThanAvailable() {
        ProductDTO available = product(1, "Anillo", "Anillos", List.of("Plata"), "150000", 5, "x");
        ProductDTO outOfStock = product(2, "Anillo", "Anillos", List.of("Plata"), "150000", 0, "x");

        List<ProductRecommendationService.Recommendation> result =
                service.recommend(List.of(outOfStock, available), SearchIntent.builder().build(), 2);

        assertEquals(1L, result.get(0).product().getId());
        assertTrue(result.get(0).score() > result.get(1).score());
    }

    @Test
    void respectsLimitAndEmptyInput() {
        ProductDTO a = product(1, "A", "Anillos", List.of("Plata"), "1000", 1, "x");
        ProductDTO b = product(2, "B", "Anillos", List.of("Plata"), "1000", 1, "x");

        assertEquals(1, service.recommend(List.of(a, b), SearchIntent.builder().build(), 1).size());
        assertTrue(service.recommend(List.of(), SearchIntent.builder().build(), 3).isEmpty());
        assertTrue(service.recommend(null, SearchIntent.builder().build(), 3).isEmpty());
    }

    @Test
    void giftIntentProducesGiftReason() {
        ProductDTO product = product(1, "Pulsera", "Pulseras", List.of("Plata"), "90000", 4, "x");

        ProductRecommendationService.Recommendation recommendation =
                service.recommend(List.of(product), SearchIntent.builder().gift(true).build(), 1).get(0);

        assertTrue(recommendation.reason().toLowerCase().contains("regalar"));
        assertFalse(recommendation.reason().isBlank());
    }
}
