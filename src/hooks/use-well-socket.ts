'use client'

import { useEffect, useRef, useState } from 'react'

interface DrillingParameterUpdate {
  wellId: string
  name: string
  value: number
  unit: string
  status: 'normal' | 'warning' | 'critical'
  timestamp: string
}

interface WellUpdate {
  wellId: string
  depth: number
  temperature?: number
  pressure?: number
  flowRate?: number
  timestamp: string
}

interface LatestData {
  wellId: string
  parameters: DrillingParameterUpdate[]
  wellData: {
    depth: number
    temperature: number
    pressure: number
  }
}

export function useWellSocket(wellId: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [latestData, setLatestData] = useState<LatestData | null>(null)
  const [parameterUpdates, setParameterUpdates] = useState<DrillingParameterUpdate[]>([])
  const [wellUpdates, setWellUpdates] = useState<WellUpdate[]>([])
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    if (!wellId) return

    // Create WebSocket connection
    const ws = new WebSocket('ws://localhost:3001')
    socketRef.current = ws

    ws.onopen = () => {
      console.log('WebSocket connected')
      setIsConnected(true)
      
      // Join the well room
      ws.send(JSON.stringify({
        type: 'join-well',
        data: wellId
      }))

      // Request latest data
      ws.send(JSON.stringify({
        type: 'request-latest-data',
        data: wellId
      }))
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        
        switch (message.type) {
          case 'joined-well':
            console.log('Joined well room:', message.data)
            break
            
          case 'latest-data':
            setLatestData(message.data)
            break
            
          case 'drilling-parameter-update':
            setParameterUpdates(prev => {
              const newUpdates = [...prev, message.data]
              // Keep only last 100 updates
              return newUpdates.slice(-100)
            })
            break
            
          case 'well-update':
            setWellUpdates(prev => {
              const newUpdates = [...prev, message.data]
              // Keep only last 50 updates
              return newUpdates.slice(-50)
            })
            break
            
          default:
            console.log('Unknown message type:', message.type)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setIsConnected(false)
    }

    return () => {
      if (socketRef.current) {
        // Leave the well room
        if (socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({
            type: 'leave-well',
            data: wellId
          }))
        }
        socketRef.current.close()
      }
    }
  }, [wellId])

  const startSimulation = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'start-simulation',
        data: wellId
      }))
    }
  }

  const stopSimulation = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'stop-simulation',
        data: wellId
      }))
    }
  }

  const sendParameterUpdate = (update: Omit<DrillingParameterUpdate, 'timestamp'>) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'drilling-parameter-update',
        data: {
          ...update,
          timestamp: new Date().toISOString()
        }
      }))
    }
  }

  const sendWellUpdate = (update: Omit<WellUpdate, 'timestamp'>) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'well-update',
        data: {
          ...update,
          timestamp: new Date().toISOString()
        }
      }))
    }
  }

  return {
    isConnected,
    latestData,
    parameterUpdates,
    wellUpdates,
    startSimulation,
    stopSimulation,
    sendParameterUpdate,
    sendWellUpdate
  }
}