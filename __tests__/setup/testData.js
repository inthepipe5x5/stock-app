import createExpiration from "../../helpers/createExpiration"
export default class TestData {
  static taskCompletionStatus = [
    'done',
    'assigned',
    'in progress',
    'blocked',
    'archived'
  ];

  static roleAccessStatus = [
    'guest', 'member', 'manager', 'admin'
  ];

  static Users = [];
  static Households = [];
  static UserHouseholds = [];
  static ProductInventories = [];
  static ProductItems = [];
  static ProductVendors = [];
  static RelatedVendors = [];
  static Tasks = [];
  static TaskAssignments = [];
  static UserInventories = [];

  constructor(dataPerTable = 2, seedValues = {}) {
    this.idx = dataPerTable;
    this.seedValues = seedValues;
    this.generateTestData();
  }

  static generateUsers(dataPerTable, seedValues) {
    for (let i = 1; i <= dataPerTable; i++) {
      TestData.Users.push({
        name: seedValues.Users?.name ?? `User${i}`,
        email: seedValues.Users?.email ?? `user${i}@example.com`,
        oauth_provider: seedValues.Users?.oauth_provider ?? `provider${i}`,
        oauth_provider_id: seedValues.Users?.oauth_provider_id ?? `provider-id-${i}`,
        refresh_token_expires_at: createExpiration(),
      });
    }
  }

  static generateHouseholds(dataPerTable, seedValues) {
    for (let i = 1; i <= dataPerTable; i++) {
      TestData.Households.push({
        name: seedValues.Households?.name ?? `Household${i}`,
        description: seedValues.Households?.description ?? `Description${i}`,
      });
    }
  }

  static generateUserHouseholds(dataPerTable, seedValues) {
    for (let i = 1; i <= dataPerTable; i++) {
      TestData.UserHouseholds.push({
        user_id: i,
        household_id: i,
        access_level: seedValues.UserHouseholds?.access_level ?? 'member',
      });
    }
  }

  static generateProductInventories(dataPerTable, seedValues) {
    for (let i = 1; i <= dataPerTable; i++) {
      TestData.ProductInventories.push({
        name: seedValues.ProductInventories?.name ?? `Inventory${i}`,
        description: seedValues.ProductInventories?.description ?? `Inventory Description${i}`,
        household_id: i,
        category: seedValues.ProductInventories?.category ?? `category${i}`,
        draft_status: seedValues.ProductInventories?.draft_status ?? (i % 2 === 0 ? 'confirmed' : 'draft'),
      });
    }
  }

  static generateProductItems(dataPerTable, seedValues) {
    for (let i = 1; i <= dataPerTable; i++) {
      TestData.ProductItems.push({
        name: seedValues.ProductItems?.name ?? `Item${i}`,
        description: seedValues.ProductItems?.description ?? `Item Description${i}`,
        inventory_id: i,
        vendor_id: seedValues.ProductItems?.vendor_id ?? null,
        auto_replenish: seedValues.ProductItems?.auto_replenish ?? (i % 2 === 0),
        min_quantity: seedValues.ProductItems?.min_quantity ?? i * 2,
        max_quantity: seedValues.ProductItems?.max_quantity ?? i * 3,
        current_quantity: seedValues.ProductItems?.current_quantity ?? i * 2 + 1,
        unit: seedValues.ProductItems?.unit ?? `unit${i}`,
        barcode: seedValues.ProductItems?.barcode ?? null,
        qr_code: seedValues.ProductItems?.qr_code ?? null,
        last_scanned: seedValues.ProductItems?.last_scanned ?? null,
        scan_history: seedValues.ProductItems?.scan_history ?? null,
        expiration_date: seedValues.ProductItems?.expiration_date ?? null,
        draft_status: seedValues.ProductItems?.draft_status ?? (i % 2 === 0 ? 'confirmed' : 'draft'),
      });
    }
  }

  static generateProductVendors(dataPerTable, seedValues) {
    for (let i = 1; i <= dataPerTable; i++) {
      TestData.ProductVendors.push({
        name: seedValues.ProductVendors?.name ?? `Vendor${i}`,
        description: seedValues.ProductVendors?.description ?? `Vendor Description${i}`,
        product_types: seedValues.ProductVendors?.product_types ?? [`${seedValues.ProductVendors?.productType ?? 'type'}${i}`],
        vendor_type: seedValues.ProductVendors?.vendor_type ?? [`${seedValues.ProductVendors?.vendorType ?? 'type'}${i}`],
        draft_status: seedValues.ProductVendors?.draft_status ?? (i % 2 === 0 ? 'confirmed' : 'draft'),
      });
    }
  }

