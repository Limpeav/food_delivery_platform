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
import com.example.fooddelivery.food.service.FoodItemService;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final UserService userService;
    private final FoodItemService foodItemService;

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

        // Check if item already exists in cart with same options and instructions
        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getFoodItem().getId().equals(foodItem.getId()) &&
                        java.util.Objects.equals(item.getSelectedOptions(), request.getSelectedOptions()) &&
                        java.util.Objects.equals(item.getSpecialInstructions(), request.getSpecialInstructions()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .foodItem(foodItem)
                    .quantity(request.getQuantity())
                    .selectedOptions(request.getSelectedOptions())
                    .specialInstructions(request.getSpecialInstructions())
                    .build();
            cart.getItems().add(newItem);
        }

        Cart updated = cartRepository.save(cart);
        log.info("Added food item {} (qty: {}) to cart for customer {}", foodItem.getId(), request.getQuantity(), customerId);
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
