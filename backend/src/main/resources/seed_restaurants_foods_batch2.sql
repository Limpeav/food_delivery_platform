-- =====================================================
-- Cravery Platform: Extended Restaurants 26-50 Seed
-- =====================================================
BEGIN;

-- 1. Insert Categories 11 to 14
INSERT INTO restaurant_categories (id, name, description, image_url, active, created_at)
VALUES (11, 'Indian & Himalayan', 'Fragrant curries, tandoori grills, buttery naan, and aromatic biryanis', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600', true, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;
INSERT INTO restaurant_categories (id, name, description, image_url, active, created_at)
VALUES (12, 'Boba & Specialty Drinks', 'Chewy brown sugar boba, creamy milk teas, and fruit tea coolers', 'https://images.unsplash.com/photo-1558857563-b37cf5a4c7e6?w=600', true, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;
INSERT INTO restaurant_categories (id, name, description, image_url, active, created_at)
VALUES (13, 'Middle Eastern & Halal', 'Juicy spiced shawarma, crispy falafel, hummus platters, and kebabs', 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600', true, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;
INSERT INTO restaurant_categories (id, name, description, image_url, active, created_at)
VALUES (14, 'Seafood & Coastal Grill', 'Fresh river prawns, Kep flower crabs, grilled squid, and garlic butter seafood', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600', true, NOW())
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, image_url = EXCLUDED.image_url;

-- 2. Insert Restaurant Owners 26 to 50
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Rajesh Kumar', 'rajesh.namaste@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330026', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Tarek Haddad', 'tarek.beirut@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330027', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Sareth Meas', 'sareth.kep@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330028', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Mei Ling Chen', 'meiling.alley@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330029', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Jenny Kao', 'jenny.koi@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330030', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Philippe Dubois', 'philippe.stropez@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330031', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Kenichi Takahashi', 'kenichi.yakitori@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330032', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Yumi Tanaka', 'yumi.matcha@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330033', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Sopha Prom', 'sopha.kravanh@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330034', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Buntha Sam', 'buntha.claypot@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330035', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Marco Bellini', 'marco.littleitaly@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330036', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Travis Scott', 'travis.brooklyn@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330037', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Brian Miller', 'brian.carls@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330038', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Zhang Wei', 'zhang.szechuan@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330039', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Simon Wong', 'simon.goldenduck@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330040', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Ji-hoon Lee', 'jihoon.gangnam@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330041', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Ha-eun Kim', 'haeun.busan@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330042', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Amit Patel', 'amit.chutney@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330043', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Sofia Rodriguez', 'sofia.lataqueria@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330044', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Mateo Gomez', 'mateo.bajafish@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330045', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Chloe Martin', 'chloe.organicgarden@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330046', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Ryan Davis', 'ryan.vitality@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330047', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Linh Tran', 'linh.saigonlotus@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330048', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Niran Chai', 'niran.chiangmai@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330049', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;
INSERT INTO users (name, email, password, phone_number, role, status, created_at, updated_at)
VALUES ('Camille Laurent', 'camille.macaron@fooddelivery.com', '$2a$10$4xHKFtJi9wnmjxjE3qZWTOkBvgQk/sGP/O0DDrDt.b3VXBT/VqQ1e', '+85512330050', 'RESTAURANT_OWNER', 'ACTIVE', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 3. Insert Restaurants 26 to 50 with Menu Categories and Foods

-- Restaurant 26: Namaste India Restaurant
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 26;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'rajesh.namaste@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'rajesh.namaste@fooddelivery.com', 'Namaste India Restaurant';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Namaste India Restaurant', 'Authentic North Indian fine dining featuring rich butter chicken, tender lamb rogan josh, sizzling tandoori grills, and oven-baked garlic naan.', 'St 278, BKK1, Phnom Penh', '+855 23 214 022', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200', 4.9, 52, 1.50, 4.00, '11:00', '23:00', 11.551, 104.924, 'APPROVED', 11, v_owner_id, NOW(), NOW())
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
    VALUES ('Rich Tandoori Curries', 'Simmered in aromatic spices and creamy tomato gravies', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Murgh Makhani (Butter Chicken)', 'Tender chicken tikka pieces simmered in silky tomato, butter, and fenugreek gravy.', 7.95, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Kashmiri Lamb Rogan Josh', 'Slow-braised lamb shanks infused with Kashmiri red chilies and fragrant whole spices.', 9.50, 'https://images.unsplash.com/photo-1545247181-516773cae754?w=600', 18, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Paneer Tikka Masala', 'Grilled Indian cottage cheese cubes in spiced masala gravy with bell peppers.', 6.95, 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600', 15, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Clay Oven Tandoor & Breads', 'Baked fresh against volcanic clay walls at 900°F', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Garlic Butter Naan Basket (3 pcs)', 'Piping hot leavened bread brushed with melted ghee and minced garlic.', 2.95, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 6, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Sizzling Tandoori Chicken Tikka', 'Boneless chicken marinated in spiced yogurt, charred to perfection.', 7.50, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600', 16, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Dum Biryani & Refreshments', 'Layered aromatic basmati rice and cooling drinks', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Royal Hyderabadi Mutton Biryani', 'Fragrant basmati rice steamed on dum with saffron, marinated mutton, and fried shallots.', 8.95, 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600', 18, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Sweet Mango Lassi Cooler', 'Thick churned yogurt blended with sweet Alphonso mango pulp and cardamom.', 2.75, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 27: Beirut Shawarma & Falafel
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 27;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'tarek.beirut@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'tarek.beirut@fooddelivery.com', 'Beirut Shawarma & Falafel';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Beirut Shawarma & Falafel', 'Authentic Lebanese street food. Marinated rotisserie chicken and beef shawarma wraps, crispy herbed falafel, and creamy tahini hummus.', 'Bassac Lane, Chamkarmon, Phnom Penh', '+855 12 888 991', 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=300', 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=1200', 4.8, 47, 1.25, 3.50, '11:00', '02:00', 11.5522, 104.9315, 'APPROVED', 13, v_owner_id, NOW(), NOW())
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
    VALUES ('Artisan Shawarma Wraps', 'Rolled in Lebanese flatbread with toum garlic sauce and pickles', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Super Beirut Chicken Shawarma', 'Spit-roasted chicken thigh with garlic toum, french fries, and pickled cucumbers.', 4.95, 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Prime Beef & Lamb Shawarma Wrap', 'Marinated steak strips with sumac onions, roasted tomatoes, and tahini drizzle.', 5.75, 'https://images.unsplash.com/photo-1561651823-34feb02250e4?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Golden Falafel Wrap', 'Herbed chickpea fritters with tomatoes, wild mint, radish, and tahini sauce.', 4.25, 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Mezze Platters & Dips', 'Handcrafted dips served with warm toasted pita bread', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Classic Creamy Hummus with Olive Oil', 'Blended chickpeas with tahini, lemon juice, garlic, and extra virgin olive oil.', 3.95, 'https://images.unsplash.com/photo-1577906096429-f73c2c312435?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Smoky Baba Ghanoush', 'Charred fire-roasted eggplant mashed with tahini, pomegranate seeds, and garlic.', 4.25, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Sides & Sweets', 'Crispy street bites and honeyed pastries', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spiced Sumac Fries with Garlic Dip', 'Crispy skin-on fries dusted with tangy sumac and served with garlic toum.', 2.50, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', 6, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pistachio Baklava Triangles (3 pcs)', 'Crisp flaky filo pastry layered with crushed pistachios and orange blossom honey.', 3.75, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 28: Kep Seafood Crab Shack
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 28;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'sareth.kep@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'sareth.kep@fooddelivery.com', 'Kep Seafood Crab Shack';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Kep Seafood Crab Shack', 'Celebrated coastal seafood cooked fresh with Kampot green peppercorns, sweet blue swimmer crabs, spicy river prawns, and grilled squid.', 'Preah Sisowath Quay, Daun Penh, Phnom Penh', '+855 11 777 444', 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=300', 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1200', 4.9, 58, 1.75, 5.00, '11:00', '23:00', 11.5695, 104.931, 'APPROVED', 14, v_owner_id, NOW(), NOW())
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
    VALUES ('Live Coastal Specialties', 'Wild-caught seafood prepared with authentic coastal recipes', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Famous Kep Blue Crab with Green Kampot Peppercorns', 'Whole sweet crabs stir-fried with fresh young green peppercorns, garlic, and oyster sauce.', 11.50, 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600', 20, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Charcoal-Grilled Giant River Prawns (4 pcs)', 'Char-grilled over hot coals, served with spicy seafood lime and chili dipping sauce.', 10.95, 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600', 18, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Garlic Butter Sautéed Squid', 'Tender whole squid rings wok-tossed with sweet butter, roasted garlic, and scallions.', 6.95, 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Seafood Soups & Rice', 'Comforting coastal broths and fragrant seafood rice', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Rich Seafood Fried Rice with Crab Meat', 'Wok-charred jasmine rice tossed with sweet crab meat, prawns, egg, and spring onions.', 5.75, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spicy Sour Lemongrass Seafood Soup', 'Fiery broth packed with squid, prawns, fish fillet, mushrooms, and kaffir lime.', 6.50, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Beverages', 'Iced fresh coconuts and tropical drinks', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chilled Whole Fresh Young Coconut', 'Naturally sweet coconut water served ice-cold in shell.', 2.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Passion Fruit Soda with Crushed Mint', 'Fizzy lime and passion fruit cooler over ice.', 2.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 29: The Alley Boba & Milk Tea
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 29;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'meiling.alley@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'meiling.alley@fooddelivery.com', 'The Alley Boba & Milk Tea';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'The Alley Boba & Milk Tea', 'Artisanal hand-crafted tapioca pearls slow-cooked in rich brown sugar syrup, premium fresh milk, and royal Assam black teas.', 'St 51 corner St 294, BKK1, Phnom Penh', '+855 23 218 899', 'https://images.unsplash.com/photo-1558857563-b37cf5a4c7e6?w=300', 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=1200', 4.9, 64, 1.00, 2.50, '08:30', '22:00', 11.5515, 104.925, 'APPROVED', 12, v_owner_id, NOW(), NOW())
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
    VALUES ('Brown Sugar Deerioca Series', 'Warm freshly made brown sugar boba layered with chilled milk', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Brown Sugar Deerioca Fresh Milk', 'Signature warm chewy pearls coated in house brown sugar with rich fresh milk and cream.', 3.45, 'https://images.unsplash.com/photo-1558857563-b37cf5a4c7e6?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Brown Sugar Deerioca Creme Brulee Milk', 'Topped with a layer of caramelized custard cream torched to a crisp.', 3.85, 'https://images.unsplash.com/photo-1541658016709-82535e94bc69?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Brown Sugar Matcha Fresh Milk', 'Layered with vibrant green Kyoto Uji matcha and dark brown sugar pearls.', 3.75, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Original Brewed Milk Teas', 'Fragrant high mountain tea leaves with creamy milk', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Royal No. 9 Black Milk Tea with Boba', 'Special black tea infused with notes of fresh blueberries and rich creamer.', 2.95, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Taro Coconut Milk Swirl with Pudding', 'Real mashed taro root swirl with silky egg pudding and fresh milk.', 3.25, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Lulu Fresh Fruit Teas', 'Brewed jasmine green tea shaken with fresh fruit chunks', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Peach Oolong Cheese Foam Tea', 'Aromatic white peach oolong tea capped with salty sweet cream cheese foam.', 3.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Grapefruit Sparkling Green Tea', 'Fresh ruby grapefruit slices with green tea and popping boba pearls.', 3.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 4, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 30: KOI Thé Cambodia
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 30;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'jenny.koi@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'jenny.koi@fooddelivery.com', 'KOI Thé Cambodia';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'KOI Thé Cambodia', 'World-famous Taiwanese artisan tea shop celebrated for golden tapioca pearls, velvety macchiato foam crowns, and fresh milk teas.', 'St 315, Toul Kork, Phnom Penh', '+855 23 881 223', 'https://images.unsplash.com/photo-1558857563-b37cf5a4c7e6?w=300', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=1200', 4.9, 71, 1.00, 2.50, '08:00', '22:00', 11.579, 104.899, 'APPROVED', 12, v_owner_id, NOW(), NOW())
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
    VALUES ('Golden Bubble Milk Teas', 'Natural bouncy golden tapioca pearls with signature tea blends', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Golden Bubble Milk Tea (Large)', 'Authentic Taiwanese milk tea with signature translucent golden tapioca pearls.', 3.10, 'https://images.unsplash.com/photo-1558857563-b37cf5a4c7e6?w=600', 3, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Hazelnut Chocolate Milk Tea with Pearls', 'Rich cocoa blended with roasted hazelnut syrup and chewy golden bubbles.', 3.35, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Signature Macchiato Series', 'Fresh brewed tea covered with a thick layer of whipped sweet cream', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Black Tea Macchiato', 'Rich Ceylon black tea topped with KOI''s famous velvety macchiato sweet cream.', 2.85, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600', 3, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Mango Green Tea Macchiato', 'Tropical sweet mango puree and green tea finished with dense cream foam.', 3.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Flavored Teas & Petite Pastries', 'Refreshing fruit juices and mini sweet snacks', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Passion Fruit Green Tea with Aloe Vera', 'Tart passion fruit seeds and sweet crunchy aloe vera cubes in iced green tea.', 2.95, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Butter Waffle Biscuit (2 pcs)', 'Warm caramelized Belgian waffle biscuits.', 1.95, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', 3, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 31: Maison Saint Tropez French Bakery
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 31;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'philippe.stropez@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'philippe.stropez@fooddelivery.com', 'Maison Saint Tropez French Bakery';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Maison Saint Tropez French Bakery', 'Chic Riviera-inspired French boutique bakery serving golden almond brioche, flaky kouign-amann, savory tarts, and velvety café au lait.', 'St 19, Daun Penh (Near National Museum), Phnom Penh', '+855 23 219 440', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=300', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200', 4.9, 39, 1.25, 3.50, '07:00', '19:30', 11.564, 104.9285, 'APPROVED', 4, v_owner_id, NOW(), NOW())
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
    VALUES ('French Pastries & Brioches', 'Artisanal butter baking from the French Riviera', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Tarte Tropézienne Slice', 'Sweet brioche bun filled with a blend of crème pâtissière and whipped buttercream, topped with pearl sugar.', 3.85, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Brittany Kouign-Amann', 'Caramelized layered butter cake with a crackling sugary crust and soft flaky interior.', 3.25, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pistachio Cherry Danish', 'Flaky puff pastry centered with rich pistachio almond paste and dark amarena cherries.', 3.45, 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Gourmet Savory Sandwiches', 'Served on freshly baked French sourdough and brioche', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Smoked Duck Breast & Brie Baguette', 'Sliced smoked duck, melted French brie cheese, and fig onion jam on artisan baguette.', 6.25, 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Roasted Vegetable & Goat Cheese Quiche', 'Zucchini, bell peppers, herbs de Provence, and creamy goat cheese in butter pastry.', 4.75, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Espresso & Beverages', 'French roasted coffee and refreshing spritzers', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('French Vanilla Café Viennois', 'Double espresso topped with a mountain of fresh chantilly whipped cream.', 2.95, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Sparkling Lavender Lemonade', 'Infused with organic French lavender syrup and fresh Meyer lemon juice.', 2.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 32: Tokyo Yakitori & Robata Bar
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 32;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'kenichi.yakitori@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'kenichi.yakitori@fooddelivery.com', 'Tokyo Yakitori & Robata Bar';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Tokyo Yakitori & Robata Bar', 'Authentic Japanese smokehouse grilling binchotan charcoal chicken skewers, wagyu beef kushiyaki, tare glazed meatballs, and draft beer snacks.', 'St 288, BKK1, Phnom Penh', '+855 23 992 331', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=300', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1200', 4.9, 43, 1.50, 4.50, '17:00', '01:00', 11.5485, 104.9245, 'APPROVED', 7, v_owner_id, NOW(), NOW())
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
    VALUES ('Binchotan Charcoal Yakitori Skewers', 'Grilled over white oak charcoal with tare glaze or sea salt', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Negima Chicken & Scallion Skewers (3 pcs)', 'Juicy chicken thigh paired with charred sweet scallions in 30-year tare sauce.', 4.75, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Tsukune Minced Chicken Meatball with Egg Yolk', 'Tender grilled chicken meatball served with fresh organic egg yolk dip.', 4.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Wagyu Beef Ribeye Kushiyaki (2 pcs)', 'Melt-in-your-mouth A4 Japanese wagyu beef seasoned with sea salt and wasabi.', 8.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 14, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Izakaya Favorites & Rice Bowls', 'Comfort food from Tokyo nightlife alleys', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Yakitori Rice Donburi', 'Steamed sushi rice topped with grilled chicken skewers, nori seaweed, and sweet soy glaze.', 5.95, 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Garlic Edamame', 'Warm boiled soybean pods tossed with toasted garlic chips and sesame oil.', 2.95, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', 6, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Japanese Beverages', 'Refreshing sodas and iced teas', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Japanese Ramune Soda (Melon Flavor)', 'Classic fizzy pop soda with glass marble stopper.', 2.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 2, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Roasted Hojicha Tea', 'Smoky roasted green tea brewed cold without bitterness.', 1.95, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 33: Kyoto Matcha & Japanese Desserts
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 33;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'yumi.matcha@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'yumi.matcha@fooddelivery.com', 'Kyoto Matcha & Japanese Desserts';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Kyoto Matcha & Japanese Desserts', 'Authentic Japanese dessert parlor featuring first-harvest Uji matcha parfaits, handmade mochi daifuku, fluffy soufflé pancakes, and dango skewers.', 'St 432, Tuol Tompoung, Phnom Penh', '+855 12 771 900', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=1200', 4.9, 55, 1.25, 3.00, '10:00', '22:00', 11.5398, 104.916, 'APPROVED', 10, v_owner_id, NOW(), NOW())
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
    VALUES ('Artisan Japanese Soufflé Pancakes', 'Jiggly, cloud-like pancakes made fresh to order', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Uji Matcha Soufflé Pancakes Stack', 'Two ultra-fluffy soufflé pancakes dusted in ceremonial matcha with sweet red bean and cream.', 5.75, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Caramelized Creme Brulee Soufflé Pancake', 'Torched vanilla custard crust over airy soufflé pancake with butter syrup.', 5.50, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Traditional Wagashi & Mochi', 'Delicate handmade rice flour sweets', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Fresh Strawberry Mochi Daifuku (2 pcs)', 'Sweet juicy whole strawberry wrapped in smooth red bean paste and soft chewy mochi.', 3.75, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Sweet Soy Glazed Mitarashi Dango (3 skewers)', 'Warm grilled chewy rice dumplings glazed in sweet savory soy syrup.', 2.95, 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600', 6, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Matcha Drinks & Shaved Ice', 'Ceremonial green tea beverages and parfaits', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Kyoto Royal Matcha Parfait Cup', 'Matcha soft serve, chiffon cake cubes, kanten jelly, red bean, and white chocolate curls.', 4.50, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 6, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Ceremonial Matcha Cloud Float', 'Iced unsweetened matcha topped with rich Hokkaido milk soft serve.', 3.85, 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 34: Kravanh Traditional Khmer Dining
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 34;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'sopha.kravanh@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'sopha.kravanh@fooddelivery.com', 'Kravanh Traditional Khmer Dining';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Kravanh Traditional Khmer Dining', 'Refined Cambodian gastronomic heritage. Slow-braised Kampot pepper pork belly, aromatic lemongrass sour soups, and seasonal jungle herbs.', 'St 240, Daun Penh, Phnom Penh', '+855 23 993 118', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200', 4.8, 34, 1.25, 4.00, '11:00', '22:00', 11.5601, 104.9288, 'APPROVED', 2, v_owner_id, NOW(), NOW())
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
    VALUES ('Khmer Heritage Classics', 'Passed down through generations of Cambodian family cooking', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Kravanh Signature Caramelized Pork Belly (Khor Sach Chrouk)', 'Tender pork belly braised with hardboiled eggs in caramelized palm sugar and young coconut water.', 6.75, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Dried Fish with Watermelon Platter', 'Traditional summer delicacy of sweet ripe watermelon paired with crispy pounded dried fish and shallots.', 4.95, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('River Prawn Sweet & Sour Soup (Samlor Machu)', 'Tamarind soup with river prawns, water morning glory, pineapple, and holy basil.', 5.75, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Wok & Stir-Fries', 'Aromatic wok-tossed specialties', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Wok-Tossed Beef with Holy Basil & Chili', 'Minced beef stir-fried with fragrant holy basil, garlic, and red bird''s eye chilies.', 5.50, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600', 12, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Steamed Organic Jasmine Rice Basket', 'Fragrant premium Cambodian phka rumduol jasmine rice.', 1.25, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Khmer Tropical Coolers', 'Chilled herbal infusions', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Lotus Root & Longan Iced Tonic', 'Sweet chilled herbal drink with tender candied lotus seeds and longan fruit.', 2.50, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Fresh Lime Juice with Wild Forest Honey', 'Squeezed local limes with raw forest honey over crushed ice.', 2.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 35: Siem Reap Claypot & Grill
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 35;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'buntha.claypot@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'buntha.claypot@fooddelivery.com', 'Siem Reap Claypot & Grill';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Siem Reap Claypot & Grill', 'Rustic Siem Reap style claypot dishes, sizzling beef skewers marinated with lemongrass kroeung, roasted street quail, and fresh green papaya salads.', 'St 598, Sangkat Boeung Kak 2, Toul Kork, Phnom Penh', '+855 12 555 771', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=300', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200', 4.8, 45, 1.25, 3.00, '10:30', '22:30', 11.585, 104.892, 'APPROVED', 2, v_owner_id, NOW(), NOW())
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
    VALUES ('Siem Reap Claypot Specialties', 'Simmered in earthen claypots for deep earthy flavor', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Claypot Mekong Catfish with Caramel Sauce', 'Boneless river fish simmered in black pepper palm glaze in a bubbling claypot.', 6.50, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 18, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Claypot Braised Chicken with Wild Ginger', 'Free-range chicken thighs stewed with fresh young ginger roots and scallions.', 5.75, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 15, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Charcoal Skewers & Street Grills', 'Grilled over natural lump charcoal', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Lemongrass Beef Skewers (Sach Ko Ang 4 pcs)', 'Tender marinated beef skewers with pickled green papaya and toasted French bread.', 4.50, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Roasted Spiced Quail (2 pcs)', 'Marinated with five-spice and Kampot pepper salt with fresh lime wedge.', 4.95, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Street Salads & Drinks', 'Crispy salads and iced drinks', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pounded Green Papaya Salad with Salted Crab', 'Spicy sour street style papaya salad with crushed peanuts and bird''s eye chilies.', 3.50, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Sugar Cane Juice with Calamansi', 'Freshly pressed sweet sugarcane juice infused with tart calamansi citrus.', 1.75, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 36: Little Italy Trattoria
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 36;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'marco.littleitaly@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'marco.littleitaly@fooddelivery.com', 'Little Italy Trattoria';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Little Italy Trattoria', 'Warm neighborhood Italian trattoria known for hearty lasagna bolognese, creamy carbonara, crispy calzones, and garlic focaccia.', 'St 454, Russian Market, Phnom Penh', '+855 95 888 123', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200', 4.8, 36, 1.25, 4.00, '11:30', '22:30', 11.5375, 104.915, 'APPROVED', 3, v_owner_id, NOW(), NOW())
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
    VALUES ('Handmade Baked Pastas', 'Baked golden with bubbling mozzarella and parmesan', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Classic Lasagna Bolognese al Forno', 'Layered fresh pasta sheets with slow-cooked beef ragù, creamy béchamel, and melted parmesan.', 8.50, 'https://images.unsplash.com/photo-1621996346565-e3d5d6281699?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spaghetti Alla Carbonara Tradizionale', 'Imported bronze-die pasta tossed with crispy cured guanciale, pecorino romano, and farm egg yolks.', 7.95, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600', 14, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Penne al Pesto Genovese con Pollo', 'Tossed with fragrant basil pine nut pesto, grilled chicken strips, and cherry tomatoes.', 7.25, 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Stuffed Calzones & Pizzas', 'Oven-baked folded pizzas and appetizers', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Stuffed Meat Lover Calzone', 'Folded pizza pocket stuffed with ricotta, mozzarella, spicy pepperoni, and Italian ham.', 8.95, 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600', 16, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Rosemary Garlic Focaccia Bread', 'Thick airy focaccia drizzled with olive oil, sea salt flakes, and fresh rosemary.', 3.50, 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600', 6, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Dolci & Drinks', 'Desserts and sodas', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chocolate Hazelnut Panna Cotta', 'Silky vanilla cooked cream cup topped with roasted hazelnut chocolate ganache.', 3.95, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('San Pellegrino Sparkling Aranciata (Can)', 'Imported Italian sparkling orange beverage.', 2.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 2, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 37: Brooklyn Smash Burger Co.
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 37;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'travis.brooklyn@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'travis.brooklyn@fooddelivery.com', 'Brooklyn Smash Burger Co.';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Brooklyn Smash Burger Co.', 'NYC-style lacy crispy edge smash burgers on potato buns, crinkle cut garlic parmesan fries, hand-dipped corn dogs, and thick malted shakes.', 'St 306, BKK1, Phnom Penh', '+855 12 444 890', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200', 4.9, 62, 1.25, 3.50, '10:00', '00:00', 11.552, 104.9242, 'APPROVED', 1, v_owner_id, NOW(), NOW())
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
    VALUES ('NYC Smashed Burgers', 'Smashed ultra-thin on blazing hot steel griddles for crispy caramelized edges', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('The Brooklyn Double Smasher', 'Two crispy smashed beef patties, double American cheese, caramelized onions, and special Brooklyn sauce.', 6.50, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Oklahoma Onion Smash Burger', 'Thinly shaved sweet vidalia onions smashed directly into the beef patties with melted cheese.', 5.95, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Buttermilk Hot Honey Chicken Burger', 'Spicy fried chicken breast coated in hot habanero honey glaze and dill pickles.', 6.25, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Loaded Fries & Corn Dogs', 'Classic American boardwalk finger food', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Garlic Parmesan Crinkle Fries', 'Tossed with roasted garlic butter, fresh parsley, and freshly grated parmesan.', 3.25, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('NYC Jumbo Beef Corn Dog', 'Beef frankfurter dipped in sweet cornmeal batter, fried golden brown with mustard.', 2.95, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600', 6, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Malted Shakes', 'Old-school Brooklyn malt milkshakes', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Black & White Malted Shake', 'Vanilla and dark chocolate fudge ice cream blended with malted milk powder.', 3.75, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Cherry Vanilla Soda Float', 'Fizzy wild cherry soda topped with a generous scoop of vanilla ice cream.', 2.95, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 38: Carl''s Jr. Express
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 38;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'brian.carls@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'brian.carls@fooddelivery.com', 'Carl''''s Jr. Express';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Carl''''s Jr. Express', 'Charbroiled 100% thick Angus beef burgers, hand-breaded chicken tenders, crisscut fries, and rich Oreo cookies shakes.', 'AEON Mall Sen Sok, Phnom Penh', '+855 23 881 990', 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300', 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=1200', 4.7, 51, 1.50, 4.00, '09:00', '22:00', 11.595, 104.878, 'APPROVED', 1, v_owner_id, NOW(), NOW())
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
    VALUES ('Charbroiled Angus Burgers', 'Grilled over open flame for signature smoky taste', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Famous Star with Cheese', 'Charbroiled all-beef patty, melted American cheese, lettuce, tomato, onions, pickles, and special sauce.', 5.25, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Western Bacon Cheeseburger', 'Charbroiled beef patty, two strips of bacon, melted cheese, crispy onion rings, and tangy BBQ sauce.', 6.25, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Hand-Breaded Chicken & Crisscut', 'Crispy fried sides and chicken fillets', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Hand-Breaded Chicken Tenders (5 pcs)', 'Tender white meat chicken fillets fried golden with Santa Fe dipping sauce.', 4.50, 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Seasoned CrissCut Fries (Large)', 'Crispy waffle-cut seasoned potatoes.', 2.50, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600', 6, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Desserts & Shakes', 'Hand-scooped ice cream shakes', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Hand-Scooped Oreo Shake', 'Vanilla ice cream blended with crushed Oreo cookies and whipped topping.', 3.50, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Warm Chocolate Chip Cookies (2 pcs)', 'Soft freshly baked chocolate chip cookies.', 1.75, 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600', 3, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 39: Szechuan Chili House
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 39;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'zhang.szechuan@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'zhang.szechuan@fooddelivery.com', 'Szechuan Chili House';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Szechuan Chili House', 'Fiery Chengdu Chinese cuisine. Numbing Szechuan peppercorns, mapo tofu, bubbling spicy boiled beef, dan dan noodles, and crispy chili chicken.', 'Mao Tse Toung Blvd, Toul Svay Prey, Phnom Penh', '+855 23 889 008', 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=300', 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200', 4.9, 48, 1.50, 4.50, '11:00', '23:30', 11.545, 104.914, 'APPROVED', 5, v_owner_id, NOW(), NOW())
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
    VALUES ('Chengdu Fiery Specialties', 'Cooked with imported red Szechuan peppercorns and chili oil', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Authentic Szechuan Mapo Tofu', 'Silky soft tofu simmered with minced beef, fermented broad bean paste, and numbing peppercorn oil.', 5.75, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Szechuan Spicy Boiled Beef (Shui Zhu Niu)', 'Tender sliced beef simmered in fiery red chili broth with bean sprouts and garlic.', 8.50, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 16, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chongqing Crispy Chili Chicken (La Zi Ji)', 'Bite-sized crispy chicken wok-fried with a mountain of fragrant dried red chilies.', 7.95, 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Noodles & Steamed Dim Sum', 'Handmade noodles and spicy wontons', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Szechuan Dan Dan Noodles', 'Springy noodles tossed in rich sesame peanut chili sauce with spicy minced pork.', 5.25, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spicy Red Oil Pork Wontons (8 pcs)', 'Plump pork wontons swimming in sweet aromatic chili oil with scallions.', 4.75, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Cooling Herbal Drinks', 'To soothe the palate from spicy peppers', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Sweet Herbal Grass Jelly Drink', 'Soothing traditional grass jelly cubes in light honey syrup.', 2.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chilled Sweet Plum Juice (Suanmeitang)', 'Tart and sweet smoked plum drink.', 2.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 40: Golden Duck Hong Kong BBQ
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 40;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'simon.goldenduck@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'simon.goldenduck@fooddelivery.com', 'Golden Duck Hong Kong BBQ';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Golden Duck Hong Kong BBQ', 'Legendary Hong Kong roast kitchen. Charcoal-roasted crispy skin duck, tender honey char siu, crackling pork belly, and comforting wonton egg noodles.', 'St 130, Daun Penh, Phnom Penh', '+855 23 216 777', 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=300', 'https://images.unsplash.com/photo-1514944298352-824f2b963a75?w=1200', 4.8, 42, 1.25, 3.50, '08:00', '21:00', 11.567, 104.927, 'APPROVED', 5, v_owner_id, NOW(), NOW())
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
    VALUES ('Hong Kong Roast Meat Platters', 'Freshly roasted daily over fruit wood charcoal', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('HK Roast Duck Rice Platter', 'Generous slices of succulent roast duck over jasmine rice with cucumber and ginger scallion sauce.', 5.75, 'https://images.unsplash.com/photo-1514944298352-824f2b963a75?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Twin Combo Roast Platter (Char Siu & Crispy Pork)', 'Honey roasted BBQ pork paired with crackling pork belly slices.', 7.95, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Egg Noodle Soups', 'Thin Hong Kong egg noodles in dried flounder broth', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Jumbo Tiger Prawn Wonton Noodle Soup', 'Whole prawn wontons with springy egg noodles and yellow chives in clear savory broth.', 4.95, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Dry Tossed Egg Noodles with Roast Duck', 'Noodles tossed in aromatic duck drippings and oyster sauce with roasted duck slices.', 5.50, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Hong Kong Beverages', 'Classic cha chaan teng refreshments', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Hong Kong Silk Stocking Milk Tea (Iced)', 'Velvety smooth Ceylon tea with rich evaporated milk.', 2.25, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600', 3, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Lemon Ribena with Fresh Lemon', 'Sweet blackcurrant cordial with sliced fresh lemons over ice.', 2.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 41: Gangnam K-Pocha & Street Eats
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 41;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'jihoon.gangnam@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'jihoon.gangnam@fooddelivery.com', 'Gangnam K-Pocha & Street Eats';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Gangnam K-Pocha & Street Eats', 'Late-night Korean pub food. Sizzling spicy pork belly, army base stew (budae jjigae), cheese corn dogs, and crispy garlic fried chicken.', 'St 302, BKK1, Phnom Penh', '+855 12 666 432', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=300', 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=1200', 4.8, 38, 1.50, 4.00, '16:00', '03:00', 11.5512, 104.923, 'APPROVED', 8, v_owner_id, NOW(), NOW())
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
    VALUES ('Pocha Hot Pots & Skillets', 'Large sharing stews and sizzling hot platters', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Budae Jjigae (Korean Army Base Hot Pot)', 'Bubbling stew with spam, cocktail sausages, kimchi, ramen noodles, tofu, and melted cheese.', 9.95, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 18, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Cheesy Sizzling Corn Skillet', 'Sweet corn baked with gooey melted mozzarella cheese, kewpie mayo, and parsley.', 4.50, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spicy Stir-Fried Squid with Pork Belly (Osam Bulgogi)', 'Wok-fried in gochujang chili paste with onions, carrots, and sesame.', 7.95, 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Street K-Bites', 'Crispy fried snacks', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Mozzarella Cheese Corn Dog with Sugar Dusting', 'Half hot dog, half gooey mozzarella wrapped in yeast batter and panko crumbs.', 2.95, 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=600', 8, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spicy Fried Chicken Wings (6 pcs)', 'Crispy wings coated in smoky red pepper sauce.', 5.50, 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Chilled Korean Drinks', 'Refreshing sodas and juices', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Korean Milkis Carbonated Drink (Can)', 'Fizzy milk and yogurt carbonated soda.', 1.75, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 2, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('BonBon Grape Juice with Whole Grapes', 'Sweet green grape drink with peeled real grapes inside.', 1.75, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 2, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 42: Busan Tteokbokki & Mandu
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 42;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'haeun.busan@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'haeun.busan@fooddelivery.com', 'Busan Tteokbokki & Mandu';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Busan Tteokbokki & Mandu', 'Authentic Busan market food. Chewy simmered spicy rice cakes, jumbo steamed dumplings (mandu), fish cake skewers in anchovy kelp broth, and gimbap.', 'St 337, Toul Kork, Phnom Penh', '+855 23 881 556', 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=300', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1200', 4.8, 33, 1.25, 3.00, '10:30', '22:00', 11.582, 104.901, 'APPROVED', 8, v_owner_id, NOW(), NOW())
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
    VALUES ('Simmered Tteokbokki Pots', 'Chewy cylindrical rice cakes simmered in sweet spicy broth', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Busan Original Spicy Tteokbokki', 'Rice cakes, fish cakes, and hardboiled egg simmered in rich red pepper gochujang broth.', 4.50, 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Rabokki (Ramen & Tteokbokki Combo)', 'Spicy rice cakes combined with springy instant ramen noodles and fried seaweed rolls.', 5.50, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Handmade Mandu & Gimbap', 'Fresh steamed dumplings and seaweed rice rolls', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Jumbo Steamed Pork & Kimchi Mandu (5 pcs)', 'Handmade thin-skinned dumplings generously stuffed with minced pork and ripe kimchi.', 4.75, 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Classic Sesame Beef Gimbap Roll', 'Seaweed rolled with seasoned rice, marinated beef, yellow pickled radish, egg, and spinach.', 3.95, 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Busan Fish Cake Skewers with Hot Broth (3 pcs)', 'Skewered folded fish cakes served in hot piping anchovy radish broth.', 2.95, 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600', 6, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Drinks', 'Korean teas and iced drinks', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chilled Roasted Barley Tea (Bori-cha)', 'Traditional caffeine-free iced grain tea.', 1.75, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 2, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Korean Citron Honey Tea (Yuja-cha)', 'Fragrant preserved yuzu citrus marmalade in iced soda.', 2.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 43: Chutney Indian Clay Oven
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 43;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'amit.chutney@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'amit.chutney@fooddelivery.com', 'Chutney Indian Clay Oven';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Chutney Indian Clay Oven', 'Authentic Southern and Northern Indian culinary traditions. Fragrant masala dosas, rich coconut chicken korma, paneer tikka, and crispy samosas.', 'St 110, Daun Penh, Phnom Penh', '+855 23 210 554', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=300', 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=1200', 4.8, 40, 1.25, 3.50, '10:30', '22:30', 11.571, 104.926, 'APPROVED', 11, v_owner_id, NOW(), NOW())
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
    VALUES ('Clay Oven & Dosa Delights', 'Crispy fermented rice crepes and tandoori specials', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Masala Dosa with Sambar & Chutneys', 'Giant golden rice crepe stuffed with spiced potato masala, served with coconut chutney and lentil sambar.', 5.50, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 14, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Tandoori Paneer Shish Kebab', 'Marinated cottage cheese cubes grilled with onions and peppers.', 6.75, 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Aromatic Curries & Samosas', 'Rich coconut and spiced gravies', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Coconut Chicken Korma', 'Tender chicken cooked in rich cashew nut and coconut cream curry with green cardamom.', 7.25, 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600', 15, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Spiced Potato Samosas (3 pcs)', 'Golden fried pyramid pastries stuffed with spiced potatoes and peas with mint chutney.', 3.50, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Butter Garlic Roti Bread (2 pcs)', 'Whole wheat flatbread brushed with garlic and butter.', 2.25, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Indian Beverages', 'Traditional milk teas and yogurt drinks', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Hot Masala Chai with Cardamom & Ginger', 'Slow-brewed black tea leaves with fresh milk, crushed ginger, and cardamom.', 2.25, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Rose Cardamom Sweet Lassi', 'Chilled yogurt smoothie infused with wild rose water syrup and crushed pistachios.', 2.75, 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600', 4, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 44: La Taqueria Mexicana
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 44;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'sofia.lataqueria@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'sofia.lataqueria@fooddelivery.com', 'La Taqueria Mexicana';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'La Taqueria Mexicana', 'Authentic Mexico City taqueria. Al pastor carved off the trompo with roasted pineapple, cheesy loaded burrito bowls, and fiery habanero salsas.', 'St 308, Bassac Lane, Phnom Penh', '+855 12 770 123', 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300', 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=1200', 4.8, 37, 1.25, 3.50, '12:00', '01:00', 11.5518, 104.9318, 'APPROVED', 9, v_owner_id, NOW(), NOW())
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
    VALUES ('Tacos al Pastor & Carnitas (3 pcs)', 'Served on double warm corn tortillas with salsa verde', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Tacos al Pastor with Grilled Pineapple', 'Achiote-marinated pork carved off the spit, served with sweet grilled pineapple, onion, and cilantro.', 6.95, 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Carne Asada Charred Steak Tacos', 'Grilled marinated skirt steak with lime, fresh guacamole, and pico de gallo.', 7.50, 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Giant Burritos & Bowls', 'Rolled with cilantro lime rice, black beans, cheese, and crema', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Mission District Beef Burrito Grande', 'Large flour tortilla stuffed with grilled steak, Mexican rice, pinto beans, salsa, and guacamole.', 7.95, 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600', 14, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chipotle Chicken Fajita Burrito Bowl', 'Grilled peppers, onions, chipotle chicken, rice, beans, and melted cheese in a bowl.', 6.75, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Mexican Sweets & Sodas', 'Churros and Jarritos', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Dulce de Leche Churros', 'Golden fried pastry loops dusted in cinnamon with warm caramel dip.', 3.50, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', 6, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Jarritos Mexican Mandarin Soda (Bottle)', 'Authentic imported Mexican soda made with real cane sugar.', 2.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 2, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 45: Baja Fish & Carnitas Stand
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 45;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'mateo.bajafish@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'mateo.bajafish@fooddelivery.com', 'Baja Fish & Carnitas Stand';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Baja Fish & Carnitas Stand', 'Pacific coast Mexican seafood. Crispy beer-battered mahi-mahi tacos, citrus shrimp ceviche with avocado, and loaded cheesy quesadillas.', 'Elite Town, Koh Pich (Diamond Island), Phnom Penh', '+855 11 889 001', 'https://images.unsplash.com/photo-1512838243191-e81e88cc8912?w=300', 'https://images.unsplash.com/photo-1512838243191-e81e88cc8912?w=1200', 4.8, 31, 1.50, 4.00, '11:00', '23:00', 11.5525, 104.9385, 'APPROVED', 9, v_owner_id, NOW(), NOW())
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
    VALUES ('Baja Seafood Specialties', 'Crispy seafood and zesty fresh ceviches', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Baja California Beer-Battered Fish Tacos (3 pcs)', 'Crispy golden battered white fish fillets with chipotle mayo, crunchy cabbage slaw, and lime.', 7.25, 'https://images.unsplash.com/photo-1512838243191-e81e88cc8912?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Citrus Poached Shrimp Ceviche with Tostadas', 'Plump river shrimp cured in fresh lime juice with diced tomatoes, red onions, cilantro, and avocado.', 6.50, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Cheesy Quesadillas & Nachos', 'Loaded with melted cheese and fresh salsas', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Smoked Pork Carnitas Quesadilla', 'Tender pulled pork with melted Jack cheese in a crispy flour tortilla with salsa verde.', 5.95, 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Tortilla Chips with Warm Queso Dip', 'House-made tortilla chips served with warm melted chili con queso dip.', 3.75, 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600', 6, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Tropical Refreshers', 'Fresh fruit aguas frescas', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Agua Fresca de Hibisco (Jamaica)', 'Tart chilled hibiscus flower tea sweetened with cane sugar.', 2.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Fresh Mango Pineapple Punch', 'Crushed pineapple and mango over ice.', 2.50, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 46: The Organic Garden Cafe
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 46;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'chloe.organicgarden@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'chloe.organicgarden@fooddelivery.com', 'The Organic Garden Cafe';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'The Organic Garden Cafe', 'Wholesome 100% organic plant-forward restaurant. Farm-to-table salads, vegan truffle pasta, hearty lentil shepherd''s pie, and wellness smoothies.', 'St 302, BKK1, Phnom Penh', '+855 12 990 411', 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200', 4.9, 35, 1.25, 3.50, '07:30', '21:00', 11.5515, 104.9228, 'APPROVED', 6, v_owner_id, NOW(), NOW())
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
    VALUES ('Nourishing Superfood Bowls', 'Nutrient-packed warm bowls made with locally grown vegetables', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Warm Mediterranean Falafel & Hummus Bowl', 'Baked herb falafel, smooth garlic hummus, tabbouleh, cucumber, kalamata olives, and tahini.', 6.50, 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Creamy Truffle Cashew Mushroom Pasta', 'Gluten-free brown rice pasta tossed in velvety roasted cashew cream, wild mushrooms, and truffle oil.', 7.25, 'https://images.unsplash.com/photo-1645112411341-6c4fd023714a?w=600', 14, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Organic Toasts & Wraps', 'Made with stoneground sourdough', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Smashing Avocado & Dukkah Toast', 'Smashed avocado, Egyptian hazelnut dukkah spice, radishes, and lemon on toasted sourdough.', 4.75, 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Roasted Sweet Potato & Black Bean Wrap', 'Spiced sweet potatoes, black beans, baby spinach, and vegan chipotle aioli in a whole wheat wrap.', 5.25, 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=600', 10, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Cold-Pressed Juices & Super Smoothies', 'Pure raw liquid nutrition', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Pure Celery & Green Apple Detox (400ml)', 'Freshly pressed celery stalks, crisp green apples, and lemon.', 3.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Blue Spirulina Coconut Cloud Smoothie', 'Coconut milk, banana, pineapple, and antioxidant-rich blue spirulina.', 3.75, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 47: Vitality Juice & Acai Bar
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 47;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'ryan.vitality@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'ryan.vitality@fooddelivery.com', 'Vitality Juice & Acai Bar';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Vitality Juice & Acai Bar', 'Power packed acai bowls, clean protein fruit smoothies, organic wheatgrass shots, and gluten-free raw energy balls.', 'St 450, Tuol Tompoung (Russian Market), Phnom Penh', '+855 17 222 345', 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=300', 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=1200', 4.9, 41, 1.00, 2.50, '07:00', '20:00', 11.539, 104.9148, 'APPROVED', 6, v_owner_id, NOW(), NOW())
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
    VALUES ('Superfood Acai Bowls', 'Blended thick with organic Amazonian acai berries', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Classic PB & Banana Acai Bowl', 'Pure acai blended with almond milk, topped with organic granola, banana, natural peanut butter, and chia.', 5.50, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600', 6, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Tropical Mango & Berry Acai Crunch', 'Acai base topped with fresh mango chunks, blueberries, toasted coconut flakes, and hemp seeds.', 5.75, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600', 6, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Power Protein Shakes', 'Made with clean organic pea and whey proteins', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Choco Peanut Butter Protein Shake', 'Chocolate protein, natural peanut butter, oats, banana, and almond milk (28g protein).', 3.95, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Berry Boost Collagen Smoothie', 'Mixed berries, coconut water, vanilla protein, and grass-fed collagen peptides.', 4.25, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Raw Treats & Boosters', 'Refined sugar free clean snacks', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Raw Cacao & Hazelnut Energy Balls (3 pcs)', 'Medjool dates, raw cacao, roasted hazelnuts, and sea salt.', 2.75, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', 2, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Ginger Turmeric Immunity Shot (60ml)', 'Concentrated pressed ginger root, turmeric, and cayenne pepper.', 1.75, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 2, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 48: Saigon Lotus Pho & Rolls
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 48;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'linh.saigonlotus@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'linh.saigonlotus@fooddelivery.com', 'Saigon Lotus Pho & Rolls';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Saigon Lotus Pho & Rolls', 'Fresh, vibrant Vietnamese street kitchen. Fragrant Hanoi beef noodle soup, sizzling crispy banh xeo crepes, grilled lemongrass pork skewers, and fresh rolls.', 'Monivong Blvd, Boeung Prolit, Phnom Penh', '+855 12 881 992', 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=300', 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=1200', 4.8, 37, 1.25, 3.00, '07:30', '21:30', 11.555, 104.919, 'APPROVED', 8, v_owner_id, NOW(), NOW())
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
    VALUES ('Hanoi Broths & Rice Noodles', 'Simmered with charred ginger, cinnamon, and beef bones', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Hanoi Ribeye Beef Pho (Pho Bo)', 'Fragrant clear broth with sliced tender Australian beef ribeye, scallions, cilantro, and lime.', 5.50, 'https://images.unsplash.com/photo-1503764654157-72d979d9af2f?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Bun Cha Hanoi (Grilled Pork Patties & Noodles)', 'Char-grilled marinated pork patties in sweet savory fish sauce broth with rice vermicelli and fresh herbs.', 5.75, 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Crispy Crepes & Street Rolls', 'Crispy golden wraps and fresh salads', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crispy Banh Xeo Crepe with Pork & Prawns', 'Golden turmeric rice crepe stuffed with shrimp, pork slices, and bean sprouts, wrapped in fresh mustard greens.', 5.25, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 14, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Grilled Lemongrass Beef Rice Paper Rolls (3 pcs)', 'Aromatic beef rolled with herbs, cucumber, and vermicelli with hoisin peanut sauce.', 3.75, 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Vietnamese Coffee & Lotus Drinks', 'Traditional beverages', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Vietnamese Egg Coffee (Ca Phe Trung)', 'Rich dark robusta coffee topped with whipped sweet egg yolk and condensed milk cream.', 2.75, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Lotus Seed & Sweet Longan Iced Tea', 'Refreshing chilled jasmine tea with candied lotus seeds.', 2.25, 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 49: Chiang Mai Khao Soi & Satay
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 49;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'niran.chiangmai@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'niran.chiangmai@fooddelivery.com', 'Chiang Mai Khao Soi & Satay';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Chiang Mai Khao Soi & Satay', 'Northern Thai culinary specialties. Golden coconut curry Khao Soi noodles, grilled chicken satay with spicy peanut sauce, and spicy minced pork larb.', 'St 310, BKK2, Phnom Penh', '+855 12 777 339', 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=300', 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=1200', 4.9, 39, 1.25, 3.50, '11:00', '22:00', 11.547, 104.9195, 'APPROVED', 8, v_owner_id, NOW(), NOW())
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
    VALUES ('Northern Thai Specialties', 'Signature Chiang Mai recipes with roasted chilies and turmeric', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Chiang Mai Khao Soi Gai (Curry Noodle Soup)', 'Tender chicken drumstick in rich golden coconut curry broth with egg noodles and crispy noodle nest topping.', 6.25, 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=600', 12, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Spicy Northern Pork Larb Kua', 'Minced pork dry-fried with aromatic roasted herbs, dried chilies, and crispy pork cracklings.', 5.50, 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600', 12, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Satay & Street Starters', 'Charcoal grilled skewers and crispy bites', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Grilled Chicken Satay Skewers (5 pcs)', 'Turmeric marinated chicken skewers served with rich peanut sauce and pickled cucumber relish.', 4.75, 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600', 10, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Thai Fish Cakes (Tod Mun Pla 4 pcs)', 'Savory red curry fish patties with sweet chili cucumber dipping sauce.', 3.95, 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600', 8, true, 4.7, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Thai Refreshments', 'Sweet iced teas and lemongrass coolers', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Thai Lemon Iced Tea (Cha Ma-Now)', 'Brewed Thai red tea shaken with fresh lime juice and crushed ice.', 2.25, 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600', 3, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Coconut Milk Sticky Rice with Sweet Corn', 'Warm sweet sticky rice with corn kernels and salted coconut cream.', 2.95, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', 5, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;


-- Restaurant 50: Parisian Macaron & Creperie
DO $$
DECLARE
    v_owner_id bigint;
    v_rest_id bigint := 50;
    v_cat_id bigint;
BEGIN
    SELECT id INTO v_owner_id FROM users WHERE email = 'camille.macaron@fooddelivery.com';
    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Owner not found for email % in restaurant %', 'camille.macaron@fooddelivery.com', 'Parisian Macaron & Creperie';
    END IF;

    INSERT INTO restaurants (id, name, description, address, phone, logo_url, cover_image_url, rating, review_count, delivery_fee, minimum_order, opening_time, closing_time, latitude, longitude, status, category_id, owner_id, created_at, updated_at)
    VALUES (v_rest_id, 'Parisian Macaron & Creperie', 'Exquisite French confectionery. Rainbow Parisian macarons, warm folded sweet crepes, savory buckwheat galettes, and handcrafted chocolate bonbons.', 'Vattanac Capital Luxury Mall, Wat Phnom, Phnom Penh', '+855 23 999 881', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300', 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200', 4.9, 53, 1.50, 4.00, '10:00', '21:30', 11.5735, 104.9205, 'APPROVED', 10, v_owner_id, NOW(), NOW())
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
    VALUES ('Parisian Macaron Gift Boxes', 'Delicate almond meringue shells with rich chocolate ganaches and fruit jams', 1, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Assorted Parisian Macaron Box (6 pcs)', 'Pistachio, salted butter caramel, dark chocolate, Madagascar vanilla, raspberry, and passion fruit.', 7.50, 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Deluxe Macaron Box (12 pcs)', 'Full collection of all signature flavors packed in luxury Parisian gift box.', 13.95, 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('Warm French Sweet Crepes', 'Spun thin on Brittany cast-iron crepe griddles', 2, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Nutella & Banana French Crepe', 'Warm golden crepe loaded with creamy Nutella spread, sliced bananas, and toasted hazelnuts.', 4.75, 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600', 8, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Crepe Suzette au Caramel', 'Folded crepe flamed with orange butter sauce, sea salt caramel, and vanilla chantilly cream.', 4.95, 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600', 8, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());

    INSERT INTO menu_categories (name, description, display_order, active, restaurant_id)
    VALUES ('French Café & Hot Chocolate', 'Rich beverages', 3, true, v_rest_id)
    RETURNING id INTO v_cat_id;

    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Parisian Thick Velvety Hot Chocolate', 'Made with melted 70% dark French chocolate and whole milk.', 3.50, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600', 5, true, 4.9, v_rest_id, v_cat_id, NOW(), NOW());
    INSERT INTO food_items (name, description, price, image_url, preparation_time, available, rating, restaurant_id, menu_category_id, created_at, updated_at)
    VALUES ('Iced Café Caramel Viennois', 'Double shot espresso with caramel syrup and whipped cream.', 3.25, 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600', 4, true, 4.8, v_rest_id, v_cat_id, NOW(), NOW());
END $$;

-- 4. Synchronize Sequences
SELECT setval('restaurants_id_seq', (SELECT COALESCE(MAX(id), 1) FROM restaurants));
SELECT setval('food_items_id_seq', (SELECT COALESCE(MAX(id), 1) FROM food_items));
SELECT setval('menu_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM menu_categories));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('restaurant_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM restaurant_categories));

COMMIT;
