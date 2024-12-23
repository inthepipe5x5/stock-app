-- Create the ENUM type for task completion status
CREATE TYPE completion_status AS ENUM(
    'done',
    'assigned',
    'in progress',
    'blocked',
    'archived'
);

-- Create the ENUM type for draft status
CREATE TYPE draft_status AS ENUM('draft', 'archived', 'deleted', 'confirmed');

-- Create the ENUM type for role access
CREATE TYPE role_access AS ENUM(
    'guest', -- view-only access
    'member', -- edit access: can create tasks, complete, edit, and assign tasks
    'manager', --can do all CRUD actions on own household and related resources
    'admin' -- on top of member privileges, can create and manage inventories
);

-- Create the ENUM type for vendor & product scale
CREATE TYPE vendor_scale AS ENUM('local', 'regional', 'domestic', 'international');

CREATE TYPE unit_measurements AS ENUM(
    'kg',
    'g',
    'lb',
    'oz',
    'l',
    'ml',
    'gal',
    'qt',
    'pt',
    'cup',
    'tbsp',
    'tsp',
    'pcs',
    'pack',
    'box',
    'bottle',
    'jar',
    'can',
    'bag',
    'roll',
    'sheet',
    'slice',
    'unit',
    'percent'
);

CREATE TYPE current_quantity_status AS ENUM(
    'full',
    'half',
    'quarter',
    'empty',
    'unknown'
);
BEGIN;

-- Step 1: Drop the existing public.product table and all dependent objects
DROP TABLE IF EXISTS public.ProductItems CASCADE;
DROP TABLE IF EXISTS public.productitems CASCADE;

DROP TABLE IF EXISTS public.Tasks CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;

DROP TABLE IF EXISTS public.ProductInventories CASCADE;
DROP TABLE IF EXISTS public.productinventories CASCADE;

DROP TABLE IF EXISTS public.ProductVendors CASCADE;
DROP TABLE IF EXISTS public.productvendors CASCADE;

DROP TABLE IF EXISTS public.Households CASCADE;  
DROP TABLE IF EXISTS public.households CASCADE;  

DROP TABLE IF EXISTS public.RelatedVendors CASCADE;

DROP TABLE IF EXISTS public.TaskAssignments CASCADE;

DROP TABLE IF EXISTS public.UserInventories CASCADE;

-- Step 2: Create the new DB tables
-- UserProfiles table
CREATE TABLE
  public.UserProfiles (
    user_id UUID NOT NULL,
    email TEXT NOT NULL,
    fullname TEXT NOT NULL,
    pREFERENCES public.jsonb NULL,
    created_at TIMESTAMP WITH TIME ZONE NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT userprofiles_pkey PRIMARY KEY (user_id),
    CONSTRAINT userprofiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
  );

-- Households table
CREATE TABLE
  public.Households (
    id UUID PRIMARY KEY,
    household_name VARCHAR(255) NOT NULL,
    description TEXT
  );

-- ProductInventories table
CREATE TABLE
  public.ProductInventories (
    id UUID PRIMARY KEY,
    NAME VARCHAR(100) NOT NULL,
    description TEXT,
    household_id UUID REFERENCES public.Households (id) ON DELETE SET NULL,
    category VARCHAR(200),
    draft_status draft_status DEFAULT 'confirmed',
    is_template BOOLEAN DEFAULT FALSE
  );


-- ProductVendors table
CREATE TABLE
  public.ProductVendors (
    id UUID PRIMARY KEY,
    NAME VARCHAR(255) NOT NULL,
    description TEXT,
    product_types TEXT[],
    vendor_type TEXT[],
    addresses TEXT[], -- array of addresses
    cities TEXT[], -- array of cities
    regions TEXT[], -- array of regions
    countries TEXT[], -- array of countries
    is_retail_chain boolean default true,
    draft_status draft_status DEFAULT 'draft',
    vendor_scale vendor_scale DEFAULT 'domestic',
    is_template BOOLEAN DEFAULT FALSE
  );

-- ProductItems table
CREATE TABLE
    public.ProductItems (
        id UUID PRIMARY KEY,
        product_name VARCHAR(255) NOT NULL,
        description TEXT,
        inventory_id UUID REFERENCES public.ProductInventories (id) ON DELETE CASCADE,
        vendor_id UUID REFERENCES public.ProductVendors (id) ON DELETE SET NULL,
        auto_replenish BOOLEAN DEFAULT FALSE,
        min_quantity INTEGER,
        max_quantity INTEGER,
        current_quantity DECIMAL(10, 2) NOT NULL,
        unit_quantity unit_measurements DEFAULT 'pcs',
        current_quantity_status current_quantity_status DEFAULT 'unknown',
        barcode VARCHAR(255),
        qr_code VARCHAR(255),
        last_scanned TIMESTAMP WITH TIME ZONE,
        scan_history JSONB,
        expiration_date DATE,
        updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        draft_status draft_status DEFAULT 'draft',
        is_template BOOLEAN DEFAULT FALSE
    );

