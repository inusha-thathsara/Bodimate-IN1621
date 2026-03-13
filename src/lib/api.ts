import { createClient } from './supabase/client'
import { Database } from '@/types/database.types'

type BoardingRow = Database['public']['Tables']['boardings']['Row']
type BoardingInsert = Database['public']['Tables']['boardings']['Insert']
type BoardingUpdate = Database['public']['Tables']['boardings']['Update']

type ReviewRow = Database['public']['Tables']['reviews']['Row']
type ReviewInsert = Database['public']['Tables']['reviews']['Insert']
type NotificationRow = Database['public']['Tables']['notifications']['Row']
type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

const supabase = createClient()

async function createNotification(notification: NotificationInsert) {
    const { error } = await supabase
        .from('notifications')
        .insert(notification)

    if (error) {
        console.error('Failed to create notification:', error)
    }
}

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

    const [{ data: boardingData }, { data: actorData }] = await Promise.all([
        supabase
            .from('boardings')
            .select('id, owner_id, title')
            .eq('id', review.boarding_id)
            .single(),
        supabase
            .from('users')
            .select('full_name')
            .eq('id', review.student_id)
            .single(),
    ])

    if (boardingData?.owner_id && boardingData.owner_id !== review.student_id) {
        const actorName = actorData?.full_name || 'A student'
        await createNotification({
            recipient_id: boardingData.owner_id,
            actor_id: review.student_id,
            boarding_id: boardingData.id,
            type: 'REVIEW_CREATED',
            title: 'New review received',
            message: `${actorName} added a ${review.rating}-star review for ${boardingData.title}.`,
        })
    }

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

    const [{ data: boardingData }, { data: actorData }] = await Promise.all([
        supabase
            .from('boardings')
            .select('id, owner_id, title')
            .eq('id', boardingId)
            .single(),
        supabase
            .from('users')
            .select('full_name')
            .eq('id', studentId)
            .single(),
    ])

    if (boardingData?.owner_id && boardingData.owner_id !== studentId) {
        const actorName = actorData?.full_name || 'A student'
        await createNotification({
            recipient_id: boardingData.owner_id,
            actor_id: studentId,
            boarding_id: boardingData.id,
            type: 'REQUEST_CREATED',
            title: 'New booking request',
            message: `${actorName} requested to book ${boardingData.title}.`,
        })
    }

    return data
}

// Notifications API
export async function getNotificationsByUser(recipientId: string, limit = 12) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', recipientId)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data as NotificationRow[]
}

export async function markNotificationRead(notificationId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)

    if (error) throw error
    return true
}

export async function markAllNotificationsRead(recipientId: string) {
    const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', recipientId)
        .eq('is_read', false)

    if (error) throw error
    return true
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

export async function getRequestForStudentBoarding(boardingId: string, studentId: string) {
    const { data, error } = await supabase
        .from('requests')
        .select('id, status')
        .eq('boarding_id', boardingId)
        .eq('student_id', studentId)
        .maybeSingle()

    if (error) return null
    return data
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

    const [{ data: requestData }, { data: boardingData }] = await Promise.all([
        supabase
            .from('requests')
            .select('student_id, boarding_id')
            .eq('id', id)
            .single(),
        supabase
            .from('boardings')
            .select('id, title')
            .eq('id', data.boarding_id)
            .single(),
    ])

    if (requestData?.student_id && boardingData?.id) {
        const statusLabel = status === 'ACCEPTED' ? 'accepted' : status === 'REJECTED' ? 'rejected' : 'updated'
        await createNotification({
            recipient_id: requestData.student_id,
            boarding_id: boardingData.id,
            type: 'REQUEST_STATUS_UPDATED',
            title: 'Booking request update',
            message: `Your booking request for ${boardingData.title} was ${statusLabel}.`,
        })
    }

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

        const [{ data: boardingData }, { data: actorData }] = await Promise.all([
            supabase
                .from('boardings')
                .select('id, owner_id, title')
                .eq('id', boardingId)
                .single(),
            supabase
                .from('users')
                .select('full_name')
                .eq('id', studentId)
                .single(),
        ])

        if (boardingData?.owner_id && boardingData.owner_id !== studentId) {
            const actorName = actorData?.full_name || 'A student'
            await createNotification({
                recipient_id: boardingData.owner_id,
                actor_id: studentId,
                boarding_id: boardingData.id,
                type: 'LISTING_SAVED',
                title: 'Listing saved',
                message: `${actorName} saved your listing ${boardingData.title}.`,
            })
        }

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
