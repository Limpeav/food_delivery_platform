package com.example.fooddelivery.cart;

import com.example.fooddelivery.cart.dto.AddToCartRequest;
import com.example.fooddelivery.cart.dto.CartResponse;
import com.example.fooddelivery.cart.entity.Cart;
import com.example.fooddelivery.cart.entity.CartItem;
import com.example.fooddelivery.cart.repository.CartRepository;
import com.example.fooddelivery.cart.service.CartService;
import com.example.fooddelivery.common.exception.BadRequestException;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.food.service.FoodItemService;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private UserService userService;

    @Mock
    private FoodItemService foodItemService;

    @InjectMocks
    private CartService cartService;

    private User customer;
    private Restaurant restaurant1;
    private Restaurant restaurant2;
    private FoodItem food1;
    private FoodItem food2FromOtherRest;

    @BeforeEach
    void setUp() {
        customer = User.builder().id(1L).email("cust@test.com").role(Role.CUSTOMER).build();

        restaurant1 = Restaurant.builder()
                .id(10L)
                .name("Burger King")
                .deliveryFee(new BigDecimal("1.50"))
                .minimumOrder(new BigDecimal("5.00"))
                .status(RestaurantStatus.APPROVED)
                .build();

        restaurant2 = Restaurant.builder()
                .id(20L)
                .name("Pizza Hut")
                .deliveryFee(new BigDecimal("2.00"))
                .minimumOrder(new BigDecimal("10.00"))
                .status(RestaurantStatus.APPROVED)
                .build();

        food1 = FoodItem.builder()
                .id(100L)
                .name("Whopper")
                .price(new BigDecimal("6.00"))
                .available(true)
                .restaurant(restaurant1)
                .build();

        food2FromOtherRest = FoodItem.builder()
                .id(200L)
                .name("Pepperoni Pizza")
                .price(new BigDecimal("12.00"))
                .available(true)
                .restaurant(restaurant2)
                .build();
    }

    @Test
    void addToCart_Success() {
        Cart cart = Cart.builder().id(1L).customer(customer).items(new ArrayList<>()).build();

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(foodItemService.findFoodItemById(100L)).thenReturn(food1);
        when(cartRepository.save(any(Cart.class))).thenAnswer(i -> i.getArgument(0));

        AddToCartRequest req = AddToCartRequest.builder().foodItemId(100L).quantity(2).build();
        CartResponse response = cartService.addToCart(1L, req);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals(2, response.getTotalItems());
        assertEquals(new BigDecimal("12.00"), response.getSubtotal());
        assertEquals(new BigDecimal("13.50"), response.getTotalAmount());
    }

    @Test
    void addToCart_DifferentRestaurant_ThrowsBadRequestException() {
        CartItem item1 = CartItem.builder().id(1L).foodItem(food1).quantity(1).build();
        Cart cart = Cart.builder()
                .id(1L)
                .customer(customer)
                .restaurant(restaurant1)
                .items(new ArrayList<>(java.util.List.of(item1)))
                .build();

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(foodItemService.findFoodItemById(200L)).thenReturn(food2FromOtherRest);

        AddToCartRequest req = AddToCartRequest.builder().foodItemId(200L).quantity(1).build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> cartService.addToCart(1L, req));
        assertTrue(ex.getMessage().contains("Your cart contains food from another restaurant"));
    }

    @Test
    void addToCart_UnavailableFood_ThrowsBadRequestException() {
        food1.setAvailable(false);
        Cart cart = Cart.builder().id(1L).customer(customer).items(new ArrayList<>()).build();

        when(cartRepository.findByCustomerId(1L)).thenReturn(Optional.of(cart));
        when(foodItemService.findFoodItemById(100L)).thenReturn(food1);

        AddToCartRequest req = AddToCartRequest.builder().foodItemId(100L).quantity(1).build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> cartService.addToCart(1L, req));
        assertTrue(ex.getMessage().contains("currently unavailable"));
    }
}
