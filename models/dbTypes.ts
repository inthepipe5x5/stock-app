export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      households: {
        Row: {
          description: string | null
          draft_status: Database["public"]["Enums"]["draft_status"]
          id: string
          initial_template_name: string
          is_template: boolean | null
          name: string | null
          styling: Json | null
        }
        Insert: {
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"]
          id: string
          initial_template_name: string
          is_template?: boolean | null
          name?: string | null
          styling?: Json | null
        }
        Update: {
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"]
          id?: string
          initial_template_name?: string
          is_template?: boolean | null
          name?: string | null
          styling?: Json | null
        }
        Relationships: []
      }
      inventories: {
        Row: {
          category: string
          description: string | null
          draft_status: Database["public"]["Enums"]["draft_status"]
          household_id: string | null
          id: string
          is_template: boolean
          name: string
          styling: Json
        }
        Insert: {
          category?: string
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"]
          household_id?: string | null
          id: string
          is_template?: boolean
          name: string
          styling?: Json
        }
        Update: {
          category?: string
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"]
          household_id?: string | null
          id?: string
          is_template?: boolean
          name?: string
          styling?: Json
        }
        Relationships: [
          {
            foreignKeyName: "productinventories_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          auto_replenish: boolean | null
          barcode: string | null
          current_quantity: number
          current_quantity_status:
            | Database["public"]["Enums"]["current_quantity_status"]
            | null
          description: string | null
          draft_status: Database["public"]["Enums"]["draft_status"]
          expiration_date: string | null
          icon_name: string | null
          id: string
          inventory_id: string | null
          is_template: boolean | null
          last_scanned: string | null
          max_quantity: number | null
          min_quantity: number | null
          photo_url: string | null
          product_category: string | null
          product_name: string
          qr_code: string | null
          quantity_unit: Database["public"]["Enums"]["unit_measurements"] | null
          scan_history: Json | null
          updated_dt: string | null
          vendor_id: string | null
        }
        Insert: {
          auto_replenish?: boolean | null
          barcode?: string | null
          current_quantity: number
          current_quantity_status?:
            | Database["public"]["Enums"]["current_quantity_status"]
            | null
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"]
          expiration_date?: string | null
          icon_name?: string | null
          id: string
          inventory_id?: string | null
          is_template?: boolean | null
          last_scanned?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          photo_url?: string | null
          product_category?: string | null
          product_name: string
          qr_code?: string | null
          quantity_unit?:
            | Database["public"]["Enums"]["unit_measurements"]
            | null
          scan_history?: Json | null
          updated_dt?: string | null
          vendor_id?: string | null
        }
        Update: {
          auto_replenish?: boolean | null
          barcode?: string | null
          current_quantity?: number
          current_quantity_status?:
            | Database["public"]["Enums"]["current_quantity_status"]
            | null
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"]
          expiration_date?: string | null
          icon_name?: string | null
          id?: string
          inventory_id?: string | null
          is_template?: boolean | null
          last_scanned?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          photo_url?: string | null
          product_category?: string | null
          product_name?: string
          qr_code?: string | null
          quantity_unit?:
            | Database["public"]["Enums"]["unit_measurements"]
            | null
          scan_history?: Json | null
          updated_dt?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "productitems_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "inventories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "productitems_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "user_households_view"
            referencedColumns: ["inventory_id"]
          },
          {
            foreignKeyName: "productitems_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          app_metadata: Json | null
          avatar_photo: string | null
          city: string | null
          country: string | null
          created_at: string | null
          draft_status: Database["public"]["Enums"]["draft_status"]
          email: string
          first_name: string | null
          last_name: string | null
          name: string | null
          phone_number: string | null
          postalcode: string | null
          preferences: Json | null
          state: string | null
          user_id: string
        }
        Insert: {
          app_metadata?: Json | null
          avatar_photo?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"]
          email: string
          first_name?: string | null
          last_name?: string | null
          name?: string | null
          phone_number?: string | null
          postalcode?: string | null
          preferences?: Json | null
          state?: string | null
          user_id: string
        }
        Update: {
          app_metadata?: Json | null
          avatar_photo?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"]
          email?: string
          first_name?: string | null
          last_name?: string | null
          name?: string | null
          phone_number?: string | null
          postalcode?: string | null
          preferences?: Json | null
          state?: string | null
          user_id?: string
        }
        Relationships: []
      }
      related_suppliers: {
        Row: {
          related_vendor_id: string
          relation_description: string | null
          vendor_id: string
        }
        Insert: {
          related_vendor_id: string
          relation_description?: string | null
          vendor_id: string
        }
        Update: {
          related_vendor_id?: string
          relation_description?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatedvendors_related_vendor_id_fkey"
            columns: ["related_vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relatedvendors_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          addresses: string[] | null
          cities: string[] | null
          countries: string[] | null
          description: string | null
          draft_status: Database["public"]["Enums"]["draft_status"] | null
          id: string
          is_retail_chain: boolean | null
          is_template: boolean | null
          name: string
          product_types: string[] | null
          regions: string[] | null
          user_ranking: number | null
          vendor_scale: Database["public"]["Enums"]["vendor_scale"] | null
          vendor_type: string[] | null
        }
        Insert: {
          addresses?: string[] | null
          cities?: string[] | null
          countries?: string[] | null
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"] | null
          id: string
          is_retail_chain?: boolean | null
          is_template?: boolean | null
          name?: string
          product_types?: string[] | null
          regions?: string[] | null
          user_ranking?: number | null
          vendor_scale?: Database["public"]["Enums"]["vendor_scale"] | null
          vendor_type?: string[] | null
        }
        Update: {
          addresses?: string[] | null
          cities?: string[] | null
          countries?: string[] | null
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"] | null
          id?: string
          is_retail_chain?: boolean | null
          is_template?: boolean | null
          name?: string
          product_types?: string[] | null
          regions?: string[] | null
          user_ranking?: number | null
          vendor_scale?: Database["public"]["Enums"]["vendor_scale"] | null
          vendor_type?: string[] | null
        }
        Relationships: []
      }
      task_assignments: {
        Row: {
          assigned_by: string | null
          created_at: string
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          created_at?: string
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          created_at?: string
          task_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "taskassignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "taskassignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "taskassignments_user_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      tasks: {
        Row: {
          automation_trigger: Database["public"]["Enums"]["current_quantity_status"]
          completion_status:
            | Database["public"]["Enums"]["completion_status"]
            | null
          created_by: string
          created_dt: string | null
          description: string | null
          draft_status: Database["public"]["Enums"]["draft_status"] | null
          due_date: string
          id: string
          is_automated: boolean | null
          is_template: boolean | null
          last_updated_by: string | null
          product_id: string | null
          recurrence_end_date: string | null
          recurrence_interval: unknown | null
          task_name: string
          updated_dt: string | null
        }
        Insert: {
          automation_trigger?: Database["public"]["Enums"]["current_quantity_status"]
          completion_status?:
            | Database["public"]["Enums"]["completion_status"]
            | null
          created_by?: string
          created_dt?: string | null
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"] | null
          due_date: string
          id: string
          is_automated?: boolean | null
          is_template?: boolean | null
          last_updated_by?: string | null
          product_id?: string | null
          recurrence_end_date?: string | null
          recurrence_interval?: unknown | null
          task_name: string
          updated_dt?: string | null
        }
        Update: {
          automation_trigger?: Database["public"]["Enums"]["current_quantity_status"]
          completion_status?:
            | Database["public"]["Enums"]["completion_status"]
            | null
          created_by?: string
          created_dt?: string | null
          description?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status"] | null
          due_date?: string
          id?: string
          is_automated?: boolean | null
          is_template?: boolean | null
          last_updated_by?: string | null
          product_id?: string | null
          recurrence_end_date?: string | null
          recurrence_interval?: unknown | null
          task_name?: string
          updated_dt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_last_updated_by_fkey"
            columns: ["last_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "tasks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_households: {
        Row: {
          access_level: Database["public"]["Enums"]["role_access"] | null
          household_id: string
          invite_accepted: boolean | null
          invite_expires_at: string | null
          invited_at: string
          invited_by: string | null
          user_id: string
        }
        Insert: {
          access_level?: Database["public"]["Enums"]["role_access"] | null
          household_id: string
          invite_accepted?: boolean | null
          invite_expires_at?: string | null
          invited_at?: string
          invited_by?: string | null
          user_id: string
        }
        Update: {
          access_level?: Database["public"]["Enums"]["role_access"] | null
          household_id?: string
          invite_accepted?: boolean | null
          invite_expires_at?: string | null
          invited_at?: string
          invited_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_household_id"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invited_by"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_households_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_households_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      user_households_view: {
        Row: {
          access_level: Database["public"]["Enums"]["role_access"] | null
          city: string | null
          country: string | null
          description: string | null
          email: string | null
          household_id: string | null
          inventory_category: string | null
          inventory_id: string | null
          inventory_name: string | null
          invite_accepted: boolean | null
          invite_expires_at: string | null
          invited_at: string | null
          invited_by: string | null
          name: string | null
          state: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_household_id"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_invited_by"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "user_households_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_households_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Functions: {
      check_user_access: {
        Args: { requested_resource: Json }
        Returns: boolean
      }
      get_public_schema_info: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          column_name: string
          data_type: string
          is_primary_key: boolean
        }[]
      }
      insert_templated_household_and_inventories: {
        Args: { new_user_id: string }
        Returns: {
          household_id: string
          inventory_id: string
        }[]
      }
      json_matches_schema: {
        Args: { schema: Json; instance: Json }
        Returns: boolean
      }
      jsonb_matches_schema: {
        Args: { schema: Json; instance: Json }
        Returns: boolean
      }
      jsonschema_is_valid: {
        Args: { schema: Json }
        Returns: boolean
      }
      jsonschema_validation_errors: {
        Args: { schema: Json; instance: Json }
        Returns: string[]
      }
      new_user_household_setup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_overdue_tasks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_updated_dt: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      completion_status:
        | "done"
        | "assigned"
        | "in progress"
        | "blocked"
        | "archived"
        | "overdue"
      current_quantity_status: "full" | "half" | "quarter" | "empty" | "unknown"
      draft_status: "draft" | "archived" | "deleted" | "confirmed" | "published"
      role_access: "guest" | "member" | "manager" | "admin"
      unit_measurements:
        | "kg"
        | "g"
        | "lb"
        | "oz"
        | "l"
        | "ml"
        | "gal"
        | "qt"
        | "pt"
        | "cup"
        | "tbsp"
        | "tsp"
        | "pcs"
        | "pack"
        | "box"
        | "bottle"
        | "jar"
        | "can"
        | "bag"
        | "roll"
        | "sheet"
        | "slice"
        | "unit"
        | "percent"
      vendor_scale: "local" | "regional" | "domestic" | "international"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      completion_status: [
        "done",
        "assigned",
        "in progress",
        "blocked",
        "archived",
        "overdue",
      ],
      current_quantity_status: ["full", "half", "quarter", "empty", "unknown"],
      draft_status: ["draft", "archived", "deleted", "confirmed", "published"],
      role_access: ["guest", "member", "manager", "admin"],
      unit_measurements: [
        "kg",
        "g",
        "lb",
        "oz",
        "l",
        "ml",
        "gal",
        "qt",
        "pt",
        "cup",
        "tbsp",
        "tsp",
        "pcs",
        "pack",
        "box",
        "bottle",
        "jar",
        "can",
        "bag",
        "roll",
        "sheet",
        "slice",
        "unit",
        "percent",
      ],
      vendor_scale: ["local", "regional", "domestic", "international"],
    },
  },
} as const
