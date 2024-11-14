-- Users table
-- This table stores app users
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_by INTEGER NOT NULL,
    created_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Households table
-- This table stores a collection of users and inventories
CREATE TABLE Households (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    members INTEGER[], -- Array of user IDs
    inventories INTEGER[], -- Array of inventory IDs
    created_by INTEGER NOT NULL,
    created_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ProductInventories table
-- This table stores collections of products grouped by intended use location, item type, or custom user sorting
CREATE TABLE ProductInventories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    household_id INTEGER REFERENCES Households(id) ON DELETE SET NULL,
    category VARCHAR(255) -- e.g., groceries, toiletries, or custom tag
);

-- ProductItems table
-- This table stores individual product entries input by a user
CREATE TABLE ProductItems (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    inventory_id INTEGER REFERENCES ProductInventories(id) ON DELETE CASCADE,
    vendor_id INTEGER REFERENCES ProductVendors(id) ON DELETE SET NULL,

    -- Quantity data columns
    auto_replenish BOOLEAN DEFAULT FALSE,
    min_quantity INTEGER,
    max_quantity INTEGER,
    current_quantity INTEGER NOT NULL,
    unit VARCHAR(50),

    -- Inventory automation columns
    barcode VARCHAR(255),
    qr_code VARCHAR(255),
    last_scanned TIMESTAMP WITH TIME ZONE,
    scan_history JSONB, 

    -- Meta data columns (useful for automatic reminders)
    expiration_date DATE, 
    updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ProductVendors table
-- This table stores vendors or retailers where the product can be restocked
CREATE TABLE ProductVendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_types TEXT[], -- Array of product types
    vendor_type TEXT[] -- Array of vendor types
);

-- RelatedVendors table (Many-to-Many relationship)
CREATE TABLE RelatedVendors (
    vendor_id INTEGER REFERENCES ProductVendors(id) ON DELETE CASCADE,
    related_vendor_id INTEGER REFERENCES ProductVendors(id) ON DELETE CASCADE,
    PRIMARY KEY (vendor_id, related_vendor_id)
);

-- Tasks table
-- This table stores tasks associated with a household, inventory, or product
CREATE TABLE Tasks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,

    -- Related entities
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    product_id INTEGER REFERENCES ProductItems(id) ON DELETE SET NULL,

    -- Task details
    due_date DATE,
    status VARCHAR(50), -- e.g., "done", "assigned", "archived"

    -- Recurrence information
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_interval INTERVAL,
    recurrence_end_date DATE,

    -- Automation columns
    is_automated BOOLEAN DEFAULT FALSE,
    automation_trigger VARCHAR(255),

    -- Meta columns
    created_by INTEGER NOT NULL REFERENCES Users(id),
    created_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_by INTEGER REFERENCES Users(id)
);

-- TaskAssignments table
-- This table tracks the assignment of tasks to users and/or products
-- This is a M:M relational table to enable multiple users to be assigned multiple tasks
CREATE TABLE TaskAssignments (
    id SERIAL PRIMARY KEY,

    -- Related entities
    task_id INTEGER REFERENCES Tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES ProductItems(id) ON DELETE SET NULL,

    -- Meta columns
    created_by INTEGER NOT NULL REFERENCES Users(id),
    created_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_dt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_updated_by INTEGER REFERENCES Users(id)
);
