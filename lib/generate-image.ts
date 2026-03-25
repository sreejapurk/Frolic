import { query } from '@/lib/db'

function buildPrompt(title: string, category: string, subcategory: string): string {
  const subject = subcategory || category
  const prompts: Record<string, string> = {
    Piano: 'a pianist playing a grand piano in a bright music studio, sheet music visible, warm lighting',
    Guitar: 'a guitarist playing acoustic guitar in a cozy music studio, natural light',
    Vocals: 'a vocal coach and student singing together in a professional recording studio',
    Drums: 'a drummer playing a full drum kit in a soundproofed music studio, dynamic energy',
    Violin: 'a violinist playing in an elegant music studio, bow in motion, warm lighting',
    Flute: 'a flute lesson in a bright airy music studio, instructor and student together',
    Ukulele: 'a ukulele class with students strumming in a cheerful bright studio',
    Bass: 'a bass guitar lesson in a modern music studio, focused instructor',
    Saxophone: 'a saxophonist playing in a jazz studio, moody professional lighting',
    Trumpet: 'a trumpet lesson in a music studio, brass instrument gleaming',
    Keyboard: 'a keyboard lesson in a modern music studio, digital piano, bright and inviting',
    Harp: 'a harpist playing a large concert harp in an elegant music studio',
    Basketball: 'a basketball training class on a bright indoor court, players dribbling and shooting',
    Soccer: 'a soccer coaching session on a green indoor turf field, active players',
    Tennis: 'a tennis lesson on a clean indoor court, instructor demonstrating serve technique',
    Swimming: 'a swimming lesson in a bright indoor pool, instructor guiding student through strokes',
    Yoga: 'a yoga class in a serene studio with natural light, students in poses on mats',
    Pilates: 'a pilates class in a modern bright studio, reformer machines, focused participants',
    Boxing: 'a boxing training session in a professional gym, gloves and pads, energetic atmosphere',
    'Martial Arts': 'a martial arts class in a dojo, students in uniforms practicing techniques',
    Golf: 'a golf lesson on an indoor driving range, instructor coaching swing technique',
    Running: 'a running coaching session on an indoor track, athletic form and energy',
    Cycling: 'a spin cycling class in a dark energetic studio with neon lights and bikes',
    CrossFit: 'a crossfit class in a bright gym, athletes doing functional movements together',
    Gymnastics: 'a gymnastics class in a bright gym with mats and equipment, graceful movement',
    Skating: 'a skating lesson on a smooth ice rink, bright arena lighting',
    Ballet: 'a ballet class in a beautiful mirrored dance studio, barre exercises, graceful dancers',
    'Hip Hop': 'a hip hop dance class in a modern dance studio with mirrors, energetic group',
    Salsa: 'a salsa dancing class with couples dancing in a vibrant colorful studio',
    Contemporary: 'a contemporary dance class in a spacious studio, expressive movement, natural light',
    Ballroom: 'an elegant ballroom dancing class in a grand studio, couples in hold',
    Jazz: 'a jazz dance class in a mirrored studio, dynamic poses and energy',
    Tap: 'a tap dance class on a wooden floor studio, feet in motion',
    'K-Pop': 'a K-Pop dance class in a modern mirrored studio, group learning choreography',
    Zumba: 'a Zumba fitness class in a bright dance studio, energetic group dancing',
    Swing: 'a swing dancing class with joyful couples in a retro-styled dance hall',
    'Belly Dance': 'a belly dance class in a colorful exotic studio, flowing scarves and graceful moves',
    Flamenco: 'a flamenco dance class in a Spanish-style studio, dramatic poses and footwork',
    Music: 'a music class in a bright modern music studio with instruments',
    Sports: 'an athletic training class in a professional sports facility, energetic participants',
    Dance: 'a dance class in a beautiful mirrored dance studio, students learning choreography',
  }

  const base = prompts[subject] || prompts[category] || `a ${subject} class in a professional modern studio`
  return `Professional high-quality commercial photography of ${base}. ${title}. Realistic, vibrant, well-lit, inviting atmosphere. No text or logos.`
}

export async function generateAndStoreImage(title: string, category: string, subcategory: string): Promise<string | null> {
  if (!process.env.OPENAI_API_KEY) return null

  try {
    const prompt = buildPrompt(title, category, subcategory)

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json',
      }),
    })

    const data = await res.json()
    const b64 = data.data?.[0]?.b64_json
    if (!b64) return null

    const result = await query(
      'INSERT INTO images (data, mime_type) VALUES ($1, $2) RETURNING id',
      [b64, 'image/png']
    )
    return `/api/images/${result.rows[0].id}`
  } catch (err) {
    console.error('Image generation failed:', err)
    return null
  }
}
