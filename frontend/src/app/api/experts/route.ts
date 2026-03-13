import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('experts')
      .select(`
        *,
        sector:lookup_values(category="sector"),
        region:lookup_values(category="region"),
        status:lookup_values(category="expert_status")
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch experts' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const expertData = await request.json()
    
    // Generate expert_id if not provided
    if (!expertData.expert_id) {
      expertData.expert_id = `EXP-${Date.now()}`
    }

    const { data, error } = await supabase
      .from('experts')
      .insert([expertData])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create expert' }, { status: 500 })
  }
}
