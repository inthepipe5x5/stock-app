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
    'admin' -- on top of member privileges, can create and manage inventories
);

-- Users table
-- This table stores app users
CREATE TABLE
    Users (
        id SERIAL PRIMARY KEY,
        NAME VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        -- OAuth details
        oauth_provider VARCHAR(255), -- e.g., 'google', 'github'
        oauth_provider_id VARCHAR(255) UNIQUE, -- e.g., provider-specific user ID
        -- Refresh token
        refresh_token TEXT UNIQUE,
        refresh_token_expires_at TIMESTAMP WITH TIME ZONE
    );

-- Households table
CREATE TABLE
    Households (
        id SERIAL PRIMARY KEY,
        NAME VARCHAR(255) NOT NULL,
        description TEXT
    );

-- UserHouseholds junction table
-- This table establishes the M:M relationship between Users and Households
CREATE TABLE
    UserHouseholds (
        user_id INTEGER REFERENCES Users (id) ON DELETE CASCADE,
        household_id INTEGER REFERENCES Households (id) ON DELETE CASCADE,
        access_level role_access DEFAULT 'guest',
        PRIMARY KEY (user_id, household_id)
    );

-- ProductInventories table
CREATE TABLE
    ProductInventories (
        id SERIAL PRIMARY KEY,
        NAME VARCHAR(100) NOT NULL,
        description TEXT,
        household_id INTEGER REFERENCES Households (id) ON DELETE SET NULL,
        category VARCHAR(200), -- e.g., groceries, toiletries, or custom tag
        draft_status draft_status DEFAULT 'confirmed' -- store the "draft_status" here, e.g., archived, deleted, confirmed, etc. Don't show to users
    );

-- UserInventories join table
CREATE TABLE
    UserInventories (
        user_id INTEGER REFERENCES Users (id) ON DELETE CASCADE,
        inventory_id INTEGER REFERENCES ProductInventories (id) ON DELETE CASCADE,
        access_level role_access DEFAULT 'guest',
        PRIMARY KEY (user_id, inventory_id)
    );

-- ProductVendors table
CREATE TABLE
    ProductVendors (
        id SERIAL PRIMARY KEY,
        NAME VARCHAR(255) NOT NULL,
        description TEXT,
        -- Array of product types
        product_types TEXT[],
        -- Array of vendor types
        vendor_type TEXT[],
        draft_status draft_status DEFAULT 'draft'
    );

-- ProductItems table
CREATE TABLE
    ProductItems (
        id SERIAL PRIMARY KEY,
        NAME VARCHAR(255) NOT NULL,
        description TEXT,
        inventory_id INTEGER REFERENCES ProductInventories (id) ON DELETE CASCADE,
        vendor_id INTEGER REFERENCES ProductVendors (id) ON DELETE SET NULL,
        auto_replenish BOOLEAN DEFAULT FALSE,
        min_quantity INTEGER,
        max_quantity INTEGER,
        current_quantity INTEGER NOT NULL,
        unit VARCHAR(50),
        barcode VARCHAR(255),
        qr_code VARCHAR(255),
        last_scanned TIMESTAMP WITH TIME ZONE,
        scan_history JSONB,
        expiration_date DATE,
        updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        draft_status draft_status DEFAULT 'draft'
    );

-- RelatedVendors table
CREATE TABLE
    RelatedVendors (
        vendor_id INTEGER REFERENCES ProductVendors (id) ON DELETE CASCADE,
        related_vendor_id INTEGER REFERENCES ProductVendors (id) ON DELETE CASCADE,
        PRIMARY KEY (vendor_id, related_vendor_id)
    );

-- Tasks table
CREATE TABLE
    Tasks (
        id SERIAL PRIMARY KEY,
        NAME VARCHAR(255) NOT NULL,
        description TEXT,
        user_id INTEGER REFERENCES Users (id) ON DELETE SET NULL,
        product_id INTEGER REFERENCES ProductItems (id) ON DELETE SET NULL,
        due_date DATE NOT NULL,
        completion_status completion_status DEFAULT 'assigned',
        is_recurring BOOLEAN DEFAULT FALSE,
        recurrence_interval INTERVAL,
        recurrence_end_date DATE,
        is_automated BOOLEAN DEFAULT FALSE,
        automation_trigger VARCHAR(255),
        created_by INTEGER NOT NULL REFERENCES Users (id),
        created_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_updated_by INTEGER REFERENCES Users (id),
        draft_status draft_status DEFAULT 'draft'
    );

-- TaskAssignments table
CREATE TABLE
    TaskAssignments (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES Tasks (id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES Users (id) ON DELETE CASCADE,
        product_id INTEGER REFERENCES ProductItems (id) ON DELETE SET NULL,
        created_by INTEGER NOT NULL REFERENCES Users (id),
        created_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_updated_by INTEGER REFERENCES Users (id)
    );

-- Indexes for UserHouseholds
CREATE INDEX idx_userhouseholds_user ON UserHouseholds (user_id);

CREATE INDEX idx_userhouseholds_household ON UserHouseholds (household_id);

-- Indexes for TaskAssignments
CREATE INDEX idx_taskassignments_user ON TaskAssignments (user_id);

CREATE INDEX idx_taskassignments_task ON TaskAssignments (task_id);

-- Indexes for ProductInventories
CREATE INDEX idx_productinventories_household ON ProductInventories (household_id);