  static generateRelatedVendors(dataPerTable, seedValues) {
    for (let i = 1; i < dataPerTable; i++) {
      TestData.RelatedVendors.push({
        vendor_id: i,
        related_vendor_id: i + 1,
      });
    }
  }

  static generateTasks(dataPerTable, seedValues) {
    for (let i = 1; i <= dataPerTable; i++) {
      TestData.Tasks.push({
        name: seedValues.Tasks?.name ?? `Task${i}`,
        description: seedValues.Tasks?.description ?? `Task Description${i}`,
        user_id: i,
        product_id: i,
        due_date: seedValues.Tasks?.due_date ?? `2024-12-${i < 10 ? `0${i}` : i}`,
        completion_status: seedValues.Tasks?.completion_status ?? (i % 3 === 0 ? 'done' : i % 3 === 1 ? 'assigned' : 'in progress'),
        is_recurring: seedValues.Tasks?.is_recurring ?? (i % 2 === 0),
        recurrence_interval: seedValues.Tasks?.recurrence_interval ?? (i % 2 === 0 ? '1 week' : null),
        recurrence_end_date: seedValues.Tasks?.recurrence_end_date ?? (i % 2 === 0 ? '2025-01-01' : null),
        is_automated: seedValues.Tasks?.is_automated ?? (i % 2 === 0),
        automation_trigger: seedValues.Tasks?.automation_trigger ?? (i % 2 === 0 ? 'trigger' : null),
        created_by: i,
        draft_status: seedValues.Tasks?.draft_status ?? (i % 2 === 0 ? 'confirmed' : 'draft'),
      });
    }
  }

  static generateTaskAssignments(dataPerTable, seedValues) {
    for (let i = 1; i <= dataPerTable; i++) {
      TestData.TaskAssignments.push({
        task_id: i,
        user_id: i,
        product_id: i,
        created_by: i,
      });
    }
  }

  static generateUserInventories(dataPerTable, seedValues) {
    for (let i = 1; i <= dataPerTable; i++) {
      TestData.UserInventories.push({
        user_id: i,
        inventory_id: i,
        access_level: seedValues.UserInventories?.access_level ?? 'member',
      });
    }
  }

  generateTestData(dataPerTable = this.idx, seedValues = this.seedValues) {
    TestData.Users = [];
    TestData.Households = [];
    TestData.UserHouseholds = [];
    TestData.ProductInventories = [];
    TestData.ProductItems = [];
    TestData.ProductVendors = [];
    TestData.RelatedVendors = [];
    TestData.Tasks = [];
    TestData.TaskAssignments = [];
    TestData.UserInventories = [];

    TestData.generateUsers(dataPerTable, seedValues);
    TestData.generateHouseholds(dataPerTable, seedValues);
    TestData.generateUserHouseholds(dataPerTable, seedValues);
    TestData.generateProductInventories(dataPerTable, seedValues);
    TestData.generateProductItems(dataPerTable, seedValues);
    TestData.generateProductVendors(dataPerTable, seedValues);
    TestData.generateRelatedVendors(dataPerTable, seedValues);
    TestData.generateTasks(dataPerTable, seedValues);
    TestData.generateTaskAssignments(dataPerTable, seedValues);
    TestData.generateUserInventories(dataPerTable, seedValues);

    const testData = {
      Users: TestData.Users,
      Households: TestData.Households,
      UserHouseholds: TestData.UserHouseholds,
      ProductInventories: TestData.ProductInventories,
      ProductItems: TestData.ProductItems,
      ProductVendors: TestData.ProductVendors,
      RelatedVendors: TestData.RelatedVendors,
      Tasks: TestData.Tasks,
      TaskAssignments: TestData.TaskAssignments,
      UserInventories: TestData.UserInventories,
    };

    return testData;
  }

  data(filters = []) {
    const testData = {
      Users: TestData.Users || [],
      Households: TestData.Households || [],
      UserHouseholds: TestData.UserHouseholds || [],
      ProductInventories: TestData.ProductInventories || [],
      ProductItems: TestData.ProductItems || [],
      ProductVendors: TestData.ProductVendors || [],
      RelatedVendors: TestData.RelatedVendors || [],
      Tasks: TestData.Tasks || [],
      TaskAssignments: TestData.TaskAssignments || [],
      UserInventories: TestData.UserInventories || [],
    };

    if (filters && filters.length > 0) {
      filters.forEach(filter => {
        if (testData[filter]) delete testData[filter];
      });
    }

    return testData;
  }
}
