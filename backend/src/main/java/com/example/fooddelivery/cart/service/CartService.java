package com.example.fooddelivery.cart.service;

import com.example.fooddelivery.cart.dto.AddToCartRequest;
import com.example.fooddelivery.cart.dto.CartResponse;
import com.example.fooddelivery.cart.dto.UpdateCartItemRequest;
import com.example.fooddelivery.cart.entity.Cart;
import com.example.fooddelivery.cart.entity.CartItem;
import com.example.fooddelivery.cart.repository.CartRepository;
import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.common.exception.ResourceNotFoundException;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.food.entity.FoodOptionGroup;
import com.example.fooddelivery.food.entity.FoodOptionItem;
import com.example.fooddelivery.food.repository.FoodOptionItemRepository;
import com.example.fooddelivery.food.service.FoodItemService;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserService userService;
    private final FoodItemService foodItemService;
    private final FoodOptionItemRepository foodOptionItemRepository;

    @Transactional
    public Cart getOrCreateCartEntity(Long customerId) {
        return cartRepository.findByCustomerId(customerId)
                .orElseGet(() -> {
                    User customer = userService.findUserById(customerId);
                    Cart cart = Cart.builder()
                            .customer(customer)
                            .build();
                    return cartRepository.save(cart);
                });
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Long customerId) {
        Cart cart = cartRepository.findByCustomerId(customerId)
                .orElse(null);
        return CartResponse.from(cart);
    }

    @Transactional
    public CartResponse addToCart(Long customerId, AddToCartRequest request) {
        Cart cart = getOrCreateCartEntity(customerId);
        FoodItem foodItem = foodItemService.findFoodItemById(request.getFoodItemId());

        if (!Boolean.TRUE.equals(foodItem.getAvailable())) {
            throw new BadRequestException("Food item '" + foodItem.getName() + "' is currently unavailable");
        }

        if (foodItem.getRestaurant().getStatus() != RestaurantStatus.APPROVED) {
            throw new BadRequestException("Restaurant is not currently accepting orders");
        }

        // Check single restaurant restriction
        if (cart.getRestaurant() != null && !cart.getItems().isEmpty() &&
                !cart.getRestaurant().getId().equals(foodItem.getRestaurant().getId())) {
            throw new BadRequestException("Your cart contains food from another restaurant. Please clear your cart before adding items from a different restaurant.");
        }

        // Set cart restaurant if empty
        if (cart.getRestaurant() == null || cart.getItems().isEmpty()) {
            cart.setRestaurant(foodItem.getRestaurant());
        }

        // Validate and compute customized unit price
        BigDecimal unitPrice = foodItem.getPrice() != null ? foodItem.getPrice() : BigDecimal.ZERO;
        List<FoodOptionItem> selectedOptionsList = new ArrayList<>();

        if (request.getSelectedOptionItemIds() != null && !request.getSelectedOptionItemIds().isEmpty()) {
            selectedOptionsList = foodOptionItemRepository.findAllById(request.getSelectedOptionItemIds());

            // Validate that every option belongs to this food item
            for (FoodOptionItem opt : selectedOptionsList) {
                if (!opt.getOptionGroup().getFoodItem().getId().equals(foodItem.getId())) {
                    throw new BadRequestException("Option '" + opt.getName() + "' does not belong to this item");
                }
                if (opt.getAdditionalPrice() != null) {
                    unitPrice = unitPrice.add(opt.getAdditionalPrice());
                }
            }
        }

        // Validate required option groups & limits
        if (foodItem.getOptionGroups() != null) {
            Map<Long, Long> selectedCountsByGroup = selectedOptionsList.stream()
                    .collect(Collectors.groupingBy(opt -> opt.getOptionGroup().getId(), Collectors.counting()));

            for (FoodOptionGroup group : foodItem.getOptionGroups()) {
                long count = selectedCountsByGroup.getOrDefault(group.getId(), 0L);
                if (Boolean.TRUE.equals(group.getRequired()) && count < (group.getMinSelect() != null ? group.getMinSelect() : 1)) {
                    throw new BadRequestException("Please select an option for: " + group.getName());
                }
                if (group.getMaxSelect() != null && count > group.getMaxSelect()) {
                    throw new BadRequestException("You can select at most " + group.getMaxSelect() + " option(s) for: " + group.getName());
                }
            }
        }

        // Generate formatted options summary if not explicitly provided
        String formattedOptions = request.getSelectedOptions();
        if ((formattedOptions == null || formattedOptions.trim().isEmpty()) && !selectedOptionsList.isEmpty()) {
            formattedOptions = selectedOptionsList.stream()
                    .map(opt -> opt.getName() + (opt.getAdditionalPrice().compareTo(BigDecimal.ZERO) > 0 ? " (+$" + opt.getAdditionalPrice() + ")" : ""))
                    .collect(Collectors.joining(", "));
        }

        final String finalOptions = formattedOptions;

        // Check if item already exists in cart with same options and instructions
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getFoodItem().getId().equals(foodItem.getId()) &&
                        java.util.Objects.equals(item.getSelectedOptions(), finalOptions) &&
                        java.util.Objects.equals(item.getSpecialInstructions(), request.getSpecialInstructions()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            if (item.getUnitPrice() == null) {
                item.setUnitPrice(unitPrice);
            }
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .foodItem(foodItem)
                    .quantity(request.getQuantity())
                    .unitPrice(unitPrice)
                    .selectedOptions(finalOptions)
                    .specialInstructions(request.getSpecialInstructions())
                    .build();
            cart.getItems().add(newItem);
        }

        Cart updated = cartRepository.save(cart);
        log.info("Added food item {} (unitPrice: ${}, qty: {}) to cart for customer {}",
                foodItem.getId(), unitPrice, request.getQuantity(), customerId);
        return CartResponse.from(updated);
    }

    @Transactional
    public CartResponse updateCartItem(Long customerId, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCartEntity(customerId);

        CartItem targetItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found in your cart"));

        if (request.getQuantity() <= 0) {
            cart.getItems().remove(targetItem);
        } else {
            targetItem.setQuantity(request.getQuantity());
        }

        if (cart.getItems().isEmpty()) {
            cart.setRestaurant(null);
        }

        Cart updated = cartRepository.save(cart);
        log.info("Updated cart item {} to qty: {} for customer {}", itemId, request.getQuantity(), customerId);
        return CartResponse.from(updated);
    }

    @Transactional
    public CartResponse removeCartItem(Long customerId, Long itemId) {
        Cart cart = getOrCreateCartEntity(customerId);
        cart.getItems().removeIf(item -> item.getId().equals(itemId));

        if (cart.getItems().isEmpty()) {
            cart.setRestaurant(null);
        }

        Cart updated = cartRepository.save(cart);
        log.info("Removed cart item {} for customer {}", itemId, customerId);
        return CartResponse.from(updated);
    }

    @Transactional
    public CartResponse clearCart(Long customerId) {
        Cart cart = getOrCreateCartEntity(customerId);
        cart.getItems().clear();
        cart.setRestaurant(null);
        Cart updated = cartRepository.save(cart);
        log.info("Cleared cart for customer {}", customerId);
        return CartResponse.from(updated);
    }

    /**
     * Convenience method for programmatic cart item addition (e.g., re-order flow).
     */
    @Transactional
    public CartResponse addItem(Long customerId, Long foodItemId, int quantity) {
        com.example.fooddelivery.cart.dto.AddToCartRequest req =
                com.example.fooddelivery.cart.dto.AddToCartRequest.builder()
                        .foodItemId(foodItemId)
                        .quantity(quantity)
                        .build();
        return addToCart(customerId, req);
    }
}
