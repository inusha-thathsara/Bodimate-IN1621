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
        .select('*, users(full_name), reviews(rating)')
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

export async function getReviewsByOwner(ownerId: string) {
    const { data, error } = await supabase
        .from('reviews')
        .select('*, boardings!inner(*), users!reviews_student_id_fkey(full_name, email)')
        .eq('boardings.owner_id', ownerId)
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

// Requests API
export async function createRequest(boardingId: string, studentId: string) {
    const { data, error } = await supabase
        .from('requests')
        .insert({ boarding_id: boardingId, student_id: studentId, status: 'PENDING' })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getRequestsByStudent(studentId: string) {
    const { data, error } = await supabase
        .from('requests')
        .select('*, boardings(*)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function checkHasRequested(boardingId: string, studentId: string) {
    const { data, error } = await supabase
        .from('requests')
        .select('id')
        .eq('boarding_id', boardingId)
        .eq('student_id', studentId)
        .maybeSingle()

    if (error) return false
    return !!data
}

export async function getRequestsByOwner(ownerId: string) {
    // We need to join requests -> boardings to filter by owner_id
    const { data, error } = await supabase
        .from('requests')
        .select('*, boardings!inner(*), users!requests_student_id_fkey(full_name, email)')
        .eq('boardings.owner_id', ownerId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function updateRequestStatus(id: string, status: 'PENDING' | 'ACCEPTED' | 'REJECTED') {
    const { data, error } = await supabase
        .from('requests')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteRequest(id: string) {
    const { error } = await supabase
        .from('requests')
        .delete()
        .eq('id', id)

    if (error) throw error
    return true
}

// Saved Boardings API
export async function toggleSavedBoarding(boardingId: string, studentId: string) {
    // First check if it exists
    const { data: existing } = await supabase
        .from('saved_boardings')
        .select('id')
        .eq('boarding_id', boardingId)
        .eq('student_id', studentId)
        .maybeSingle()

    if (existing) {
        // Delete it
        const { error } = await supabase.from('saved_boardings').delete().eq('id', existing.id)
        if (error) throw error
        return { action: 'removed' }
    } else {
        // Add it
        const { error } = await supabase.from('saved_boardings').insert({ boarding_id: boardingId, student_id: studentId })
        if (error) throw error
        return { action: 'saved' }
    }
}

export async function getSavedBoardingsByStudent(studentId: string) {
    const { data, error } = await supabase
        .from('saved_boardings')
        .select('*, boardings(*)')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data
}

export async function checkIsSaved(boardingId: string, studentId: string) {
    const { data, error } = await supabase
        .from('saved_boardings')
        .select('id')
        .eq('boarding_id', boardingId)
        .eq('student_id', studentId)
        .maybeSingle()

    if (error) return false
    return !!data
}
