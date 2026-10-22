-- ===================================
-- BEAN FARM DATABASE SCHEMA
-- Website bán thực phẩm organic
-- MYSQL VERSION
-- ===================================

-- ===================================
-- BẢNG QUẢN LÝ NGƯỜI DÙNG
-- ===================================

-- Bảng vai trò người dùng
CREATE TABLE roles (
                       role_id INT PRIMARY KEY AUTO_INCREMENT,
                       role_name VARCHAR(50) NOT NULL UNIQUE,
                       description TEXT,
                       created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)
);

-- Bảng người dùng/khách hàng
CREATE TABLE users (
                       user_id INT PRIMARY KEY AUTO_INCREMENT,
                       email VARCHAR(100) NOT NULL UNIQUE,
                       password_hash VARCHAR(255) NOT NULL,
                       full_name VARCHAR(100) NOT NULL,
                       phone VARCHAR(20),
                       avatar VARCHAR(255),
                       role_id INT DEFAULT 2,
                       is_active BIT DEFAULT 1,
                       email_verified BIT DEFAULT 0,
                       created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                       updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                       last_login DATETIME(6) NULL,
                       FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Bảng địa chỉ giao hàng
CREATE TABLE addresses (
                           address_id INT PRIMARY KEY AUTO_INCREMENT,
                           user_id INT NOT NULL,
                           full_name VARCHAR(100) NOT NULL,
                           phone VARCHAR(20) NOT NULL,
                           address_line1 VARCHAR(255) NOT NULL,
                           address_line2 VARCHAR(255),
                           city VARCHAR(100) NOT NULL,
                           district VARCHAR(100),
                           ward VARCHAR(100),
                           postal_code VARCHAR(20),
                           is_default BIT DEFAULT 0,
                           created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                           updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                           FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===================================
-- BẢNG QUẢN LÝ SẢN PHẨM
-- ===================================

-- Bảng danh mục sản phẩm
CREATE TABLE categories (
                            category_id INT PRIMARY KEY AUTO_INCREMENT,
                            category_name VARCHAR(100) NOT NULL,
                            slug VARCHAR(100) NOT NULL UNIQUE,
                            description TEXT,
                            parent_id INT NULL,
                            image VARCHAR(255),
                            is_active BIT DEFAULT 1,
                            display_order INT DEFAULT 0,
                            created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                            updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                            FOREIGN KEY (parent_id) REFERENCES categories(category_id)
);

-- Bảng thương hiệu
CREATE TABLE brands (
                        brand_id INT PRIMARY KEY AUTO_INCREMENT,
                        brand_name VARCHAR(100) NOT NULL,
                        slug VARCHAR(100) NOT NULL UNIQUE,
                        description TEXT,
                        logo VARCHAR(255),
                        is_active BIT DEFAULT 1,
                        created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                        updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Bảng nhà cung cấp
CREATE TABLE suppliers (
                           supplier_id INT PRIMARY KEY AUTO_INCREMENT,
                           supplier_name VARCHAR(150) NOT NULL,
                           contact_person VARCHAR(100),
                           email VARCHAR(100),
                           phone VARCHAR(20),
                           address TEXT,
                           is_active BIT DEFAULT 1,
                           created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                           updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Bảng sản phẩm
CREATE TABLE products (
                          product_id INT PRIMARY KEY AUTO_INCREMENT,
                          product_name VARCHAR(200) NOT NULL,
                          slug VARCHAR(200) NOT NULL UNIQUE,
                          sku VARCHAR(50) UNIQUE,
                          category_id INT,
                          brand_id INT,
                          supplier_id INT,
                          description TEXT,
                          short_description VARCHAR(500),
                          price DECIMAL(10, 2) NOT NULL,
                          sale_price DECIMAL(10, 2),
                          cost_price DECIMAL(10, 2),
                          stock_quantity INT DEFAULT 0,
                          unit VARCHAR(50) DEFAULT 'kg',
                          weight DECIMAL(8, 2),
                          is_organic BIT DEFAULT 0,
                          is_featured BIT DEFAULT 0,
                          is_active BIT DEFAULT 1,
                          view_count INT DEFAULT 0,
                          sold_count INT DEFAULT 0,
                          rating_average DECIMAL(3, 2) DEFAULT 0,
                          review_count INT DEFAULT 0,
                          created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                          updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                          FOREIGN KEY (category_id) REFERENCES categories(category_id),
                          FOREIGN KEY (brand_id) REFERENCES brands(brand_id),
                          FOREIGN KEY (supplier_id) REFERENCES suppliers(supplier_id)
);

-- Bảng hình ảnh sản phẩm
CREATE TABLE product_images (
                                image_id INT PRIMARY KEY AUTO_INCREMENT,
                                product_id INT NOT NULL,
                                image_url VARCHAR(255) NOT NULL,
                                is_primary BIT DEFAULT 0,
                                display_order INT DEFAULT 0,
                                created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                                FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Bảng thuộc tính sản phẩm
CREATE TABLE product_attributes (
                                    attribute_id INT PRIMARY KEY AUTO_INCREMENT,
                                    product_id INT NOT NULL,
                                    attribute_name VARCHAR(100) NOT NULL,
                                    attribute_value VARCHAR(255) NOT NULL,
                                    created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                                    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ===================================
-- BẢNG QUẢN LÝ ĐÁNH GIÁ
-- ===================================

-- Bảng đánh giá sản phẩm
CREATE TABLE reviews (
                         review_id INT PRIMARY KEY AUTO_INCREMENT,
                         product_id INT NOT NULL,
                         user_id INT NOT NULL,
                         order_id INT,
                         rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
                         title VARCHAR(200),
                         comment TEXT,
                         is_verified_purchase BIT DEFAULT 0,
                         is_approved BIT DEFAULT 0,
                         created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                         updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                         FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
                         FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- ===================================
-- BẢNG QUẢN LÝ GIỎ HÀNG
-- ===================================

-- Bảng giỏ hàng
CREATE TABLE carts (
                       cart_id INT PRIMARY KEY AUTO_INCREMENT,
                       user_id INT,
                       session_id VARCHAR(255),
                       created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                       updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                       FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Bảng chi tiết giỏ hàng
CREATE TABLE cart_items (
                            cart_item_id INT PRIMARY KEY AUTO_INCREMENT,
                            cart_id INT NOT NULL,
                            product_id INT NOT NULL,
                            quantity INT NOT NULL DEFAULT 1,
                            price DECIMAL(10, 2) NOT NULL,
                            created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                            updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                            FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
                            FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- ===================================
-- BẢNG QUẢN LÝ ĐƠN HÀNG
-- ===================================

-- Bảng trạng thái đơn hàng
CREATE TABLE order_statuses (
                                status_id INT PRIMARY KEY AUTO_INCREMENT,
                                status_name VARCHAR(50) NOT NULL UNIQUE,
                                description TEXT,
                                color_code VARCHAR(20),
                                display_order INT DEFAULT 0
);

-- Bảng đơn hàng
CREATE TABLE orders (
                        order_id INT PRIMARY KEY AUTO_INCREMENT,
                        user_id INT,
                        order_code VARCHAR(50) NOT NULL UNIQUE,
                        status_id INT NOT NULL,

    -- Thông tin giao hàng
                        shipping_full_name VARCHAR(100) NOT NULL,
                        shipping_phone VARCHAR(20) NOT NULL,
                        shipping_email VARCHAR(100),
                        shipping_address TEXT NOT NULL,
                        shipping_city VARCHAR(100),
                        shipping_district VARCHAR(100),
                        shipping_ward VARCHAR(100),

    -- Thông tin thanh toán
                        payment_method VARCHAR(50) NOT NULL,
                        payment_status VARCHAR(50) DEFAULT 'pending',

    -- Tổng tiền
                        subtotal DECIMAL(10, 2) NOT NULL,
                        shipping_fee DECIMAL(10, 2) DEFAULT 0,
                        discount_amount DECIMAL(10, 2) DEFAULT 0,
                        tax_amount DECIMAL(10, 2) DEFAULT 0,
                        total_amount DECIMAL(10, 2) NOT NULL,

    -- Ghi chú
                        note TEXT,
                        admin_note TEXT,

    -- Thời gian
                        created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                        updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                        confirmed_at DATETIME(6) NULL,
                        shipped_at DATETIME(6) NULL,
                        completed_at DATETIME(6) NULL,
                        cancelled_at DATETIME(6) NULL,

                        FOREIGN KEY (user_id) REFERENCES users(user_id),
                        FOREIGN KEY (status_id) REFERENCES order_statuses(status_id)
);

-- Bảng chi tiết đơn hàng
CREATE TABLE order_items (
                             order_item_id INT PRIMARY KEY AUTO_INCREMENT,
                             order_id INT NOT NULL,
                             product_id INT,
                             product_name VARCHAR(200) NOT NULL,
                             product_sku VARCHAR(50),
                             quantity INT NOT NULL,
                             unit_price DECIMAL(10, 2) NOT NULL,
                             total_price DECIMAL(10, 2) NOT NULL,
                             created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                             FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                             FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- Bảng lịch sử đơn hàng
CREATE TABLE order_history (
                               history_id INT PRIMARY KEY AUTO_INCREMENT,
                               order_id INT NOT NULL,
                               status_id INT NOT NULL,
                               note TEXT,
                               created_by INT,
                               created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                               FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
                               FOREIGN KEY (status_id) REFERENCES order_statuses(status_id),
                               FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- ===================================
-- BẢNG QUẢN LÝ MÃ GIẢM GIÁ
-- ===================================

-- Bảng mã giảm giá
CREATE TABLE coupons (
                         coupon_id INT PRIMARY KEY AUTO_INCREMENT,
                         coupon_code VARCHAR(50) NOT NULL UNIQUE,
                         description TEXT,
                         discount_type VARCHAR(20) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
                         discount_value DECIMAL(10, 2) NOT NULL,
                         min_order_value DECIMAL(10, 2) DEFAULT 0,
                         max_discount_amount DECIMAL(10, 2),
                         usage_limit INT,
                         used_count INT DEFAULT 0,
                         is_active BIT DEFAULT 1,
                         start_date DATETIME(6) NULL,
                         end_date DATETIME(6) NULL,
                         created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                         updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- Bảng lịch sử sử dụng mã giảm giá
CREATE TABLE coupon_usage (
                              usage_id INT PRIMARY KEY AUTO_INCREMENT,
                              coupon_id INT NOT NULL,
                              user_id INT NOT NULL,
                              order_id INT NOT NULL,
                              discount_amount DECIMAL(10, 2) NOT NULL,
                              used_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                              FOREIGN KEY (coupon_id) REFERENCES coupons(coupon_id) ON DELETE CASCADE,
                              FOREIGN KEY (user_id) REFERENCES users(user_id),
                              FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ===================================
-- BẢNG QUẢN LÝ BLOG/TIN TỨC
-- ===================================

-- Bảng danh mục blog
CREATE TABLE blog_categories (
                                 blog_category_id INT PRIMARY KEY AUTO_INCREMENT,
                                 category_name VARCHAR(100) NOT NULL,
                                 slug VARCHAR(100) NOT NULL UNIQUE,
                                 description TEXT,
                                 is_active BIT DEFAULT 1,
                                 created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)
);

-- Bảng bài viết blog
CREATE TABLE blog_posts (
                            post_id INT PRIMARY KEY AUTO_INCREMENT,
                            title VARCHAR(255) NOT NULL,
                            slug VARCHAR(255) NOT NULL UNIQUE,
                            blog_category_id INT,
                            author_id INT,
                            content TEXT NOT NULL,
                            excerpt VARCHAR(500),
                            featured_image VARCHAR(255),
                            view_count INT DEFAULT 0,
                            is_published BIT DEFAULT 0,
                            published_at DATETIME(6) NULL,
                            created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                            updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                            FOREIGN KEY (blog_category_id) REFERENCES blog_categories(blog_category_id),
                            FOREIGN KEY (author_id) REFERENCES users(user_id)
);

-- ===================================
-- BẢNG QUẢN LÝ BANNER/SLIDER
-- ===================================

-- Bảng banner
CREATE TABLE banners (
                         banner_id INT PRIMARY KEY AUTO_INCREMENT,
                         title VARCHAR(200),
                         image VARCHAR(255) NOT NULL,
                         link VARCHAR(255),
                         position VARCHAR(50) DEFAULT 'home_slider',
                         display_order INT DEFAULT 0,
                         is_active BIT DEFAULT 1,
                         start_date DATETIME(6) NULL,
                         end_date DATETIME(6) NULL,
                         created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6)
);

-- ===================================
-- BẢNG QUẢN LÝ WISHLIST (YÊU THÍCH)
-- ===================================

-- Bảng sản phẩm yêu thích
CREATE TABLE wishlists (
                           wishlist_id INT PRIMARY KEY AUTO_INCREMENT,
                           user_id INT NOT NULL,
                           product_id INT NOT NULL,
                           created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                           FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
                           FOREIGN KEY (product_id) REFERENCES products(product_id),
                           CONSTRAINT UQ_Wishlist UNIQUE (user_id, product_id)
);

-- ===================================
-- BẢNG QUẢN LÝ THÔNG BÁO
-- ===================================

-- Bảng thông báo
CREATE TABLE notifications (
                               notification_id INT PRIMARY KEY AUTO_INCREMENT,
                               user_id INT,
                               title VARCHAR(200) NOT NULL,
                               content TEXT NOT NULL,
                               type VARCHAR(50),
                               related_id INT,
                               is_read BIT DEFAULT 0,
                               created_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6),
                               FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ===================================
-- BẢNG CÀI ĐẶT HỆ THỐNG
-- ===================================

-- Bảng cấu hình website
CREATE TABLE settings (
                          setting_id INT PRIMARY KEY AUTO_INCREMENT,
                          setting_key VARCHAR(100) NOT NULL UNIQUE,
                          setting_value TEXT,
                          setting_type VARCHAR(50),
                          description TEXT,
                          updated_at DATETIME(6) DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
);

-- ===================================
-- CHỈ MỤC (INDEX) ĐỂ TỐI ƯU HIỆU SUẤT
-- ===================================

-- Index cho bảng users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);

-- Index cho bảng products
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);

-- Index cho bảng orders
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status_id);
CREATE INDEX idx_orders_code ON orders(order_code);
CREATE INDEX idx_orders_created ON orders(created_at);

-- Index cho bảng order_items
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Index cho bảng reviews
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- ===================================
-- DỮ LIỆU MẪU
-- ===================================

-- Thêm vai trò mặc định
INSERT INTO roles (role_name, description) VALUES
                                               ('admin', 'Quản trị viên'),
                                               ('customer', 'Khách hàng'),
                                               ('staff', 'Nhân viên');

-- Thêm trạng thái đơn hàng
INSERT INTO order_statuses (status_name, description, color_code, display_order) VALUES
                                                                                     ('pending', 'Chờ xác nhận', '#FFA500', 1),
                                                                                     ('confirmed', 'Đã xác nhận', '#3498db', 2),
                                                                                     ('processing', 'Đang xử lý', '#9b59b6', 3),
                                                                                     ('shipping', 'Đang giao hàng', '#2ecc71', 4),
                                                                                     ('completed', 'Hoàn thành', '#27ae60', 5),
                                                                                     ('cancelled', 'Đã hủy', '#e74c3c', 6),
                                                                                     ('refunded', 'Đã hoàn tiền', '#95a5a6', 7);

-- Thêm cấu hình website mẫu
INSERT INTO settings (setting_key, setting_value, setting_type, description) VALUES
                                                                                 ('site_name', 'Bean Farm', 'text', 'Tên website'),
                                                                                 ('site_email', 'contact@beanfarm.com', 'text', 'Email liên hệ'),
                                                                                 ('site_phone', '0123456789', 'text', 'Số điện thoại'),
                                                                                 ('shipping_fee', '30000', 'number', 'Phí vận chuyển mặc định'),
                                                                                 ('free_shipping_threshold', '500000', 'number', 'Miễn phí ship cho đơn hàng trên'),
                                                                                 ('currency', 'VND', 'text', 'Đơn vị tiền tệ');

-- Thêm danh mục sản phẩm mẫu
INSERT INTO categories (category_name, slug, description, display_order) VALUES
                                                                             ('Rau củ quả tươi', 'rau-cu-qua-tuoi', 'Rau củ quả tươi sạch hàng ngày', 1),
                                                                             ('Trái cây organic', 'trai-cay-organic', 'Trái cây hữu cơ nhập khẩu', 2),
                                                                             ('Thực phẩm khô', 'thuc-pham-kho', 'Hạt, ngũ cốc, đậu các loại', 3),
                                                                             ('Sữa & Trứng', 'sua-va-trung', 'Sản phẩm từ sữa và trứng', 4),
                                                                             ('Thịt & Hải sản', 'thit-hai-san', 'Thịt tươi và hải sản', 5);