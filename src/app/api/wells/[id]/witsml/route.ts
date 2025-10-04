import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { searchParams } = new URL(request.url)
    const dataType = searchParams.get('type')
    const format = searchParams.get('format') || 'json'
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = { wellId: params.id }
    if (dataType) where.dataType = dataType

    const witsmlData = await db.witsmlData.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit
    })

    // If XML format is requested, transform the data
    if (format === 'xml') {
      const xmlData = generateWITSMLXML(witsmlData)
      return new NextResponse(xmlData, {
        headers: {
          'Content-Type': 'application/xml',
        },
      })
    }

    return NextResponse.json(witsmlData)
  } catch (error) {
    console.error('Error fetching WITSML data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch WITSML data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { dataType, version, xmlData, jsonData } = body

    if (!dataType) {
      return NextResponse.json(
        { error: 'Data type is required' },
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

    const witsmlEntry = await db.witsmlData.create({
      data: {
        wellId: params.id,
        dataType,
        version: version || '2.1',
        xmlData,
        jsonData: jsonData ? JSON.stringify(jsonData) : null
      }
    })

    return NextResponse.json(witsmlEntry, { status: 201 })
  } catch (error) {
    console.error('Error creating WITSML data:', error)
    return NextResponse.json(
      { error: 'Failed to create WITSML data' },
      { status: 500 }
    )
  }
}

function generateWITSMLXML(data: any[]): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  xml += '<wells version="2.1">\n'
  
  data.forEach((entry) => {
    xml += `  <well uid="${entry.wellId}">\n`
    xml += `    <dataType>${entry.dataType}</dataType>\n`
    xml += `    <version>${entry.version}</version>\n`
    xml += `    <dTimStamp>${entry.timestamp.toISOString()}</dTimStamp>\n`
    if (entry.xmlData) {
      xml += `    <data>${entry.xmlData}</data>\n`
    }
    xml += '  </well>\n'
  })
  
  xml += '</wells>'
  return xml
}