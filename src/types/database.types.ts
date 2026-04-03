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
                    role: 'STUDENT' | 'OWNER' | 'ADMIN'
                    full_name: string | null
                    email: string
                    created_at: string
                    phone_number: string | null
                    gender: string | null
                    university: string | null
                    age: number | null
                }
                Insert: {
                    id: string
                    role?: 'STUDENT' | 'OWNER' | 'ADMIN'
                    full_name?: string | null
                    email: string
                    created_at?: string
                    phone_number?: string | null
                    gender?: string | null
                    university?: string | null
                    age?: number | null
                }
                Update: {
                    id?: string
                    role?: 'STUDENT' | 'OWNER' | 'ADMIN'
                    full_name?: string | null
                    email?: string
                    created_at?: string
                    phone_number?: string | null
                    gender?: string | null
                    university?: string | null
                    age?: number | null
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
                    rent_includes_bills: boolean
                    number_of_beds: number
                    google_maps_url: string | null
                    distance_university: string | null
                    distance_supermarket: string | null
                    distance_town: string | null
                    has_kitchen: boolean
                    has_balcony: boolean
                    has_laundry: boolean
                    rules: string | null
                    image_urls: string[] | null
                    preferred_gender: string | null
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
                    rent_includes_bills?: boolean
                    number_of_beds?: number
                    google_maps_url?: string | null
                    distance_university?: string | null
                    distance_supermarket?: string | null
                    distance_town?: string | null
                    has_kitchen?: boolean
                    has_balcony?: boolean
                    has_laundry?: boolean
                    rules?: string | null
                    image_urls?: string[] | null
                    preferred_gender?: string | null
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
                    rent_includes_bills?: boolean
                    number_of_beds?: number
                    google_maps_url?: string | null
                    distance_university?: string | null
                    distance_supermarket?: string | null
                    distance_town?: string | null
                    has_kitchen?: boolean
                    has_balcony?: boolean
                    has_laundry?: boolean
                    rules?: string | null
                    image_urls?: string[] | null
                    preferred_gender?: string | null
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
            requests: {
                Row: {
                    id: string
                    boarding_id: string
                    student_id: string
                    status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
                    created_at: string
                }
                Insert: {
                    id?: string
                    boarding_id: string
                    student_id: string
                    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
                    created_at?: string
                }
                Update: {
                    id?: string
                    boarding_id?: string
                    student_id?: string
                    status?: 'PENDING' | 'ACCEPTED' | 'REJECTED'
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "requests_boarding_id_fkey"
                        columns: ["boarding_id"]
                        isOneToOne: false
                        referencedRelation: "boardings"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "requests_student_id_fkey"
                        columns: ["student_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            notifications: {
                Row: {
                    id: string
                    recipient_id: string
                    actor_id: string | null
                    boarding_id: string | null
                    type: 'REQUEST_CREATED' | 'REVIEW_CREATED' | 'REQUEST_STATUS_UPDATED' | 'LISTING_SAVED'
                    title: string
                    message: string
                    is_read: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    recipient_id: string
                    actor_id?: string | null
                    boarding_id?: string | null
                    type: 'REQUEST_CREATED' | 'REVIEW_CREATED' | 'REQUEST_STATUS_UPDATED' | 'LISTING_SAVED'
                    title: string
                    message: string
                    is_read?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    recipient_id?: string
                    actor_id?: string | null
                    boarding_id?: string | null
                    type?: 'REQUEST_CREATED' | 'REVIEW_CREATED' | 'REQUEST_STATUS_UPDATED' | 'LISTING_SAVED'
                    title?: string
                    message?: string
                    is_read?: boolean
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "notifications_recipient_id_fkey"
                        columns: ["recipient_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notifications_actor_id_fkey"
                        columns: ["actor_id"]
                        isOneToOne: false
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "notifications_boarding_id_fkey"
                        columns: ["boarding_id"]
                        isOneToOne: false
                        referencedRelation: "boardings"
                        referencedColumns: ["id"]
                    }
                ]
            }
            saved_boardings: {
                Row: {
                    id: string
                    boarding_id: string
                    student_id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    boarding_id: string
                    student_id: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    boarding_id?: string
                    student_id?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "saved_boardings_boarding_id_fkey"
                        columns: ["boarding_id"]
                        isOneToOne: false
                        referencedRelation: "boardings"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "saved_boardings_student_id_fkey"
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
