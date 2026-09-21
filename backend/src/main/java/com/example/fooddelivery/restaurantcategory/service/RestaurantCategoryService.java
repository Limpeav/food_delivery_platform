package com.example.fooddelivery.restaurantcategory.service;

import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.restaurantcategory.dto.RestaurantCategoryRequest;
import com.example.fooddelivery.restaurantcategory.dto.RestaurantCategoryResponse;
import com.example.fooddelivery.restaurantcategory.entity.RestaurantCategory;
import com.example.fooddelivery.restaurantcategory.repository.RestaurantCategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RestaurantCategoryService {

    private final RestaurantCategoryRepository categoryRepository;

    @Cacheable(value = "restaurant_categories")
    @Transactional(readOnly = true)
    public List<RestaurantCategoryResponse> getAllActiveCategories() {
        log.info("Fetching active restaurant categories from database");
        return categoryRepository.findByActiveTrueOrderByNameAsc()
                .stream()
                .map(RestaurantCategoryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RestaurantCategoryResponse> getAllCategoriesAdmin() {
        return categoryRepository.findAll()
                .stream()
                .map(RestaurantCategoryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RestaurantCategoryResponse getCategoryById(Long id) {
        RestaurantCategory category = findCategoryById(id);
        return RestaurantCategoryResponse.from(category);
    }

    @Transactional(readOnly = true)
    public RestaurantCategory findCategoryById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RestaurantCategory", "id", id));
    }

    @CacheEvict(value = "restaurant_categories", allEntries = true)
    @Transactional
    public RestaurantCategoryResponse createCategory(RestaurantCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Category already exists with name: " + request.getName());
        }

        RestaurantCategory category = RestaurantCategory.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        RestaurantCategory saved = categoryRepository.save(category);
        log.info("Restaurant category created: {}", saved.getName());
        return RestaurantCategoryResponse.from(saved);
    }

    @CacheEvict(value = "restaurant_categories", allEntries = true)
    @Transactional
    public RestaurantCategoryResponse updateCategory(Long id, RestaurantCategoryRequest request) {
        RestaurantCategory category = findCategoryById(id);

        if (!category.getName().equalsIgnoreCase(request.getName().trim()) &&
                categoryRepository.existsByNameIgnoreCase(request.getName().trim())) {
            throw new BadRequestException("Another category already exists with name: " + request.getName());
        }

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        RestaurantCategory updated = categoryRepository.save(category);
        log.info("Restaurant category updated: {}", updated.getName());
        return RestaurantCategoryResponse.from(updated);
    }

    @CacheEvict(value = "restaurant_categories", allEntries = true)
    @Transactional
    public void deleteCategory(Long id) {
        RestaurantCategory category = findCategoryById(id);
        categoryRepository.delete(category);
        log.info("Restaurant category deleted with id: {}", id);
    }
}
