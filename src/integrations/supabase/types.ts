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
      market_analyses: {
        Row: {
          created_at: string
          id: string
          model: string | null
          niche: string
          prompt: string | null
          result: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model?: string | null
          niche: string
          prompt?: string | null
          result?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string | null
          niche?: string
          prompt?: string | null
          result?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_connections: {
        Row: {
          cached_data: Json | null
          config: Json
          created_at: string
          id: string
          is_connected: boolean
          last_sync_at: string | null
          last_sync_log: string | null
          name: string
          next_sync_at: string | null
          sync_interval_minutes: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cached_data?: Json | null
          config?: Json
          created_at?: string
          id: string
          is_connected?: boolean
          last_sync_at?: string | null
          last_sync_log?: string | null
          name: string
          next_sync_at?: string | null
          sync_interval_minutes?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cached_data?: Json | null
          config?: Json
          created_at?: string
          id?: string
          is_connected?: boolean
          last_sync_at?: string | null
          last_sync_log?: string | null
          name?: string
          next_sync_at?: string | null
          sync_interval_minutes?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      platform_items: {
        Row: {
          avg_watch_time: number | null
          clicks: number | null
          created_at: string | null
          ctr: number | null
          earnings: number | null
          engagement_rate: number | null
          external_id: string
          id: string
          impressions: number | null
          link: string | null
          metadata: Json | null
          platform_id: string
          rpm: number | null
          title: string
          updated_at: string | null
          user_id: string | null
          views: number | null
        }
        Insert: {
          avg_watch_time?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          earnings?: number | null
          engagement_rate?: number | null
          external_id: string
          id?: string
          impressions?: number | null
          link?: string | null
          metadata?: Json | null
          platform_id: string
          rpm?: number | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Update: {
          avg_watch_time?: number | null
          clicks?: number | null
          created_at?: string | null
          ctr?: number | null
          earnings?: number | null
          engagement_rate?: number | null
          external_id?: string
          id?: string
          impressions?: number | null
          link?: string | null
          metadata?: Json | null
          platform_id?: string
          rpm?: number | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          views?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          external_id: string | null
          id: string
          name: string
          platform: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          name: string
          platform: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_id?: string | null
          id?: string
          name?: string
          platform?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_reports: {
        Row: {
          created_at: string
          filters: Json
          id: string
          period_end: string | null
          period_start: string | null
          report_type: string
          snapshot: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          period_end?: string | null
          period_start?: string | null
          report_type: string
          snapshot?: Json
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          period_end?: string | null
          period_start?: string | null
          report_type?: string
          snapshot?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategy_funnel_stages: {
        Row: {
          channels: string[]
          content: string | null
          copy: string | null
          created_at: string
          due_date: string | null
          funnel_id: string
          id: string
          kpi: string | null
          notes: string | null
          objective: string | null
          offer: string | null
          owner: string | null
          position: number
          stage_type: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          channels?: string[]
          content?: string | null
          copy?: string | null
          created_at?: string
          due_date?: string | null
          funnel_id: string
          id?: string
          kpi?: string | null
          notes?: string | null
          objective?: string | null
          offer?: string | null
          owner?: string | null
          position?: number
          stage_type?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          channels?: string[]
          content?: string | null
          copy?: string | null
          created_at?: string
          due_date?: string | null
          funnel_id?: string
          id?: string
          kpi?: string | null
          notes?: string | null
          objective?: string | null
          offer?: string | null
          owner?: string | null
          position?: number
          stage_type?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_funnel_stages_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "strategy_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_funnels: {
        Row: {
          created_at: string
          description: string | null
          id: string
          market_analysis_id: string | null
          name: string
          source_snapshot: Json
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          market_analysis_id?: string | null
          name: string
          source_snapshot?: Json
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          market_analysis_id?: string | null
          name?: string
          source_snapshot?: Json
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_funnels_market_analysis_id_fkey"
            columns: ["market_analysis_id"]
            isOneToOne: false
            referencedRelation: "market_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_progress_history: {
        Row: {
          blocked_tasks: number
          completed_tasks: number
          funnel_id: string
          id: string
          overdue_tasks: number
          progress: number
          recorded_at: string
          total_tasks: number
          user_id: string
        }
        Insert: {
          blocked_tasks?: number
          completed_tasks?: number
          funnel_id: string
          id?: string
          overdue_tasks?: number
          progress?: number
          recorded_at?: string
          total_tasks?: number
          user_id: string
        }
        Update: {
          blocked_tasks?: number
          completed_tasks?: number
          funnel_id?: string
          id?: string
          overdue_tasks?: number
          progress?: number
          recorded_at?: string
          total_tasks?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_progress_history_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "strategy_funnels"
            referencedColumns: ["id"]
          },
        ]
      }
      strategy_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          funnel_id: string
          id: string
          metadata: Json
          owner: string | null
          position: number
          priority: string
          stage_id: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          funnel_id: string
          id?: string
          metadata?: Json
          owner?: string | null
          position?: number
          priority?: string
          stage_id?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          funnel_id?: string
          id?: string
          metadata?: Json
          owner?: string | null
          position?: number
          priority?: string
          stage_id?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategy_tasks_funnel_id_fkey"
            columns: ["funnel_id"]
            isOneToOne: false
            referencedRelation: "strategy_funnels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "strategy_tasks_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "strategy_funnel_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_history: {
        Row: {
          created_at: string
          detail: string | null
          id: string
          platform_id: string
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          detail?: string | null
          id?: string
          platform_id: string
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          detail?: string | null
          id?: string
          platform_id?: string
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          default_sync_interval_minutes: number | null
          preferences: Json
          saved_filters: Json
          theme: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          default_sync_interval_minutes?: number | null
          preferences?: Json
          saved_filters?: Json
          theme?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          default_sync_interval_minutes?: number | null
          preferences?: Json
          saved_filters?: Json
          theme?: string | null
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
      capture_strategy_progress_snapshot: {
        Args: { p_funnel_id: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
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
