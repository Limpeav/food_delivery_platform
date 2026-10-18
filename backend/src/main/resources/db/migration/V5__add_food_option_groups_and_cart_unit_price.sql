-- =========================================================================
-- V5__add_food_option_groups_and_cart_unit_price.sql
-- Add food option groups, option items, and unit_price to cart_items.
-- =========================================================================

-- 1. Create food_option_groups table
CREATE TABLE IF NOT EXISTS food_option_groups (
    id BIGSERIAL PRIMARY KEY,
    food_item_id BIGINT NOT NULL REFERENCES food_items(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    required BOOLEAN NOT NULL DEFAULT FALSE,
    min_select INTEGER NOT NULL DEFAULT 0,
    max_select INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_option_group_food_item ON food_option_groups(food_item_id);

-- 2. Create food_option_items table
CREATE TABLE IF NOT EXISTS food_option_items (
    id BIGSERIAL PRIMARY KEY,
    option_group_id BIGINT NOT NULL REFERENCES food_option_groups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    additional_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    is_default BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_option_item_group ON food_option_items(option_group_id);

-- 3. Add unit_price column to cart_items table if not exists
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2);
