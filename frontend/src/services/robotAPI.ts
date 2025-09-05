import axios from 'axios';

interface RobotLocation {
  lat: number;
  lng: number;
  timestamp?: Date | string;
}

interface Robot {
  id: string;
  name: string;
  status: 'idle' | 'assigned' | 'picking_up' | 'delivering' | 'returning';
  batteryLevel: number;
  currentLocation: RobotLocation;
  speed: number; // mph
  estimatedArrival?: Date | string;
}

interface RobotAPIResponse {
  success: boolean;
  data?: {
    robot: Robot;
    route?: RobotLocation[];
  };
  error?: string;
}

class RobotAPIService {
  private baseURL = process.env.VITE_ROBOT_API_URL || 'http://localhost:8080/api';
  private isAPIAvailable = false;
  private demoRobots: Map<string, Robot> = new Map();

  constructor() {
    this.checkAPIAvailability();
    this.initializeDemoRobots();
  }

  private async checkAPIAvailability(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/health`, { timeout: 3000 });
      this.isAPIAvailable = response.status === 200;
      console.log('Robot API available:', this.isAPIAvailable);
      return this.isAPIAvailable;
    } catch (error) {
      console.log('Robot API unavailable, using demo mode');
      this.isAPIAvailable = false;
      return false;
    }
  }

  private initializeDemoRobots() {
    // Initialize demo robots for fallback
    this.demoRobots.set('RB-001', {
      id: 'RB-001',
      name: 'RoboBot Alpha',
      status: 'idle',
      batteryLevel: 85,
      currentLocation: {
        lat: 40.7505,
        lng: -73.9934,
        timestamp: new Date()
      },
      speed: 3.2
    });

    this.demoRobots.set('RB-002', {
      id: 'RB-002',
      name: 'RoboBot Beta',
      status: 'idle',
      batteryLevel: 92,
      currentLocation: {
        lat: 40.7614,
        lng: -73.9776,
        timestamp: new Date()
      },
      speed: 2.8
    });
  }

  async assignRobot(orderId: string, vendorLocation: RobotLocation, customerLocation: RobotLocation): Promise<RobotAPIResponse> {
    if (await this.checkAPIAvailability()) {
      try {
        const response = await axios.post(`${this.baseURL}/robots/assign`, {
          orderId,
          vendorLocation,
          customerLocation
        });
        return response.data;
      } catch (error) {
        console.error('Robot API assignment failed:', error);
        return this.assignDemoRobot(orderId, vendorLocation, customerLocation);
      }
    }
    
    return this.assignDemoRobot(orderId, vendorLocation, customerLocation);
  }

  private assignDemoRobot(_orderId: string, vendorLocation: RobotLocation, customerLocation: RobotLocation): RobotAPIResponse {
    // Find available demo robot
    const availableRobot = Array.from(this.demoRobots.values()).find(r => r.status === 'idle');
    
    if (!availableRobot) {
      return {
        success: false,
        error: 'No robots available'
      };
    }

    // Update robot status and location
    availableRobot.status = 'assigned';
    availableRobot.currentLocation = { ...vendorLocation, timestamp: new Date() };
    
    // Calculate estimated arrival (demo calculation)
    const distance = this.calculateDistance(vendorLocation, customerLocation);
    const estimatedMinutes = (distance / availableRobot.speed) * 60;
    availableRobot.estimatedArrival = new Date(Date.now() + estimatedMinutes * 60 * 1000);

    return {
      success: true,
      data: {
        robot: availableRobot,
        route: this.generateDemoRoute(vendorLocation, customerLocation)
      }
    };
  }

  async getRobotLocation(robotId: string): Promise<RobotAPIResponse> {
    if (await this.checkAPIAvailability()) {
      try {
        const response = await axios.get(`${this.baseURL}/robots/${robotId}/location`);
        return response.data;
      } catch (error) {
        console.error('Robot API location fetch failed:', error);
        return this.getDemoRobotLocation(robotId);
      }
    }
    
    return this.getDemoRobotLocation(robotId);
  }

  private getDemoRobotLocation(robotId: string): RobotAPIResponse {
    const robot = this.demoRobots.get(robotId);
    
    if (!robot) {
      return {
        success: false,
        error: 'Robot not found'
      };
    }

    return {
      success: true,
      data: { robot }
    };
  }

  async updateRobotStatus(robotId: string, status: Robot['status'], location?: RobotLocation): Promise<RobotAPIResponse> {
    if (await this.checkAPIAvailability()) {
      try {
        const response = await axios.put(`${this.baseURL}/robots/${robotId}/status`, {
          status,
          location
        });
        return response.data;
      } catch (error) {
        console.error('Robot API status update failed:', error);
        return this.updateDemoRobotStatus(robotId, status, location);
      }
    }
    
    return this.updateDemoRobotStatus(robotId, status, location);
  }

  private updateDemoRobotStatus(robotId: string, status: Robot['status'], location?: RobotLocation): RobotAPIResponse {
    const robot = this.demoRobots.get(robotId);
    
    if (!robot) {
      return {
        success: false,
        error: 'Robot not found'
      };
    }

    robot.status = status;
    if (location) {
      robot.currentLocation = { ...location, timestamp: new Date() };
    }

    return {
      success: true,
      data: { robot }
    };
  }

  // Demo route generation for map visualization
  private generateDemoRoute(start: RobotLocation, end: RobotLocation): RobotLocation[] {
    const route: RobotLocation[] = [];
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      route.push({
        lat: start.lat + (end.lat - start.lat) * progress,
        lng: start.lng + (end.lng - start.lng) * progress,
        timestamp: new Date(Date.now() + i * 60000) // 1 minute intervals
      });
    }
    
    return route;
  }

  private calculateDistance(loc1: RobotLocation, loc2: RobotLocation): number {
    // Haversine formula for distance in miles
    const R = 3959; // Earth's radius in miles
    const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
    const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Simulate robot movement for demo
  simulateRobotMovement(robotId: string, route: RobotLocation[]): void {
    const robot = this.demoRobots.get(robotId);
    if (!robot || !route.length) return;

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= route.length - 1) {
        robot.status = 'idle';
        clearInterval(interval);
        return;
      }

      robot.currentLocation = route[currentStep];
      currentStep++;
      
      // Update status based on progress
      if (currentStep === 1) robot.status = 'picking_up';
      else if (currentStep === Math.floor(route.length / 2)) robot.status = 'delivering';
      
    }, 5000); // Update every 5 seconds for demo
  }

  isUsingDemoMode(): boolean {
    return !this.isAPIAvailable;
  }
}

export const robotAPI = new RobotAPIService();
export type { Robot, RobotLocation, RobotAPIResponse };
