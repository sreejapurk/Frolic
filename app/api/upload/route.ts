import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { getStudioSession } from '@/lib/studio-auth'

export async function POST(req: NextRequest) {
  const session = await getStudioSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024)
    return NextResponse.json({ error: 'File too large. Max 5MB.' }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  const mimeType = file.type

  const result = await query(
    'INSERT INTO images (data, mime_type) VALUES ($1, $2) RETURNING id',
    [base64, mimeType]
  )

  const id = result.rows[0].id
  return NextResponse.json({ url: `/api/images/${id}` })
}
