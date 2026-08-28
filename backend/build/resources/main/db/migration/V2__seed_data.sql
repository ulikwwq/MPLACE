-- Development seed data: 3 categories, 10 products (spec section 18).
-- One product (SUNGLASSES-RAYBAN-001) is INACTIVE on purpose, so the
-- "only ACTIVE products are purchasable" rule has something to test against.

INSERT INTO categories (name) VALUES
    ('Electronics'),
    ('Home'),
    ('Accessories');

INSERT INTO products (sku, name, description, price, stock_quantity, status, category_id) VALUES
    ('IPHONE-15-128', 'iPhone 15', 'Smartphone, 128GB', 65000, 12, 'ACTIVE',
        (SELECT id FROM categories WHERE name = 'Electronics')),
    ('SAMSUNG-S24-256', 'Samsung Galaxy S24', 'Smartphone, 256GB', 58000, 8, 'ACTIVE',
        (SELECT id FROM categories WHERE name = 'Electronics')),
    ('LAPTOP-DELL-XPS13', 'Dell XPS 13', 'Ultrabook laptop, 13-inch', 95000, 5, 'ACTIVE',
        (SELECT id FROM categories WHERE name = 'Electronics')),
    ('HEADPHONES-SONY-WH1000', 'Sony WH-1000XM5', 'Noise-cancelling headphones', 22000, 15, 'ACTIVE',
        (SELECT id FROM categories WHERE name = 'Electronics')),
    ('MUG-001', 'Coffee Mug', 'Ceramic mug, 350ml', 450, 100, 'ACTIVE',
        (SELECT id FROM categories WHERE name = 'Home')),
    ('BLANKET-WOOL-001', 'Wool Blanket', 'Warm wool blanket, 150x200cm', 2800, 30, 'ACTIVE',
        (SELECT id FROM categories WHERE name = 'Home')),
    ('LAMP-DESK-LED', 'LED Desk Lamp', 'Adjustable LED desk lamp', 1500, 40, 'ACTIVE',
        (SELECT id FROM categories WHERE name = 'Home')),
    ('BAG-001', 'Leather Bag', 'Genuine leather bag', 3200, 15, 'ACTIVE',
        (SELECT id FROM categories WHERE name = 'Accessories')),
    ('WATCH-CASIO-A168', 'Casio Watch A168', 'Classic digital watch', 3500, 25, 'ACTIVE',
        (SELECT id FROM categories WHERE name = 'Accessories')),
    ('SUNGLASSES-RAYBAN-001', 'Ray-Ban Sunglasses', 'Classic aviator sunglasses', 8500, 10, 'INACTIVE',
        (SELECT id FROM categories WHERE name = 'Accessories'));
