import React, { useState, useEffect } from 'react';
import { Robot, RobotLocation } from '@/services/robotAPI';

interface DemoRobotMapProps {
  robot: Robot;
  vendorLocation: RobotLocation;
  customerLocation: RobotLocation;
  route?: RobotLocation[];
}

const DemoRobotMap: React.FC<DemoRobotMapProps> = ({
  robot,
  vendorLocation,
  customerLocation,
  route = []
}) => {
  // Fallback demo data with realistic NYC coordinates
  const demoRobot = robot || {
    id: 'RQ-' + Math.random().toString(36).substr(2, 4).toUpperCase(),
    name: 'RoboQ-' + Math.floor(Math.random() * 99 + 1),
    status: 'delivering' as const,
    batteryLevel: Math.floor(Math.random() * 30 + 70), // 70-100%
    speed: Math.floor(Math.random() * 8 + 8), // 8-15 mph
    currentLocation: { lat: 28.6139, lng: 77.2090, timestamp: new Date() },
    estimatedArrival: new Date(Date.now() + Math.random() * 20 * 60000 + 5 * 60000).toISOString() // 5-25 min
  };

  const demoVendorLocation = vendorLocation || { lat: 28.6129, lng: 77.2295, timestamp: new Date() };
  const demoCustomerLocation = customerLocation || { lat: 28.6304, lng: 77.2177, timestamp: new Date() };
  
  // Generate realistic route with multiple waypoints
  const generateRealisticRoute = () => {
    const start = demoVendorLocation;
    const end = demoCustomerLocation;
    const waypoints = [];
    
    // Add intermediate points for realistic path
    for (let i = 1; i <= 8; i++) {
      const progress = i / 9;
      const lat = start.lat + (end.lat - start.lat) * progress + (Math.random() - 0.5) * 0.002;
      const lng = start.lng + (end.lng - start.lng) * progress + (Math.random() - 0.5) * 0.002;
      waypoints.push({ lat, lng, timestamp: new Date() });
    }
    
    return [start, ...waypoints, end];
  };

  const demoRoute = route.length > 0 ? route : generateRealisticRoute();
  const [currentPosition, setCurrentPosition] = useState(0);
  const [animatedLocation, setAnimatedLocation] = useState(demoRobot.currentLocation);
  const [realTimeBattery, setRealTimeBattery] = useState(demoRobot.batteryLevel);
  const [realTimeSpeed, setRealTimeSpeed] = useState(demoRobot.speed);

  // Calculate map bounds
  const bounds = {
    minLat: Math.min(demoVendorLocation.lat, demoCustomerLocation.lat) - 0.01,
    maxLat: Math.max(demoVendorLocation.lat, demoCustomerLocation.lat) + 0.01,
    minLng: Math.min(demoVendorLocation.lng, demoCustomerLocation.lng) - 0.01,
    maxLng: Math.max(demoVendorLocation.lng, demoCustomerLocation.lng) + 0.01,
  };

  // Convert lat/lng to SVG coordinates
  const toSVG = (location: RobotLocation) => {
    const x = ((location.lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 400;
    const y = ((bounds.maxLat - location.lat) / (bounds.maxLat - bounds.minLat)) * 300;
    return { x, y };
  };

  // Animate robot movement with realistic timing
  useEffect(() => {
    if (demoRoute.length === 0) return;

    const interval = setInterval(() => {
      setCurrentPosition(prev => {
        const next = (prev + 1) % demoRoute.length;
        setAnimatedLocation(demoRoute[next]);
        
        // Simulate realistic changes
        setRealTimeBattery(battery => Math.max(20, battery - Math.random() * 0.5));
        setRealTimeSpeed(speed => Math.max(5, speed + (Math.random() - 0.5) * 2));
        
        return next;
      });
    }, 1500 + Math.random() * 1000); // Variable timing 1.5-2.5s

    return () => clearInterval(interval);
  }, [demoRoute]);

  const vendorSVG = toSVG(demoVendorLocation);
  const customerSVG = toSVG(demoCustomerLocation);
  const robotSVG = toSVG(animatedLocation);

  const getStatusColor = (status: Robot['status']) => {
    switch (status) {
      case 'picking_up': return '#f59e0b';
      case 'delivering': return '#3b82f6';
      case 'assigned': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: Robot['status']) => {
    switch (status) {
      case 'assigned': return 'Robot Assigned';
      case 'picking_up': return 'Picking Up Order';
      case 'delivering': return 'Delivering to You';
      case 'returning': return 'Returning to Base';
      default: return 'Idle';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Live Robot Tracking</h3>
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getStatusColor(demoRobot.status) }}
          />
          <span className="text-sm font-medium text-gray-700">
            {getStatusText(demoRobot.status)}
          </span>
        </div>
      </div>

      {/* Demo Map */}
      <div className="relative bg-gray-100 rounded-lg overflow-hidden mb-4">
        <svg width="100%" height="300" viewBox="0 0 400 300" className="bg-gradient-to-br from-green-100 to-blue-100">
          {/* Street grid pattern */}
          <defs>
            <pattern id="streets" width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill="#f3f4f6"/>
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d1d5db" strokeWidth="1"/>
              <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
            </pattern>
            <filter id="shadow">
              <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.3"/>
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#streets)" />
          
          {/* Buildings/landmarks */}
          <rect x="50" y="50" width="30" height="40" fill="#9ca3af" opacity="0.6" rx="2"/>
          <rect x="320" y="180" width="25" height="35" fill="#9ca3af" opacity="0.6" rx="2"/>
          <rect x="150" y="120" width="40" height="30" fill="#9ca3af" opacity="0.6" rx="2"/>
          
          {/* Route path with realistic curves */}
          {demoRoute.length > 0 && (
            <path
              d={`M ${demoRoute.map((point, i) => {
                const svg = toSVG(point);
                return i === 0 ? `${svg.x},${svg.y}` : `L ${svg.x},${svg.y}`;
              }).join(' ')}`}
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="8,4"
              fill="none"
              opacity="0.8"
              filter="url(#shadow)"
            />
          )}

          {/* Vendor location */}
          <g transform={`translate(${vendorSVG.x}, ${vendorSVG.y})`}>
            <circle cx="0" cy="0" r="12" fill="#f59e0b" filter="url(#shadow)" />
            <circle cx="0" cy="0" r="6" fill="#fbbf24" />
            <text x="0" y="25" textAnchor="middle" className="text-xs fill-gray-700 font-medium">
              🏪 Restaurant
            </text>
          </g>

          {/* Customer location */}
          <g transform={`translate(${customerSVG.x}, ${customerSVG.y})`}>
            <circle cx="0" cy="0" r="12" fill="#10b981" filter="url(#shadow)" />
            <circle cx="0" cy="0" r="6" fill="#34d399" />
            <text x="0" y="25" textAnchor="middle" className="text-xs fill-gray-700 font-medium">
              🏠 You
            </text>
          </g>

          {/* Robot location with pulsing animation */}
          <g transform={`translate(${robotSVG.x}, ${robotSVG.y})`}>
            <circle cx="0" cy="0" r="18" fill={getStatusColor(demoRobot.status)} opacity="0.3">
              <animate attributeName="r" values="18;22;18" dur="2s" repeatCount="indefinite"/>
            </circle>
            <circle cx="0" cy="0" r="12" fill={getStatusColor(demoRobot.status)} filter="url(#shadow)" />
            <circle cx="0" cy="0" r="6" fill="white" />
            <text x="0" y="2" textAnchor="middle" className="text-xs fill-gray-700 font-bold">🤖</text>
            <text x="0" y="30" textAnchor="middle" className="text-xs fill-gray-700 font-bold">
              {demoRobot.name}
            </text>
          </g>
        </svg>

        {/* Demo mode indicator */}
        <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">
          Demo Mode
        </div>
      </div>

      {/* Robot info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Robot ID</div>
          <div className="font-semibold text-gray-900">{demoRobot.id}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Battery Level</div>
          <div className="font-semibold text-gray-900 flex items-center">
            {Math.round(realTimeBattery)}%
            <div className={`ml-2 w-2 h-2 rounded-full ${realTimeBattery > 50 ? 'bg-green-500' : realTimeBattery > 25 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">Current Speed</div>
          <div className="font-semibold text-gray-900">{Math.round(realTimeSpeed)} km/h</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-sm text-gray-600">ETA</div>
          <div className="font-semibold text-gray-900">
            {demoRobot.estimatedArrival 
              ? new Date(demoRobot.estimatedArrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'Calculating...'
            }
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round((currentPosition / Math.max(demoRoute.length - 1, 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="h-2 rounded-full transition-all duration-1000"
            style={{ 
              width: `${(currentPosition / Math.max(demoRoute.length - 1, 1)) * 100}%`,
              backgroundColor: getStatusColor(demoRobot.status)
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DemoRobotMap;
