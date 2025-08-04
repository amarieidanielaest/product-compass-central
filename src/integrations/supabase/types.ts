export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      board_memberships: {
        Row: {
          board_id: string
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          board_id: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          board_id?: string
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "board_memberships_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "customer_boards"
            referencedColumns: ["id"]
          },
        ]
      }
      changelog_entries: {
        Row: {
          author_id: string | null
          board_id: string | null
          content: string | null
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          organization_id: string | null
          published_at: string | null
          title: string
          type: string | null
          updated_at: string | null
          version: string | null
          visibility: string | null
        }
        Insert: {
          author_id?: string | null
          board_id?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          organization_id?: string | null
          published_at?: string | null
          title: string
          type?: string | null
          updated_at?: string | null
          version?: string | null
          visibility?: string | null
        }
        Update: {
          author_id?: string | null
          board_id?: string | null
          content?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          organization_id?: string | null
          published_at?: string | null
          title?: string
          type?: string | null
          updated_at?: string | null
          version?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "changelog_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "changelog_entries_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "customer_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "changelog_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_boards: {
        Row: {
          access_type: string | null
          board_type: string | null
          branding_config: Json | null
          created_at: string | null
          customer_organization_id: string | null
          description: string | null
          features_enabled: Json | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          name: string
          organization_id: string | null
          slug: string
          updated_at: string | null
        }
        Insert: {
          access_type?: string | null
          board_type?: string | null
          branding_config?: Json | null
          created_at?: string | null
          customer_organization_id?: string | null
          description?: string | null
          features_enabled?: Json | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name: string
          organization_id?: string | null
          slug: string
          updated_at?: string | null
        }
        Update: {
          access_type?: string | null
          board_type?: string | null
          branding_config?: Json | null
          created_at?: string | null
          customer_organization_id?: string | null
          description?: string | null
          features_enabled?: Json | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          name?: string
          organization_id?: string | null
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_boards_customer_organization_id_fkey"
            columns: ["customer_organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_boards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          feedback_id: string
          id: string
          is_internal: boolean | null
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          feedback_id: string
          id?: string
          is_internal?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          feedback_id?: string
          id?: string
          is_internal?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_comments_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "feedback_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_items: {
        Row: {
          assigned_to: string | null
          board_id: string | null
          category: string | null
          comments_count: number | null
          created_at: string | null
          customer_info: Json | null
          description: string | null
          effort_estimate: number | null
          id: string
          impact_score: number | null
          organization_id: string | null
          priority: string | null
          status: string | null
          submitted_by: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          upvotes_count: number | null
          votes_count: number | null
        }
        Insert: {
          assigned_to?: string | null
          board_id?: string | null
          category?: string | null
          comments_count?: number | null
          created_at?: string | null
          customer_info?: Json | null
          description?: string | null
          effort_estimate?: number | null
          id?: string
          impact_score?: number | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          submitted_by?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          upvotes_count?: number | null
          votes_count?: number | null
        }
        Update: {
          assigned_to?: string | null
          board_id?: string | null
          category?: string | null
          comments_count?: number | null
          created_at?: string | null
          customer_info?: Json | null
          description?: string | null
          effort_estimate?: number | null
          id?: string
          impact_score?: number | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          submitted_by?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          upvotes_count?: number | null
          votes_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_items_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_items_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "customer_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feedback_items_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_votes: {
        Row: {
          created_at: string | null
          feedback_id: string
          id: string
          user_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          feedback_id: string
          id?: string
          user_id: string
          vote_type?: string
        }
        Update: {
          created_at?: string | null
          feedback_id?: string
          id?: string
          user_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_votes_feedback_id_fkey"
            columns: ["feedback_id"]
            isOneToOne: false
            referencedRelation: "feedback_items"
            referencedColumns: ["id"]
          },
        ]
      }
      help_article_tags: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_article_tags_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "help_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_article_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "help_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          author_id: string | null
          board_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          organization_id: string | null
          read_time: number | null
          sort_order: number | null
          title: string
          updated_at: string | null
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          author_id?: string | null
          board_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          organization_id?: string | null
          read_time?: number | null
          sort_order?: number | null
          title: string
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          author_id?: string | null
          board_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          organization_id?: string | null
          read_time?: number | null
          sort_order?: number | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_articles_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "customer_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      help_categories: {
        Row: {
          board_id: string | null
          color: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          sort_order: number | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          board_id?: string | null
          color: string
          created_at?: string | null
          description?: string | null
          icon: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          board_id?: string | null
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_categories_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "customer_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "help_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      help_tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      kb_article_comments: {
        Row: {
          article_id: string
          author_id: string
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          is_helpful: boolean | null
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          article_id: string
          author_id: string
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_helpful?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          article_id?: string
          author_id?: string
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_helpful?: boolean | null
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      kb_article_ratings: {
        Row: {
          article_id: string
          created_at: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          article_id: string
          created_at?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          article_id?: string
          created_at?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      kb_article_versions: {
        Row: {
          article_id: string
          author_id: string | null
          changes_summary: string | null
          content: string
          created_at: string | null
          id: string
          title: string
          version_number: number
        }
        Insert: {
          article_id: string
          author_id?: string | null
          changes_summary?: string | null
          content: string
          created_at?: string | null
          id?: string
          title: string
          version_number: number
        }
        Update: {
          article_id?: string
          author_id?: string | null
          changes_summary?: string | null
          content?: string
          created_at?: string | null
          id?: string
          title?: string
          version_number?: number
        }
        Relationships: []
      }
      kb_article_views: {
        Row: {
          article_id: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          article_id: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          article_id?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: []
      }
      kb_articles: {
        Row: {
          author_id: string | null
          board_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          description: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          last_updated: string | null
          organization_id: string | null
          rating_average: number | null
          rating_count: number | null
          read_time: number | null
          search_vector: unknown | null
          sort_order: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          author_id?: string | null
          board_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          last_updated?: string | null
          organization_id?: string | null
          rating_average?: number | null
          rating_count?: number | null
          read_time?: number | null
          search_vector?: unknown | null
          sort_order?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          author_id?: string | null
          board_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          last_updated?: string | null
          organization_id?: string | null
          rating_average?: number | null
          rating_count?: number | null
          read_time?: number | null
          search_vector?: unknown | null
          sort_order?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: []
      }
      kb_categories: {
        Row: {
          board_id: string | null
          color: string
          created_at: string | null
          description: string | null
          icon: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          sort_order: number | null
          updated_at: string | null
          visibility: string | null
        }
        Insert: {
          board_id?: string | null
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Update: {
          board_id?: string | null
          color?: string
          created_at?: string | null
          description?: string | null
          icon?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          visibility?: string | null
        }
        Relationships: []
      }
      kb_content_suggestions: {
        Row: {
          article_id: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          is_applied: boolean | null
          suggested_by: string | null
          suggestion_text: string
          suggestion_type: string
        }
        Insert: {
          article_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_applied?: boolean | null
          suggested_by?: string | null
          suggestion_text: string
          suggestion_type: string
        }
        Update: {
          article_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          is_applied?: boolean | null
          suggested_by?: string | null
          suggestion_text?: string
          suggestion_type?: string
        }
        Relationships: []
      }
      methodology_templates: {
        Row: {
          created_at: string
          default_columns: Json
          default_config: Json | null
          default_statuses: Json
          description: string | null
          id: string
          is_system_template: boolean | null
          methodology_type: string
          name: string
        }
        Insert: {
          created_at?: string
          default_columns: Json
          default_config?: Json | null
          default_statuses: Json
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          methodology_type: string
          name: string
        }
        Update: {
          created_at?: string
          default_columns?: Json
          default_config?: Json | null
          default_statuses?: Json
          description?: string | null
          id?: string
          is_system_template?: boolean | null
          methodology_type?: string
          name?: string
        }
        Relationships: []
      }
      organization_memberships: {
        Row: {
          created_at: string | null
          id: string
          invited_by: string | null
          joined_at: string | null
          organization_id: string | null
          role: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          role?: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string | null
          role?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          branding_config: Json | null
          created_at: string | null
          custom_domain: string | null
          description: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          branding_config?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          branding_config?: Json | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      plan_usage_quotas: {
        Row: {
          created_at: string | null
          id: string
          included_quota: number
          metric_id: string | null
          plan_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          included_quota: number
          metric_id?: string | null
          plan_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          included_quota?: number
          metric_id?: string | null
          plan_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_usage_quotas_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "usage_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_usage_quotas_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_plans: {
        Row: {
          billing_cycle: string | null
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_custom_pricing: boolean | null
          max_projects: number | null
          max_team_members: number | null
          max_users: number | null
          min_users: number | null
          name: string
          price_monthly: number | null
          price_per_user_monthly: number | null
          price_per_user_yearly: number | null
          price_yearly: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_custom_pricing?: boolean | null
          max_projects?: number | null
          max_team_members?: number | null
          max_users?: number | null
          min_users?: number | null
          name: string
          price_monthly?: number | null
          price_per_user_monthly?: number | null
          price_per_user_yearly?: number | null
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_custom_pricing?: boolean | null
          max_projects?: number | null
          max_team_members?: number | null
          max_users?: number | null
          min_users?: number | null
          name?: string
          price_monthly?: number | null
          price_per_user_monthly?: number | null
          price_per_user_yearly?: number | null
          price_yearly?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_team_id: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_team_id?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_team_id?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_current_team_id_fkey"
            columns: ["current_team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          methodology_config: Json | null
          name: string
          start_date: string | null
          status: string
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          methodology_config?: Json | null
          name: string
          start_date?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          methodology_config?: Json | null
          name?: string
          start_date?: string | null
          status?: string
          team_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmap_items: {
        Row: {
          acceptance_criteria: string | null
          author_id: string | null
          board_id: string | null
          business_value_score: number | null
          category: string | null
          completion_date: string | null
          created_at: string | null
          dependencies: Json | null
          description: string | null
          due_date: string | null
          effort_points: number | null
          estimated_date: string | null
          id: string
          organization_id: string | null
          priority: string | null
          project_id: string | null
          sort_order: number | null
          start_date: string | null
          status: string
          title: string
          updated_at: string | null
          upvotes_count: number | null
          visibility: string | null
        }
        Insert: {
          acceptance_criteria?: string | null
          author_id?: string | null
          board_id?: string | null
          business_value_score?: number | null
          category?: string | null
          completion_date?: string | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          due_date?: string | null
          effort_points?: number | null
          estimated_date?: string | null
          id?: string
          organization_id?: string | null
          priority?: string | null
          project_id?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
          upvotes_count?: number | null
          visibility?: string | null
        }
        Update: {
          acceptance_criteria?: string | null
          author_id?: string | null
          board_id?: string | null
          business_value_score?: number | null
          category?: string | null
          completion_date?: string | null
          created_at?: string | null
          dependencies?: Json | null
          description?: string | null
          due_date?: string | null
          effort_points?: number | null
          estimated_date?: string | null
          id?: string
          organization_id?: string | null
          priority?: string | null
          project_id?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
          upvotes_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roadmap_items_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_items_board_id_fkey"
            columns: ["board_id"]
            isOneToOne: false
            referencedRelation: "customer_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roadmap_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      sprints: {
        Row: {
          capacity: number | null
          committed: number | null
          completed: number | null
          created_at: string
          end_date: string
          goal: string | null
          id: string
          methodology_type: string
          name: string
          project_id: string | null
          start_date: string
          status: string
          updated_at: string
          workflow_config: Json | null
        }
        Insert: {
          capacity?: number | null
          committed?: number | null
          completed?: number | null
          created_at?: string
          end_date: string
          goal?: string | null
          id?: string
          methodology_type?: string
          name: string
          project_id?: string | null
          start_date: string
          status?: string
          updated_at?: string
          workflow_config?: Json | null
        }
        Update: {
          capacity?: number | null
          committed?: number | null
          completed?: number | null
          created_at?: string
          end_date?: string
          goal?: string | null
          id?: string
          methodology_type?: string
          name?: string
          project_id?: string | null
          start_date?: string
          status?: string
          updated_at?: string
          workflow_config?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sprints_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      team_invitations: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: string | null
          team_id: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          invited_by: string
          role?: string | null
          team_id: string
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: string | null
          team_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_invitations_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_memberships: {
        Row: {
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          role: string | null
          status: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          role?: string | null
          status?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_memberships_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
          pricing_plan_id: string | null
          slug: string
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
          pricing_plan_id?: string | null
          slug: string
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
          pricing_plan_id?: string | null
          slug?: string
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_pricing_plan_id_fkey"
            columns: ["pricing_plan_id"]
            isOneToOne: false
            referencedRelation: "pricing_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_metrics: {
        Row: {
          cost_per_unit: number
          created_at: string | null
          description: string | null
          id: string
          metric_name: string
          unit_name: string
          updated_at: string | null
        }
        Insert: {
          cost_per_unit: number
          created_at?: string | null
          description?: string | null
          id?: string
          metric_name: string
          unit_name: string
          updated_at?: string | null
        }
        Update: {
          cost_per_unit?: number
          created_at?: string | null
          description?: string | null
          id?: string
          metric_name?: string
          unit_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      work_item_comments: {
        Row: {
          author_id: string | null
          comment_type: string | null
          content: string
          created_at: string
          id: string
          metadata: Json | null
          work_item_id: string | null
        }
        Insert: {
          author_id?: string | null
          comment_type?: string | null
          content: string
          created_at?: string
          id?: string
          metadata?: Json | null
          work_item_id?: string | null
        }
        Update: {
          author_id?: string | null
          comment_type?: string | null
          content?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          work_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_item_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_item_comments_work_item_id_fkey"
            columns: ["work_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_item_dependencies: {
        Row: {
          created_at: string
          dependency_type: string
          from_item_id: string | null
          id: string
          to_item_id: string | null
        }
        Insert: {
          created_at?: string
          dependency_type?: string
          from_item_id?: string | null
          id?: string
          to_item_id?: string | null
        }
        Update: {
          created_at?: string
          dependency_type?: string
          from_item_id?: string | null
          id?: string
          to_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "work_item_dependencies_from_item_id_fkey"
            columns: ["from_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_item_dependencies_to_item_id_fkey"
            columns: ["to_item_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
        ]
      }
      work_items: {
        Row: {
          acceptance_criteria: string | null
          assignee_id: string | null
          completed_date: string | null
          created_at: string
          custom_fields: Json | null
          description: string | null
          due_date: string | null
          effort_estimate: number | null
          effort_unit: string | null
          id: string
          item_type: string
          linked_feedback_ids: string[] | null
          parent_id: string | null
          priority: string
          reporter_id: string | null
          roadmap_item_id: string | null
          sprint_id: string | null
          start_date: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          acceptance_criteria?: string | null
          assignee_id?: string | null
          completed_date?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          effort_estimate?: number | null
          effort_unit?: string | null
          id?: string
          item_type?: string
          linked_feedback_ids?: string[] | null
          parent_id?: string | null
          priority?: string
          reporter_id?: string | null
          roadmap_item_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          acceptance_criteria?: string | null
          assignee_id?: string | null
          completed_date?: string | null
          created_at?: string
          custom_fields?: Json | null
          description?: string | null
          due_date?: string | null
          effort_estimate?: number | null
          effort_unit?: string | null
          id?: string
          item_type?: string
          linked_feedback_ids?: string[] | null
          parent_id?: string | null
          priority?: string
          reporter_id?: string | null
          roadmap_item_id?: string | null
          sprint_id?: string | null
          start_date?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_items_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "work_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_roadmap_item_id_fkey"
            columns: ["roadmap_item_id"]
            isOneToOne: false
            referencedRelation: "roadmap_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "work_items_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_columns: {
        Row: {
          color: string | null
          column_type: string | null
          created_at: string
          id: string
          name: string
          position: number
          sprint_id: string | null
          wip_limit: number | null
        }
        Insert: {
          color?: string | null
          column_type?: string | null
          created_at?: string
          id?: string
          name: string
          position: number
          sprint_id?: string | null
          wip_limit?: number | null
        }
        Update: {
          color?: string | null
          column_type?: string | null
          created_at?: string
          id?: string
          name?: string
          position?: number
          sprint_id?: string | null
          wip_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_columns_sprint_id_fkey"
            columns: ["sprint_id"]
            isOneToOne: false
            referencedRelation: "sprints"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_team_invitation: {
        Args: { invitation_token: string }
        Returns: boolean
      }
      create_team_with_owner: {
        Args: {
          team_name: string
          team_slug: string
          team_description?: string
          plan_id?: string
        }
        Returns: string
      }
      get_user_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      increment_article_views: {
        Args: { article_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "product_manager"
        | "developer"
        | "stakeholder"
        | "viewer"
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
      app_role: [
        "admin",
        "product_manager",
        "developer",
        "stakeholder",
        "viewer",
      ],
    },
  },
} as const
