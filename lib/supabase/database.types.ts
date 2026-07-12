// Generated from the live Supabase schema (IMPROVEMENT_PLAN.md Phase 1.1).
// Regenerate after migrations:
//   supabase gen types typescript --linked > lib/supabase/database.types.ts
// (or via the Supabase MCP generate_typescript_types tool).
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
      applications: {
        Row: {
          applicant_id: string
          cover_note: string | null
          created_at: string
          gig_id: string
          id: string
          status: string
        }
        Insert: {
          applicant_id: string
          cover_note?: string | null
          created_at?: string
          gig_id: string
          id?: string
          status?: string
        }
        Update: {
          applicant_id?: string
          cover_note?: string | null
          created_at?: string
          gig_id?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_blocked_id_fkey"
            columns: ["blocked_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blocks_blocker_id_fkey"
            columns: ["blocker_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cert_verification_log: {
        Row: {
          certification_id: string
          checked_at: string
          id: string
          method: string
          raw_response: Json | null
          success: boolean
        }
        Insert: {
          certification_id: string
          checked_at?: string
          id?: string
          method: string
          raw_response?: Json | null
          success: boolean
        }
        Update: {
          certification_id?: string
          checked_at?: string
          id?: string
          method?: string
          raw_response?: Json | null
          success?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "cert_verification_log_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          created_at: string
          doc_url: string | null
          extracted_skills: string[]
          id: string
          issued_at: string | null
          issuer: string
          kind: string
          rejection_reason: string | null
          title: string
          user_id: string
          verification_method: string | null
          verification_status: string
          verified: boolean
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          doc_url?: string | null
          extracted_skills?: string[]
          id?: string
          issued_at?: string | null
          issuer: string
          kind: string
          rejection_reason?: string | null
          title: string
          user_id: string
          verification_method?: string | null
          verification_status?: string
          verified?: boolean
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          doc_url?: string | null
          extracted_skills?: string[]
          id?: string
          issued_at?: string | null
          issuer?: string
          kind?: string
          rejection_reason?: string | null
          title?: string
          user_id?: string
          verification_method?: string | null
          verification_status?: string
          verified?: boolean
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      company_registrations: {
        Row: {
          business_activities: string[]
          checklist_state: Json
          created_at: string
          entity_type: string | null
          id: string
          mock_acra_id: string | null
          proposed_name: string | null
          stage: string
          updated_at: string
          user_id: string
        }
        Insert: {
          business_activities?: string[]
          checklist_state?: Json
          created_at?: string
          entity_type?: string | null
          id?: string
          mock_acra_id?: string | null
          proposed_name?: string | null
          stage?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          business_activities?: string[]
          checklist_state?: Json
          created_at?: string
          entity_type?: string | null
          id?: string
          mock_acra_id?: string | null
          proposed_name?: string | null
          stage?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_sessions: {
        Row: {
          id: string
          state: Json
          updated_at: string | null
        }
        Insert: {
          id: string
          state?: Json
          updated_at?: string | null
        }
        Update: {
          id?: string
          state?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      disputes: {
        Row: {
          application_id: string
          created_at: string
          details: string
          id: string
          opened_by: string
          reason: string
          resolution_note: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          application_id: string
          created_at?: string
          details?: string
          id?: string
          opened_by: string
          reason: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          application_id?: string
          created_at?: string
          details?: string
          id?: string
          opened_by?: string
          reason?: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gigs: {
        Row: {
          applications_close_at: string | null
          budget_cents: number | null
          budget_kind: string
          category: string | null
          created_at: string
          days_of_week: number[] | null
          description: string
          duration_label: string | null
          embedding: string | null
          employer_id: string
          end_time: string | null
          ends_at: string | null
          headcount: number
          hours_required: number | null
          id: string
          instant_urgency: string | null
          is_instant: boolean
          lat: number | null
          location: string | null
          lon: number | null
          milestones: Json | null
          recurrence_cadence: string | null
          requires_employer_approval: boolean
          skills_required: string[]
          start_at: string | null
          start_time: string | null
          starts_at: string | null
          status: string
          title: string
        }
        Insert: {
          applications_close_at?: string | null
          budget_cents?: number | null
          budget_kind?: string
          category?: string | null
          created_at?: string
          days_of_week?: number[] | null
          description: string
          duration_label?: string | null
          embedding?: string | null
          employer_id: string
          end_time?: string | null
          ends_at?: string | null
          headcount?: number
          hours_required?: number | null
          id?: string
          instant_urgency?: string | null
          is_instant?: boolean
          lat?: number | null
          location?: string | null
          lon?: number | null
          milestones?: Json | null
          recurrence_cadence?: string | null
          requires_employer_approval?: boolean
          skills_required?: string[]
          start_at?: string | null
          start_time?: string | null
          starts_at?: string | null
          status?: string
          title: string
        }
        Update: {
          applications_close_at?: string | null
          budget_cents?: number | null
          budget_kind?: string
          category?: string | null
          created_at?: string
          days_of_week?: number[] | null
          description?: string
          duration_label?: string | null
          embedding?: string | null
          employer_id?: string
          end_time?: string | null
          ends_at?: string | null
          headcount?: number
          hours_required?: number | null
          id?: string
          instant_urgency?: string | null
          is_instant?: boolean
          lat?: number | null
          location?: string | null
          lon?: number | null
          milestones?: Json | null
          recurrence_cadence?: string | null
          requires_employer_approval?: boolean
          skills_required?: string[]
          start_at?: string | null
          start_time?: string | null
          starts_at?: string | null
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "gigs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_questions: {
        Row: {
          display_order: number
          gig_id: string
          id: string
          max_duration_sec: number
          prompt: string
        }
        Insert: {
          display_order?: number
          gig_id: string
          id?: string
          max_duration_sec?: number
          prompt: string
        }
        Update: {
          display_order?: number
          gig_id?: string
          id?: string
          max_duration_sec?: number
          prompt?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_questions_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
        ]
      }
      interview_responses: {
        Row: {
          application_id: string
          created_at: string
          duration_sec: number | null
          id: string
          question_id: string
          video_url: string
        }
        Insert: {
          application_id: string
          created_at?: string
          duration_sec?: number | null
          id?: string
          question_id: string
          video_url: string
        }
        Update: {
          application_id?: string
          created_at?: string
          duration_sec?: number | null
          id?: string
          question_id?: string
          video_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "interview_responses_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interview_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "interview_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          data: Json
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          data?: Json
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          external_url: string | null
          id: string
          kind: string
          media_url: string | null
          tags: string[]
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          external_url?: string | null
          id?: string
          kind: string
          media_url?: string | null
          tags?: string[]
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          external_url?: string | null
          id?: string
          kind?: string
          media_url?: string | null
          tags?: string[]
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string
          embedding: string | null
          handle: string
          headline: string | null
          id: string
          is_admin: boolean
          lat: number | null
          lon: number | null
          nric_hash: string | null
          role: string
          singpass_verified_at: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name: string
          embedding?: string | null
          handle: string
          headline?: string | null
          id: string
          is_admin?: boolean
          lat?: number | null
          lon?: number | null
          nric_hash?: string | null
          role?: string
          singpass_verified_at?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string
          embedding?: string | null
          handle?: string
          headline?: string | null
          id?: string
          is_admin?: boolean
          lat?: number | null
          lon?: number | null
          nric_hash?: string | null
          role?: string
          singpass_verified_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          count: number
          key: string
          window_start: string
        }
        Insert: {
          count?: number
          key: string
          window_start?: string
        }
        Update: {
          count?: number
          key?: string
          window_start?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          application_id: string
          created_at: string
          from_id: string
          gig_id: string
          id: string
          review: string
          stars: number
          to_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          from_id: string
          gig_id: string
          id?: string
          review: string
          stars: number
          to_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          from_id?: string
          gig_id?: string
          id?: string
          review?: string
          stars?: number
          to_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_from_id_fkey"
            columns: ["from_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_to_id_fkey"
            columns: ["to_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          details: string
          id: string
          reason: string
          reporter_id: string
          status: string
          target_id: string
          target_kind: string
        }
        Insert: {
          created_at?: string
          details?: string
          id?: string
          reason: string
          reporter_id: string
          status?: string
          target_id: string
          target_kind: string
        }
        Update: {
          created_at?: string
          details?: string
          id?: string
          reason?: string
          reporter_id?: string
          status?: string
          target_id?: string
          target_kind?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_gigs: {
        Row: {
          gig_id: string
          id: string
          saved_at: string
          user_id: string
        }
        Insert: {
          gig_id: string
          id?: string
          saved_at?: string
          user_id: string
        }
        Update: {
          gig_id?: string
          id?: string
          saved_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_gigs_gig_id_fkey"
            columns: ["gig_id"]
            isOneToOne: false
            referencedRelation: "gigs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_gigs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_availability: {
        Row: {
          id: string
          slots: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          slots?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          slots?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_history: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean
          start_date: string
          title: string
          user_id: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          start_date: string
          title: string
          user_id: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          start_date?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_instant_gig: { Args: { p_gig_id: string }; Returns: Json }
      check_rate_limit: {
        Args: { p_key: string; p_limit: number; p_window_seconds: number }
        Returns: boolean
      }
      decide_application: {
        Args: { p_app_id: string; p_decision: string }
        Returns: Json
      }
      distance_score: { Args: { km: number }; Returns: number }
      haversine_km: {
        Args: { lat1: number; lat2: number; lon1: number; lon2: number }
        Returns: number
      }
      match_gigs_for_user: {
        Args: { p_limit?: number; p_user_id: string }
        Returns: {
          applications_close_at: string
          budget_cents: number
          budget_kind: string
          category: string
          description: string
          distance_km: number
          employer_id: string
          gig_id: string
          location: string
          score: number
          skills_required: string[]
          title: string
        }[]
      }
      match_instant_gigs_for_user: {
        Args: {
          p_day_end: string
          p_day_start: string
          p_limit?: number
          p_user_id: string
        }
        Returns: {
          budget_cents: number
          budget_kind: string
          description: string
          distance_km: number
          employer_id: string
          gig_id: string
          instant_urgency: string
          lat: number
          location: string
          lon: number
          score: number
          skills_required: string[]
          title: string
        }[]
      }
      match_users_for_gig: {
        Args: { p_gig_id: string; p_limit?: number }
        Returns: {
          display_name: string
          handle: string
          headline: string
          score: number
          user_id: string
        }[]
      }
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
