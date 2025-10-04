import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const logType = searchParams.get('type')
    const minDepth = searchParams.get('minDepth')
    const maxDepth = searchParams.get('maxDepth')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { wellId: params.id }
    if (logType) where.logType = logType
    if (minDepth) where.depth = { gte: parseFloat(minDepth) }
    if (maxDepth) {
      where.depth = { 
        ...where.depth,
        lte: parseFloat(maxDepth)
      }
    }

    const logs = await db.wellLog.findMany({
      where,
      orderBy: [
        { depth: 'asc' },
        { timestamp: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    return NextResponse.json(logs)
  } catch (error) {
    console.error('Error fetching well logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch well logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { logType, depth, value, unit } = body

    if (!logType || depth === undefined || value === undefined || !unit) {
      return NextResponse.json(
        { error: 'Log type, depth, value, and unit are required' },
        { status: 400 }
      )
    }

    // Check if well exists
    const well = await db.well.findUnique({
      where: { id: params.id }
    })

    if (!well) {
      return NextResponse.json(
        { error: 'Well not found' },
        { status: 404 }
      )
    }

    const log = await db.wellLog.create({
      data: {
        wellId: params.id,
        logType,
        depth: parseFloat(depth),
        value: parseFloat(value),
        unit
      }
    })

    return NextResponse.json(log, { status: 201 })
  } catch (error) {
    console.error('Error creating well log:', error)
    return NextResponse.json(
      { error: 'Failed to create well log' },
      { status: 500 }
    )
  }
}