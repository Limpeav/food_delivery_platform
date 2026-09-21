package com.example.fooddelivery.menu.service;

import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.menu.dto.MenuCategoryRequest;
import com.example.fooddelivery.menu.dto.MenuCategoryResponse;
import com.example.fooddelivery.menu.entity.MenuCategory;
import com.example.fooddelivery.menu.repository.MenuCategoryRepository;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.restaurant.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MenuCategoryService {

    private final MenuCategoryRepository menuCategoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final RestaurantService restaurantService;

    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> getActiveCategoriesByRestaurant(Long restaurantId) {
        return menuCategoryRepository.findByRestaurantIdAndActiveTrueOrderByDisplayOrderAsc(restaurantId)
                .stream()
                .map(MenuCategoryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuCategoryResponse> getCategoriesForOwner(Long ownerId) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant found for current owner"));
        return menuCategoryRepository.findByRestaurantIdOrderByDisplayOrderAsc(restaurant.getId())
                .stream()
                .map(MenuCategoryResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuCategory findMenuCategoryById(Long id) {
        return menuCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MenuCategory", "id", id));
    }

    @Transactional
    public MenuCategoryResponse createMenuCategory(Long ownerId, MenuCategoryRequest request) {
        Restaurant restaurant = restaurantRepository.findByOwnerId(ownerId)
                .orElseThrow(() -> new ResourceNotFoundException("No restaurant found for current owner"));

        MenuCategory category = MenuCategory.builder()
                .restaurant(restaurant)
                .name(request.getName().trim())
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        MenuCategory saved = menuCategoryRepository.save(category);
        log.info("Menu category created: {} for restaurant: {}", saved.getName(), restaurant.getId());
        return MenuCategoryResponse.from(saved);
    }

    @Transactional
    public MenuCategoryResponse updateMenuCategory(Long ownerId, Long categoryId, MenuCategoryRequest request) {
        MenuCategory category = findMenuCategoryById(categoryId);
        restaurantService.verifyOwnership(category.getRestaurant(), ownerId);

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) category.setDisplayOrder(request.getDisplayOrder());
        if (request.getActive() != null) category.setActive(request.getActive());

        MenuCategory updated = menuCategoryRepository.save(category);
        log.info("Menu category updated: {}", categoryId);
        return MenuCategoryResponse.from(updated);
    }

    @Transactional
    public void deleteMenuCategory(Long ownerId, Long categoryId) {
        MenuCategory category = findMenuCategoryById(categoryId);
        restaurantService.verifyOwnership(category.getRestaurant(), ownerId);
        menuCategoryRepository.delete(category);
        log.info("Menu category deleted: {}", categoryId);
    }
}
