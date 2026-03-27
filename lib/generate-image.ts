import { query } from '@/lib/db'

function buildPrompt(title: string, category: string, subcategory: string): string {
  const subject = subcategory || category
  const prompts: Record<string, string> = {
    Piano: 'person playing grand piano in a warm cozy music studio, natural window light, hands on keys, shallow depth of field, candid moment',
    Guitar: 'person strumming acoustic guitar in a relaxed music room, warm lamp light, casual and natural, candid photo',
    Vocals: 'singing lesson in a small cozy studio, teacher and student facing each other, natural expressions, warm lighting',
    Drums: 'drummer mid-performance at a drum kit in a rehearsal studio, motion blur on sticks, energetic and candid',
    Violin: 'violinist playing in a sunlit music studio, bow in motion, focused expression, natural window light',
    Flute: 'flute lesson in a bright airy room, instructor guiding student, warm afternoon light, candid',
    Ukulele: 'person playing ukulele outdoors on a porch, relaxed and smiling, golden hour light, natural and candid',
    Bass: 'bass guitarist in a dim rehearsal room, focused on fingering, atmospheric moody lighting',
    Saxophone: 'saxophonist playing in a warmly lit jazz lounge, soulful expression, cinematic lighting',
    Trumpet: 'trumpet player in a music studio, cheeks puffed mid-note, natural candid moment',
    Keyboard: 'person playing keyboard in a modern home studio setup, focused, warm desk lamp lighting',
    Harp: 'harpist playing a large harp in a bright elegant room, graceful hands, natural light',
    Basketball: 'basketball practice in a gym, player driving to the hoop, motion blur, dynamic action shot',
    Soccer: 'soccer drill on green turf, player kicking ball mid-stride, natural outdoor lighting',
    Tennis: 'tennis lesson on an outdoor court, coach demonstrating backhand, natural sunlight',
    Swimming: 'swimming lesson in a bright indoor pool, student and coach in water, water splashing naturally',
    Yoga: 'yoga class in a sunlit studio, people on mats in warrior pose, morning light through windows, calm atmosphere',
    Pilates: 'pilates reformer class in a clean bright studio, instructor adjusting student form, natural light',
    Boxing: 'boxing training session, person hitting pads with trainer, sweat and motion, gym lighting',
    'Martial Arts': 'martial arts class in a dojo, students in white gi practicing kata, focused expressions',
    Golf: 'golf lesson on a sunny driving range, instructor watching student mid-swing, natural outdoor light',
    Running: 'group running on a park path, early morning light, motion and energy, candid and natural',
    Cycling: 'spin class in a dark studio with dramatic lighting, riders pushing hard, sweat and energy',
    CrossFit: 'crossfit training in an open gym, person doing kettlebell swings, gritty and energetic',
    Gymnastics: 'gymnastics class in a bright gym, child on balance beam with coach spotting, natural and candid',
    Skating: 'ice skating lesson on a rink, coach holding student hands while gliding, natural arena light',
    Ballet: 'ballet class at the barre in a mirrored studio, dancers in pink leotards, morning light, graceful',
    'Hip Hop': 'hip hop dance class in a mirrored studio, group mid-choreography, energetic motion, candid',
    Salsa: 'salsa dance class with couples dancing, colorful outfits, warm evening light, joyful expressions',
    Contemporary: 'contemporary dance rehearsal in a spacious studio, dancer mid-leap, natural light, artistic',
    Ballroom: 'ballroom dancing lesson, couple in hold doing waltz, elegant studio, soft warm light',
    Jazz: 'jazz dance class in a studio, dancer mid-kick, mirrors reflecting, energetic and candid',
    Tap: 'tap dance class on hardwood floor, close shot of feet in tap shoes mid-step, motion blur',
    'K-Pop': 'k-pop dance class in a modern studio, group of young people learning choreography, fun and energetic',
    Zumba: 'zumba class in a bright gym, group of people dancing and laughing, vibrant energy, candid',
    Swing: 'swing dance class in a retro hall, couple being spun, joyful expressions, warm vintage lighting',
    'Belly Dance': 'belly dance class in a studio, dancer with flowing scarf, graceful movement, warm candlelit atmosphere',
    Flamenco: 'flamenco dance class, dancer in red dress mid-stomp, dramatic lighting, passionate expression',
    Music: 'music lesson in a warm cozy studio, instructor and student with instruments, natural light',
    Sports: 'athletic training session in a modern gym, coach and athlete, natural and candid',
    Dance: 'dance class in a sunlit mirrored studio, students learning together, natural and joyful',
  }

  const base = prompts[subject] || prompts[category] || `${subject} class in a warm natural setting, candid and realistic`
  return `${base}, photorealistic, shot on Sony A7, 35mm lens, natural lighting, no text, no watermarks, cinematic`
}

export async function generateAndStoreImage(title: string, category: string, subcategory: string): Promise<string | null> {
  try {
    const prompt = buildPrompt(title, category, subcategory)
    const encoded = encodeURIComponent(prompt)
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=768&nologo=true&enhance=true`

    const res = await fetch(url, { signal: AbortSignal.timeout(60000) })
    if (!res.ok) return null

    const buffer = await res.arrayBuffer()
    const b64 = Buffer.from(buffer).toString('base64')
    const mimeType = res.headers.get('content-type') || 'image/jpeg'

    const result = await query(
      'INSERT INTO images (data, mime_type) VALUES ($1, $2) RETURNING id',
      [b64, mimeType]
    )
    return `/api/images/${result.rows[0].id}`
  } catch (err) {
    console.error('Image generation failed:', err)
    return null
  }
}
