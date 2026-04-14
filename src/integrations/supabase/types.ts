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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      custom_tab_columns: {
        Row: {
          id: string
          name: string
          sort_order: number
          tab_id: string
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          tab_id: string
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          tab_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_tab_columns_tab_id_fkey"
            columns: ["tab_id"]
            isOneToOne: false
            referencedRelation: "custom_tabs"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_tab_rows: {
        Row: {
          created_at: string
          id: string
          row_data: Json
          sort_order: number
          tab_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          row_data?: Json
          sort_order?: number
          tab_id: string
        }
        Update: {
          created_at?: string
          id?: string
          row_data?: Json
          sort_order?: number
          tab_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "custom_tab_rows_tab_id_fkey"
            columns: ["tab_id"]
            isOneToOne: false
            referencedRelation: "custom_tabs"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_tabs: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          sort_order: number
          visible_in_view: boolean
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          name: string
          sort_order?: number
          visible_in_view?: boolean
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          sort_order?: number
          visible_in_view?: boolean
        }
        Relationships: []
      }
      events: {
        Row: {
          actual_soldiers: number | null
          created_at: string
          date: string
          description: string | null
          end_date: string | null
          end_time: string | null
          event_kind: string | null
          id: string
          linked_event_id: string | null
          location: string | null
          notes: string | null
          placement_targets: string | null
          planned_soldiers: number | null
          time: string | null
          title: string
          type: string
        }
        Insert: {
          actual_soldiers?: number | null
          created_at?: string
          date: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_kind?: string | null
          id?: string
          linked_event_id?: string | null
          location?: string | null
          notes?: string | null
          placement_targets?: string | null
          planned_soldiers?: number | null
          time?: string | null
          title: string
          type: string
        }
        Update: {
          actual_soldiers?: number | null
          created_at?: string
          date?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          event_kind?: string | null
          id?: string
          linked_event_id?: string | null
          location?: string | null
          notes?: string | null
          placement_targets?: string | null
          planned_soldiers?: number | null
          time?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_linked_event_id_fkey"
            columns: ["linked_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      soldiers: {
        Row: {
          created_at: string
          id: string
          name: string
          phone: string | null
          status: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          phone?: string | null
          status: string
          unit: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          phone?: string | null
          status?: string
          unit?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          completed: boolean
          created_at: string
          due_date: string
          id: string
          priority: string
          title: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          due_date: string
          id?: string
          priority: string
          title: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          due_date?: string
          id?: string
          priority?: string
          title?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
