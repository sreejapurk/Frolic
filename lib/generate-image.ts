import { query } from '@/lib/db'

function buildSearchQuery(category: string, subcategory: string): string {
  const subject = subcategory || category
  const queries: Record<string, string[]> = {
    Piano: ['child learning piano teacher candid', 'piano lesson home authentic', 'student practicing piano keys real'],
    Guitar: ['guitar lesson student teacher candid', 'teenager learning acoustic guitar home', 'guitar practice bedroom real'],
    Vocals: ['singing lesson vocal coach candid', 'student singer microphone real', 'voice lesson authentic'],
    Drums: ['drum lesson kid candid', 'teenager drumming real moment', 'drum practice authentic'],
    Violin: ['violin lesson child teacher real', 'kid learning violin candid', 'violin practice authentic moment'],
    Flute: ['flute lesson student candid', 'child learning flute real'],
    Ukulele: ['ukulele lesson casual outdoor candid', 'person learning ukulele home real'],
    Bass: ['bass guitar lesson candid real', 'teenager learning bass guitar'],
    Saxophone: ['saxophone lesson student candid', 'learning sax real moment'],
    Trumpet: ['trumpet lesson child candid real', 'student learning trumpet authentic'],
    Keyboard: ['keyboard lesson student real candid', 'learning piano keyboard home authentic'],
    Harp: ['harp lesson student candid real', 'learning harp authentic moment'],
    Basketball: ['kids basketball practice candid gym', 'youth basketball training real', 'basketball coaching children authentic'],
    Soccer: ['kids soccer practice field candid', 'youth football training real outdoor', 'children soccer coaching authentic'],
    Tennis: ['tennis lesson kids coach candid', 'youth tennis practice real court', 'learning tennis authentic'],
    Swimming: ['swimming lesson kids pool candid', 'child learning swim real', 'swim coaching authentic pool'],
    Yoga: ['yoga class real people candid', 'group yoga session authentic community', 'yoga practice candid lifestyle'],
    Pilates: ['pilates class real people candid', 'pilates session authentic studio', 'core workout real people'],
    Boxing: ['boxing class real people candid', 'boxing training authentic gym candid', 'people boxing workout real'],
    'Martial Arts': ['martial arts kids class candid', 'karate children training real dojo', 'judo class authentic candid'],
    Golf: ['golf lesson candid real course', 'learning golf authentic outdoor', 'golf coaching real moment'],
    Running: ['group running candid park real', 'runners outdoor authentic community', 'jogging friends candid lifestyle'],
    Cycling: ['cycling group outdoor candid real', 'spin class real people authentic', 'bike riding candid community'],
    CrossFit: ['crossfit class real people candid', 'group workout authentic gym', 'functional training real community'],
    Gymnastics: ['gymnastics kids class candid real', 'children gymnastics training authentic', 'gymnastics practice real moment'],
    Skating: ['skating lesson kids candid rink', 'ice skating real people authentic', 'roller skating candid outdoor'],
    Ballet: ['ballet class children candid real', 'kids ballet lesson authentic studio', 'ballet practice real moment barre'],
    'Hip Hop': ['hip hop dance class candid real', 'street dance practice authentic', 'urban dance class real people'],
    Salsa: ['salsa dancing class real people candid', 'latin dance lesson authentic', 'couple salsa dancing candid real'],
    Contemporary: ['contemporary dance class real candid', 'modern dance practice authentic', 'dance rehearsal real moment'],
    Ballroom: ['ballroom dance lesson couple candid', 'waltz dancing class real authentic', 'dance class real people'],
    Jazz: ['jazz dance class real candid', 'dance class authentic studio real', 'jazz dancing candid people'],
    Tap: ['tap dance lesson kids candid real', 'tap dancing class authentic'],
    'K-Pop': ['dance class group practice candid real', 'group choreography practice authentic studio'],
    Zumba: ['zumba class real people candid fun', 'dance fitness group authentic candid', 'group exercise dancing real'],
    Swing: ['swing dance class couple candid real', 'lindy hop dancing authentic real'],
    'Belly Dance': ['belly dance class women candid real', 'belly dancing lesson authentic'],
    Flamenco: ['flamenco class candid real authentic', 'flamenco dance practice real moment'],
    Music: ['music lesson child teacher candid real', 'music class authentic kids learning', 'instrument lesson real moment'],
    Sports: ['sports coaching kids candid real', 'youth training session authentic', 'coach teaching children real'],
    Dance: ['dance class real people candid', 'dance lesson authentic studio', 'people dancing class real moment'],
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
      category === 'Music' ? 'music lesson child teacher candid real' : category === 'Dance' ? 'dance class real people candid' : 'sports coaching kids candid real',
      'learning class candid real people authentic',
    ]

    let photo: any = null
    for (const searchQuery of queries) {
      const page = Math.floor(Math.random() * 2) + 1
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=20&page=${page}&orientation=landscape&content_filter=high&order_by=relevant`,
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
