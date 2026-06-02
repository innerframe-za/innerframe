// Hand-written types for the Innerframe Supabase schema.
// Run `supabase gen types typescript` to replace with auto-generated types.
//
// Includes both the legacy (organisations/users/patients) tables and
// the new multi-tenant (facilities/profiles/facility_memberships) tables.

export type PermissionLevel = 'none' | 'view' | 'own' | 'full'
export type AppModule =
  | 'admin' | 'staff' | 'hr' | 'board_governance'
  | 'residence' | 'finance' | 'kitchen' | 'medical'

export type Database = {
  public: {
    Tables: {
      // ── Legacy tables (keep for backward compat during transition) ──────────

      organisations: {
        Row: {
          id: string; name: string; address: string | null
          contact_email: string | null; contact_phone: string | null
          logo_url: string | null; created_at: string
        }
        Insert: {
          id?: string; name: string; address?: string | null
          contact_email?: string | null; contact_phone?: string | null
          logo_url?: string | null; created_at?: string
        }
        Update: {
          id?: string; name?: string; address?: string | null
          contact_email?: string | null; contact_phone?: string | null
          logo_url?: string | null; created_at?: string
        }
        Relationships: []
      }

      users: {
        Row: {
          id: string; org_id: string; full_name: string; email: string
          role: 'home_admin' | 'staff' | 'super_admin'; created_at: string
          username: string | null
        }
        Insert: {
          id: string; org_id: string; full_name: string; email: string
          role: 'home_admin' | 'staff' | 'super_admin'; created_at?: string
          username?: string | null
        }
        Update: {
          id?: string; org_id?: string; full_name?: string; email?: string
          role?: 'home_admin' | 'staff' | 'super_admin'; created_at?: string
          username?: string | null
        }
        Relationships: []
      }

      patients: {
        Row: {
          id: string; org_id: string; full_name: string
          date_of_birth: string | null; id_number: string | null
          room_number: string | null; admission_date: string | null
          discharge_date: string | null; status: 'active' | 'discharged' | 'deceased'
          allergies: string | null; chronic_conditions: string | null
          current_medications: string | null; gp_name: string | null
          gp_contact: string | null; medical_aid_scheme: string | null
          medical_aid_member_number: string | null; religion: string | null
          language: string | null; dietary_requirements: string | null
          created_at: string
        }
        Insert: {
          id?: string; org_id: string; full_name: string
          date_of_birth?: string | null; id_number?: string | null
          room_number?: string | null; admission_date?: string | null
          discharge_date?: string | null; status?: 'active' | 'discharged' | 'deceased'
          allergies?: string | null; chronic_conditions?: string | null
          current_medications?: string | null; gp_name?: string | null
          gp_contact?: string | null; medical_aid_scheme?: string | null
          medical_aid_member_number?: string | null; religion?: string | null
          language?: string | null; dietary_requirements?: string | null
          created_at?: string
        }
        Update: {
          id?: string; org_id?: string; full_name?: string
          date_of_birth?: string | null; id_number?: string | null
          room_number?: string | null; admission_date?: string | null
          discharge_date?: string | null; status?: 'active' | 'discharged' | 'deceased'
          allergies?: string | null; chronic_conditions?: string | null
          current_medications?: string | null; gp_name?: string | null
          gp_contact?: string | null; medical_aid_scheme?: string | null
          medical_aid_member_number?: string | null; religion?: string | null
          language?: string | null; dietary_requirements?: string | null
          created_at?: string
        }
        Relationships: []
      }

      patient_contacts: {
        Row: {
          id: string; patient_id: string; org_id: string; full_name: string
          relationship: string | null; email: string | null; phone: string | null
          is_primary: boolean; created_at: string
        }
        Insert: {
          id?: string; patient_id: string; org_id: string; full_name: string
          relationship?: string | null; email?: string | null; phone?: string | null
          is_primary?: boolean; created_at?: string
        }
        Update: {
          id?: string; patient_id?: string; org_id?: string; full_name?: string
          relationship?: string | null; email?: string | null; phone?: string | null
          is_primary?: boolean; created_at?: string
        }
        Relationships: []
      }

      patient_notes: {
        Row: {
          id: string; patient_id: string; org_id: string; user_id: string | null
          author_name: string; category: 'call' | 'visit' | 'incident' | 'update' | 'general'
          content: string; created_at: string
        }
        Insert: {
          id?: string; patient_id: string; org_id: string; user_id?: string | null
          author_name: string; category: 'call' | 'visit' | 'incident' | 'update' | 'general'
          content: string; created_at?: string
        }
        Update: {
          id?: string; patient_id?: string; org_id?: string; user_id?: string | null
          author_name?: string; category?: 'call' | 'visit' | 'incident' | 'update' | 'general'
          content?: string; created_at?: string
        }
        Relationships: []
      }

      documents_legacy: {
        Row: {
          id: string; org_id: string; patient_id: string | null
          category_id: string | null; section_id: string | null; pillar: string
          title: string | null; file_name: string; file_url: string
          uploaded_by: string | null; is_global: boolean; created_at: string
        }
        Insert: {
          id?: string; org_id: string; patient_id?: string | null
          category_id?: string | null; section_id?: string | null; pillar: string
          title?: string | null; file_name: string; file_url: string
          uploaded_by?: string | null; is_global?: boolean; created_at?: string
        }
        Update: {
          id?: string; org_id?: string; patient_id?: string | null
          category_id?: string | null; section_id?: string | null; pillar?: string
          title?: string | null; file_name?: string; file_url?: string
          uploaded_by?: string | null; is_global?: boolean; created_at?: string
        }
        Relationships: []
      }

      document_categories: {
        Row: { id: string; org_id: string; name: string; created_at: string }
        Insert: { id?: string; org_id: string; name: string; created_at?: string }
        Update: { id?: string; org_id?: string; name?: string; created_at?: string }
        Relationships: []
      }

      staff_permissions: {
        Row: {
          id: string; user_id: string; pillar_slug: string
          can_view: boolean; can_edit: boolean; created_at: string
        }
        Insert: {
          id?: string; user_id: string; pillar_slug: string
          can_view?: boolean; can_edit?: boolean; created_at?: string
        }
        Update: {
          id?: string; user_id?: string; pillar_slug?: string
          can_view?: boolean; can_edit?: boolean; created_at?: string
        }
        Relationships: []
      }

      // ── New multi-tenant tables ─────────────────────────────────────────────

      facilities: {
        Row: {
          id: string; name: string; slug: string; facility_type: string | null
          subscription_tier: string; is_active: boolean
          created_at: string; updated_at: string
        }
        Insert: {
          id?: string; name: string; slug: string; facility_type?: string | null
          subscription_tier?: string; is_active?: boolean
          created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; name?: string; slug?: string; facility_type?: string | null
          subscription_tier?: string; is_active?: boolean
          created_at?: string; updated_at?: string
        }
        Relationships: []
      }

      profiles: {
        Row: {
          id: string; full_name: string | null; email: string | null
          avatar_url: string | null; created_at: string; updated_at: string
          username: string | null
        }
        Insert: {
          id: string; full_name?: string | null; email?: string | null
          avatar_url?: string | null; created_at?: string; updated_at?: string
          username?: string | null
        }
        Update: {
          id?: string; full_name?: string | null; email?: string | null
          avatar_url?: string | null; created_at?: string; updated_at?: string
          username?: string | null
        }
        Relationships: []
      }

      facility_memberships: {
        Row: {
          id: string; facility_id: string; user_id: string
          role: 'super_admin' | 'facility_admin' | 'hr_manager' | 'finance_officer'
               | 'medical_staff' | 'board_member' | 'kitchen_staff' | 'general_staff'
          perm_admin: PermissionLevel; perm_staff: PermissionLevel
          perm_hr: PermissionLevel; perm_board: PermissionLevel
          perm_residence: PermissionLevel; perm_finance: PermissionLevel
          perm_kitchen: PermissionLevel; perm_medical: PermissionLevel
          status: 'active' | 'inactive' | 'suspended'
          invited_by: string | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; facility_id: string; user_id: string
          role: 'super_admin' | 'facility_admin' | 'hr_manager' | 'finance_officer'
               | 'medical_staff' | 'board_member' | 'kitchen_staff' | 'general_staff'
          perm_admin?: PermissionLevel; perm_staff?: PermissionLevel
          perm_hr?: PermissionLevel; perm_board?: PermissionLevel
          perm_residence?: PermissionLevel; perm_finance?: PermissionLevel
          perm_kitchen?: PermissionLevel; perm_medical?: PermissionLevel
          status?: 'active' | 'inactive' | 'suspended'
          invited_by?: string | null; created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; facility_id?: string; user_id?: string
          role?: 'super_admin' | 'facility_admin' | 'hr_manager' | 'finance_officer'
                | 'medical_staff' | 'board_member' | 'kitchen_staff' | 'general_staff'
          perm_admin?: PermissionLevel; perm_staff?: PermissionLevel
          perm_hr?: PermissionLevel; perm_board?: PermissionLevel
          perm_residence?: PermissionLevel; perm_finance?: PermissionLevel
          perm_kitchen?: PermissionLevel; perm_medical?: PermissionLevel
          status?: 'active' | 'inactive' | 'suspended'
          invited_by?: string | null; created_at?: string; updated_at?: string
        }
        Relationships: []
      }

      contacts: {
        Row: {
          id: string; facility_id: string
          contact_type: 'resident' | 'client' | 'donor' | 'volunteer' | 'supplier' | 'other'
          full_name: string; email: string | null; phone: string | null
          metadata: Record<string, unknown>; is_active: boolean
          created_by: string | null; created_at: string; updated_at: string
        }
        Insert: {
          id?: string; facility_id: string
          contact_type: 'resident' | 'client' | 'donor' | 'volunteer' | 'supplier' | 'other'
          full_name: string; email?: string | null; phone?: string | null
          metadata?: Record<string, unknown>; is_active?: boolean
          created_by?: string | null; created_at?: string; updated_at?: string
        }
        Update: {
          id?: string; facility_id?: string
          contact_type?: 'resident' | 'client' | 'donor' | 'volunteer' | 'supplier' | 'other'
          full_name?: string; email?: string | null; phone?: string | null
          metadata?: Record<string, unknown>; is_active?: boolean
          created_by?: string | null; created_at?: string; updated_at?: string
        }
        Relationships: []
      }

      documents: {
        Row: {
          id: string; facility_id: string; module: AppModule
          contact_id: string | null; title: string; tags: string[]
          storage_path: string; mime_type: string | null; file_size: number | null
          uploaded_by: string; created_at: string
        }
        Insert: {
          id?: string; facility_id: string; module: AppModule
          contact_id?: string | null; title: string; tags?: string[]
          storage_path: string; mime_type?: string | null; file_size?: number | null
          uploaded_by: string; created_at?: string
        }
        Update: {
          id?: string; facility_id?: string; module?: AppModule
          contact_id?: string | null; title?: string; tags?: string[]
          storage_path?: string; mime_type?: string | null; file_size?: number | null
          uploaded_by?: string; created_at?: string
        }
        Relationships: []
      }

      audit_log: {
        Row: {
          id: number; facility_id: string; user_id: string | null
          action: string; module: AppModule | null; table_name: string
          record_id: string | null; old_values: Record<string, unknown> | null
          new_values: Record<string, unknown> | null; ip_address: string | null
          user_agent: string | null; created_at: string
        }
        Insert: {
          facility_id: string; user_id?: string | null
          action: string; module?: AppModule | null; table_name: string
          record_id?: string | null; old_values?: Record<string, unknown> | null
          new_values?: Record<string, unknown> | null; ip_address?: string | null
          user_agent?: string | null; created_at?: string
        }
        Update: Record<string, never>  // append-only — no updates ever
        Relationships: []
      }

      dashboard_widgets: {
        Row: {
          id: string; facility_id: string; module: AppModule; widget_type: string
          title: string; config: Record<string, unknown>; position: number
          is_visible: boolean; created_at: string
        }
        Insert: {
          id?: string; facility_id: string; module: AppModule; widget_type: string
          title: string; config?: Record<string, unknown>; position?: number
          is_visible?: boolean; created_at?: string
        }
        Update: {
          id?: string; facility_id?: string; module?: AppModule; widget_type?: string
          title?: string; config?: Record<string, unknown>; position?: number
          is_visible?: boolean; created_at?: string
        }
        Relationships: []
      }

      activity_feed: {
        Row: {
          id: string; facility_id: string; user_id: string | null
          module: AppModule | null; event_type: string; description: string | null
          record_id: string | null; created_at: string
        }
        Insert: {
          id?: string; facility_id: string; user_id?: string | null
          module?: AppModule | null; event_type: string; description?: string | null
          record_id?: string | null; created_at?: string
        }
        Update: {
          id?: string; facility_id?: string; user_id?: string | null
          module?: AppModule | null; event_type?: string; description?: string | null
          record_id?: string | null; created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      get_email_by_username: {
        Args: { p_username: string }
        Returns: string | null
      }
    }
    Enums: {
      permission_level: PermissionLevel
      app_module: AppModule
    }
  }
}
