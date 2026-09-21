-- =====================================================
-- Cravery Platform: Comprehensive Restaurant & Food Seed
-- =====================================================
BEGIN;

-- 1. Insert New Categories if not present
INSERT INTO restaurant_categories (id, name, description, image_url, active, created_at)
VALUES (7, 'Japanese & Sushi', 'Fresh nigiri, sashimi platters, ramen, and robata grilled specialties', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600', true, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;
INSERT INTO restaurant_categories (id, name, description, image_url, active, created_at)
VALUES (8, 'Korean & Asian Fusion', 'Crispy Korean fried chicken, sizzling bulgogi, and Asian street comfort food', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600', true, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;
INSERT INTO restaurant_categories (id, name, description, image_url, active, created_at)
VALUES (9, 'Mexican & Street Food', 'Authentic birria tacos, loaded quesadillas, sizzling fajitas, and nachos', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600', true, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;
INSERT INTO restaurant_categories (id, name, description, image_url, active, created_at)
VALUES (10, 'Desserts & Ice Cream', 'Handcrafted Italian gelato, bubble waffles, gourmet cakes, and sweets', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', true, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;
UPDATE restaurants SET category_id = 7 WHERE id = 8;

-- 2. Insert Restaurant Owners
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Vannak Brown', 'vannak.brown@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220010', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Sopheap Heng', 'sopheap.eleven@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220011', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Luigi Romano', 'luigi.romano@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220012', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Min-ho Park', 'minho.seoul@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220013', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('David Thornton', 'david.texas@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220014', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Chef Lu Zhao', 'chef.yisang@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220015', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Emma Watson', 'emma.backyard@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220016', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Chanthy Chea', 'chanthy.romdeng@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220017', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Carlos Mendoza', 'carlos.tacos@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220018', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Hiroshi Sato', 'hiroshi.hakata@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220019', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Jean-Pierre Laurent', 'jeanpierre.kayser@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220020', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Nguyen Van Nam', 'nam.pho99@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220021', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Somnang Sok', 'somnang.pizza@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220022', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Alice Moreau', 'alice.gelato@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220023', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Somchai Prasert', 'somchai.bangkok@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220024', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Lucas Miller', 'lucas.shake@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512220025', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. Update Restaurant 9 (Angkor Craft Brewery)
UPDATE restaurants SET 
    rating = 4.8, 
    review_count = 32, 
    updated_at = NOW() 
WHERE id = 9;

-- Menu categories & food items for Restaurant 9

DO $$
DECLARE
    v_cat_id bigint;
BEGIN
    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Slow-Smoked Texas BBQ', 'Smoked low and slow over Cambodian rambutan and coffee wood for up to 14 hours', 1, true, 9)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Smoked Prime Beef Brisket Platter (250g)', 'Melt-in-your-mouth tender brisket with deep pepper bark, served with pickled onions, jalapenos, and house BBQ sauce.', 12.95, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 15, true, 4.9, 9, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Memphis Dry-Rub St. Louis Ribs (Half Rack)', 'Smoky fall-off-the-bone pork ribs dusted in sweet paprika and brown sugar dry rub.', 11.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 15, true, 4.8, 9, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Smoked Pulled Pork Sliders (3 pcs)', 'Tender hickory pulled pork on brioche buns topped with crunchy vinegar coleslaw.', 6.75, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', 12, true, 4.8, 9, v_cat_id, NOW(), NOW());
END $$;

DO $$
DECLARE
    v_cat_id bigint;
BEGIN
    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Smokehouse Starters & Sides', 'Comfort sides and craft bar snacks', 2, true, 9)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Smoked Pork Belly Bites', 'Cubed pork belly burnt ends glazed in hot honey BBQ sauce.', 5.75, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 10, true, 4.8, 9, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Four-Cheese Smoked Mac & Cheese', 'Cavatappi pasta baked in sharp cheddar, gouda, and gruyère with panko crumb crust.', 4.50, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600', 10, true, 4.9, 9, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Charred Jalapeño Cheddar Cornbread', 'Warm baked skillet cornbread served with honey whipped butter.', 3.50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', 8, true, 4.7, 9, v_cat_id, NOW(), NOW());
END $$;

DO $$
DECLARE
    v_cat_id bigint;
BEGIN
    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Craft Beverages & Sodas', 'House craft sodas and refreshing drinks', 3, true, 9)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Craft Artisanal Ginger Beer (Non-Alcoholic)', 'Brewed with fiery ginger root, lime juice, and cane sugar.', 2.75, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, 9, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Smoked Lemonade Iced Cooler', 'Grilled caramelized lemon juice over crushed ice and sparkling soda.', 2.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.7, 9, v_cat_id, NOW(), NOW());
END $$;

-- 4. Insert Restaurants 10 to 25 with Menu Categories and Foods

-- Restaurant 10: Brown Coffee & Roastery
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 10;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'vannak.brown@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'vannak.brown@fooddelivery.com', 'Brown Coffee & Roastery';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Brown Coffee & Roastery', 'Cambodia''s premier homegrown specialty coffeehouse. Featuring freshly roasted single-origin beans, artisanal pastries, and handcrafted brunch.', 'St 51 corner St 302, BKK1, Phnom Penh', '+855 23 215 151', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200', 4.9, 48, 1.25, 3.00, '06:30', '21:00', 11.5512, 104.9261, 'APPROVED', 4, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Specialty Coffee & Lattes', 'Espresso drinks brewed with freshly roasted house beans', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Brown Palm Sugar Latte', 'Signature espresso layered with organic Kampong Speu palm sugar and fresh creamy milk.', 3.45, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spanish Cortado', 'Double shot espresso cut with equal part warm velvety steamed milk.', 2.85, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Cold Brew Reserve', 'Steeped for 18 hours, smooth with chocolate and nutty undertones.', 3.25, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Kyoto Iced Uji Matcha Latte', 'Ceremonial grade matcha whisked with fresh milk and a touch of sweetness.', 3.75, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Artisanal Bakery & Croissants', 'Baked fresh every morning using French butter', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Almond Frangipane Croissant', 'Flaky butter croissant filled with almond cream and topped with toasted almonds and powdered sugar.', 2.95, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pain au Chocolat Supreme', 'Double chocolate baton rolled in delicate layered French puff pastry.', 2.65, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Basque Burnt Cheesecake Slice', 'Caramelized crust with an ultra-creamy, melt-in-your-mouth center.', 3.85, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', 3, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('All-Day Gourmet Brunch', 'Wholesome brunch dishes prepared to order', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Avocado & Poached Eggs Sourdough', 'Mashed Hass avocado on toasted sourdough with two organic poached eggs and chili flakes.', 5.50, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Truffle Mushroom Scramble Croissant', 'Fluffy scrambled eggs with sautéed button mushrooms and white truffle oil in a warm croissant.', 5.25, 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Smoked Salmon Bagel Deluxe', 'Toasted sesame bagel with dill cream cheese, capers, pickled red onions, and Norwegian smoked salmon.', 6.25, 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 11: Eleven One Kitchen
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 11;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'sopheap.eleven@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'sopheap.eleven@fooddelivery.com', 'Eleven One Kitchen';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Eleven One Kitchen', 'Eco-friendly dining celebrating authentic Khmer recipes prepared with 100% MSG-free, locally sourced organic produce.', 'St 460, Sangkat Tuol Tompoung 1 (Russian Market), Phnom Penh', '+855 86 516 111', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200', 4.8, 36, 1.25, 3.50, '07:00', '21:30', 11.5401, 104.9152, 'APPROVED', 2, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Traditional Khmer Mains', 'Time-honored Cambodian classics made with local herbs', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Signature Beef Lok Lak', 'Tender stir-fried marinated beef cubes served with jasmine rice, a fried organic egg, and Kampot black pepper lime dip.', 6.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Mekong Fish Amok in Banana Leaf', 'Boneless river fish steamed with fresh kroeung paste, coconut cream, and noni leaves.', 5.95, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 18, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Prahok Ktis Dipping Platter', 'Minced pork cooked with coconut milk, fermented fish, and pea eggplants served with crisp seasonal raw vegetables.', 5.25, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', 14, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Lemongrass Stir-Fried Chicken (Chha Kroeung)', 'Free-range chicken wok-tossed with aromatic yellow lemongrass paste, holy basil, and peanuts.', 4.95, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Soups & Refreshing Salads', 'Light, wholesome broths and vibrant Cambodian salads', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Green Mango & Smoked Fish Salad', 'Shredded sour green mango tossed with crispy smoked lake fish, shallots, mint, and toasted peanuts.', 4.50, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Khmer Chicken & Winter Melon Soup (Samlor Korko)', 'Nourishing hearty herbal broth packed with pumpkin, green papaya, roasted ground rice, and moringa leaves.', 4.75, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 15, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spicy Kampot Pepper Squid', 'Fresh coastal squid flash-fried with aromatic green Kampot peppercorns, garlic, and spring onions.', 6.75, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Fresh Coolers & Healthy Drinks', 'Naturally sweetened tropical refreshments', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Fresh Passion Fruit Mint Cooler', 'Freshly scooped purple passion fruit with crushed ice, wild mint, and local honey.', 2.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Lemongrass Butterfly Pea Iced Tea', 'Vibrant blue butterfly pea flower infusion paired with fragrant lemongrass and lime.', 2.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 12: Luigi's Neapolitan Pizzeria
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 12;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'luigi.romano@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'luigi.romano@fooddelivery.com', 'Luigi''s Neapolitan Pizzeria';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Luigi''s Neapolitan Pizzeria', 'Authentic wood-fired Neapolitan pizza fermented for 48 hours. San Marzano tomatoes, fresh mozzarella, and traditional Italian craftsmanship.', 'St 308, Bassac Lane, Chamkarmon, Phnom Penh', '+855 17 888 240', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200', 4.9, 42, 1.50, 5.00, '11:00', '23:00', 11.5519, 104.9312, 'APPROVED', 3, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Wood-Fired Neapolitan Pizzas', 'Baked at 450°C in an authentic volcanic stone oven', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Margherita Verace D.O.P.', 'San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.', 8.50, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Diavola Piccante & Hot Honey', 'Spicy Italian salami, fiery calabrian chilies, San Marzano sauce, fior di latte, and hot honey drizzle.', 9.75, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Tartufata & Funghi Selvatici', 'Truffle cream base, wild sautéed porcini and champignon mushrooms, fior di latte, and shaved parmesan.', 11.50, 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600', 16, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Quattro Formaggi Cremosa', 'Gorgonzola D.O.P., aged parmesan, creamy ricotta, and melted fior di latte mozzarella.', 10.25, 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600', 15, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Handmade Pastas & Starters', 'Freshly rolled pasta and rustic antipasti', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Burrata Pugliese con Pomodorini', 'Creamy 150g whole Pugliese burrata cheese served with roasted cherry tomatoes, basil pesto, and warm focaccia.', 8.95, 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Tagliatelle al Ragù Bolognese', 'Fresh egg ribbons simmered in slow-cooked prime beef ragù with red wine and rosemary.', 9.50, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600', 15, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Truffle Arancini (4 pcs)', 'Golden fried saffron risotto balls stuffed with gooey mozzarella and served with garlic aioli.', 5.75, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 10, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Dolci & Desserts', 'Classic Italian confectionary', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Tiramisù Tradizionale al Mascarpone', 'Savoiardi ladyfingers soaked in espresso and Marsala wine, layered with fluffy mascarpone mousse and cocoa.', 4.50, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Sicilian Cannoli Siciliani (2 pcs)', 'Crispy pastry shells filled with sweet ricotta cream, chocolate chips, and crushed pistachios.', 3.95, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 13: Seoul BBQ & Fried Chicken (K-Town)
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 13;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'minho.seoul@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'minho.seoul@fooddelivery.com', 'Seoul BBQ & Fried Chicken (K-Town)';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Seoul BBQ & Fried Chicken (K-Town)', 'Crispy double-fried Korean fried chicken glazed in signature sauces, sizzling beef bulgogi bowls, and bubbling street-style kimchi stews.', 'St 310, Boeung Keng Kang 1, Phnom Penh', '+855 98 777 889', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1200', 4.8, 39, 1.50, 4.00, '10:30', '23:30', 11.5495, 104.922, 'APPROVED', 8, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Korean Fried Chicken (Chimaek)', 'Extra crispy double-fried chicken coated in addictive Korean glazes', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Honey Butter Crunch Chicken (Whole)', 'Golden crispy fried chicken tossed in sweet honey butter glaze and fine garlic powder.', 9.50, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600', 20, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Yangnyeom Sweet & Spicy Wings (8 pcs)', 'Classic Korean red pepper sauce glaze with crushed peanuts and sesame seeds.', 6.75, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600', 15, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Soy Garlic Boneless Bites', 'Crispy boneless chicken thigh pieces glazed in savory garlic soy reduction.', 6.25, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600', 15, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Sizzling BBQ & Rice Bowls', 'Marinated meats served with warm rice and banchan sides', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Sizzling Beef Bulgogi Rice Bowl', 'Thinly sliced prime beef marinated in sweet pear soy sauce, wok-charred with onions and mushrooms.', 7.25, 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spicy Pork Dolsot Bibimbap', 'Gochujang marinated pork with sautéed vegetables, kimchi, fried egg, and nori over rice.', 6.50, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600', 15, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Cheesy Rose Tteokbokki', 'Chewy Korean rice cakes and fish cakes simmered in creamy spicy gochujang rose cream topped with melted mozzarella.', 5.75, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Soups & Sides', 'Bubbling stews and classic street favorites', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Kimchi Jjigae with Pork Belly', 'Rich bubbling stew made with aged kimchi, tender pork belly, silky tofu, and scallions.', 5.95, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 15, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Seafood Kimchi Pancake (Jeon)', 'Pan-fried savory pancake studded with scallions, squid, prawns, and tangy kimchi.', 5.50, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Korean Milk Bingsu Cup', 'Shaved snowflake milk ice with sweet red beans, injeolmi rice cakes, and condensed milk.', 3.75, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', 8, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 14: Texas Chicken Riverside
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 14;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'david.texas@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'david.texas@fooddelivery.com', 'Texas Chicken Riverside';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Texas Chicken Riverside', 'Big, juicy, crunchy Texas-style fried chicken, warm golden honey-butter biscuits, and signature jalapeno cheese burgers.', 'Preah Sisowath Quay, Sangkat Chey Chumneas, Phnom Penh', '+855 23 990 011', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=1200', 4.7, 52, 1.25, 3.00, '08:00', '23:00', 11.5682, 104.932, 'APPROVED', 1, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Crunchy Chicken & Combos', 'Hand-battered fresh fried chicken seasoned with southern spices', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('3-Piece Mega Crunch Chicken Combo', '3 pieces of crispy golden fried chicken served with 1 honey-butter biscuit, coleslaw, and french fries.', 5.95, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spicy Jalapeno Crunch Burger', 'Huge crispy chicken fillet topped with pickled jalapenos, spicy pepperjack cheese, lettuce, and smoky mayo.', 4.75, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Texas Tender Strips (5 pcs)', '100% white meat chicken tenders with honey mustard and BBQ dipping sauces.', 4.25, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600', 8, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Biscuits & Classic Sides', 'Fresh out-of-the-oven signature biscuits and hot sides', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Golden Honey-Butter Biscuits (3 pcs)', 'Drizzled with sweet honey butter straight from the oven.', 2.25, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Creamy Mashed Potatoes with Brown Gravy', 'Smooth whipped potatoes smothered in savory country brown gravy.', 1.95, 'https://images.unsplash.com/photo-1514944298352-824f2b963a75?w=600', 5, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Crinkle Cut Fries (Large)', 'Golden crinkle fries dusted with Texas seasoning salt.', 2.15, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', 6, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Creamy Southern Coleslaw', 'Crisp cabbage and carrots tossed in sweet and tangy cream dressing.', 1.75, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', 3, true, 4.6, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Chilled Drinks', 'Ice-cold sodas and iced lemon teas', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Fresh Sweet Lemonade (Large)', 'Freshly squeezed lemons with pure cane sugar syrup.', 1.75, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Southern Sweet Peach Tea', 'Brewed black tea infused with sweet peach puree.', 1.95, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 15: Yi Sang Cantonese & Seafood
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 15;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'chef.yisang@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'chef.yisang@fooddelivery.com', 'Yi Sang Cantonese & Seafood';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Yi Sang Cantonese & Seafood', 'Masterful Cantonese cuisine, succulent charcoal-roasted Peking duck, crispy pork belly, live seafood preparations, and handmade dim sum.', 'Preah Sisowath Quay, Phnom Penh', '+855 23 211 088', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=1200', 4.9, 45, 1.75, 6.00, '07:30', '22:00', 11.5645, 104.9318, 'APPROVED', 5, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Roast Meats & Specialties', 'Hong Kong style charcoal roasted ducks and crispy meats', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Roasted Cantonese Duck with Plum Sauce (Half)', 'Crispy spiced skin with tender aromatic duck meat served with traditional sweet plum sauce.', 14.50, 'https://images.unsplash.com/photo-1514944298352-824f2b963a75?w=600', 20, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Crackling Golden Roast Pork Belly', 'Pork belly roasted to golden perfection with crisp skin and succulent layers.', 8.95, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Honey-Glazed Char Siu BBQ Pork', 'Tender pork loin basted in sweet maltose honey and five-spice marinade.', 7.95, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600', 15, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Handmade Dim Sum', 'Delicate steamed and pan-fried bites', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Steamed Crystal Prawn Har Gow (4 pcs)', 'Translucent pleated dumplings generously stuffed with crunchy tiger prawns and bamboo shoots.', 4.50, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Steamed Pork & Prawn Siu Mai (4 pcs)', 'Savory steamed dumplings topped with flying fish roe.', 4.25, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pan-Fried Shanghai Pork Buns (3 pcs)', 'Crispy bottom pan-fried baozi with juicy pork filling and aromatic soup inside.', 3.95, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Wok Noodles & Desserts', 'Aromatic stir-fried noodles and sweet treats', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Wok-Fried Beef Hor Fun with Bean Sprouts', 'Wide flat rice noodles tossed with sliced tender beef and scallions with smoky wok hei flavor.', 6.75, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chilled Mango Sago with Pomelo', 'Sweet ripe mango puree with chewy sago pearls, fresh pomelo pulp, and coconut milk.', 3.50, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 16: Backyard Cafe & Wellness
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 16;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'emma.backyard@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'emma.backyard@fooddelivery.com', 'Backyard Cafe & Wellness';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Backyard Cafe & Wellness', 'Phnom Penh''s favorite clean-eating cafe. Packed with nutrient-dense superfood smoothie bowls, hearty vegan macro bowls, and cold-pressed elixirs.', 'St 240, Daun Penh, Phnom Penh', '+855 78 737 077', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200', 4.9, 37, 1.25, 3.50, '07:00', '20:30', 11.5588, 104.9295, 'APPROVED', 6, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Superfood Smoothie Bowls', 'Thick blended organic fruit bowls topped with crunchy granola', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Amazonian Acai Energy Bowl', 'Organic pure acai puree blended with banana, topped with chia seeds, house peanut butter, coconut chips, and strawberries.', 5.95, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600', 8, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Dragonfruit Tropical Glow Bowl', 'Vibrant pink dragonfruit and mango puree topped with passion fruit, kiwi, and hemp seeds.', 5.25, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Wholesome Warm Bowls & Salads', 'Nourishing grain bowls loaded with clean plant proteins', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('The Earth Bowl with Lemon Tahini', 'Organic tricolor quinoa, roasted sweet potatoes, steamed kale, spiced chickpeas, and avocado with garlic tahini dressing.', 6.75, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Grilled Lemongrass Tofu Protein Bowl', 'Marinated organic tofu with brown rice, edamame, shredded red cabbage, pickled carrots, and peanut lime vinaigrette.', 5.75, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Smoked Salmon Rainbow Salad', 'Norwegian smoked salmon over wild rocket, cherry tomatoes, cucumbers, poached egg, and caper dill dressing.', 7.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Cold-Pressed Juices & Healthy Sweets', '100% raw unpasteurized juice and guilt-free desserts', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Glow Green Detox Juice (350ml)', 'Cold-pressed celery, green apple, cucumber, kale, ginger, and lime.', 3.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Golden Turmeric Immunity Elixir', 'Fresh turmeric, ginger root, orange, carrot, and black pepper oil.', 3.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Raw Vegan Salted Caramel Snickers Bar', 'Almond flour base, chewy medjool date caramel, roasted peanuts, and dark raw cacao coating. Gluten-free and refined sugar-free.', 3.00, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', 3, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 17: Romdeng Traditional Khmer Heritage
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 17;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'chanthy.romdeng@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'chanthy.romdeng@fooddelivery.com', 'Romdeng Traditional Khmer Heritage';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Romdeng Traditional Khmer Heritage', 'Celebrated culinary institution showcasing ancient Cambodian recipes, royal heritage platters, fragrant Kampot peppercorn delights, and seasonal feasts.', 'St 174, Sangkat Phsar Thmey 3, Daun Penh, Phnom Penh', '+855 92 219 546', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', 4.9, 41, 1.50, 4.50, '11:00', '22:00', 11.5665, 104.9231, 'APPROVED', 2, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Royal Cambodian Heritage Dishes', 'Historic Khmer recipes preserved and perfected', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Royal Mekong Lobster Amok', 'Succulent sweet river lobster meat braised in velvety coconut kroeung curry and steamed inside a fresh whole coconut.', 12.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 22, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Charred Pork Ribs with Fresh Kampot Peppercorns', 'Slow-glazed pork spare ribs caramelized with wild Kampot green peppercorns, palm syrup, and garlic.', 8.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 18, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pomelo & River Prawn Salad (Nhoam Kroch Thlong)', 'Juicy sweet pomelo segments tossed with poached river prawns, toasted shallots, and fresh mint.', 5.95, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Taro & Crab Spring Rolls (4 pcs)', 'Handmade golden rolls filled with shredded sweet taro root and sweet blue swimmer crab meat.', 4.75, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Khmer Curries & Wok Delights', 'Fragrant curries and sizzling Cambodian stir fries', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Saraman Beef Curry (Kari Saraman)', 'Rich, deeply spiced braised beef shank in roasted peanut and coconut milk curry with star anise and cinnamon.', 7.95, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 18, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Stir-Fried Morning Glory with Crispy Garlic (Chha Trokuon)', 'Crisp tender river greens wok-tossed with fermented yellow soybean paste and crispy garlic.', 3.75, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', 10, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Khmer Desserts & Coolers', 'Sweet endings made with fresh coconut and tropical fruits', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Sweet Mango Sticky Rice with Warm Coconut Cream', 'Fragrant butterfly pea coconut sticky rice served with sweet golden mango slices and toasted sesame seeds.', 3.50, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', 6, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Pandan Lemongrass Tea', 'Brewed fresh pandan leaf and crushed lemongrass over crushed ice.', 2.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 18: Tacos & Tequila Phnom Penh
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 18;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'carlos.tacos@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'carlos.tacos@fooddelivery.com', 'Tacos & Tequila Phnom Penh';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Tacos & Tequila Phnom Penh', 'Authentic Mexican taqueria. Juicy slow-cooked birria beef with consomé dipping broth, Baja crispy fish tacos, loaded cheesy nachos, and churros.', 'St 450, Tuol Tompoung (Russian Market), Phnom Penh', '+855 11 345 678', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200', 4.8, 33, 1.50, 4.00, '11:30', '23:00', 11.5385, 104.9142, 'APPROVED', 9, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Signature Street Tacos (3 pcs)', 'Served on warm double corn tortillas with cilantro and chopped white onion', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Quesabirria Tacos with Rich Consomé', 'Slow-braised beef shank grilled in corn tortillas with melted cheese, served with hot spiced dipping broth and limes.', 7.50, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Baja Fish Tacos', 'Crispy beer-battered white fish fillet topped with crunchy chipotle slaw and pickled red onions.', 6.95, 'https://images.unsplash.com/photo-1512838243191-e81e88cc8912?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pork Carnitas Michoacan Tacos', 'Slow-rendered tender pork carnitas topped with fresh guacamole and salsa verde.', 6.50, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Quesadillas & Loaded Nachos', 'Cheesy Mexican comfort food', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Ultimate Loaded Volcano Nachos', 'Crisp tortilla chips smothered in warm queso sauce, black beans, pico de gallo, sour cream, and jalapenos.', 6.25, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chipotle Chicken & Cheese Quesadilla', 'Toasted flour tortilla stuffed with grilled spiced chicken and melted Monterey Jack cheese with guacamole.', 5.75, 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600', 10, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Fresh Guacamole & Corn Tortilla Chips', 'Hass avocado mashed with lime, sea salt, tomatoes, cilantro, and serrano chilies.', 3.95, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', 6, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Desserts & Mexican Drinks', 'Crisp churros and refreshing aguas frescas', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Golden Cinnamon Churros with Dulce de Leche', 'Piping hot Mexican churros dusted in cinnamon sugar served with warm dulce de leche dipping sauce.', 3.75, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', 8, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Horchata Fresca (500ml)', 'Traditional sweet rice milk flavored with cinnamon, vanilla, and crushed almonds.', 2.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 19: Hakata Tonkotsu Ramen House
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 19;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'hiroshi.hakata@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'hiroshi.hakata@fooddelivery.com', 'Hakata Tonkotsu Ramen House';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Hakata Tonkotsu Ramen House', 'Authentic Japanese ramen master crafting rich, collagen-packed 24-hour pork bone broths, handcrafted springy noodles, and charred chashu.', 'St 288, Boeung Keng Kang 1, Phnom Penh', '+855 23 221 445', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200', 4.9, 46, 1.50, 4.50, '11:00', '22:30', 11.5478, 104.9255, 'APPROVED', 7, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Artisanal Hakata Ramen', 'Rich simmering broths with firm handmade noodles and ajitsuke tamago', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Classic Hakata Tonkotsu Chashu Ramen', 'Creamy 24-hr pork bone broth with tender rolled pork chashu, soft ramen egg, wood ear mushrooms, and nori.', 7.95, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Kuro Mayu Black Garlic Tonkotsu Ramen', 'Infused with roasted black garlic oil, giving deep aromatic complexity, chashu slices, and bean sprouts.', 8.50, 'https://images.unsplash.com/photo-1552611052-33e04de081de?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Fiery Red Spicy Jigoku Miso Ramen', 'Rich miso pork broth infused with red chili oil, spicy minced pork, bamboo shoots, and chashu.', 8.25, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 15, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Japanese Izakaya Sides', 'Crispy pan-fried and deep-fried Japanese delicacies', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pan-Fried Pork Gyoza (6 pcs)', 'Crispy lace-bottom dumplings packed with juicy minced pork, ginger, and cabbage with ponzu dip.', 4.25, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Chicken Karaage with Kewpie Aioli', 'Double-fried Japanese ginger soy chicken bites served with lemon and kewpie mayo.', 4.75, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Torched Chashu Don Rice Bowl', 'Steamed koshihikari rice topped with diced caramelized chashu, sweet tare sauce, and spring onions.', 4.95, 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Drinks & Desserts', 'Refreshing Japanese teas and mochi ice cream', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Matcha Green Tea Mochi Ice Cream (2 pcs)', 'Chewy rice dough filled with rich bittersweet Japanese matcha ice cream.', 2.95, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chilled Japanese Iced Genmaicha Tea', 'Toasted brown rice green tea brewed cold.', 1.95, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 20: Eric Kayser Artisan French Boulangerie
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 20;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'jeanpierre.kayser@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'jeanpierre.kayser@fooddelivery.com', 'Eric Kayser Artisan French Boulangerie';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Eric Kayser Artisan French Boulangerie', 'World-renowned master French baker. Pure French Normandy butter croissants, crisp sourdough baguettes, quiches, and delicate French patisserie.', 'Vattanac Capital, Preah Monivong Blvd, Wat Phnom, Phnom Penh', '+855 23 963 888', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200', 4.9, 38, 1.50, 4.00, '07:00', '20:00', 11.5732, 104.9198, 'APPROVED', 4, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Viennoiseries & French Breads', 'Handcrafted with French natural liquid leaven and Normandy butter', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Traditional French Butter Croissant', 'Golden, flaky, 24-layered croissant with rich melt-in-the-mouth French butter aroma.', 2.20, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pain au Chocolat Pur Beurre', 'Filled with two bars of premium Valrhona dark chocolate.', 2.50, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Artisan Baguette Monge', 'Kayser signature sourdough baguette with a crackling crust and airy honeycomb crumb.', 2.25, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Gourmet Sandwiches & Savory Quiches', 'Classic French café fare made with artisan bread', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Parisian Jambon-Beurre Baguette', 'Fresh crispy baguette with French ham, cornichons, and generous Normandy butter.', 5.25, 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Traditional Croque Monsieur', 'Toasted pain de mie layered with ham, creamy béchamel sauce, and bubbling Gruyère cheese.', 5.75, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Quiche Lorraine Slice', 'Rich egg custard baked with smoked bacon lardons and Swiss cheese in a flaky crust.', 4.50, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('French Patisserie & Specialty Café', 'Finest Parisian pastries and espresso', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Royal Dark Chocolate Éclair', 'Choux pastry piped with silky Valrhona 70% dark chocolate cream and glossy ganache.', 3.50, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Lemon Meringue Tartlet', 'Crisp sablé shell with tangy lemon curd and lightly torched Italian meringue.', 3.75, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Café Crème au Lait', 'Double espresso with velvety steamed whole milk in French Parisian style.', 2.85, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 21: Pho 99 Saigon Street Kitchen
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 21;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'nam.pho99@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'nam.pho99@fooddelivery.com', 'Pho 99 Saigon Street Kitchen';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Pho 99 Saigon Street Kitchen', 'Authentic Southern Vietnamese pho with 18-hour simmered star anise bone broth, fresh banh mi baguettes, and crispy spring rolls.', 'Preah Monivong Blvd, Sangkat Boeung Prolit, Phnom Penh', '+855 12 444 332', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300', 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=1200', 4.8, 35, 1.25, 3.50, '07:00', '21:30', 11.5542, 104.9185, 'APPROVED', 8, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Signature Vietnamese Pho', 'Fragrant beef and chicken broths with flat rice noodles and fresh herbs', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pho Dac Biet (Special Combination Beef Pho)', 'Loaded with rare sliced tender beef, brisket, flank, beef meatballs, fresh thai basil, bean sprouts, and lime.', 5.75, 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pho Bo Tai (Rare Beef Pho)', 'Tender thinly sliced Australian ribeye cooked gently in piping hot star anise broth.', 5.25, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pho Ga (Free-Range Chicken Pho)', 'Shredded yellow chicken in clear ginger coriander chicken broth.', 4.75, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 10, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Banh Mi & Street Bites', 'Crispy baguettes and Vietnamese appetizers', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Banh Mi Thit Dac Biet', 'Crisp Vietnamese baguette stuffed with pork liver pate, cha lua pork roll, pickled daikon, cucumber, cilantro, and chili.', 3.75, 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600', 8, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Hanoi Fried Spring Rolls (Nem Ran 4 pcs)', 'Golden fried rice paper rolls packed with minced pork, glass noodles, wood ear mushrooms, and nuoc cham dip.', 3.50, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Fresh Summer Rice Paper Rolls (Goi Cuon 3 pcs)', 'Poached prawns, pork slices, fresh mint, and vermicelli wrapped in translucent rice paper with peanut dipping sauce.', 3.50, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', 6, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Vietnamese Specialty Coffee', 'Strong drip robusta with sweet condensed milk', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Ca Phe Sua Da (Iced Vietnamese Coffee)', 'Drip brewed dark roast robusta coffee over sweet condensed milk and crushed ice.', 2.25, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Coconut Coffee Smoothie', 'Blended iced coconut cream with bold Vietnamese espresso float.', 2.75, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 22: The Pizza Company Toul Kork
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 22;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'somnang.pizza@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'somnang.pizza@fooddelivery.com', 'The Pizza Company Toul Kork';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'The Pizza Company Toul Kork', 'Cambodia''s beloved pizza family favorite. Iconic Cheesy Pan Crust, loaded Seafood Deluxe pizzas, juicy glazed wings, and comforting pastas.', 'St 315, Sangkat Boeung Kak 1, Toul Kork, Phnom Penh', '+855 23 880 880', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300', 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=1200', 4.7, 50, 1.25, 4.00, '10:00', '22:00', 11.5788, 104.8965, 'APPROVED', 3, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Signature Pan Pizzas', 'Thick golden buttery pan crust loaded with cheese', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Seafood Deluxe Pan Pizza (Medium)', 'Loaded with succulent shrimp, crab sticks, squid, mozzarella, and Thousand Island marinara.', 11.95, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600', 18, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Hawaiian Supreme Pan Pizza', 'Double cured ham, crispy bacon bits, sweet pineapple chunks, and melted mozzarella cheese.', 9.50, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600', 16, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Meat Deluxe Extravaganza', 'Pepperoni, ground beef, ham, sausage, mushrooms, bell peppers, and mozzarella.', 10.50, 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600', 16, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Hot Appetizers & Pastas', 'Crispy glazed wings, garlic breads, and baked pastas', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('BBQ Glazed Chicken Wings (6 pcs)', 'Juicy oven-baked chicken wings tossed in smoky honey BBQ glaze.', 4.75, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Garlic Bread Supreme with Mozzarella', 'Crispy French bread loaf toasted with garlic herb butter and melted mozzarella.', 3.25, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 8, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Baked Cheesy Penne Carbonara', 'Penne pasta baked with smoked bacon, creamy carbonara sauce, and golden browned cheese.', 5.95, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Baked Spinach & Cheese Gratin', 'Creamy tender spinach baked with rich cheddar and mozzarella crust.', 4.25, 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600', 12, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Desserts & Sodas', 'Sweet desserts and carbonated refreshments', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chocolate Lava Cake with Vanilla Dip', 'Warm molten chocolate cake with gooey fudge center.', 3.75, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Sparkling Italian Strawberry Soda', 'Fizzy club soda infused with wild strawberry syrup and lime.', 2.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.6, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 23: Gelato & Sweet Delights Lab
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 23;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'alice.gelato@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'alice.gelato@fooddelivery.com', 'Gelato & Sweet Delights Lab';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Gelato & Sweet Delights Lab', 'Artisan small-batch Italian gelato, freshly made Hong Kong bubble egg waffles, decadent dessert parfaits, and thick loaded milkshakes.', 'Elite Town, Koh Pich (Diamond Island), Phnom Penh', '+855 16 999 111', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300', 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=1200', 4.9, 44, 1.25, 3.00, '11:00', '23:00', 11.551, 104.939, 'APPROVED', 10, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Artisan Italian Gelato Pints & Cups', 'Made fresh with whole milk and natural imported ingredients', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Bronte Pistachio Gelato Cup (180g)', '100% roasted Sicilian Bronte pistachios with sea salt.', 3.95, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Belgian Dark Chocolate Fudge Gelato (180g)', 'Intense 72% Callebaut chocolate folded with homemade dark fudge ribbons.', 3.75, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Madagascar Vanilla Bean & Salted Caramel Gelato', 'Infused with pure vanilla pods and swirls of buttery sea salt caramel.', 3.75, 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Alphonso Mango & Passion Fruit Sorbet', 'Dairy-free refreshing tropical sorbet made with ripe Alphonso mangoes.', 3.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Bubble Waffles & Decadent Sundaes', 'Warm crispy egg bubble waffles loaded with toppings', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Oreo Cookies & Cream Bubble Waffle Sundae', 'Warm vanilla bubble waffle wrapped around two scoops of gelato, Oreo crumbs, chocolate sauce, and whipped cream.', 5.50, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Matcha Strawberries & Cream Waffle', 'Uji matcha waffle with fresh sliced strawberries, white chocolate pearls, and vanilla gelato.', 5.75, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Thick Milkshakes & Specialty Frappes', 'Super thick shakes made with 3 scoops of real gelato', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Lotus Biscoff Speculoos Shake', 'Blended with Biscoff cookie spread, crunchy crumbs, and vanilla ice cream topped with caramel drizzle.', 3.95, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 6, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Salted Caramel Pretzel Shake', 'Creamy caramel shake topped with whipped cream, crushed salted pretzels, and caramel chips.', 3.85, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600', 6, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 24: Bangkok Express Thai Kitchen
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 24;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'somchai.bangkok@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'somchai.bangkok@fooddelivery.com', 'Bangkok Express Thai Kitchen';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Bangkok Express Thai Kitchen', 'Vibrant street-side Thai cuisine. Smoky river prawn Pad Thai, fragrant Tom Yum Goong, spicy basil crispy pork, and authentic Cha Yen iced milk tea.', 'St 360, Sangkat Toul Svay Prey 2, Phnom Penh', '+855 96 333 445', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=1200', 4.8, 40, 1.25, 3.50, '10:30', '22:00', 11.5435, 104.9125, 'APPROVED', 8, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Wok-Tossed Street Specialties', 'Classic Bangkok street food prepared with authentic Thai spices', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pad Thai Boran with River Prawns', 'Chewy rice noodles stir-fried in tamarind reduction with giant river prawns, pressed tofu, crushed peanuts, and fresh lime.', 6.75, 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pad Kra Pao Crispy Pork Belly with Fried Egg', 'Golden crispy roasted pork belly stir-fried with fiery bird''s eye chilies and holy basil over jasmine rice.', 5.95, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pineapple Fried Rice with Shrimps & Cashews', 'Golden curry spiced jasmine rice tossed with sweet pineapple, prawns, chicken floss, and roasted cashews.', 5.50, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Authentic Curries & Soups', 'Aromatic coconut curries and spicy sour broths', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Tom Yum Goong Creamy Soup', 'Hot and sour aromatic lemongrass soup packed with tiger prawns, straw mushrooms, kaffir lime, and evaporated coconut milk.', 6.50, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 14, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Thai Green Curry Chicken with Pea Eggplants', 'Tender chicken simmered in fragrant green chili paste, sweet basil, coconut milk, and bamboo shoots.', 5.75, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spicy Green Papaya Salad (Som Tum Thai)', 'Crisp pounded green papaya with dried shrimp, roasted peanuts, long beans, and palm sugar lime dressing.', 3.95, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Thai Beverages & Desserts', 'Famous Thai iced drinks and sweet mango rice', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Cha Yen (Authentic Thai Iced Milk Tea)', 'Brewed Thai red tea leaves with sweet condensed milk over crushed ice.', 2.25, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600', 3, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Cha Tra Mue Iced Green Tea', 'Fragrant Thai jasmine green tea with creamy sweet milk.', 2.25, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Mango Sticky Rice with Warm Coconut Cream', 'Ripe yellow honey mango with warm sweet coconut sticky rice.', 3.50, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 25: Shake Corner Gourmet Burgers
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 25;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'lucas.shake@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'lucas.shake@fooddelivery.com', 'Shake Corner Gourmet Burgers';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Shake Corner Gourmet Burgers', 'Premium smash burgers crafted with 100% Black Angus beef, butter-toasted potato buns, crispy Nashville hot chicken, and decadent hand-spun shakes.', 'Promenade Mall, Sen Sok City, Phnom Penh', '+855 23 888 776', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200', 4.9, 49, 1.50, 4.00, '09:30', '23:00', 11.583, 104.882, 'APPROVED', 1, v_owner_id, NOW(), NOW())
    ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description, 
        address = EXCLUDED.address,
        logo_url = EXCLUDED.logo_url, 
        cover_image_url = EXCLUDED.cover_image_url,
        category_id = EXCLUDED.category_id,
        rating = EXCLUDED.rating,
        review_count = EXCLUDED.review_count;


    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Artisanal Smash Burgers', 'Crispy lacy edges smashed on a 400°F flat-top griddle on toasted potato buns', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Truffle Bacon Double Smash Burger', 'Two 1/4 lb smashed Angus patties, double American cheese, thick-cut smoked bacon, and black truffle garlic aioli.', 7.95, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('The Classic Corner Cheeseburger', 'Single smashed patty, melted cheese, crisp lettuce, tomato, pickles, and signature Corner burger sauce.', 5.25, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Nashville Hot Crispy Chicken Sandwich', 'Crispy fried chicken thigh dipped in fiery cayenne butter, layered with dill pickles and creamy buttermilk slaw.', 6.25, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Portobello Mushroom & Swiss Burger', 'Breaded portobello mushroom cap stuffed with melted muenster and cheddar cheese.', 6.50, 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Fries & Sides', 'Golden crinkle-cut fries and gourmet starters', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Loaded Cheddar Bacon Crinkle Fries', 'Golden crinkle-cut fries smothered in warm cheese sauce, crispy bacon crumbles, and green onions.', 3.95, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Beer-Battered Onion Rings', 'Thick cut jumbo onions in crunchy batter with smoky BBQ dip.', 2.95, 'https://images.unsplash.com/photo-1639024471287-032f66ab7503?w=600', 8, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Chicken Bites with Ranch', 'Bite-sized buttermilk fried chicken pieces with homemade garlic ranch.', 3.75, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Hand-Spun Milkshakes', 'Real frozen custard blended thick with gourmet mix-ins', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Salted Caramel Pretzel Custard Shake', 'Rich vanilla frozen custard blended with sea salt caramel and pretzel crunch.', 3.85, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 6, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Strawberry Shortcake Shake', 'Fresh strawberries blended with vanilla custard and crushed graham crackers.', 3.85, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', 6, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Craft Root Beer Float', 'Sparkling draft root beer topped with a big scoop of vanilla frozen custard.', 3.25, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;

-- 5. Synchronize Sequences
SELECT setval('restaurants_id_seq', (SELECT COALESCE(MAX(id), 1) FROM restaurants));
SELECT setval('food_items_id_seq', (SELECT COALESCE(MAX(id), 1) FROM food_items));
SELECT setval('menu_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM menu_categories));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('restaurant_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM restaurant_categories));

COMMIT;
