import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  try {
    const { ageGroup, category, subcategory, level, freeText } = await req.json()

    // Fetch all active classes
    const result = await query(
      `SELECT id, title, instructor, category, subcategory, level, description, price
       FROM classes
       WHERE status IS DISTINCT FROM 'deleted'
       ORDER BY created_at DESC`,
      []
    )

    if (result.rows.length === 0) {
      return NextResponse.json([])
    }

    const classList = result.rows.map(c => ({
      id: c.id,
      title: c.title,
      instructor: c.instructor,
      category: c.category,
      subcategory: c.subcategory,
      level: c.level,
      description: c.description,
      price: c.price,
    }))

    const preferences = [
      ageGroup && `Age group: ${ageGroup}`,
      category && `Category: ${category}`,
      subcategory && `Specific interest: ${subcategory}`,
      level && `Experience level: ${level}`,
      freeText && `Additional details: ${freeText}`,
    ].filter(Boolean).join('\n')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: `You are a class matching assistant for Frolic, a marketplace for music, sports, and dance classes.

A student has these preferences:
${preferences}

Available classes:
${JSON.stringify(classList, null, 2)}

Return the top 3 to 5 best matching classes as a JSON array. Format:
[{"id": "uuid", "reason": "One sentence explaining why this is a great match for them."}]

Consider: age appropriateness, level match, relevance to interests, and variety. Only return the JSON array, nothing else.`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '[]'
    const matches: { id: string; reason: string }[] = JSON.parse(text)
    const matchedIds = matches.map(m => m.id)

    // Fetch full class data including slots for matched classes
    const fullResult = await query(
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
       WHERE c.id = ANY($1)
       GROUP BY c.id`,
      [matchedIds]
    )

    const ranked = matchedIds
      .map(id => {
        const cls = fullResult.rows.find(r => r.id === id)
        if (!cls) return null
        return { ...cls, matchReason: matches.find(m => m.id === id)?.reason || '' }
      })
      .filter(Boolean)

    return NextResponse.json(ranked)
  } catch (err: any) {
    console.error('Match error:', err)
    return NextResponse.json({ error: 'Matching failed' }, { status: 500 })
  }
}
