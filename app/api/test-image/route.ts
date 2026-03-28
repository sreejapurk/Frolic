import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const url = 'https://image.pollinations.ai/prompt/a%20guitar%20lesson%20in%20a%20music%20studio?width=512&height=512&nologo=true'
    const res = await fetch(url)
    const contentType = res.headers.get('content-type') || 'none'
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      contentType,
      size: res.headers.get('content-length'),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
