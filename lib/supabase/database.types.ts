// Minimal hand-written types for the Innerframe Supabase schema.
// Run `supabase gen types typescript` to replace this with auto-generated types.

export type Database = {
  public: {
    Tables: {
      organisations: {
        Row: {
          id: string
          name: string
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          logo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          logo_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          id: string
          org_id: string
          full_name: string
          email: string
          role: 'home_admin' | 'staff' | 'super_admin'
          created_at: string
        }
        Insert: {
          id: string
          org_id: string
          full_name: string
          email: string
          role: 'home_admin' | 'staff' | 'super_admin'
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          full_name?: string
          email?: string
          role?: 'home_admin' | 'staff' | 'super_admin'
          created_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          id: string
          org_id: string
          full_name: string
          date_of_birth: string | null
          id_number: string | null
          room_number: string | null
          admission_date: string | null
          discharge_date: string | null
          status: 'active' | 'discharged' | 'deceased'
          allergies: string | null
          chronic_conditions: string | null
          current_medications: string | null
          gp_name: string | null
          gp_contact: string | null
          medical_aid_scheme: string | null
          medical_aid_member_number: string | null
          religion: string | null
          language: string | null
          dietary_requirements: string | null
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          full_name: string
          date_of_birth?: string | null
          id_number?: string | null
          room_number?: string | null
          admission_date?: string | null
          discharge_date?: string | null
          status?: 'active' | 'discharged' | 'deceased'
          allergies?: string | null
          chronic_conditions?: string | null
          current_medications?: string | null
          gp_name?: string | null
          gp_contact?: string | null
          medical_aid_scheme?: string | null
          medical_aid_member_number?: string | null
          religion?: string | null
          language?: string | null
          dietary_requirements?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          full_name?: string
          date_of_birth?: string | null
          id_number?: string | null
          room_number?: string | null
          admission_date?: string | null
          discharge_date?: string | null
          status?: 'active' | 'discharged' | 'deceased'
          allergies?: string | null
          chronic_conditions?: string | null
          current_medications?: string | null
          gp_name?: string | null
          gp_contact?: string | null
          medical_aid_scheme?: string | null
          medical_aid_member_number?: string | null
          religion?: string | null
          language?: string | null
          dietary_requirements?: string | null
          created_at?: string
        }
        Relationships: []
      }
      patient_contacts: {
        Row: {
          id: string
          patient_id: string
          org_id: string
          full_name: string
          relationship: string | null
          email: string | null
          phone: string | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          org_id: string
          full_name: string
          relationship?: string | null
          email?: string | null
          phone?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          org_id?: string
          full_name?: string
          relationship?: string | null
          email?: string | null
          phone?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Relationships: []
      }
      patient_notes: {
        Row: {
          id: string
          patient_id: string
          org_id: string
          user_id: string | null
          author_name: string
          category: 'call' | 'visit' | 'incident' | 'update' | 'general'
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          org_id: string
          user_id?: string | null
          author_name: string
          category: 'call' | 'visit' | 'incident' | 'update' | 'general'
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          org_id?: string
          user_id?: string | null
          author_name?: string
          category?: 'call' | 'visit' | 'incident' | 'update' | 'general'
          content?: string
          created_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          org_id: string
          patient_id: string | null
          category_id: string | null
          section_id: string | null
          pillar: string
          title: string | null
          file_name: string
          file_url: string
          uploaded_by: string | null
          is_global: boolean
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          patient_id?: string | null
          category_id?: string | null
          section_id?: string | null
          pillar: string
          title?: string | null
          file_name: string
          file_url: string
          uploaded_by?: string | null
          is_global?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          patient_id?: string | null
          category_id?: string | null
          section_id?: string | null
          pillar?: string
          title?: string | null
          file_name?: string
          file_url?: string
          uploaded_by?: string | null
          is_global?: boolean
          created_at?: string
        }
        Relationships: []
      }
      document_categories: {
        Row: {
          id: string
          org_id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          org_id: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          org_id?: string
          name?: string
          created_at?: string
        }
        Relationships: []
      }
      staff_permissions: {
        Row: {
          id: string
          user_id: string
          pillar_slug: string
          can_view: boolean
          can_edit: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          pillar_slug: string
          can_view?: boolean
          can_edit?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          pillar_slug?: string
          can_view?: boolean
          can_edit?: boolean
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
