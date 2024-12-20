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

-- Users table
-- This table stores app users
CREATE TABLE Users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    oauth_provider VARCHAR(255), -- e.g., 'google', 'github'
    oauth_provider_id VARCHAR(255) UNIQUE, -- e.g., provider-specific user ID
    refresh_token TEXT UNIQUE,
    refresh_token_expires_at TIMESTAMP WITH TIME ZONE
);

-- Households table
CREATE TABLE Households (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

-- UserHouseholds junction table
CREATE TABLE UserHouseholds (
    user_id UUID REFERENCES Users (id) ON DELETE CASCADE,
    household_id UUID REFERENCES Households (id) ON DELETE CASCADE,
    role role_access DEFAULT 'guest',
    PRIMARY KEY (user_id, household_id)
);

-- ProductInventories table
CREATE TABLE ProductInventories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    household_id UUID REFERENCES Households (id) ON DELETE SET NULL,
    category VARCHAR(200),
    draft_status draft_status DEFAULT 'confirmed'
);

-- ProductVendors table
CREATE TABLE ProductVendors (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_types TEXT[],
    vendor_type TEXT[],
    draft_status draft_status DEFAULT 'draft'
);

-- ProductItems table
CREATE TABLE ProductItems (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    inventory_id UUID REFERENCES ProductInventories (id) ON DELETE CASCADE,
    vendor_id UUID REFERENCES ProductVendors (id) ON DELETE SET NULL,
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
CREATE TABLE RelatedVendors (
    vendor_id UUID REFERENCES ProductVendors (id) ON DELETE CASCADE,
    related_vendor_id UUID REFERENCES ProductVendors (id) ON DELETE CASCADE,
    PRIMARY KEY (vendor_id, related_vendor_id)
);

-- Tasks table
CREATE TABLE Tasks (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    user_id UUID REFERENCES Users (id) ON DELETE SET NULL,
    product_id UUID REFERENCES ProductItems (id) ON DELETE SET NULL,
    due_date DATE NOT NULL,
    completion_status completion_status DEFAULT 'assigned',
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_interval INTERVAL,
    recurrence_end_date DATE,
    is_automated BOOLEAN DEFAULT FALSE,
    automation_trigger VARCHAR(255),
    created_by UUID NOT NULL REFERENCES Users (id),
    created_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_by UUID REFERENCES Users (id),
    draft_status draft_status DEFAULT 'draft'
);

-- UserInventories: Many-to-Many relationship between Users and Inventories
CREATE TABLE UserInventories (
    user_id UUID REFERENCES Users (id) ON DELETE CASCADE,
    inventory_id UUID REFERENCES ProductInventories (id) ON DELETE CASCADE,
    access_level role_access DEFAULT 'guest',
    PRIMARY KEY (user_id, inventory_id)
);

-- TaskAssignments: Many-to-Many relationship for Task assignments
CREATE TABLE TaskAssignments (
    task_id UUID REFERENCES Tasks (id) ON DELETE CASCADE,
    user_id UUID REFERENCES Users (id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES Users (id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (task_id, user_id)
);

-- Indexes for UserHouseholds
CREATE INDEX idx_userhouseholds_user ON UserHouseholds (user_id);
CREATE INDEX idx_userhouseholds_household ON UserHouseholds (household_id);

-- Indexes for TaskAssignments
CREATE INDEX idx_taskassignments_user ON TaskAssignments (user_id);
CREATE INDEX idx_taskassignments_task ON TaskAssignments (task_id);

-- Indexes for ProductInventories
CREATE INDEX idx_productinventories_household ON ProductInventories (household_id);

-- Function to update the updated_dt field
CREATE OR REPLACE FUNCTION update_updated_dt()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_dt = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Tasks table
CREATE TRIGGER update_tasks_updated_dt
BEFORE UPDATE ON Tasks
FOR EACH ROW
EXECUTE FUNCTION update_updated_dt();

-- Trigger for ProductItems table
CREATE TRIGGER update_productitems_updated_dt
BEFORE UPDATE ON ProductItems
FOR EACH ROW
EXECUTE FUNCTION update_updated_dt();

-- Trigger for TaskAssignments table
CREATE TRIGGER update_taskassignments_updated_dt
BEFORE UPDATE ON TaskAssignments
FOR EACH ROW
EXECUTE FUNCTION update_updated_dt();
