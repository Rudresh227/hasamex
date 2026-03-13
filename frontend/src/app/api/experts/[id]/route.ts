import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('experts')
      .select(`
        *,
        sector:lookup_values(category="sector"),
        region:lookup_values(category="region"),
        status:lookup_values(category="expert_status"),
        employment_history(expert_employment(*)),
        rates(expert_rates(*)),
        files(expert_files(*))
      `)
      .eq('id', params.id)
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch expert' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const expertData = await request.json()
    
    const { data, error } = await supabase
      .from('experts')
      .update(expertData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update expert' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('experts')
      .update({ is_deleted: true })
      .eq('id', params.id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete expert' }, { status: 500 })
  }
}