-- Tasks table
CREATE TABLE
  public.Tasks (
    id UUID PRIMARY KEY,
    TASK_NAME VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES public.UserProfiles (user_id) ON DELETE SET NULL,
    product_id UUID REFERENCES public.ProductItems (id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    completion_status completion_status DEFAULT 'assigned',
    recurrence_interval INTERVAL,
    recurrence_end_date DATE,
    is_automated BOOLEAN DEFAULT FALSE,
    automation_trigger VARCHAR(255),
    created_by UUID NOT NULL REFERENCES public.UserProfiles (user_id),
    created_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_by UUID REFERENCES public.UserProfiles (user_id),
    draft_status draft_status DEFAULT 'draft',
    is_template BOOLEAN DEFAULT FALSE
  );


-- UserHouseholds junction table
CREATE TABLE
  public.UserHouseholds (
    user_profile_id UUID REFERENCES public.UserProfiles (user_id) ON DELETE CASCADE,
    household_id UUID REFERENCES public.Households (id) ON DELETE CASCADE,
    user_role role_access DEFAULT 'guest',
    PRIMARY KEY (user_profile_id, household_id)
  );

-- RelatedVendors table
CREATE TABLE
  public.RelatedVendors (
    vendor_id UUID REFERENCES public.ProductVendors (id) ON DELETE CASCADE,
    related_vendor_id UUID REFERENCES public.ProductVendors (id) ON DELETE CASCADE,
    relation_description TEXT,
    PRIMARY KEY (vendor_id, related_vendor_id)
  );

-- UserInventories: Many-to-Many relationship between UserProfiles and Inventories
CREATE TABLE
  public.UserInventories (
    user_profile_id UUID REFERENCES public.UserProfiles (user_id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES public.ProductInventories (id) ON DELETE CASCADE,
    access_level role_access DEFAULT 'guest',
    PRIMARY KEY (user_profile_id, inventory_id)
  );

-- TaskAssignments: Many-to-Many relationship for Task assignments
CREATE TABLE
  public.TaskAssignments (
    task_id UUID REFERENCES public.Tasks (id) ON DELETE CASCADE,
    user_profile_id UUID REFERENCES public.UserProfiles (user_id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.UserProfiles (user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_profile_id, task_id)
  );

    
-- Enable row level security
    ALTER TABLE IF EXISTS public.Households ENABLE ROW LEVEL SECURITY;

    ALTER TABLE IF EXISTS public.UserHouseholds ENABLE ROW LEVEL SECURITY;

    ALTER TABLE IF EXISTS public.ProductInventories ENABLE ROW LEVEL SECURITY;

    ALTER TABLE IF EXISTS public.ProductItems ENABLE ROW LEVEL SECURITY;

    ALTER TABLE IF EXISTS public.Tasks ENABLE ROW LEVEL SECURITY;

    ALTER TABLE IF EXISTS public.TaskAssignments ENABLE ROW LEVEL SECURITY;

    ALTER TABLE IF EXISTS public.ProductVendors ENABLE ROW LEVEL SECURITY;

    ALTER TABLE IF EXISTS public.RelatedVendors ENABLE ROW LEVEL SECURITY;

    ALTER TABLE IF EXISTS public.UserInventories ENABLE ROW LEVEL SECURITY;

COMMIT;

-- Indexes for UserHouseholds
CREATE INDEX idx_userhouseholds_user ON UserHouseholds (user_id);

CREATE INDEX idx_userhouseholds_household ON UserHouseholds (household_id);

-- Indexes for TaskAssignments
CREATE INDEX idx_taskassignments_user ON TaskAssignments (user_id);

CREATE INDEX idx_taskassignments_task ON TaskAssignments (task_id);

-- Indexes for ProductInventories
CREATE INDEX idx_productinventories_household ON ProductInventories (household_id);

-- Function to update the updated_dt field
CREATE
OR REPLACE FUNCTION update_updated_dt () RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_dt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Tasks table
CREATE TRIGGER update_tasks_updated_dt BEFORE
UPDATE ON Tasks FOR EACH ROW
EXECUTE FUNCTION update_updated_dt ();

-- Trigger for ProductItems table
CREATE TRIGGER update_productitems_updated_dt BEFORE
UPDATE ON ProductItems FOR EACH ROW
EXECUTE FUNCTION update_updated_dt ();

-- Trigger for TaskAssignments table
CREATE TRIGGER update_taskassignments_updated_dt BEFORE
UPDATE ON TaskAssignments FOR EACH ROW
EXECUTE FUNCTION update_updated_dt ();