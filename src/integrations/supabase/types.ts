export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      demo_files: {
        Row: {
          created_at: string | null
          demo_user_id: string | null
          file_name: string
          file_size: number
          file_type: string
          id: string
          public_url: string
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          demo_user_id?: string | null
          file_name: string
          file_size: number
          file_type: string
          id?: string
          public_url: string
          storage_path: string
        }
        Update: {
          created_at?: string | null
          demo_user_id?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          public_url?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "demo_files_demo_user_id_fkey"
            columns: ["demo_user_id"]
            isOneToOne: false
            referencedRelation: "demo_users"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_users: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          session_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          session_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          session_id?: string
        }
        Relationships: []
      }
      editor_widgets: {
        Row: {
          configuration: Json
          created_at: string
          embed_code: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
          usage_count: number
          workspace_id: string
        }
        Insert: {
          configuration?: Json
          created_at?: string
          embed_code?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          usage_count?: number
          workspace_id: string
        }
        Update: {
          configuration?: Json
          created_at?: string
          embed_code?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          usage_count?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "editor_widgets_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          created_at: string
          file_size: number
          file_type: string
          folder_id: string | null
          id: string
          mime_type: string
          name: string
          original_name: string
          public_url: string
          storage_path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          file_size: number
          file_type: string
          folder_id?: string | null
          id?: string
          mime_type: string
          name: string
          original_name: string
          public_url: string
          storage_path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          file_size?: number
          file_type?: string
          folder_id?: string | null
          id?: string
          mime_type?: string
          name?: string
          original_name?: string
          public_url?: string
          storage_path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      folders: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_folder_id: string | null
          path: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_folder_id?: string | null
          path: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_folder_id?: string | null
          path?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "folders_parent_folder_id_fkey"
            columns: ["parent_folder_id"]
            isOneToOne: false
            referencedRelation: "folders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_credits: {
        Row: {
          created_at: string
          id: string
          total_credits: number
          updated_at: string
          used_credits: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          total_credits?: number
          updated_at?: string
          used_credits?: number
          user_id?: string
        }
        Relationships: []
      }
      widget_usage: {
        Row: {
          created_at: string
          domain: string
          id: string
          ip_address: unknown | null
          page_url: string | null
          user_agent: string | null
          user_id: string
          widget_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          user_agent?: string | null
          user_id: string
          widget_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          ip_address?: unknown | null
          page_url?: string | null
          user_agent?: string | null
          user_id?: string
          widget_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "widget_usage_widget_id_fkey"
            columns: ["widget_id"]
            isOneToOne: false
            referencedRelation: "editor_widgets"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          description: string | null
          domain: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          domain: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          domain?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_demo_file: {
        Args: {
          p_file_name: string
          p_file_size: number
          p_file_type: string
          p_public_url: string
          p_session_id: string
          p_storage_path: string
        }
        Returns: string
      }
      cleanup_expired_demo_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_demo_user: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_demo_files: {
        Args: { p_session_id: string }
        Returns: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          public_url: string
        }[]
      }
      increment_widget_usage: {
        Args: {
          _domain: string
          _ip_address?: unknown
          _page_url?: string
          _user_agent?: string
          _widget_id: string
        }
        Returns: boolean
      }
      schedule_demo_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      setup_demo_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      validate_domain: {
        Args: { domain_input: string }
        Returns: boolean
      }
    }
    Enums: {
      editor_status: "active" | "inactive" | "deleted"
      transaction_type: "purchase" | "usage" | "refund"
      workspace_status: "active" | "suspended" | "deleted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      editor_status: ["active", "inactive", "deleted"],
      transaction_type: ["purchase", "usage", "refund"],
      workspace_status: ["active", "suspended", "deleted"],
    },
  },
} as const
