-- Seed catalog items for Tania's Wholesale Club
-- All prices are wholesale base prices (before member discount)

insert into catalog_items (slug, name, description, unit_label, base_price, min_tier, stock_qty, low_stock_threshold, supplier_name, sort_order) values

-- Slice Club tier (available to all members)
(
  'diet-coke-case-24',
  'Diet Coke — Case of 24',
  'Classic Diet Coke, 12 oz cans. Case of 24. Perfect for offices and high-volume buyers.',
  'case of 24 cans',
  18.00,
  'slice_club',
  120,
  20,
  'Pepsi/Coke Distributor',
  10
),
(
  'coke-case-24',
  'Coca-Cola Classic — Case of 24',
  'Coca-Cola Classic, 12 oz cans. Case of 24.',
  'case of 24 cans',
  18.00,
  'slice_club',
  80,
  20,
  'Pepsi/Coke Distributor',
  20
),
(
  'sprite-case-24',
  'Sprite — Case of 24',
  'Sprite lemon-lime, 12 oz cans. Case of 24.',
  'case of 24 cans',
  17.00,
  'slice_club',
  60,
  15,
  'Pepsi/Coke Distributor',
  30
),
(
  'take-bake-cheese-tray',
  'Take & Bake — Cheese Pizza Tray (4-pack)',
  'Four 14" par-baked cheese pizzas, ready to finish at home in 12 minutes. Great for meal prep and events.',
  '4-pack tray',
  42.00,
  'slice_club',
  30,
  8,
  'In-house',
  40
),

-- Wholesale Member tier (available to Wholesale + Business Partner)
(
  'pizza-dough-6pack',
  'House Pizza Dough — 6-Pack',
  'Fresh-made 14" dough balls, same recipe we use in the shop. Ready to stretch. Refrigerates 5 days, freezes 3 months.',
  '6 dough balls',
  24.00,
  'wholesale_member',
  50,
  10,
  'In-house',
  50
),
(
  'marinara-sauce-5lb',
  'House Marinara Sauce — 5 lb Tub',
  'Our signature slow-cooked San Marzano marinara. Perfect for dipping, pasta, or pizza.',
  '5 lb tub',
  22.00,
  'wholesale_member',
  40,
  8,
  'In-house',
  60
),
(
  'take-bake-supreme-tray',
  'Take & Bake — Supreme Pizza Tray (4-pack)',
  'Four 14" supreme par-baked pizzas loaded with pepperoni, sausage, peppers, and onions.',
  '4-pack tray',
  52.00,
  'wholesale_member',
  20,
  6,
  'In-house',
  70
),
(
  'pepperoni-bulk-3lb',
  'Sliced Pepperoni — 3 lb Bag',
  'Same thick-cut pepperoni we use in the shop. Vacuum-sealed, refrigerates 3 weeks.',
  '3 lb bag',
  28.00,
  'wholesale_member',
  35,
  8,
  'US Foods',
  80
),

-- Business Partner tier (exclusive to Business Partner)
(
  'mozzarella-bulk-10lb',
  'Whole-Milk Mozzarella — 10 lb Block',
  'Low-moisture whole-milk mozzarella, the same block we shred fresh daily. Commercial grade.',
  '10 lb block',
  65.00,
  'business_partner',
  25,
  5,
  'US Foods',
  90
),
(
  'catering-pizza-pack-12',
  'Catering Pack — 12 Pizzas',
  '12 full-size 16" pizzas, mix-and-match toppings. Pre-order required 48 hours in advance. Great for corporate events.',
  '12 pizzas',
  180.00,
  'business_partner',
  10,
  2,
  'In-house',
  100
);
