import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Preserve image and studio_user_id from existing Brooklyn Music Workshop entry
  const existing = await query(
    `SELECT studio_user_id, image FROM classes WHERE studio ILIKE '%Brooklyn%Workshop%' AND status IS DISTINCT FROM 'deleted' LIMIT 1`,
    []
  )
  const studioUserId = existing.rows[0]?.studio_user_id || null
  const existingImage = existing.rows[0]?.image || null

  // Soft-delete all existing Brooklyn Music Workshop classes
  await query(
    `UPDATE classes SET status = 'deleted' WHERE studio ILIKE '%Brooklyn%Workshop%'`,
    []
  )

  const STUDIO = 'Brooklyn Music Workshop'
  const ROOM = '379 Baltic St, Brooklyn, NY 11201'

  const SHANE_BG = `Shane Allessio has been teaching music since his Berklee College of Music days in the early 2000's. He loves sharing his passion for music with kids and adults of all levels. Jazz is his main groove, but he's spent time with classical orchestras, funk and blues bands, a Tool cover band and everything in between. Find out more at shaneallessio.com and search "Shane Allessio" on your favorite streaming service.`
  const ANTHONY_BG = `Anthony is a passionate, skilled and methodical teacher of piano, woodwinds and brass instruments.`
  const LOU_BG = `Lou Barker is a violinist, guitarist, writer, and teacher living and working in Brooklyn. With a background in classical and folk music as well as a passion for music by living composers and interdisciplinary performance, Lou feels strongly about meeting students at their interests and developing very personalized lessons. Lou received an MM at NYU and a BM at University of Iowa.`

  const classes = [
    {
      title: 'Guitar, Bass Guitar, Double Bass, Drums or Young Beginner (age 2-6) - Private Intro Class',
      instructor: 'Shane Allessio',
      description: "Kids 7+ and adults (or 2-6 for Young Beginner) of any level can meet the teacher, see the space, get started on some basics if you're a beginner, or do an assessment if you have any experience. You'll discuss goals, discuss a practice routine and decide on a course moving forward.",
      instructor_background: SHANE_BG,
      level: 'All Levels',
      slots: [
        { date: '2026-06-08', time: '2:15 PM', duration: '45 min' },
        { date: '2026-06-09', time: '3:15 PM', duration: '45 min' },
        { date: '2026-06-04', time: '1:30 PM', duration: '45 min' },
        { date: '2026-06-04', time: '4:30 PM', duration: '45 min' },
      ],
    },
    {
      title: 'Young Beginner (age 2-6) Private Intro Class',
      instructor: 'Shane Allessio',
      description: "Kids age 2-6 can meet the teacher, see the space, sing some songs, play some games and instruments and see how it goes. We'll all discuss the young beginner program and decide on a course moving forward. Intro is private. Weekly lessons may be private or in small groups.",
      instructor_background: SHANE_BG,
      level: 'Beginner',
      slots: [
        { date: '2026-06-08', time: '3:30 PM', duration: '30 min' },
        { date: '2026-06-08', time: '4:45 PM', duration: '30 min' },
      ],
    },
    {
      title: 'Guitar, Bass Guitar, Double Bass or Drums - Private Intro Class',
      instructor: 'Shane Allessio',
      description: "Kids 7+ and adults of any level can meet the teacher, see the space, get started on some basics if you're a beginner, or do an assessment if you have any experience. You'll discuss goals, discuss a practice routine and decide on a course moving forward.",
      instructor_background: SHANE_BG,
      level: 'All Levels',
      slots: [
        { date: '2026-06-04', time: '7:30 PM', duration: '45 min' },
      ],
    },
    {
      title: 'Piano, Saxophone, Flute, Clarinet, Trumpet or Trombone - Private Intro Lesson',
      instructor: 'Anthony Martinez',
      description: "Kids 7+ and adults of any level can meet the teacher, see the space, get started on some basics if you're a beginner, or do an assessment if you have any experience. You'll discuss goals, discuss a practice routine and decide on a course moving forward.",
      instructor_background: ANTHONY_BG,
      level: 'All Levels',
      slots: [
        { date: '2026-06-08', time: '6:30 PM', duration: '45 min' },
        { date: '2026-06-06', time: '1:45 PM', duration: '45 min' },
      ],
    },
    {
      title: 'Piano, Saxophone, Flute, Clarinet, Trumpet or Trombone - Private Intro Lesson for Kids',
      instructor: 'Anthony Martinez',
      description: "Kids age 7-12 of any level can meet the teacher, see the space, get started on some basics if you're a beginner, or do an assessment if you have any experience. You'll discuss goals, discuss a practice routine and decide on a course moving forward.",
      instructor_background: ANTHONY_BG,
      level: 'All Levels',
      slots: [
        { date: '2026-06-05', time: '4:30 PM', duration: '30 min' },
      ],
    },
    {
      title: 'Violin, Viola or Guitar - Private Intro Class',
      instructor: 'Lou Barker',
      description: "Kids age 7-12 of any level can meet the teacher, see the space, get started on some basics if you're a beginner, or do an assessment if you have any experience. You'll discuss goals, discuss a practice routine and decide on a course moving forward.",
      instructor_background: LOU_BG,
      level: 'All Levels',
      slots: [
        { date: '2026-06-05', time: '11:00 AM', duration: '45 min' },
      ],
    },
  ]

  const inserted = []
  for (const cls of classes) {
    const id = uuidv4()
    const first = cls.slots[0]
    await query(
      `INSERT INTO classes
        (id, title, studio, category, price, level, duration, date, time, spots, spots_left,
         distance, image, instructor, room, recurring, status, description,
         location_type, location_types, price_location, instructor_background, studio_user_id)
       VALUES
        ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$10,
         '',$11,$12,$13,$14,'active',$15,
         'location','{location}',$5,$16,$17)`,
      [
        id, cls.title, STUDIO, 'Music', 19.99, cls.level, first.duration, first.date, first.time, 1,
        existingImage, cls.instructor, ROOM, true, cls.description,
        cls.instructor_background, studioUserId,
      ]
    )
    for (const slot of cls.slots) {
      await query(
        `INSERT INTO class_slots (class_id, date, time, duration, spots, spots_left) VALUES ($1,$2,$3,$4,$5,$5)`,
        [id, slot.date, slot.time, slot.duration, 1]
      )
    }
    inserted.push({ title: cls.title, slots: cls.slots.length })
  }

  return NextResponse.json({ ok: true, inserted })
}
