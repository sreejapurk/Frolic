import { query } from '@/lib/db'

function buildSearchQuery(category: string, subcategory: string): string {
  const subject = subcategory || category
  const queries: Record<string, string[]> = {
    Piano: ['pianist playing piano', 'piano practice studio', 'person at piano keys'],
    Guitar: ['guitarist playing acoustic guitar', 'guitar practice session', 'musician strumming guitar'],
    Vocals: ['singer performing microphone', 'vocalist singing studio', 'choir singing rehearsal'],
    Drums: ['drummer playing drums', 'drum kit practice', 'percussionist drumming'],
    Violin: ['violinist playing violin', 'violin practice', 'musician with violin bow'],
    Flute: ['flutist playing flute', 'flute music practice'],
    Ukulele: ['ukulele playing outdoors', 'person strumming ukulele'],
    Bass: ['bassist playing bass guitar', 'bass guitar practice'],
    Saxophone: ['saxophonist playing saxophone', 'sax player jazz'],
    Trumpet: ['trumpet player performing', 'brass musician trumpet'],
    Keyboard: ['keyboard player studio', 'synthesizer musician'],
    Harp: ['harpist playing harp', 'harp music concert'],
    Basketball: ['basketball players gym court', 'basketball game action', 'players shooting hoops'],
    Soccer: ['soccer players field action', 'football training grass', 'kids playing soccer'],
    Tennis: ['tennis player court action', 'tennis swing racket', 'doubles tennis match'],
    Swimming: ['swimmer pool lap', 'swimming training pool', 'athlete swimming freestyle'],
    Yoga: ['yoga class studio poses', 'people doing yoga mat', 'yoga instructor teaching group'],
    Pilates: ['pilates class reformer', 'pilates studio workout', 'core exercise mat'],
    Boxing: ['boxing training gym gloves', 'boxer punching bag', 'boxing sparring ring'],
    'Martial Arts': ['martial arts class dojo', 'karate training kick', 'judo sparring practice'],
    Golf: ['golfer swing course', 'golf lesson driving range', 'putting green golf'],
    Running: ['runners park trail', 'jogging city street', 'group running outdoors'],
    Cycling: ['cyclists riding bikes', 'spin class indoor cycling', 'cycling group road'],
    CrossFit: ['crossfit workout gym', 'functional fitness training', 'group workout barbells'],
    Gymnastics: ['gymnastics training gym', 'gymnast floor routine', 'acrobatics practice'],
    Skating: ['skaters ice rink', 'roller skating outdoors', 'figure skating practice'],
    Ballet: ['ballet dancers studio barre', 'ballet rehearsal stage', 'dancers ballet practice'],
    'Hip Hop': ['hip hop dancers practice', 'street dance crew', 'breakdance urban'],
    Salsa: ['salsa dancing couple', 'latin dance class', 'dancers salsa club'],
    Contemporary: ['contemporary dance rehearsal', 'modern dance studio', 'expressive dance performance'],
    Ballroom: ['ballroom dancing couple elegant', 'waltz dance floor', 'latin ballroom competition'],
    Jazz: ['jazz dance class studio', 'jazz dancers performing', 'dance jazz routine'],
    Tap: ['tap dancer rehearsal', 'tap dance class floor'],
    'K-Pop': ['dance class group choreography', 'group dance practice studio'],
    Zumba: ['zumba fitness class group', 'dance fitness workout', 'group exercise dancing'],
    Swing: ['swing dancing couple', 'lindy hop dance floor', 'jive dance'],
    'Belly Dance': ['belly dancer costume', 'belly dancing class studio'],
    Flamenco: ['flamenco dancer performance', 'flamenco dance dress'],
    Music: ['music class group lesson', 'musician teaching student', 'music practice room'],
    Sports: ['sports training session', 'athletes workout gym', 'coach training players'],
    Dance: ['dance class studio group', 'dancers rehearsal mirror', 'choreography practice'],
  }
  const options = queries[subject] || queries[category] || [`${subject} class people`, `${subject} training action`]
  return options[Math.floor(Math.random() * options.length)]
}

export async function generateAndStoreImage(title: string, category: string, subcategory: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY
  if (!accessKey) throw new Error('UNSPLASH_ACCESS_KEY not set')

  try {
    // Try progressively simpler queries until we get results
    const queries = [
      buildSearchQuery(category, subcategory),
      buildSearchQuery(category, ''),
      category === 'Music' ? 'music class children singing' : category === 'Dance' ? 'dance class studio' : 'fitness class group',
      'people taking a class together',
    ]

    let photo: any = null
    for (const searchQuery of queries) {
      const page = Math.floor(Math.random() * 2) + 1
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=20&page=${page}&orientation=landscape&content_filter=high`,
        { headers: { Authorization: `Client-ID ${accessKey}` } }
      )
      if (!res.ok) continue
      const data = await res.json()
      if (data.results && data.results.length > 0) {
        photo = data.results[Math.floor(Math.random() * data.results.length)]
        break
      }
    }

    if (!photo) throw new Error('No photos found after fallbacks')
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
