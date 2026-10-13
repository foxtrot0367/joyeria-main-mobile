package com.joyeria.ai;

import com.joyeria.dto.ProductDTO;
import com.joyeria.model.Category;
import com.joyeria.model.Material;
import com.joyeria.model.Product;
import com.joyeria.repository.CategoryRepository;
import com.joyeria.repository.MaterialRepository;
import com.joyeria.repository.ProductRepository;
import com.joyeria.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Consulta productos <strong>reales</strong> de PostgreSQL a partir de una
 * intención. Es la única fuente de datos comerciales del asistente.
 * Si el filtro inicial no devuelve nada, se relaja progresivamente para no
 * dejar al usuario sin resultados.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductSearchService {

    private static final int MAX_CANDIDATES = 50;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final MaterialRepository materialRepository;
    private final ProductService productService;

    public List<ProductDTO> findCandidates(SearchIntent intent) {
        Long categoryId = resolveCategoryId(intent.getCategory());
        Long materialId = resolveMaterialId(intent.getMaterial());

        List<Product> pool = query(categoryId, materialId, intent);
        if (pool.isEmpty() && materialId != null) {
            pool = query(categoryId, null, intent);
        }
        if (pool.isEmpty() && categoryId != null) {
            pool = query(null, materialId, intent);
        }
        if (pool.isEmpty()) {
            pool = query(null, null, intent);
        }
        return productService.mapProducts(pool);
    }

    Long resolveCategoryId(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        String needle = TextNormalizer.normalize(name);
        return categoryRepository.findByActiveTrueOrderByDisplayOrderAsc().stream()
                .filter(category -> matches(category.getName(), needle) || matches(category.getSlug(), needle))
                .map(Category::getId)
                .findFirst()
                .orElse(null);
    }

    Long resolveMaterialId(String name) {
        if (name == null || name.isBlank()) {
            return null;
        }
        String needle = TextNormalizer.normalize(name);
        return materialRepository.findByActiveTrue().stream()
                .filter(material -> matches(material.getName(), needle) || matches(material.getSlug(), needle))
                .map(Material::getId)
                .findFirst()
                .orElse(null);
    }

    private List<Product> query(Long categoryId, Long materialId, SearchIntent intent) {
        Pageable pageable = PageRequest.of(0, MAX_CANDIDATES,
                Sort.by(Sort.Direction.DESC, "soldCount"));
        return productRepository.searchFiltered(
                null,
                categoryId,
                materialId,
                intent.getMinPrice(),
                intent.getMaxPrice(),
                "",
                intent.isInStockOnly(),
                pageable).getContent();
    }

    private boolean matches(String candidate, String needle) {
        if (candidate == null) {
            return false;
        }
        String normalized = TextNormalizer.normalize(candidate);
        return normalized.equals(needle) || normalized.contains(needle) || needle.contains(normalized);
    }
}
