import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { wellId: params.id }
    if (type) where.type = type
    if (status) where.status = status

    const operations = await db.operation.findMany({
      where,
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json(operations)
  } catch (error) {
    console.error('Error fetching operations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch operations' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { type, description, startTime, endTime, status, result } = body

    if (!type || !startTime) {
      return NextResponse.json(
        { error: 'Type and start time are required' },
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

    const operation = await db.operation.create({
      data: {
        wellId: params.id,
        type,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        status: status || 'PLANNED',
        result
      }
    })

    return NextResponse.json(operation, { status: 201 })
  } catch (error) {
    console.error('Error creating operation:', error)
    return NextResponse.json(
      { error: 'Failed to create operation' },
      { status: 500 }
    )
  }
}