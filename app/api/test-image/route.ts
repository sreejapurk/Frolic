import { NextResponse } from 'next/server'

export async function GET() {
  const results: any = {}

  // Test 1: basic outbound request
  try {
    const r = await fetch('https://httpbin.org/get')
    results.outbound = { status: r.status, ok: r.ok }
  } catch (e: any) {
    results.outbound = { error: e.message }
  }

  // Test 2: Pollinations simple URL
  try {
    const r = await fetch('https://image.pollinations.ai/prompt/guitar')
    const ct = r.headers.get('content-type') || ''
    results.pollinations = { status: r.status, ok: r.ok, contentType: ct }
  } catch (e: any) {
    results.pollinations = { error: e.message }
  }

  // Test 3: Pollinations with params
  try {
    const r = await fetch('https://image.pollinations.ai/prompt/guitar%20lesson?width=512&height=512&nologo=true')
    const ct = r.headers.get('content-type') || ''
    results.pollinationsWithParams = { status: r.status, ok: r.ok, contentType: ct }
  } catch (e: any) {
    results.pollinationsWithParams = { error: e.message }
  }

  return NextResponse.json(results)
}
