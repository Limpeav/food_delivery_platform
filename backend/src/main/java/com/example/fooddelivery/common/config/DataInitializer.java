package com.example.fooddelivery.common.config;

import com.example.fooddelivery.address.entity.Address;
import com.example.fooddelivery.address.repository.AddressRepository;
import com.example.fooddelivery.coupon.entity.Coupon;
import com.example.fooddelivery.coupon.entity.DiscountType;
import com.example.fooddelivery.coupon.repository.CouponRepository;
import com.example.fooddelivery.driver.entity.Driver;
import com.example.fooddelivery.driver.entity.DriverLocation;
import com.example.fooddelivery.driver.repository.DriverLocationRepository;
import com.example.fooddelivery.driver.repository.DriverRepository;
import com.example.fooddelivery.food.entity.FoodItem;
import com.example.fooddelivery.food.repository.FoodItemRepository;
import com.example.fooddelivery.menu.entity.MenuCategory;
import com.example.fooddelivery.menu.repository.MenuCategoryRepository;
import com.example.fooddelivery.restaurant.entity.Restaurant;
import com.example.fooddelivery.restaurant.entity.RestaurantStatus;
import com.example.fooddelivery.restaurant.repository.RestaurantRepository;
import com.example.fooddelivery.restaurantcategory.entity.RestaurantCategory;
import com.example.fooddelivery.restaurantcategory.repository.RestaurantCategoryRepository;
import com.example.fooddelivery.user.entity.Role;
import com.example.fooddelivery.user.entity.User;
import com.example.fooddelivery.user.entity.UserStatus;
import com.example.fooddelivery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestaurantCategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;
    private final MenuCategoryRepository menuCategoryRepository;
    private final FoodItemRepository foodItemRepository;
    private final DriverRepository driverRepository;
    private final DriverLocationRepository driverLocationRepository;
    private final AddressRepository addressRepository;
    private final CouponRepository couponRepository;
    private final javax.sql.DataSource dataSource;

    @org.springframework.beans.factory.annotation.Value("${app.admin.email:admin@gmail.com}")
    private String adminEmail;

    @org.springframework.beans.factory.annotation.Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Seeding initial development data...");
            seedInitialData();
        } else {
            log.info("Database already initialized with initial seed data.");
        }

        if (restaurantRepository.count() < 25) {
            try {
                log.info("Executing extended restaurants & foods seed script (Batch 1)...");
                org.springframework.jdbc.datasource.init.ResourceDatabasePopulator populator =
                        new org.springframework.jdbc.datasource.init.ResourceDatabasePopulator(
                                new org.springframework.core.io.ClassPathResource("seed_restaurants_foods.sql"));
                populator.execute(dataSource);
                log.info("Extended restaurants & foods (Batch 1) seeded successfully!");
            } catch (Exception e) {
                log.error("Failed to execute extended restaurants seed script (Batch 1): {}", e.getMessage());
            }
        }

        if (restaurantRepository.count() < 50) {
            try {
                log.info("Executing extended restaurants & foods seed script (Batch 2)...");
                org.springframework.jdbc.datasource.init.ResourceDatabasePopulator populator =
                        new org.springframework.jdbc.datasource.init.ResourceDatabasePopulator(
                                new org.springframework.core.io.ClassPathResource("seed_restaurants_foods_batch2.sql"));
                populator.execute(dataSource);
                log.info("Extended restaurants & foods (Batch 2) seeded successfully!");
            } catch (Exception e) {
                log.error("Failed to execute extended restaurants seed script (Batch 2): {}", e.getMessage());
            }
        }
    }

    private void seedInitialData() {

        // 1. Create Users
        User admin = User.builder()
                .name("Platform Admin")
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .phoneNumber("+85512345670")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        User owner = User.builder()
                .name("Restaurant Owner")
                .email("owner@gmail.com")
                .password(passwordEncoder.encode("owner123"))
                .phoneNumber("+85512345671")
                .role(Role.RESTAURANT_OWNER)
                .status(UserStatus.ACTIVE)
                .build();

        User driverUser = User.builder()
                .name("Sokha Driver")
                .email("driver@gmail.com")
                .password(passwordEncoder.encode("driver123"))
                .phoneNumber("+85512345672")
                .role(Role.DRIVER)
                .status(UserStatus.ACTIVE)
                .build();

        User customer = User.builder()
                .name("Dara Customer")
                .email("customer@gmail.com")
                .password(passwordEncoder.encode("customer123"))
                .phoneNumber("+85512345673")
                .role(Role.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        userRepository.saveAll(List.of(admin, owner, driverUser, customer));

        // 2. Customer Address
        Address address = Address.builder()
                .user(customer)
                .label("Home")
                .recipientName("Dara Customer")
                .phoneNumber("+85512345673")
                .addressLine("#45, Street 240, Daun Penh")
                .city("Phnom Penh")
                .latitude(11.5621)
                .longitude(104.9282)
                .isDefault(true)
                .build();
        addressRepository.save(address);

        // 3. Driver Profile
        Driver driver = Driver.builder()
                .user(driverUser)
                .vehicleType("MOTORCYCLE")
                .vehicleNumber("1AB-9876")
                .licenseNumber("DL-992817")
                .online(true)
                .approved(true)
                .rating(4.9)
                .build();
        Driver savedDriver = driverRepository.save(driver);

        DriverLocation driverLocation = DriverLocation.builder()
                .driver(savedDriver)
                .latitude(11.5580)
                .longitude(104.9250)
                .build();
        driverLocationRepository.save(driverLocation);

        // 4. Restaurant Categories
        RestaurantCategory catFastFood = RestaurantCategory.builder()
                .name("Fast Food")
                .description("Burgers, fries, chicken wings, and quick bites")
                .imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600")
                .active(true)
                .build();

        RestaurantCategory catKhmer = RestaurantCategory.builder()
                .name("Khmer Food")
                .description("Authentic traditional Cambodian dishes and delicacies")
                .imageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600")
                .active(true)
                .build();

        RestaurantCategory catPizza = RestaurantCategory.builder()
                .name("Pizza & Italian")
                .description("Oven-baked pizzas, artisanal pastas, and Italian desserts")
                .imageUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600")
                .active(true)
                .build();

        RestaurantCategory catCoffee = RestaurantCategory.builder()
                .name("Coffee & Bakery")
                .description("Espresso drinks, fresh pastries, croissants, and treats")
                .imageUrl("https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600")
                .active(true)
                .build();

        RestaurantCategory catChinese = RestaurantCategory.builder()
                .name("Chinese Food")
                .description("Dim sum, noodles, dumplings, and savory stir-fries")
                .imageUrl("https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600")
                .active(true)
                .build();

        RestaurantCategory catHealthy = RestaurantCategory.builder()
                .name("Healthy Food")
                .description("Fresh salad bowls, organic juices, and balanced meals")
                .imageUrl("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600")
                .active(true)
                .build();

        categoryRepository.saveAll(List.of(catFastFood, catKhmer, catPizza, catCoffee, catChinese, catHealthy));

        // 5. Restaurants
        Restaurant rest1 = Restaurant.builder()
                .owner(owner)
                .category(catFastFood)
                .name("Burger King BKK1")
                .description("Flame-grilled burgers, crispy chicken nuggets, and delicious milkshakes.")
                .logoUrl("https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200")
                .coverImageUrl("https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200")
                .phone("+85523888001")
                .address("St 51 corner St 306, BKK1, Phnom Penh")
                .latitude(11.5528)
                .longitude(104.9248)
                .openingTime("07:00")
                .closingTime("23:00")
                .deliveryFee(new BigDecimal("1.50"))
                .minimumOrder(new BigDecimal("5.00"))
                .rating(4.8)
                .reviewCount(128)
                .status(RestaurantStatus.APPROVED)
                .build();

        restaurantRepository.save(rest1);

        // 6. Menu Categories for Burger King
        MenuCategory menuBurgers = MenuCategory.builder()
                .restaurant(rest1)
                .name("Burgers")
                .description("Signature flame-grilled beef and crispy chicken burgers")
                .displayOrder(1)
                .active(true)
                .build();

        MenuCategory menuSides = MenuCategory.builder()
                .restaurant(rest1)
                .name("Sides & Snacks")
                .description("Golden french fries, onion rings, and finger foods")
                .displayOrder(2)
                .active(true)
                .build();

        MenuCategory menuDrinks = MenuCategory.builder()
                .restaurant(rest1)
                .name("Drinks & Shakes")
                .description("Chilled sodas and creamy milkshakes")
                .displayOrder(3)
                .active(true)
                .build();

        menuCategoryRepository.saveAll(List.of(menuBurgers, menuSides, menuDrinks));

        // 7. Food Items for Burger King
        FoodItem food1 = FoodItem.builder()
                .restaurant(rest1)
                .menuCategory(menuBurgers)
                .name("Double Whopper with Cheese")
                .description("Two 1/4 lb flame-grilled beef patties with melted American cheese, lettuce, pickles, and mayo on a sesame bun.")
                .price(new BigDecimal("6.50"))
                .imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600")
                .preparationTime(15)
                .available(true)
                .rating(4.9)
                .build();

        FoodItem food2 = FoodItem.builder()
                .restaurant(rest1)
                .menuCategory(menuBurgers)
                .name("Crispy Spicy Chicken Deluxe")
                .description("Tender white meat chicken fillet seasoned with spicy pepper blend, layered with lettuce and tomato.")
                .price(new BigDecimal("5.25"))
                .imageUrl("https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600")
                .preparationTime(12)
                .available(true)
                .rating(4.7)
                .build();

        FoodItem food3 = FoodItem.builder()
                .restaurant(rest1)
                .menuCategory(menuSides)
                .name("Golden French Fries (Large)")
                .description("Crispy, piping hot golden fries salted to perfection.")
                .price(new BigDecimal("2.50"))
                .imageUrl("https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600")
                .preparationTime(8)
                .available(true)
                .rating(4.8)
                .build();

        FoodItem food4 = FoodItem.builder()
                .restaurant(rest1)
                .menuCategory(menuSides)
                .name("Crispy Onion Rings")
                .description("Thick-cut, golden-battered onion rings with signature zesty dipping sauce.")
                .price(new BigDecimal("3.00"))
                .imageUrl("https://images.unsplash.com/photo-1639024471287-032f66ab7503?w=600")
                .preparationTime(10)
                .available(true)
                .rating(4.6)
                .build();

        FoodItem food5 = FoodItem.builder()
                .restaurant(rest1)
                .menuCategory(menuDrinks)
                .name("Chocolate Oreo Shake")
                .description("Creamy vanilla soft serve blended with chocolate syrup and Oreo cookie crumbles.")
                .price(new BigDecimal("3.50"))
                .imageUrl("https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600")
                .preparationTime(5)
                .available(true)
                .rating(4.9)
                .build();

        foodItemRepository.saveAll(List.of(food1, food2, food3, food4, food5));

        // 8. Coupons
        Coupon coupon1 = Coupon.builder()
                .code("WELCOME10")
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00"))
                .minimumOrderAmount(new BigDecimal("10.00"))
                .maximumDiscount(new BigDecimal("5.00"))
                .usageLimit(1000)
                .usedCount(0)
                .startDate(LocalDate.now().minusDays(5))
                .expirationDate(LocalDate.now().plusMonths(6))
                .active(true)
                .build();

        Coupon coupon2 = Coupon.builder()
                .code("FREESHIP")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("1.50"))
                .minimumOrderAmount(new BigDecimal("8.00"))
                .usageLimit(500)
                .usedCount(0)
                .startDate(LocalDate.now().minusDays(5))
                .expirationDate(LocalDate.now().plusMonths(6))
                .active(true)
                .build();

        Coupon coupon3 = Coupon.builder()
                .code("SAVE5")
                .discountType(DiscountType.FIXED_AMOUNT)
                .discountValue(new BigDecimal("5.00"))
                .minimumOrderAmount(new BigDecimal("20.00"))
                .usageLimit(200)
                .usedCount(0)
                .startDate(LocalDate.now().minusDays(5))
                .expirationDate(LocalDate.now().plusMonths(6))
                .active(true)
                .build();

        couponRepository.saveAll(List.of(coupon1, coupon2, coupon3));

        log.info("Seed data initialized successfully!");
    }
}
