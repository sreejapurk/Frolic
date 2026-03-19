import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const input = req.nextUrl.searchParams.get('input')
  if (!input) return NextResponse.json({ suggestions: [] })

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${process.env.GOOGLE_MAPS_API_KEY}&types=establishment|geocode`
  const res = await fetch(url)
  const data = await res.json()

  const suggestions = (data.predictions || []).map((p: any) => ({
    description: p.description,
    place_id: p.place_id,
  }))

  return NextResponse.json({ suggestions })
}
