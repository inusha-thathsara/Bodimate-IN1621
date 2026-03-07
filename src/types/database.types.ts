export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            users: {
                Row: {
                    id: string
                    role: 'STUDENT' | 'OWNER'
                    full_name: string | null
                    email: string
                    created_at: string
                }
                Insert: {
                    id: string
                    role?: 'STUDENT' | 'OWNER'
                    full_name?: string | null
                    email: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    role?: 'STUDENT' | 'OWNER'
                    full_name?: string | null
                    email?: string
                    created_at?: string
                }
                Relationships: []
            }
            boardings: {
                Row: {
                    id: string
                    owner_id: string
                    title: string
                    description: string | null
                    price: number
                    address: string
                    has_wifi: boolean
                    has_ac: boolean
                    attached_bathroom: boolean
                    image_url: string | null
                    is_available: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    owner_id: string
                    title: string
                    description?: string | null
                    price: number
                    address: string
                    has_wifi?: boolean
                    has_ac?: boolean
                    attached_bathroom?: boolean
                    image_url?: string | null
                    is_available?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    owner_id?: string
                    title?: string
                    description?: string | null
                    price?: number
                    address?: string
                    has_wifi?: boolean
                    has_ac?: boolean
                    attached_bathroom?: boolean
                    image_url?: string | null
                    is_available?: boolean
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "boardings_owner_id_fkey"
                        columns: ["owner_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            reviews: {
                Row: {
                    id: string
                    boarding_id: string
                    student_id: string
                    rating: number
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    boarding_id: string
                    student_id: string
                    rating: number
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    boarding_id?: string
                    student_id?: string
                    rating?: number
                    comment?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "reviews_boarding_id_fkey"
                        columns: ["boarding_id"]
                        isOneToOne: false
                        referencedRelation: "boardings"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "reviews_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
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
