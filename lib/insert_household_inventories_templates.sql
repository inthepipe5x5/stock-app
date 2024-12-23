BEGIN;

INSERT INTO
    public.Households (id, household_name, description)
VALUES
    -- Insert Household for Rooms
    (
        gen_random_uuid (),
        'Room-Based Household',
        'Household organized by rooms'
    ),
    -- Insert Household for Types
    (
        gen_random_uuid (),
        'Type-Based Household',
        'Household organized by product types'
    );

-- Insert Product Inventories for Rooms
INSERT INTO
    public.ProductInventories (
        id,
        NAME,
        description,
        household_id,
        category,
        draft_status,
        is_template
    )
VALUES
    (
        gen_random_uuid (),
        'Kitchen Inventory',
        'Inventory for kitchen items',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Room-Based Household'
        ),
        'food',
        'published',
        TRUE
    ),
    (
        gen_random_uuid (),
        'Garage Inventory',
        'Inventory for garage tools',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Room-Based Household'
        ),
        'tools',
        'published',
        TRUE
    ),
    (
        gen_random_uuid (),
        'Bathroom Inventory',
        'Inventory for bathroom supplies',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Room-Based Household'
        ),
        'hygiene & skin care',
        'published',
        TRUE
    ),
    (
        gen_random_uuid (),
        'Living Room Inventory',
        'Inventory for living room items',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Room-Based Household'
        ),
        'cleaning supplies',
        'published',
        TRUE
    ),
    (
        gen_random_uuid (),
        'Bedroom Inventory',
        'Inventory for bedroom items',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Room-Based Household'
        ),
        'personal care',
        'published',
        TRUE
    );

-- Insert Product Inventories for Types
INSERT INTO
    public.ProductInventories (
        id,
        NAME,
        description,
        household_id,
        category,
        draft_status,
        is_template
    )
VALUES
    (
        gen_random_uuid (),
        'Groceries Inventory',
        'Inventory for groceries',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Type-Based Household'
        ),
        'food',
        'published',
        TRUE
    ),
    (
        gen_random_uuid (),
        'Tools Inventory',
        'Inventory for tools',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Type-Based Household'
        ),
        'tools',
        'published',
        TRUE
    ),
    (
        gen_random_uuid (),
        'Skin Care Inventory',
        'Inventory for skin care products',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Type-Based Household'
        ),
        'hygiene & skin care',
        'published',
        TRUE
    ),
    (
        gen_random_uuid (),
        'Cleaning Supplies Inventory',
        'Inventory for cleaning supplies',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Type-Based Household'
        ),
        'cleaning supplies',
        'published',
        TRUE
    ),
    (
        gen_random_uuid (),
        'Personal Care Inventory',
        'Inventory for personal care products',
        (
            SELECT
                id
            FROM
                public.Households
            WHERE
                household_name = 'Type-Based Household'
        ),
        'personal care',
        'published',
        TRUE
    );

COMMIT;