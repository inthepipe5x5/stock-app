CREATE
OR REPLACE FUNCTION public.insert_templated_household_and_inventories (new_user_id UUID) RETURNS TABLE (household_id UUID, inventory_id UUID) AS $$
DECLARE
    template_household RECORD;
    new_household_id UUID;
BEGIN
    -- Select the template household
    SELECT
        th.name,
        th.description,
        th.initial_template_name,
        th.styling,
        th.media
    INTO template_household
    FROM public.households AS th
    WHERE
        th.is_template = TRUE
        AND th.draft_status = 'published'
        AND th.initial_template_name = 'Type-Based Household'
    LIMIT 1;

    -- Insert into public.households
    INSERT INTO public.households (
        id,
        name,
        description,
        initial_template_name,
        styling,
        is_template,
        draft_status
    ) VALUES (
        gen_random_uuid(),
        template_household.name,
        template_household.description,
        template_household.initial_template_name,
        template_household.styling,
        FALSE,  -- Set is_template to FALSE for the new household
        'draft' -- Set draft_status to 'draft' for the new household
    )
    RETURNING id INTO new_household_id;

    -- Insert into user_households
    INSERT INTO public.user_households (
        household_id,
        user_id,
        access_level,
        invited_by,
        invited_at,
        invite_accepted,
        invite_expires_at
    ) VALUES (
        new_household_id,
        new_user_id,
        'manager',  -- Assuming the user is a manager by default
        NULL,       -- invited_by can be NULL for the manager
        NOW(),      -- invited_at is the current timestamp
        TRUE,       -- invite_accepted is TRUE for the owner
        NULL        -- invite_expires_at can be NULL for the owner
    )
    ON CONFLICT (user_id, household_id) DO NOTHING;

    -- Insert inventories associated with the household
    IF new_household_id IS NOT NULL THEN
        INSERT INTO public.inventories (
            id,
            name,
            description,
            category,
            styling,
            household_id
        )
        SELECT
            gen_random_uuid() AS id,
            inv.name,
            inv.description,
            inv.category,
            inv.styling,
            new_household_id
        FROM public.inventories AS inv
        WHERE
            inv.is_template = TRUE
            AND inv.draft_status = 'published'
            AND inv.household_id = (
                SELECT h.id
                FROM public.households AS h
                WHERE
                    h.is_template = TRUE
                    AND h.draft_status = 'published'
                    AND h.initial_template_name = 'Type-Based Household'
            )
        ON CONFLICT (name) DO NOTHING
        RETURNING id INTO inventory_id;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;

--OUTDATED April 29 2025 it has been replaced by the function above which is called on every new auth.user insert trigger
-- BEGIN;
-- INSERT INTO
--     public.households (id, initial_template_name, description) --this is out of date --linter ignore
-- VALUES
--     -- Insert Household for Rooms
--     (
--         gen_random_uuid (),
--         'Room-Based Household',
--         'Household organized by rooms'
--     ),
--     -- Insert Household for Types
--     (
--         gen_random_uuid (),
--         'Type-Based Household',
--         'Household organized by product types'
--     );
-- -- Insert Product Inventories for Rooms
-- INSERT INTO
--     public.inventories (
--         id,
--         NAME,
--         description,
--         household_id,
--         category,
--         draft_status,
--         is_template
--     )
-- VALUES
--     (
--         gen_random_uuid (),
--         'Kitchen Inventory',
--         'Inventory for kitchen items',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Room-Based Household'
--         ),
--         'food',
--         'published',
--         TRUE
--     ),
--     (
--         gen_random_uuid (),
--         'Garage Inventory',
--         'Inventory for garage tools',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Room-Based Household'
--         ),
--         'tools',
--         'published',
--         TRUE
--     ),
--     (
--         gen_random_uuid (),
--         'Bathroom Inventory',
--         'Inventory for bathroom supplies',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Room-Based Household'
--         ),
--         'hygiene & skin care',
--         'published',
--         TRUE
--     ),
--     (
--         gen_random_uuid (),
--         'Living Room Inventory',
--         'Inventory for living room items',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Room-Based Household'
--         ),
--         'cleaning supplies',
--         'published',
--         TRUE
--     ),
--     (
--         gen_random_uuid (),
--         'Bedroom Inventory',
--         'Inventory for bedroom items',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Room-Based Household'
--         ),
--         'personal care',
--         'published',
--         TRUE
--     );
-- -- Insert Product Inventories for Types
-- INSERT INTO
--     public.inventories (
--         id,
--         NAME,
--         description,
--         household_id,
--         category,
--         draft_status,
--         is_template
--     )
-- VALUES
--     (
--         gen_random_uuid (),
--         'Groceries Inventory',
--         'Inventory for groceries',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Type-Based Household'
--         ),
--         'food',
--         'published',
--         TRUE
--     ),
--     (
--         gen_random_uuid (),
--         'Tools Inventory',
--         'Inventory for tools',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Type-Based Household'
--         ),
--         'tools',
--         'published',
--         TRUE
--     ),
--     (
--         gen_random_uuid (),
--         'Skin Care Inventory',
--         'Inventory for skin care products',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Type-Based Household'
--         ),
--         'hygiene & skin care',
--         'published',
--         TRUE
--     ),
--     (
--         gen_random_uuid (),
--         'Cleaning Supplies Inventory',
--         'Inventory for cleaning supplies',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Type-Based Household'
--         ),
--         'cleaning supplies',
--         'published',
--         TRUE
--     ),
--     (
--         gen_random_uuid (),
--         'Personal Care Inventory',
--         'Inventory for personal care products',
--         (
--             SELECT
--                 id
--             FROM
--                 public.households
--             WHERE
--                 initial_template_name = 'Type-Based Household'
--         ),
--         'personal care',
--         'published',
--         TRUE
--     );
-- COMMIT;