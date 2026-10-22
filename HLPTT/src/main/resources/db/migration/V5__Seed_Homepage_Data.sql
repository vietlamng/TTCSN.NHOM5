/* ==========================================================================
   SCRIPT FINAL UPDATE: FULL SẢN PHẨM + MÔ TẢ CHI TIẾT + USER + REVIEW
   (Chạy 1 lần là có đủ mọi thứ - Không lo thiếu mô tả)
   ========================================================================== */

SET FOREIGN_KEY_CHECKS = 0;

-- 1. RESET DATA
TRUNCATE TABLE reviews;
TRUNCATE TABLE cart_items;
TRUNCATE TABLE order_items;
TRUNCATE TABLE product_images;
TRUNCATE TABLE product_attributes;
TRUNCATE TABLE products;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;


-- 3. TẠO DANH MỤC
INSERT INTO categories (category_id, category_name, slug, is_active, display_order) VALUES
(1, 'Rau củ', 'rau-cu', 1, 1),
(2, 'Trái cây', 'trai-cay', 1, 2),
(3, 'Thịt', 'thit', 1, 3),
(4, 'Trứng', 'trung', 1, 4),
(5, 'Đồ uống', 'do-uong', 1, 5),
(6, 'Bánh và sữa', 'banh-va-sua', 1, 6),
(7, 'Hải sản', 'hai-san', 1, 7),
(8, 'Bánh mì', 'banh-mi', 1, 8),
(9, 'Salad', 'salad', 1, 9),
(10, 'Dầu thực vật', 'dau-thuc-vat', 1, 10),
(11, 'Gia vị & Đồ khô', 'gia-vi-do-kho', 1, 11);

-- 4. NHẬP SẢN PHẨM (KÈM MÔ TẢ HTML)

