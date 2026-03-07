import { createClient } from './supabase/client'
import { Database } from '@/types/database.types'

type BoardingRow = Database['public']['Tables']['boardings']['Row']
type BoardingInsert = Database['public']['Tables']['boardings']['Insert']
type BoardingUpdate = Database['public']['Tables']['boardings']['Update']

type ReviewRow = Database['public']['Tables']['reviews']['Row']
type ReviewInsert = Database['public']['Tables']['reviews']['Insert']

const supabase = createClient()

// Boardings API
export async function getBoardings() {
    const { data, error } = await supabase
        .from('boardings')
        .select('*, users(full_name)')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function getBoardingById(id: string) {
    const { data, error } = await supabase
        .from('boardings')
        .select('*, users(full_name)')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function getBoardingsByOwner(ownerId: string) {
    const { data, error } = await supabase
        .from('boardings')
        .select('*')
        .eq('owner_id', ownerId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function createBoarding(boarding: BoardingInsert) {
    const { data, error } = await supabase
        .from('boardings')
        .insert(boarding)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateBoarding(id: string, boarding: BoardingUpdate) {
    const { data, error } = await supabase
        .from('boardings')
        .update(boarding)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteBoarding(id: string) {
    const { error } = await supabase
        .from('boardings')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}

// Reviews API
export async function getReviewsByBoarding(boardingId: string) {
    const { data, error } = await supabase
        .from('reviews')
        .select('*, users(full_name)')
        .eq('boarding_id', boardingId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function createReview(review: ReviewInsert) {
    const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single()

    if (error) throw error
    return data
}
