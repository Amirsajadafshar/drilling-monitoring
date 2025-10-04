import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const well = await db.well.findUnique({
      where: { id: params.id },
      include: {
        drillingParameters: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        witsmlData: {
          orderBy: { timestamp: 'desc' },
          take: 5
        },
        wellLogs: {
          orderBy: { timestamp: 'desc' },
          take: 20
        },
        operations: {
          orderBy: { startTime: 'desc' },
          take: 10
        }
      }
    })

    if (!well) {
      return NextResponse.json(
        { error: 'Well not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(well)
  } catch (error) {
    console.error('Error fetching well:', error)
    return NextResponse.json(
      { error: 'Failed to fetch well' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      completionDate
    } = body

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (location !== undefined) updateData.location = location
    if (field !== undefined) updateData.field = field
    if (status !== undefined) updateData.status = status
    if (depth !== undefined) updateData.depth = parseFloat(depth)
    if (targetDepth !== undefined) updateData.targetDepth = parseFloat(targetDepth)
    if (temperature !== undefined) updateData.temperature = parseFloat(temperature)
    if (pressure !== undefined) updateData.pressure = parseFloat(pressure)
    if (flowRate !== undefined) updateData.flowRate = parseFloat(flowRate)
    if (witsmlVersion !== undefined) updateData.witsmlVersion = witsmlVersion
    if (latitude !== undefined) updateData.latitude = parseFloat(latitude)
    if (longitude !== undefined) updateData.longitude = parseFloat(longitude)
    if (operator !== undefined) updateData.operator = operator
    if (contractor !== undefined) updateData.contractor = contractor
    if (completionDate !== undefined) updateData.completionDate = new Date(completionDate)

    const well = await db.well.update({
      where: { id: params.id },
      data: updateData,
      include: {
        drillingParameters: true,
        witsmlData: true,
        wellLogs: true,
        operations: true
      }
    })

    return NextResponse.json(well)
  } catch (error) {
    console.error('Error updating well:', error)
    return NextResponse.json(
      { error: 'Failed to update well' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await db.well.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Well deleted successfully' })
  } catch (error) {
    console.error('Error deleting well:', error)
    return NextResponse.json(
      { error: 'Failed to delete well' },
      { status: 500 }
    )
  }
}