import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const field = searchParams.get('field')

    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (field) where.field = { contains: field, mode: 'insensitive' }

    const wells = await db.well.findMany({
      where,
      include: {
        drillingParameters: {
          orderBy: { timestamp: 'desc' },
          take: 1
        },
        operations: {
          orderBy: { startTime: 'desc' },
          take: 1
        }
      },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' }
    })

    const total = await db.well.count({ where })

    return NextResponse.json({
      data: wells,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching wells:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wells' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      location,
      field,
      status,
      depth,
      targetDepth,
      temperature,
      pressure,
      flowRate,
      witsmlVersion,
      latitude,
      longitude,
      operator,
      contractor,
      spudDate
    } = body

    // Validate required fields
    if (!name || !location || depth === undefined) {
      return NextResponse.json(
        { error: 'Name, location, and depth are required' },
        { status: 400 }
      )
    }

    const well = await db.well.create({
      data: {
        name,
        location,
        field,
        status,
        depth: parseFloat(depth),
        targetDepth: targetDepth ? parseFloat(targetDepth) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        pressure: pressure ? parseFloat(pressure) : null,
        flowRate: flowRate ? parseFloat(flowRate) : null,
        witsmlVersion: witsmlVersion || '2.1',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        operator,
        contractor,
        spudDate: spudDate ? new Date(spudDate) : null
      },
      include: {
        drillingParameters: true,
        operations: true
      }
    })

    return NextResponse.json(well, { status: 201 })
  } catch (error) {
    console.error('Error creating well:', error)
    return NextResponse.json(
      { error: 'Failed to create well' },
      { status: 500 }
    )
  }
}