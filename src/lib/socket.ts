import { Server } from 'socket.io';

interface DrillingParameterUpdate {
  wellId: string;
  name: string;
  value: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
}

interface WellUpdate {
  wellId: string;
  depth: number;
  temperature?: number;
  pressure?: number;
  flowRate?: number;
  timestamp: string;
}

export const setupSocket = (io: Server) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Join well-specific room
    socket.on('join-well', (wellId: string) => {
      socket.join(`well-${wellId}`);
      console.log(`Client ${socket.id} joined well ${wellId}`);
      
      // Send confirmation
      socket.emit('joined-well', { wellId, message: `Connected to well ${wellId}` });
    });

    // Leave well-specific room
    socket.on('leave-well', (wellId: string) => {
      socket.leave(`well-${wellId}`);
      console.log(`Client ${socket.id} left well ${wellId}`);
    });

    // Handle drilling parameter updates
    socket.on('drilling-parameter-update', (data: DrillingParameterUpdate) => {
      // Broadcast to all clients in the well room
      io.to(`well-${data.wellId}`).emit('drilling-parameter-update', {
        ...data,
        timestamp: new Date().toISOString()
      });
      console.log(`Drilling parameter update for well ${data.wellId}:`, data);
    });

    // Handle well updates
    socket.on('well-update', (data: WellUpdate) => {
      // Broadcast to all clients in the well room
      io.to(`well-${data.wellId}`).emit('well-update', {
        ...data,
        timestamp: new Date().toISOString()
      });
      console.log(`Well update for well ${data.wellId}:`, data);
    });

    // Request latest data for a well
    socket.on('request-latest-data', (wellId: string) => {
      // In a real implementation, this would fetch from database
      // For now, we'll send mock data
      const mockData = {
        wellId,
        parameters: [
          { name: 'سرعت حفاری', value: 25 + Math.random() * 10, unit: 'متر/ساعت', status: 'normal' },
          { name: 'فشار گل حفاری', value: 4500 + Math.random() * 200, unit: 'PSI', status: 'normal' },
          { name: 'دبی گل', value: 450 + Math.random() * 50, unit: 'گالن/دقیقه', status: 'warning' },
          { name: 'گشتاور', value: 15000 + Math.random() * 1000, unit: 'فوت-پوند', status: 'normal' },
          { name: 'سرعت چرخش', value: 120 + Math.random() * 10, unit: 'دور بر دقیقه', status: 'normal' },
        ],
        wellData: {
          depth: 3250 + Math.random() * 5,
          temperature: 85 + Math.random() * 2,
          pressure: 4500 + Math.random() * 100,
        }
      };
      
      socket.emit('latest-data', mockData);
    });

    // Start real-time simulation for a well
    socket.on('start-simulation', (wellId: string) => {
      console.log(`Starting simulation for well ${wellId}`);
      
      // Send updates every 2 seconds
      const interval = setInterval(() => {
        if (!socket.rooms.has(`well-${wellId}`)) {
          clearInterval(interval);
          return;
        }

        const update: DrillingParameterUpdate = {
          wellId,
          name: 'سرعت حفاری',
          value: 25 + Math.random() * 10,
          unit: 'متر/ساعت',
          status: 'normal',
          timestamp: new Date().toISOString()
        };

        io.to(`well-${wellId}`).emit('drilling-parameter-update', update);
      }, 2000);

      // Store interval ID for cleanup
      socket.data.simulationInterval = interval;
    });

    // Stop real-time simulation
    socket.on('stop-simulation', (wellId: string) => {
      console.log(`Stopping simulation for well ${wellId}`);
      if (socket.data.simulationInterval) {
        clearInterval(socket.data.simulationInterval);
        delete socket.data.simulationInterval;
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Clean up any running simulations
      if (socket.data.simulationInterval) {
        clearInterval(socket.data.simulationInterval);
      }
    });

    // Send welcome message
    socket.emit('message', {
      text: 'Welcome to Oil Well Monitoring WebSocket Server!',
      senderId: 'system',
      timestamp: new Date().toISOString(),
    });
  });
};