BEGIN;
-- Insert Product Vendors
INSERT INTO
    public.ProductVendors (
        id,
        NAME,
        description,
        product_types,
        vendor_type,
        vendor_scale,
        countries,
        is_retail_chain,
        is_template
    )
VALUES
    (
        gen_random_uuid (),
        'Canadian Tire',
        'A retail company selling automotive, hardware, sports, leisure, and home products',
        ARRAY[
            'automotive',
            'hardware',
            'sports equipment',
            'home goods'
        ],
        ARRAY['big box', 'department store'],
        'international',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Shoppers Drug Mart',
        'A major pharmacy and convenience store chain',
        ARRAY[
            'pharmaceuticals',
            'cosmetics',
            'groceries',
            'health products'
        ],
        ARRAY['pharmacy', 'convenience store'],
        'international',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Loblaws',
        'One of Canada''s largest food retailers',
        ARRAY['groceries', 'bakery', 'deli', 'household items'],
        ARRAY['supermarket', 'grocery store'],
        'international',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Metro',
        'A major Canadian food retailer operating in Ontario and Quebec',
        ARRAY['groceries', 'produce', 'meat', 'bakery'],
        ARRAY['supermarket', 'grocery store'],
        'international',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Sephora',
        'A multinational chain of personal care and beauty stores',
        ARRAY[
            'cosmetics',
            'skincare',
            'fragrance',
            'beauty tools'
        ],
        ARRAY['specialty retailer', 'beauty store'],
        'international',
        NULL,
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Best Buy',
        'A multinational consumer electronics retailer',
        ARRAY[
            'electronics',
            'appliances',
            'computers',
            'mobile phones'
        ],
        ARRAY['big box', 'electronics store'],
        'international',
        NULL,
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Hudson''s Bay',
        'A chain of department stores across Canada',
        ARRAY[
            'clothing',
            'accessories',
            'home goods',
            'beauty products'
        ],
        ARRAY['department store'],
        'international',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Costco',
        'A membership-based wholesale retailer',
        ARRAY[
            'groceries',
            'electronics',
            'home goods',
            'clothing'
        ],
        ARRAY['wholesale', 'big box'],
        'international',
        NULL,
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Walmart Canada',
        'A subsidiary of Walmart operating discount department stores',
        ARRAY[
            'groceries',
            'clothing',
            'electronics',
            'home goods'
        ],
        ARRAY['discount store', 'superstore'],
        'international',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Home Depot',
        'A home improvement retailer selling construction and home improvement products',
        ARRAY[
            'hardware',
            'tools',
            'appliances',
            'building materials'
        ],
        ARRAY['big box', 'home improvement store'],
        'international',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Dollarama',
        'A chain of dollar stores offering a wide range of products',
        ARRAY[
            'household items',
            'food',
            'toys',
            'seasonal goods'
        ],
        ARRAY['discount store', 'dollar store'],
        'regional',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Staples',
        'An office supply chain store',
        ARRAY[
            'office supplies',
            'electronics',
            'furniture',
            'printing services'
        ],
        ARRAY['office supply store', 'electronics store'],
        'international',
        ARRAY['CANADA', 'UNITED STATES OF AMERICA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Sobeys',
        'A national grocery store chain',
        ARRAY['groceries', 'produce', 'meat', 'bakery'],
        ARRAY['supermarket', 'grocery store'],
        'international',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'London Drugs',
        'A retail chain offering pharmaceuticals, electronics, and general merchandise',
        ARRAY[
            'pharmaceuticals',
            'electronics',
            'cosmetics',
            'household items'
        ],
        ARRAY['pharmacy', 'department store'],
        'regional',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Mark''s',
        'A Canadian retailer specializing in casual and work wear',
        ARRAY['clothing', 'footwear', 'workwear', 'accessories'],
        ARRAY['clothing store', 'retailer', 'workwear retailer'],
        'international',
        ARRAY['CANADA', 'UNITED STATES OF AMERICA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Sport Chek',
        'A sporting goods and apparel retailer',
        ARRAY[
            'sports equipment',
            'athletic apparel',
            'footwear',
            'outdoor gear'
        ],
        ARRAY['sporting goods store'],
        'international',
        ARRAY['CANADA', 'UNITED STATES OF AMERICA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Rona',
        'A Canadian retailer of hardware, home improvement, and gardening products',
        ARRAY[
            'hardware',
            'building materials',
            'gardening supplies',
            'home decor'
        ],
        ARRAY['home improvement store', 'hardware store'],
        'domestic',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Winners',
        'An off-price department store chain',
        ARRAY[
            'clothing',
            'home goods',
            'accessories',
            'beauty products'
        ],
        ARRAY['discount store', 'department store'],
        'international',
        ARRAY['CANADA', 'UNITED STATES OF AMERICA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'HomeSense',
        'A home furnishings retailer offering discounted brand-name products',
        ARRAY[
            'home decor',
            'furniture',
            'kitchenware',
            'bedding'
        ],
        ARRAY['home goods store', 'discount store'],
        'international',
        ARRAY['CANADA', 'UNITED STATES OF AMERICA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Indigo',
        'A book and lifestyle retailer',
        ARRAY['books', 'stationery', 'gifts', 'home decor'],
        ARRAY['bookstore', 'gift shop', 'retailer'],
        'international',
        NULL,
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Jean Coutu',
        'A Canadian pharmacy chain',
        ARRAY[
            'pharmaceuticals',
            'cosmetics',
            'health products',
            'photo services'
        ],
        ARRAY['pharmacy', 'drugstore'],
        'domestic',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Canadian Tire Gas+',
        'A chain of gas stations and convenience stores',
        ARRAY[
            'fuel',
            'convenience items',
            'car wash',
            'propane'
        ],
        ARRAY['gas station', 'convenience store'],
        'domestic',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Canadian Tire',
        'A chain of every day products, home improvement and tools',
        ARRAY[
            'car',
            'kitchen',
            'gardening',
            'convenience items',
            'car wash',
            'propane'
        ],
        ARRAY['gas station', 'convenience store'],
        'domestic',
        ARRAY['CANADA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Lululemon',
        'An athletic apparel retailer',
        ARRAY[
            'athletic wear',
            'yoga apparel',
            'accessories',
            'lifestyle clothing'
        ],
        ARRAY[
            'specialty retailer',
            'clothing store',
            'retailer'
        ],
        'international',
        ARRAY['CANADA', 'UNITED STATES OF AMERICA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Roots',
        'A Canadian lifestyle brand offering clothing and leather goods',
        ARRAY[
            'clothing',
            'leather goods',
            'footwear',
            'accessories'
        ],
        ARRAY['clothing store', 'retailer', 'lifestyle brand'],
        'international',
        ARRAY['CANADA', 'UNITED STATES OF AMERICA'],
        TRUE,
        TRUE
    ),
    (
        gen_random_uuid (),
        'Aritzia',
        'A women''s fashion boutique chain',
        ARRAY[
            'women''s clothing',
            'accessories',
            'shoes',
            'beauty products'
        ],
        ARRAY['clothing store', 'retailer', 'fashion boutique'],
        'international',
        ARRAY['CANADA', 'UNITED STATES OF AMERICA'],
        TRUE,
        TRUE
    );
COMMIT;