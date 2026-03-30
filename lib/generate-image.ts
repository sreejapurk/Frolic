import { query } from '@/lib/db'

function buildSearchQuery(category: string, subcategory: string): string {
  const subject = subcategory || category
  const queries: Record<string, string> = {
    Piano: 'piano lesson',
    Guitar: 'guitar lesson',
    Vocals: 'singing lesson',
    Drums: 'drumming lesson',
    Violin: 'violin music',
    Flute: 'flute music',
    Ukulele: 'ukulele playing',
    Bass: 'bass guitar',
    Saxophone: 'saxophone jazz',
    Trumpet: 'trumpet music',
    Keyboard: 'keyboard piano',
    Harp: 'harp music',
    Basketball: 'basketball training',
    Soccer: 'soccer training',
    Tennis: 'tennis lesson',
    Swimming: 'swimming lesson',
    Yoga: 'yoga class',
    Pilates: 'pilates class',
    Boxing: 'boxing training',
    'Martial Arts': 'martial arts class',
    Golf: 'golf lesson',
    Running: 'running jogging',
    Cycling: 'cycling class',
    CrossFit: 'crossfit workout',
    Gymnastics: 'gymnastics class',
    Skating: 'ice skating',
    Ballet: 'ballet class',
    'Hip Hop': 'hip hop dance',
    Salsa: 'salsa dance',
    Contemporary: 'contemporary dance',
    Ballroom: 'ballroom dancing',
    Jazz: 'jazz dance',
    Tap: 'tap dance',
    'K-Pop': 'dance class',
    Zumba: 'zumba fitness',
    Swing: 'swing dance',
    'Belly Dance': 'belly dance',
    Flamenco: 'flamenco dance',
    Music: 'music lesson',
    Sports: 'sports training',
    Dance: 'dance class',
  }
  return queries[subject] || queries[category] || `${subject} class`
}

export async function generateAndStoreImage(title: string, category: string, subcategory: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) throw new Error('UNSPLASH_ACCESS_KEY not set')

  try {
    const searchQuery = buildSearchQuery(category, subcategory)
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=10&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    )
    if (!res.ok) throw new Error(`Unsplash API returned ${res.status}`)

    const data = await res.json()
    if (!data.results || data.results.length === 0) throw new Error('No photos found')

    const photo = data.results[Math.floor(Math.random() * data.results.length)]
    const imageUrl = photo.urls.regular

    // Download and store in DB
    const imgRes = await fetch(imageUrl)
    if (!imgRes.ok) throw new Error('Failed to download image')

    const buffer = await imgRes.arrayBuffer()
    const b64 = Buffer.from(buffer).toString('base64')
    const mimeType = imgRes.headers.get('content-type') || 'image/jpeg'

    const result = await query(
      'INSERT INTO images (data, mime_type) VALUES ($1, $2) RETURNING id',
      [b64, mimeType]
    )
    return `/api/images/${result.rows[0].id}`
  } catch (err: any) {
    console.error('Image generation failed:', err?.message || err)
    throw err
  }
}
