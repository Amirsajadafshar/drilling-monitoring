import { create } from 'zustand'

export interface WellData {
  id: string
  name: string
  location: string
  status: 'drilling' | 'producing' | 'completed' | 'planned'
  depth: number
  temperature: number
  pressure: number
  flowRate: number
  witsmlVersion: string
  lastUpdate: string
  targetDepth?: number
  spudDate?: string
}

interface WellsStore {
  wells: WellData[]
  selectedWell: WellData | null
  addWell: (well: Omit<WellData, 'id' | 'lastUpdate'>) => void
  updateWell: (id: string, updates: Partial<WellData>) => void
  deleteWell: (id: string) => void
  setSelectedWell: (well: WellData | null) => void
  getWellById: (id: string) => WellData | undefined
}

export const useWellsStore = create<WellsStore>((set, get) => ({
  wells: [
    {
      id: '1',
      name: 'Well-A-01',
      location: 'South Pars Field',
      status: 'drilling',
      depth: 3250,
      targetDepth: 4100,
      temperature: 85,
      pressure: 4500,
      flowRate: 0,
      witsmlVersion: '2.1',
      lastUpdate: new Date().toISOString(),
      spudDate: '2023-10-15'
    },
    {
      id: '2',
      name: 'Well-B-02',
      location: 'North Dome Field',
      status: 'producing',
      depth: 2800,
      targetDepth: 2800,
      temperature: 78,
      pressure: 3800,
      flowRate: 1250,
      witsmlVersion: '2.1',
      lastUpdate: new Date().toISOString(),
      spudDate: '2023-08-20'
    },
    {
      id: '3',
      name: 'Well-C-03',
      location: 'West Oil Field',
      status: 'completed',
      depth: 4100,
      targetDepth: 4100,
      temperature: 92,
      pressure: 5200,
      flowRate: 980,
      witsmlVersion: '2.0',
      lastUpdate: new Date(Date.now() - 86400000).toISOString(),
      spudDate: '2023-05-10'
    }
  ],
  selectedWell: null,
  
  addWell: (wellData) => {
    const newWell: WellData = {
      ...wellData,
      id: Date.now().toString(), // Simple ID generation
      lastUpdate: new Date().toISOString()
    }
    
    set((state) => ({
      wells: [...state.wells, newWell]
    }))
    
    // Auto-select the newly added well
    get().setSelectedWell(newWell)
  },
  
  updateWell: (id, updates) => {
    set((state) => ({
      wells: state.wells.map(well => 
        well.id === id 
          ? { ...well, ...updates, lastUpdate: new Date().toISOString() }
          : well
      )
    }))
  },
  
  deleteWell: (id) => {
    set((state) => ({
      wells: state.wells.filter(well => well.id !== id),
      selectedWell: state.selectedWell?.id === id ? null : state.selectedWell
    }))
  },
  
  setSelectedWell: (well) => {
    set({ selectedWell: well })
  },
  
  getWellById: (id) => {
    return get().wells.find(well => well.id === id)
  }
}))