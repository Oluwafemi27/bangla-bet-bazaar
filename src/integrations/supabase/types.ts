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
      aviator_bets: {
        Row: {
          amount: number
          cashout_multiplier: number | null
          created_at: string
          id: string
          payout: number | null
          round_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          cashout_multiplier?: number | null
          created_at?: string
          id?: string
          payout?: number | null
          round_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          cashout_multiplier?: number | null
          created_at?: string
          id?: string
          payout?: number | null
          round_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "aviator_bets_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "aviator_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      aviator_rounds: {
        Row: {
          crash_multiplier: number
          created_at: string
          id: string
        }
        Insert: {
          crash_multiplier: number
          created_at?: string
          id?: string
        }
        Update: {
          crash_multiplier?: number
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      bets: {
        Row: {
          amount: number
          created_at: string
          game_type: string
          id: string
          market: string | null
          match_id: string | null
          odds: number
          potential_payout: number
          selection: string | null
          settled_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          game_type: string
          id?: string
          market?: string | null
          match_id?: string | null
          odds: number
          potential_payout: number
          selection?: string | null
          settled_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          game_type?: string
          id?: string
          market?: string | null
          match_id?: string | null
          odds?: number
          potential_payout?: number
          selection?: string | null
          settled_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          house_edge: number | null
          id: string
          iframe_url: string | null
          is_active: boolean
          name_bn: string
          thumbnail_url: string | null
          type: string
        }
        Insert: {
          created_at?: string
          house_edge?: number | null
          id?: string
          iframe_url?: string | null
          is_active?: boolean
          name_bn: string
          thumbnail_url?: string | null
          type: string
        }
        Update: {
          created_at?: string
          house_edge?: number | null
          id?: string
          iframe_url?: string | null
          is_active?: boolean
          name_bn?: string
          thumbnail_url?: string | null
          type?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          created_at: string
          id: string
          result: string | null
          score_away: number | null
          score_home: number | null
          start_time: string
          status: string
          team_away: string
          team_home: string
          tournament: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          result?: string | null
          score_away?: number | null
          score_home?: number | null
          start_time: string
          status?: string
          team_away: string
          team_home: string
          tournament?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          result?: string | null
          score_away?: number | null
          score_home?: number | null
          start_time?: string
          status?: string
          team_away?: string
          team_home?: string
          tournament?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message_bn: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_bn: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_bn?: string
          user_id?: string | null
        }
        Relationships: []
      }
      odds_markets: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          market_name: string
          match_id: string
          selections: Json
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          market_name: string
          match_id: string
          selections: Json
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          market_name?: string
          match_id?: string
          selections?: Json
        }
        Relationships: [
          {
            foreignKeyName: "odds_markets_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          balance: number
          bonus_balance: number
          created_at: string
          id: string
          kyc_status: string
          mobile: string | null
          name: string
          referral_code: string
          referred_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          balance?: number
          bonus_balance?: number
          created_at?: string
          id: string
          kyc_status?: string
          mobile?: string | null
          name: string
          referral_code?: string
          referred_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          bonus_balance?: number
          created_at?: string
          id?: string
          kyc_status?: string
          mobile?: string | null
          name?: string
          referral_code?: string
          referred_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          created_at: string
          description_bn: string | null
          expiry_date: string | null
          id: string
          is_active: boolean
          max_bonus: number | null
          min_deposit: number | null
          terms_bn: string | null
          title_bn: string
          type: string
          value: number
        }
        Insert: {
          created_at?: string
          description_bn?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          max_bonus?: number | null
          min_deposit?: number | null
          terms_bn?: string | null
          title_bn: string
          type: string
          value: number
        }
        Update: {
          created_at?: string
          description_bn?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean
          max_bonus?: number | null
          min_deposit?: number | null
          terms_bn?: string | null
          title_bn?: string
          type?: string
          value?: number
        }
        Relationships: []
      }
      transactions: {
        Row: {
          account_number: string | null
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          method: string | null
          reference: string | null
          screenshot_url: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          method?: string | null
          reference?: string | null
          screenshot_url?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          method?: string | null
          reference?: string | null
          screenshot_url?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
