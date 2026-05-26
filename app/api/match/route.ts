import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

function buildReason(c: any, category: string, subcategory: string, level: string, ageGroup: string): string {
  const parts: string[] = []
  if (subcategory && c.subcategory?.toLowerCase() === subcategory.toLowerCase())
    parts.push(`${c.subcategory} class`)
  else if (category && c.category?.toLowerCase() === category.toLowerCase())
    parts.push(`${c.category} class`)
  if (c.instructor) parts.push(`taught by ${c.instructor}`)
  if (level && c.level?.toLowerCase() === level.toLowerCase())
    parts.push(`${c.level.toLowerCase()} level — a great fit`)
  else if (c.level)
    parts.push(`${c.level.toLowerCase()} level`)
  if (ageGroup.includes('Child') && c.description?.toLowerCase().includes('kid'))
    parts.push('welcoming for children')
  return parts.length > 0 ? parts.join(', ') + '.' : `A strong match based on your preferences.`
}

export async function POST(req: NextRequest) {
  try {
    const { ageGroup, category, subcategory, level, freeText } = await req.json()

    const result = await query(
      `SELECT c.*,
        COALESCE(
          json_agg(
            json_build_object('id', s.id, 'date', s.date, 'time', s.time, 'duration', s.duration, 'spots', s.spots, 'spots_left', s.spots_left, 'label', s.label)
            ORDER BY s.time
          ) FILTER (WHERE s.id IS NOT NULL),
          '[]'::json
        ) as slots
       FROM classes c
       LEFT JOIN class_slots s ON s.class_id = c.id
       WHERE c.status IS DISTINCT FROM 'deleted'
       GROUP BY c.id`,
      []
    )

    const freeTextLower = freeText?.toLowerCase() || ''

    const scored = result.rows.map(c => {
      let score = 0

      // Category match
      if (category && c.category?.toLowerCase() === category.toLowerCase()) score += 40
      // Subcategory match
      if (subcategory && c.subcategory?.toLowerCase() === subcategory.toLowerCase()) score += 35
      // Level match
      if (level && c.level?.toLowerCase() === level.toLowerCase()) score += 20
      // Beginner bonus: if no level specified or beginner, prefer beginner-friendly
      if (!level && c.level?.toLowerCase() === 'beginner') score += 5
      // Free text keyword match against title/description/instructor
      if (freeTextLower) {
        const haystack = `${c.title} ${c.description || ''} ${c.instructor || ''}`.toLowerCase()
        freeTextLower.split(/\s+/).forEach((word: string) => {
          if (word.length > 3 && haystack.includes(word)) score += 10
        })
      }
      // Age group hints
      if (ageGroup.includes('Child')) {
        const text = `${c.title} ${c.description || ''}`.toLowerCase()
        if (text.includes('kid') || text.includes('child') || text.includes('junior') || text.includes('youth')) score += 15
      }
      // Spots available bonus
      const totalSpots = (c.slots || []).reduce((s: number, sl: any) => s + (sl.spots_left || 0), 0) || c.spots_left || 0
      if (totalSpots > 0) score += 5

      return { ...c, score }
    })

    // Sort by score, take top 5
    const top = scored
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(c => ({ ...c, matchReason: buildReason(c, category, subcategory, level, ageGroup) }))

    return NextResponse.json(top)
  } catch (err: any) {
    console.error('Match error:', err)
    return NextResponse.json({ error: 'Matching failed' }, { status: 500 })
  }
}
