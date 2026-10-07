-- =========================================================================
-- V2__add_performance_indexes.sql
-- Production Performance Indexes for Query Optimization
-- =========================================================================

-- Order query performance (customer order history, restaurant kitchen queue)
CREATE INDEX IF NOT EXISTS idx_orders_customer_created ON orders (customer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_created ON orders (restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

-- Restaurant discovery & geolocation
CREATE INDEX IF NOT EXISTS idx_restaurants_status_rating ON restaurants (status, rating DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_lat_lng ON restaurants (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_restaurants_category ON restaurants (category_id);

-- Menu items lookups
CREATE INDEX IF NOT EXISTS idx_food_items_rest_avail ON food_items (restaurant_id, available);
CREATE INDEX IF NOT EXISTS idx_food_items_menu_cat ON food_items (menu_category_id);

-- Driver tracking & dispatch
CREATE INDEX IF NOT EXISTS idx_drivers_online_approved ON drivers (is_online, is_approved);
CREATE INDEX IF NOT EXISTS idx_driver_locations_coords ON driver_locations (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_deliveries_driver_status ON deliveries (driver_id, status);

-- Notifications unread count queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

-- Review ratings lookup
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant ON reviews (restaurant_id, rating DESC);
