import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const parameterName = searchParams.get('name')

    const where: any = { wellId: params.id }
    if (parameterName) where.name = parameterName

    const parameters = await db.drillingParameter.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset
    })

    return NextResponse.json(parameters)
  } catch (error) {
    console.error('Error fetching drilling parameters:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drilling parameters' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { name, value, unit, status } = body

    if (!name || value === undefined || !unit) {
      return NextResponse.json(
        { error: 'Name, value, and unit are required' },
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

    const parameter = await db.drillingParameter.create({
      data: {
        wellId: params.id,
        name,
        value: parseFloat(value),
        unit,
        status: status || 'NORMAL'
      }
    })

    return NextResponse.json(parameter, { status: 201 })
  } catch (error) {
    console.error('Error creating drilling parameter:', error)
    return NextResponse.json(
      { error: 'Failed to create drilling parameter' },
      { status: 500 }
    )
  }
}