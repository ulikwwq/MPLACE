-- Initial schema for MPlace MVP.
-- Column definitions mirror the JPA entity mappings exactly:
--   Category, Product        -> com.mplace.backend.product.entity
--   Order, OrderItem         -> com.mplace.backend.order.entity

CREATE TABLE categories (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT uq_categories_name UNIQUE (name)
);

CREATE TABLE products (
    id             BIGSERIAL PRIMARY KEY,
    sku            VARCHAR(255) NOT NULL,
    name           VARCHAR(255) NOT NULL,
    description    VARCHAR(2000),
    price          NUMERIC(12, 2) NOT NULL,
    stock_quantity INTEGER NOT NULL,
    status         VARCHAR(20) NOT NULL,
    category_id    BIGINT NOT NULL,
    CONSTRAINT uq_products_sku UNIQUE (sku),
    CONSTRAINT fk_products_category FOREIGN KEY (category_id) REFERENCES categories (id)
);

CREATE INDEX idx_products_category_id ON products (category_id);

CREATE TABLE orders (
    id             BIGSERIAL PRIMARY KEY,
    customer_name  VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(255) NOT NULL,
    status         VARCHAR(20) NOT NULL,
    total_price    NUMERIC(12, 2) NOT NULL,
    created_at     TIMESTAMP NOT NULL
);

CREATE TABLE order_items (
    id          BIGSERIAL PRIMARY KEY,
    order_id    BIGINT NOT NULL,
    product_id  BIGINT NOT NULL,
    quantity    INTEGER NOT NULL,
    unit_price  NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products (id)
);

CREATE INDEX idx_order_items_order_id ON order_items (order_id);
CREATE INDEX idx_order_items_product_id ON order_items (product_id);