-- === [1] RAU CỦ ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(1, 'Nấm đùi gà', 'nam-dui-ga', 62000, 30, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Nấm đùi gà tươi ngon, giàu dinh dưỡng, thích hợp cho các món xào, nấu lẩu.</p><ul><li>Xuất xứ: Việt Nam</li><li>Hạn sử dụng: 5 ngày</li><li>Bảo quản: Ngăn mát tủ lạnh</li></ul>'),
(1, 'Ớt hiểm', 'ot-hiem', 70000, 30, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Ớt hiểm cay nồng, tạo hương vị đậm đà cho món ăn.</p>'),
(1, 'Củ gừng', 'cu-gung', 30000, 50, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Gừng tươi, cay ấm, tốt cho tiêu hóa và giải cảm.</p>'),
(1, 'Chanh hữu cơ', 'chanh-huu-co', 25000, 60, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Chanh tươi mọng nước, vỏ mỏng, thơm ngát.</p>'),
(1, 'Khoai lang', 'khoai-lang', 25000, 100, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Khoai lang mật ngọt lịm, dẻo thơm, được trồng theo tiêu chuẩn hữu cơ.</p><ul><li>Xuất xứ: Đà Lạt</li><li>Hạn sử dụng: 1 tháng</li></ul>'),
(1, 'Hành tây', 'hanh-tay', 35000, 100, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Hành tây Đà Lạt củ to, chắc thịt, vị ngọt thanh, ít hăng.</p>'),
(1, 'Dưa leo baby', 'dua-leo-baby', 35000, 80, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Dưa leo baby giòn rụm, ngọt mát, ăn sống rất ngon.</p>'),
(1, 'Cà chua bi', 'ca-chua-bi', 40000, 50, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Cà chua bi đỏ mọng, ngọt dịu, rất thích hợp làm salad hoặc ăn sống.</p><ul><li>Xuất xứ: Lâm Đồng</li><li>Canh tác: Hữu cơ</li></ul>'),
(1, 'Bí đỏ hồ lô', 'bi-do-ho-lo', 25000, 40, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Bí đỏ dẻo ngọt, giàu vitamin A, tốt cho mắt.</p>'),
(1, 'Hành lá', 'hanh-la', 30000, 20, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Hành lá tươi xanh, gia vị không thể thiếu cho món Việt.</p>'),
(1, 'Súp lơ xanh', 'sup-lo-xanh', 55000, 30, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Súp lơ xanh (Bông cải xanh) chứa nhiều vitamin, tốt cho sức khỏe tim mạch.</p><ul><li>Xuất xứ: Đà Lạt</li><li>Trọng lượng: 500g - 800g/bông</li></ul>'),
(1, 'Rau muống', 'rau-muong', 20000, 50, 'bó', 1, '<h3>Thông tin sản phẩm</h3><p>Rau muống hữu cơ, thân giòn, lá xanh mướt, không sử dụng thuốc kích thích.</p><ul><li>Xuất xứ: Vườn rau sạch Củ Chi</li><li>Quy cách: Bó 500g</li></ul>'),
(1, 'Cải thìa', 'cai-thia', 25000, 50, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Cải thìa (Cải chíp) bẹ dày, ngọt mát, thích hợp xào nấm hoặc nấu canh.</p><ul><li>Xuất xứ: Mộc Châu</li><li>Canh tác: VietGAP</li></ul>'),
(1, 'Bắp cải', 'bap-cai', 25000, 40, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Bắp cải trắng giòn ngọt, cuộn chặt, bảo quản được lâu.</p>'),
(1, 'Ngò rí', 'ngo-ri', 55000, 20, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Ngò rí thơm nồng, trang trí và tăng hương vị món ăn.</p>'),
(1, 'Cải bó xôi', 'cai-bo-xoi', 35000, 40, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Cải bó xôi (Rau chân vịt) giàu sắt và vitamin, rất tốt cho sức khỏe.</p>'),
(1, 'Xà lách mỡ', 'xa-lach-mo', 40000, 40, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Xà lách mỡ lá mềm, vị ngọt nhẹ, chuyên dùng cuốn thịt nướng.</p>'),
(1, 'Cà rốt', 'ca-rot', 25000, 100, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Cà rốt tươi, củ to đều, màu cam đẹp mắt, giàu Vitamin A.</p>'),
(1, 'Khoai tây', 'khoai-tay', 30000, 100, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Khoai tây sáp, ruột vàng, bở tơi khi nấu chín.</p>'),
(1, 'Bí đao xanh', 'bi-dao-xanh', 22000, 50, 'kg', 1, '<p>Bí đao thanh mát, giải nhiệt.</p>'),
(1, 'Cà chua Hà Lan', 'ca-chua-ha-lan', 55000, 30, 'kg', 1, '<p>Cà chua chùm, trái tròn đều, vị chua ngọt cân bằng.</p>'),
(1, 'Cà tím', 'ca-tim', 18000, 40, 'kg', 1, '<p>Cà tím ruột trắng, mềm ngọt khi nướng mỡ hành.</p>'),
(1, 'Củ cải trắng', 'cu-cai-trang', 15000, 50, 'kg', 1, '<p>Củ cải trắng ngọt nước, hầm xương rất ngon.</p>'),
(1, 'Đậu bắp', 'dau-bap', 25000, 40, 'kg', 1, '<p>Đậu bắp non, xanh mướt, luộc chấm chao tuyệt vời.</p>'),
(1, 'Đậu Cove', 'dau-cove', 30000, 40, 'kg', 1, '<p>Đậu cove hạt nhỏ, giòn sần sật.</p>'),
(1, 'Mướp hương', 'muop-huong', 20000, 40, 'kg', 1, '<p>Mướp hương thơm lừng, nấu canh cua rau đay chuẩn vị.</p>'),
(1, 'Cải bẹ xanh', 'cai-be-xanh', 18000, 50, 'bó', 1, '<p>Cải bẹ xanh vị hăng nhẹ, nấu canh cá rô đồng rất hợp.</p>'),
(1, 'Cải ngọt', 'cai-ngot', 18000, 50, 'bó', 1, '<h3>Thông tin sản phẩm</h3><p><strong>Cải ngọt hữu cơ</strong> được trồng tại nông trại Bean Farm theo quy trình chuẩn VietGAP.</p><ul><li>Xuất xứ: Đà Lạt, Lâm Đồng</li><li>Quy cách: Bó 500g</li><li>Hạn sử dụng: 3-5 ngày</li></ul>'),
(1, 'Cải xoăn Kale', 'cai-xoan-kale', 60000, 20, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p><strong>Cải xoăn Kale</strong> giàu dinh dưỡng, nữ hoàng của các loại rau xanh.</p><ul><li>Công dụng: Làm đẹp da, giảm cân</li><li>Chế biến: Salad, Smoothie</li></ul>');

-- === [2] TRÁI CÂY ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(2, 'Dâu tây', 'dau-tay', 250000, 20, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Dâu tây giống New Zealand trồng tại Đà Lạt, trái to, đỏ mọng, ngọt ngào.</p><ul><li>Xuất xứ: Đà Lạt</li><li>Quy cách: Hộp 500g</li></ul>'),
(2, 'Bơ sáp', 'bo-sap', 80000, 30, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Bơ sáp Đắk Lắk cơm vàng, dẻo quánh, béo ngậy, không xơ.</p><ul><li>Xuất xứ: Đắk Lắk</li><li>Size: 3-4 trái/kg</li></ul>'),
(2, 'Táo Envy Mỹ', 'tao-envy-my', 240000, 30, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Táo Envy Mỹ size lớn, giòn tan, ngọt lịm, hương thơm đặc trưng.</p><ul><li>Xuất xứ: Mỹ</li><li>Nhập khẩu chính ngạch</li></ul>'),
(2, 'Kiwi vàng New Zealand', 'kiwi-vang-new-zealand', 220000, 30, 'kg', 1, '<p>Kiwi vàng ngọt lịm, vỏ mỏng, giàu Vitamin C.</p>'),
(2, 'Nho đen không hạt', 'nho-den-khong-hat', 199000, 30, 'kg', 1, '<p>Nho đen không hạt Mỹ, trái cứng, giòn ngọt.</p>'),
(2, 'Dưa lưới', 'dua-luoi', 65000, 40, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Dưa lưới ruột cam, vỏ lưới nổi, độ ngọt Brix > 14.</p><ul><li>Xuất xứ: Ninh Thuận</li><li>Công nghệ: Nhà màng Israel</li></ul>'),
(2, 'Bơ Booth', 'bo-booth', 90000, 30, 'kg', 1, '<p>Bơ Booth cơm dày, hạt nhỏ, béo ngậy.</p>'),
(2, 'Chuối xiêm', 'chuoi-xiem', 20000, 50, 'nải', 1, '<p>Chuối xiêm chín cây, ngọt đậm, vỏ mỏng.</p>'),
(2, 'Quýt hữu cơ', 'quyt-huu-co', 55000, 40, 'kg', 1, '<p>Quýt đường vỏ mỏng, tép mọng nước, ngọt thanh.</p>'),
(2, 'Xoài tứ quý', 'xoai-tu-quy', 45000, 40, 'kg', 1, '<p>Xoài tứ quý trái to, ăn sống giòn, ăn chín ngọt.</p>'),
(2, 'Cam Valencia', 'cam-valencia', 60000, 40, 'kg', 1, '<p>Cam Valencia mọng nước, chuyên dùng để vắt nước uống.</p>'),
(2, 'Dưa hấu', 'dua-hau', 20000, 50, 'kg', 1, '<p>Dưa hấu đỏ, không hạt, ngọt lịm.</p>'),
(2, 'Táo Juliet', 'tao-juliet', 120000, 30, 'kg', 1, '<p>Táo Juliet Pháp hữu cơ, giòn ngọt tự nhiên.</p>');

-- === [3] THỊT ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(3, 'Xương ống bò Karst', 'xuong-ong-bo-karst', 100000, 50, 'kg', 1, '<p>Xương ống bò nhiều tủy, hầm nước dùng ngọt lịm.</p>'),
(3, 'Bắp chân bò Karst', 'bap-chan-bo-karst', 320000, 50, 'kg', 1, '<p>Bắp bò hoa, giòn sần sật, thích hợp ngâm mắm hoặc luộc.</p>'),
(3, 'Thăn mông bò Kobe', 'than-mong-bo-kobe', 500000, 20, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Thăn mông bò Kobe vân mỡ đều, thịt mềm tan chảy, hương vị thượng hạng.</p><ul><li>Xuất xứ: Nhật Bản</li><li>Hạng: A5</li></ul>'),
(3, 'Thịt xay', 'thit-xay', 155000, 80, 'kg', 1, '<p>Thịt heo xay nạc mỡ vừa phải, tiện lợi chế biến.</p>'),
(3, 'Xương ống bò Kobe', 'xuong-ong-bo-kobe', 87000, 50, 'kg', 1, '<p>Xương bò Kobe cao cấp, nước dùng trong vắt.</p>'),
(3, 'Bò Lúc lắc Kobe', 'luc-lac-bo-kobe', 180000, 30, 'kg', 1, '<p>Thịt bò cắt khối vuông, mềm ngọt, làm món lúc lắc tuyệt hảo.</p>'),
(3, 'Dê sườn bò Kobe', 'de-suon-bo-kobe', 250000, 30, 'kg', 1, '<p>Dẻ sườn bò béo ngậy, nướng BBQ hết ý.</p>'),
(3, 'Gân bò Kobe', 'gan-bo-kobe', 115000, 40, 'kg', 1, '<p>Gân bò trong, giòn, hầm lâu vẫn giữ độ dai ngon.</p>'),
(3, 'Nạc vai bò Kobe', 'nac-vai-bo-kobe', 310000, 30, 'kg', 1, '<p>Nạc vai mềm, thích hợp làm bít tết.</p>'),
(3, 'Mỡ heo', 'mo-heo', 55000, 100, 'kg', 1, '<p>Mỡ heo sạch, dùng để rán lấy mỡ nước rất thơm.</p>'),
(3, 'Sườn non', 'suon-non', 268000, 30, 'kg', 1, '<p>Sườn non heo nhiều sụn, thịt mềm.</p>'),
(3, 'Ba rọi rút sườn', 'ba-roi-rut-suon', 245000, 40, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Ba rọi heo rút sườn, tỷ lệ nạc mỡ hoàn hảo, thích hợp nướng hoặc kho tàu.</p><ul><li>Xuất xứ: Việt Nam (CP)</li><li>Quy cách: Khay 500g</li></ul>'),
(3, 'Nạc dăm Karst', 'nac-dam-karst', 198000, 40, 'kg', 1, '<p>Nạc dăm mềm, có mỡ xen kẽ, không bị khô khi nướng.</p>'),
(3, 'Xương thịt Karst', 'xuong-thit-karst', 60000, 50, 'kg', 1, '<p>Xương heo nhiều thịt, nấu canh ngọt nước.</p>'),
(3, 'Xương Cotlet', 'cot-let', 148000, 40, 'kg', 1, '<p>Thịt cốt lết cắt lát, thích hợp làm sườn bì chả.</p>'),
(3, 'Thịt gà ta nguyên con', 'thit-ga-ta-nguyen-con', 190000, 30, 'con', 1, '<p>Gà ta thả vườn, thịt dai, da giòn.</p>'),
(3, 'Sườn già', 'suon-gia', 132000, 40, 'kg', 1, '<p>Sườn già thích hợp hầm canh, nấu cháo.</p>'),
(3, 'Nạc đùi heo', 'nac-dui-heo', 148000, 50, 'kg', 1, '<p>Thịt nạc đùi săn chắc.</p>'),
(3, 'Chân giò rút xương', 'chan-gio-rut-xuong', 158000, 30, 'kg', 1, '<p>Chân giò đã rút xương, tiện lợi để bó giò luộc.</p>'),
(3, 'Ức gà phi lê', 'uc-ga-phi-le', 85000, 50, 'kg', 1, '<p>Ức gà tươi, ít mỡ, phù hợp ăn kiêng.</p>'),
(3, 'Đùi gà góc tư', 'dui-ga-goc-tu', 80000, 50, 'kg', 1, '<p>Đùi gà góc tư to, thịt mềm ẩm.</p>'),
(3, 'Cánh gà', 'canh-ga', 95000, 60, 'kg', 1, '<p>Cánh gà tươi, chiên nước mắm rất ngon.</p>'),
(3, 'Chân gà', 'chan-ga', 75000, 50, 'kg', 1, '<p>Chân gà sạch, trắng, làm chân gà sả tắc.</p>');


-- === [4] TRỨNG ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(4, 'Trứng gà ta', 'trung-ga-ta', 37000, 100, 'chục', 1, '<p>Trứng gà ta lòng đỏ to, thơm béo.</p>'),
(4, 'Trứng cút', 'trung-cut', 12000, 100, 'chục', 1, '<p>Trứng cút tươi, vỏ sạch.</p>'),
(4, 'Trứng vịt', 'trung-vit', 40000, 100, 'chục', 1, '<p>Trứng vịt đồng, lòng đỏ cam đẹp mắt.</p>'),
(4, 'Trứng gà công nghiệp', 'trung-ga-cong-nghiep', 42000, 100, 'chục', 1, '<p>Trứng gà size lớn, giá tiết kiệm.</p>');

-- === [5] ĐỒ UỐNG ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(5, 'Nước ép nho lựu', 'nuoc-ep-nho-luu', 189000, 50, 'chai', 1, '<p>Nước ép nho lựu nguyên chất, không đường.</p>'),
(5, 'Nước ép cherry', 'nuoc-ep-cherry', 202000, 50, 'chai', 1, '<p>Nước ép cherry nhập khẩu, vị chua ngọt tự nhiên.</p>'),
(5, 'Nước ép lựu', 'nuoc-ep-luu', 342000, 50, 'chai', 1, '<h3>Thông tin sản phẩm</h3><p>Nước ép lựu nguyên chất, giàu chất chống oxy hóa, giúp trẻ hóa làn da.</p><ul><li>Không đường, vị ngọt tự nhiên</li><li>Dung tích: 1 Lít</li></ul>'),
(5, 'Nước ép táo', 'nuoc-ep-tao', 167000, 50, 'chai', 1, '<p>Nước ép táo lên men tự nhiên.</p>'),
(5, 'Nước ép nho', 'nuoc-ep-nho', 170000, 50, 'chai', 1, '<p>Nước ép nho tím đậm đà.</p>'),
(5, 'Nước ép lúa mạch', 'nuoc-ep-lua-mach', 150000, 50, 'chai', 1, '<p>Nước lúa mạch giải khát, bổ dưỡng.</p>'),
(5, 'Nước tăng lực', 'nuoc-tang-luc', 15000, 100, 'chai', 1, '<h3>Thông tin sản phẩm</h3><p>Nước tăng lực giúp tỉnh táo tức thì, bổ sung năng lượng cho ngày dài hoạt động.</p><ul><li>Hương vị dâu tây</li><li>Có ga nhẹ</li></ul>');

-- === [6] BÁNH VÀ SỮA ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(6, 'Sữa Gạo Canxi', 'sua-gao-canxi', 45000, 100, 'hộp', 1, '<h3>Thông tin sản phẩm</h3><p>Sữa gạo rang Hàn Quốc vị thanh mát, giải nhiệt, đẹp da, tốt cho giấc ngủ.</p><ul><li>Dung tích: 1.5 Lít</li><li>Nhập khẩu trực tiếp</li></ul>'),
(6, 'Phô mai lát Zott Burger', 'pho-mai-lat-zott-burger', 39000, 50, 'gói', 1, '<p>Phô mai lát chuyên dùng kẹp bánh mì, burger.</p>'),
(6, 'Sữa gạo ca cao', 'sua-gao-ca-cao', 25000, 100, 'hộp', 1, '<p>Sữa gạo vị cacao thơm ngon cho bé.</p>'),
(6, 'Sữa gạo nâu', 'sua-gao-nau', 25000, 100, 'hộp', 1, '<p>Sữa gạo lứt ít đường.</p>'),
(6, 'Sữa hạnh nhân', 'sua-hanh-nhan', 30000, 100, 'hộp', 1, '<p>Sữa hạt hạnh nhân nguyên chất.</p>'),
(6, 'Sữa yến mạch', 'sua-yen-mach', 35000, 100, 'hộp', 1, '<p>Sữa yến mạch tốt cho tiêu hóa.</p>');

-- === [7] HẢI SẢN ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(7, 'Mực ống Mùa', 'muc-ong-mua', 462000, 30, 'kg', 1, '<p>Mực ống tươi, dày cơm, ngọt thịt.</p>'),
(7, 'Chả mực', 'cha-muc', 350000, 30, 'kg', 1, '<p>Chả mực Hạ Long giã tay, dai giòn sần sật.</p>'),
(7, 'Cua tách thịt', 'cua-tach-thit', 399000, 20, 'hộp', 1, '<p>Thịt cua ghẹ bóc sẵn, tiện lợi.</p>'),
(7, 'Cá hồi phi lê', 'ca-hoi-phi-le', 569000, 30, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Cá hồi Nauy phi lê tươi rói, giàu Omega-3, cắt miếng tiện lợi.</p><ul><li>Xuất xứ: Nauy</li><li>Bảo quản: 0-4 độ C</li></ul>'),
(7, 'Cá thu cắt khúc', 'ca-thu-cat-khuc', 280000, 40, 'kg', 1, '<p>Cá thu cắt khúc nướng hoặc kho đều ngon.</p>'),
(7, 'Tôm sú', 'tom-su', 350000, 40, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Tôm sú biển tự nhiên, size lớn, thịt chắc, ngọt đậm đà.</p><ul><li>Xuất xứ: Cà Mau</li><li>Size: 20-25 con/kg</li></ul>'),
(7, 'Cá chim trắng', 'ca-chim-trang', 120000, 40, 'kg', 1, '<p>Cá chim trắng biển, thịt mềm béo.</p>'),
(7, 'Cá nục', 'ca-nuc', 60000, 50, 'kg', 1, '<p>Cá nục tươi xanh, hấp cuốn bánh tráng.</p>'),
(7, 'Cá thu nguyên con', 'ca-thu-nguyen-con', 250000, 20, 'kg', 1, '<p>Cá thu nguyên con tươi mới đánh bắt.</p>');

-- === [8] BÁNH MÌ ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(8, 'Bánh mì Sandwich', 'banh-mi-sandwich', 25000, 50, 'gói', 1, '<h3>Thông tin sản phẩm</h3><p>Bánh mì Sandwich mềm mịn, thơm mùi bơ sữa, thích hợp cho bữa sáng nhanh gọn.</p><ul><li>Thương hiệu: Kinh Đô</li><li>Hạn sử dụng: 7 ngày</li><li>Quy cách: Gói 10 lát</li></ul>'),
(8, 'Bánh mì Baguette', 'banh-mi-baguette', 15000, 50, 'ổ', 1, '<h3>Thông tin sản phẩm</h3><p>Bánh mì Baguette vỏ giòn ruột mềm, đậm chất Pháp, ngon hơn khi nướng lại.</p><ul><li>Xuất xứ: Lò bánh mì truyền thống</li><li>Sử dụng trong ngày</li></ul>');

-- === [9] SALAD ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(9, 'Salad ức gà', 'salad-uc-ga', 89000, 20, 'suất', 1, '<h3>Thông tin sản phẩm</h3><p>Salad ức gà giảm cân, ức gà mềm không khô, sốt mè rang đậm đà.</p><ul><li>Thành phần: Xà lách, ức gà, cà chua bi, dưa leo</li><li>Kèm sốt riêng</li></ul>'),
(9, 'Salad cầu vồng', 'salad-cau-vong', 69000, 20, 'suất', 1, '<h3>Thông tin sản phẩm</h3><p>Salad cầu vồng rực rỡ sắc màu vitamin, giúp đẹp da và thanh lọc cơ thể.</p><ul><li>Thành phần: Bắp cải tím, cà rốt, ngô ngọt, ớt chuông</li><li>Phù hợp ăn chay</li></ul>'),
(9, 'Salad cá ngừ', 'salad-ca-ngu', 79000, 20, 'suất', 1, '<h3>Thông tin sản phẩm</h3><p>Salad cá ngừ ngâm dầu giàu Protein và Omega-3, bữa ăn dinh dưỡng tiện lợi.</p><ul><li>Cá ngừ đóng hộp Hạ Long</li><li>Rau xanh tươi mới mỗi ngày</li></ul>');

-- === [10] DẦU THỰC VẬT ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(10, 'Dầu đậu nành', 'dau-dau-nanh', 54000, 100, 'chai', 1, '<h3>Thông tin sản phẩm</h3><p>Dầu đậu nành nguyên chất, tốt cho tim mạch, không chứa Cholesterol.</p><ul><li>Dung tích: 1 Lít</li><li>Thương hiệu: Tường An</li></ul>');

-- === [11] GIA VỊ & ĐỒ KHÔ ===
INSERT INTO products (category_id, product_name, slug, price, stock_quantity, unit, is_active, description) VALUES 
(11, 'Bột chiên giòn Meizan', 'bot-chien-gion-meizan', 12000, 100, 'gói', 1, '<h3>Thông tin sản phẩm</h3><p>Bột chiên giòn Meizan giúp món chiên vàng ruộm, giòn lâu mà không ngấm dầu.</p><ul><li>Trọng lượng: 150g</li><li>Dùng cho: Tôm, mực, rau củ, gà...</li></ul>'),
(11, 'Bột gạo tẻ', 'bot-gao-te', 20000, 50, 'kg', 1, '<p>Bột gạo tẻ mịn, làm bánh cuốn, bánh xèo.</p>'),
(11, 'Bún gạo lứt', 'bun-gao-lut', 30000, 50, 'gói', 1, '<h3>Thông tin sản phẩm</h3><p>Gạo lứt huyết rồng nguyên cám, hỗ trợ giảm cân và kiểm soát đường huyết hiệu quả.</p><ul><li>Xuất xứ: Đồng Tháp Mười</li><li>Đóng gói: Túi 1kg hút chân không</li></ul>'),
(11, 'Bún gạo khô', 'bun-gao-kho', 25000, 50, 'gói', 1, '<h3>Thông tin sản phẩm</h3><p>Bún gạo khô Safoco, sợi trắng dai ngon, tiện lợi chế biến bún xào, bún nước.</p><ul><li>Trọng lượng: 500g</li><li>Xuất xứ: Việt Nam</li></ul>'),
(11, 'Đậu đỏ', 'dau-do', 40000, 50, 'kg', 1, '<p>Đậu đỏ hạt to, nấu chè mềm ngọt.</p>'),
(11, 'Đậu phộng', 'dau-phong', 45000, 50, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Đậu phộng (Lạc) nhân to, đều hạt, béo ngậy, thích hợp làm muối vừng hoặc nấu xôi.</p><ul><li>Xuất xứ: Nghệ An</li><li>Hạt chọn lọc kỹ</li></ul>'),
(11, 'Đậu xanh', 'dau-xanh', 35000, 50, 'kg', 1, '<p>Đậu xanh bóc vỏ, nấu chè, làm nhân bánh.</p>'),
(11, 'Gạo lứt hữu cơ', 'gao-lut-huu-co', 50000, 50, 'kg', 1, '<p>Gạo lứt tím than hữu cơ, tốt cho sức khỏe.</p>'),
(11, 'Gạo nếp trắng', 'gao-nep-trang', 25000, 50, 'kg', 1, '<p>Gạo nếp cái hoa vàng, dẻo thơm.</p>'),
(11, 'Gạo trắng hữu cơ', 'gao-trang-huu-co', 35000, 50, 'kg', 1, '<p>Gạo trắng ST25, hạt dài, thơm mùi lá dứa.</p>'),
(11, 'Hạt điều bóc vỏ', 'hat-dieu-boc-vo', 150000, 50, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Hạt điều Bình Phước rang củi, giữ nguyên hương vị tự nhiên, giòn rụm.</p><ul><li>Loại A cồ (Size lớn nhất)</li><li>Còn vỏ lụa</li></ul>'),
(11, 'Hạt hạnh nhân', 'hat-hanh-nhan', 200000, 30, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Hạt hạnh nhân Mỹ sấy mộc, giòn tan, bùi béo, tốt cho trí não và tim mạch.</p><ul><li>Xuất xứ: California, Mỹ</li><li>Quy cách: Hũ 250g</li></ul>'),
(11, 'Hạt sen tươi', 'hat-sen-tuoi', 90000, 40, 'kg', 1, '<h3>Thông tin sản phẩm</h3><p>Hạt sen tươi Huế, hạt to đều, bở tơi, bùi béo, nấu chè rất ngon.</p><ul><li>Xuất xứ: Huế</li><li>Hạn sử dụng: 6 tháng (cấp đông)</li></ul>'),
(11, 'Miến dong', 'mien-dong', 30000, 50, 'gói', 1, '<h3>Thông tin sản phẩm</h3><p>Miến dong làng So dai ngon, không bị nát khi nấu lại, thích hợp nấu canh măng gà.</p><ul><li>Thành phần: 100% tinh bột dong riềng</li><li>Không chất tẩy trắng</li></ul>');


-- INSERT ẢNH (GIỮ NGUYÊN)
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nam-dui-ga.jpg?v=1715138889833', 1 FROM products WHERE slug='nam-dui-ga';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ot.jpg?v=1715138219740', 1 FROM products WHERE slug='ot-hiem';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cu-gung.jpg?v=1715137879660', 1 FROM products WHERE slug='cu-gung';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/chanh-huu-co.jpg?v=1715137724730', 1 FROM products WHERE slug='chanh-huu-co';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/khoa-lang.jpg?v=1712829768790', 1 FROM products WHERE slug='khoai-lang';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/hanh-tay12.jpg?v=1715069895337', 1 FROM products WHERE slug='hanh-tay';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dua-luoi.jpg?v=1713168345367', 1 FROM products WHERE slug='dua-leo-baby';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ca-chua-ha-lan.jpg?v=1712911444550', 1 FROM products WHERE slug='ca-chua-bi';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bi-dao-xanh.jpg?v=1712905433607', 1 FROM products WHERE slug='bi-do-ho-lo';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ngo-ri.jpg?v=1712912315410', 1 FROM products WHERE slug='hanh-la';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cai-xoan-kale.jpg?v=1712827421803', 1 FROM products WHERE slug='sup-lo-xanh';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/rau-muong-huu-co.jpg?v=1712827065973', 1 FROM products WHERE slug='rau-muong';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cai-thia-huu-co.jpg?v=1712823878203', 1 FROM products WHERE slug='cai-thia';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cai-be-xanh-huu-co.jpg?v=1712826069227', 1 FROM products WHERE slug='bap-cai';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ngo-ri.jpg?v=1712912315410', 1 FROM products WHERE slug='ngo-ri';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cai-be-xanh-huu-co.jpg?v=1712826069227', 1 FROM products WHERE slug='cai-bo-xoi';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cai-ngot-huu-co.jpg?v=1712826714077', 1 FROM products WHERE slug='xa-lach-mo';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ca-rot-donduong.jpg?v=1712829533363', 1 FROM products WHERE slug='ca-rot';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/khoai-tay.jpg?v=1712830021727', 1 FROM products WHERE slug='khoai-tay';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bi-dao-xanh.jpg?v=1712905433607', 1 FROM products WHERE slug='bi-dao-xanh';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ca-chua-ha-lan.jpg?v=1712911444550', 1 FROM products WHERE slug='ca-chua-ha-lan';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ca-tim.jpg?v=1712830723957', 1 FROM products WHERE slug='ca-tim';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cu-cai-trang.jpg?v=1712830309207', 1 FROM products WHERE slug='cu-cai-trang';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dau-bap.jpg?v=1712831346997', 1 FROM products WHERE slug='dau-bap';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dau-cove1.jpg?v=1712911870007', 1 FROM products WHERE slug='dau-cove';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/muop-nha.jpg?v=1712831047947', 1 FROM products WHERE slug='muop-huong';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cai-be-xanh-huu-co.jpg?v=1712826069227', 1 FROM products WHERE slug='cai-be-xanh';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cai-ngot-huu-co.jpg?v=1712826714077', 1 FROM products WHERE slug='cai-ngot';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cai-xoan-kale.jpg?v=1712827421803', 1 FROM products WHERE slug='cai-xoan-kale';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dau-cap-dong-mua.jpg?v=1713175919240', 1 FROM products WHERE slug='dau-tay';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bo-booth.jpg?v=1713170772577', 1 FROM products WHERE slug='bo-sap';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ao-candine-huu-co-phap.jpg?v=1713174555260', 1 FROM products WHERE slug='tao-envy-my';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/kiwi-vang-huu-co.jpg?v=1713175503857', 1 FROM products WHERE slug='kiwi-vang-new-zealand';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/12817-851501657688267-1657688267.jpg?v=1713175181177', 1 FROM products WHERE slug='nho-den-khong-hat';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dua-luoi.jpg?v=1713168345367', 1 FROM products WHERE slug='dua-luoi';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bo-booth.jpg?v=1713170772577', 1 FROM products WHERE slug='bo-booth';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/chuoi-xiem-huu-co.jpg?v=1713169903643', 1 FROM products WHERE slug='chuoi-xiem';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/quyt-huu-co.jpg?v=1713169573610', 1 FROM products WHERE slug='quyt-huu-co';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/xoai-tu-quy.jpg?v=1713167818690', 1 FROM products WHERE slug='xoai-tu-quy';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cam-valencia.jpg?v=1713168655623', 1 FROM products WHERE slug='cam-valencia';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dua-hau-huu-co.jpg?v=1713170312343', 1 FROM products WHERE slug='dua-hau';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/tao-juliet-huu-co.jpg?v=1713174712750', 1 FROM products WHERE slug='tao-juliet';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/xuong-ong-bo.jpg?v=1713513504497', 1 FROM products WHERE slug='xuong-ong-bo-karst';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bap-chan-bo-kobe.jpg?v=1713513309253', 1 FROM products WHERE slug='bap-chan-bo-karst';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/than-mong-bo-kobe.jpg?v=1713513056833', 1 FROM products WHERE slug='than-mong-bo-kobe';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/thit-xay.jpg?v=1713509051480', 1 FROM products WHERE slug='thit-xay';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/xuong-ong-bo-kobe.jpg?v=1713511789060', 1 FROM products WHERE slug='xuong-ong-bo-kobe';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bo-luc-lac-kobe.jpg?v=1713512844873', 1 FROM products WHERE slug='luc-lac-bo-kobe';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/de-suon-bo-kobe.jpg?v=1713512193857', 1 FROM products WHERE slug='de-suon-bo-kobe';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/gan-bo-kobe.jpg?v=1713512528300', 1 FROM products WHERE slug='gan-bo-kobe';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nac-vai.jpg?v=1713511141443', 1 FROM products WHERE slug='nac-vai-bo-kobe';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nac-vai.jpg?v=1713511141443', 1 FROM products WHERE slug='thit-vai';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/mo-heo.jpg?v=1713510949583', 1 FROM products WHERE slug='mo-heo';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/suonn-non.jpg?v=1713509989667', 1 FROM products WHERE slug='suon-non';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ba-roi-rut-suon.jpg?v=1713509546573', 1 FROM products WHERE slug='ba-roi-rut-suon';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nac-dam.jpg?v=1713508834890', 1 FROM products WHERE slug='nac-dam-karst';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/xuong-thit-karst.jpg?v=1713176456930', 1 FROM products WHERE slug='xuong-thit-karst';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cot-let-heo.jpg?v=1713510533377', 1 FROM products WHERE slug='cot-let';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ga-ta.jpg?v=1715137518810', 1 FROM products WHERE slug='thit-ga-ta-nguyen-con';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://th.bing.com/th/id/OIP.KGVGu1d5kTINmXcOJxDrfwHaHa?w=176&h=180&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3', 1 FROM products WHERE slug='suon-gia';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://th.bing.com/th/id/OIP.tD8LjWPX8OZhuqRKlI_l9QHaHa?w=183&h=183&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3', 1 FROM products WHERE slug='nac-dui-heo';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://th.bing.com/th/id/OIP.I546ugnjbz59bgZlkfqDEQHaHa?w=189&h=189&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3', 1 FROM products WHERE slug='chan-gio-rut-xuong';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://th.bing.com/th/id/OIP.i2BIJqJSgw_qjmD9F273BwHaEo?w=306&h=191&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3', 1 FROM products WHERE slug='uc-ga-phi-le';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://th.bing.com/th/id/OIP.7z0Km4B7KUapm2rCd4kpFQHaFd?w=221&h=180&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3', 1 FROM products WHERE slug='dui-ga-goc-tu';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/100/447/072/products/ca-nh-ga-scaled.jpg?v=1684825083447', 1 FROM products WHERE slug='canh-ga';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSN07wLuXcewFxM8X7wB9oyeq44iGj_7eAehw&s', 1 FROM products WHERE slug='chan-ga';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/trung-ga-ta.jpg?v=1715136498367', 1 FROM products WHERE slug='trung-ga-ta';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://th.bing.com/th/id/OIP.BpJiQ5CDypD6XciTsJmYeAHaE8?w=220&h=180&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3', 1 FROM products WHERE slug='trung-cut';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://th.bing.com/th?q=Trung+Vit+Gia&w=120&h=120&c=1&rs=1&qlt=70&o=7&cb=1&dpr=1.2&pid=InlineBlock&rm=3&mkt=en-WW&cc=VN&setlang=en&adlt=moderate&t=1&mw=247', 1 FROM products WHERE slug='trung-vit';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://th.bing.com/th/id/OIP.llZDDdFLTlUD8G3oPAnysAHaHa?w=178&h=180&c=7&r=0&o=7&dpr=1.2&pid=1.7&rm=3', 1 FROM products WHERE slug='trung-ga-cong-nghiep';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nuoc-ep-nho.jpg?v=1713588161853', 1 FROM products WHERE slug='nuoc-ep-nho-luu';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nuoc-ep-cherry.jpg?v=1713588378853', 1 FROM products WHERE slug='nuoc-ep-cherry';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nuoc-ep-luu.jpg?v=1713588616830', 1 FROM products WHERE slug='nuoc-ep-luu';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nuoc-ep-tao.jpg?v=1713594835390', 1 FROM products WHERE slug='nuoc-ep-tao';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nuoc-ep-nho.jpg?v=1713588161853', 1 FROM products WHERE slug='nuoc-ep-nho';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nuoc-ep-lua-mach.jpg?v=1713595008033', 1 FROM products WHERE slug='nuoc-ep-lua-mach';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/nuoc-nang-luong.jpg?v=1713596292330', 1 FROM products WHERE slug='nuoc-tang-luc';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/sua-gao-canxi.jpg?v=1713595988933', 1 FROM products WHERE slug='sua-gao-canxi';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/pho-mai-lat-zott-burger-goi.jpg?v=1715076098177', 1 FROM products WHERE slug='pho-mai-lat-zott-burger';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/sua-gao-ca-cao.jpg?v=1713595892157', 1 FROM products WHERE slug='sua-gao-ca-cao';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/sua-gao-nau.jpg?v=1713595741877', 1 FROM products WHERE slug='sua-gao-nau';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/sua-hanh-nhan.jpg?v=1713595530857', 1 FROM products WHERE slug='sua-hanh-nhan';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/sua-yen-mach.jpg?v=1713595304693', 1 FROM products WHERE slug='sua-yen-mach';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/muc-ong-phan-thiet.jpg?v=1713514305523', 1 FROM products WHERE slug='muc-ong-mua';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cha-muc.jpg?v=1713514946607', 1 FROM products WHERE slug='cha-muc';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/cua-tach-thit.jpg?v=1713514547463', 1 FROM products WHERE slug='cua-tach-thit';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/fillet-ca-hoi-mua.jpg?v=1713515255320', 1 FROM products WHERE slug='ca-hoi-phi-le';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ca-thu.jpg?v=1713515932630', 1 FROM products WHERE slug='ca-thu-cat-khuc';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/tom-su.jpg?v=1713516087560', 1 FROM products WHERE slug='tom-su';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ca-chim-trang.jpg?v=1713515560530', 1 FROM products WHERE slug='ca-chim-trang';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ca-nuc.jpg?v=1713515803790', 1 FROM products WHERE slug='ca-nuc';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/ca-thu-mua.jpg?v=1713519432897', 1 FROM products WHERE slug='ca-thu-nguyen-con';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/muc-ong-phan-thiet.jpg?v=1713514305523', 1 FROM products WHERE slug='banh-mi-sandwich';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW1RPlHZUNp65xWq12Vfd3rDgL7Q5rtz216Q&s', 1 FROM products WHERE slug='banh-mi-baguette';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://chefstudio.vn/uploads/r/cach-lam-salad-uc-ga-sot-mayonnaise.jpg', 1 FROM products WHERE slug='salad-uc-ga';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://cdn.tgdd.vn/2020/06/CookProduct/1-730x412.jpg', 1 FROM products WHERE slug='salad-cau-vong';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://cdn.tgdd.vn/2020/07/CookRecipe/Avatar/salad-ca-ngu-ngam-dau-voi-trung-luoc-thumbnail.jpg', 1 FROM products WHERE slug='salad-ca-ngu';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dau-dau-nanh.jpg?v=1715136877413', 1 FROM products WHERE slug='dau-dau-nanh';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bot-chien-gion-meizan.jpg?v=1715076744097', 1 FROM products WHERE slug='bot-chien-gion-meizan';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bot-gao-te.jpg?v=1713519865883', 1 FROM products WHERE slug='bot-gao-te';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bun-gao-lut.jpg?v=1713598677007', 1 FROM products WHERE slug='bun-gao-lut';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/bun-gao-kho.jpg?v=1713598826507', 1 FROM products WHERE slug='bun-gao-kho';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dau-do-co-tu.jpg?v=1713586483790', 1 FROM products WHERE slug='dau-do';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dau-phong-do.jpg?v=1713586854930', 1 FROM products WHERE slug='dau-phong';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/dau-xanh-co-tu.jpg?v=1713586727320', 1 FROM products WHERE slug='dau-xanh';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/gao-lut-huu-co.jpg?v=1713586190973', 1 FROM products WHERE slug='gao-lut-huu-co';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/gao-nep-trang.jpg?v=1713585673193', 1 FROM products WHERE slug='gao-nep-trang';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/gao-trang-huu-co.jpg?v=1713585950610', 1 FROM products WHERE slug='gao-trang-huu-co';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/hat-dieu-boc-vo.jpg?v=1713587480277', 1 FROM products WHERE slug='hat-dieu-boc-vo';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/hat-hanh-nhan-dd.jpg?v=1713587200417', 1 FROM products WHERE slug='hat-hanh-nhan';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/hat-sen-tuoi.jpg?v=1713587709807', 1 FROM products WHERE slug='hat-sen-tuoi';
INSERT INTO product_images (product_id, image_url, is_primary) SELECT product_id, 'https://bizweb.dktcdn.net/thumb/large/100/514/629/products/mien-dong.jpg?v=1713598421507', 1 FROM products WHERE slug='mien-dong';

-- 6. TẠO ĐÁNH GIÁ MẪU (Reviews) - CHỈ CHẠY KHI ĐÃ CÓ USER
INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved, created_at)
SELECT product_id, 1, 5, 'Ngon tuyệt', 'Salad rất tươi, sốt ngon vừa miệng.', 1, NOW()
FROM products WHERE slug IN ('salad-uc-ga', 'salad-ca-ngu');

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved, created_at)
SELECT product_id, 2, 5, 'Chất lượng', 'Hạt điều giòn, không bị hôi dầu. Đóng gói đẹp.', 1, NOW()
FROM products WHERE slug = 'hat-dieu-boc-vo';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved, created_at)
SELECT product_id, 1, 4, 'Tốt', 'Gạo lứt dẻo, dễ ăn hơn mình nghĩ. Sẽ mua lại.', 1, NOW()
FROM products WHERE slug = 'gao-lut-huu-co';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved, created_at)
SELECT product_id, 2, 5, 'Thơm ngon', 'Bánh mì sandwich mềm, date mới tinh.', 1, NOW()
FROM products WHERE slug = 'banh-mi-sandwich';

INSERT INTO reviews (product_id, user_id, rating, title, comment, is_approved, created_at)
SELECT product_id, 1, 5, 'Uống nghiền luôn', 'Sữa gạo vị rất thanh, uống lạnh bao phê.', 1, NOW()
FROM products WHERE slug = 'sua-gao-canxi';

SET FOREIGN_KEY_CHECKS = 1;
SELECT 'Đã nhập thành công FULL DATA (User + Product + Review)!' AS status;