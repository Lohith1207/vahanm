import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { Info, ChevronDown, ChevronUp, Users, UserCheck, Play } from 'lucide-react';

export const DemoInstructions = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <div className="p-4">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <Info className="text-blue-600" size={20} />
            <h3 className="font-semibold text-blue-800">How Manual Driver Acceptance Works</h3>
          </div>
          {isExpanded ? 
            <ChevronUp className="text-blue-600" size={20} /> : 
            <ChevronDown className="text-blue-600" size={20} />
          }
        </div>
        
        {isExpanded && (
          <div className="mt-4 space-y-4 text-blue-700">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <Users size={16} className="mr-2" />
                  For Customers:
                </h4>
                <ul className="text-sm space-y-1 ml-6">
                  <li>• Enter pickup and destination</li>
                  <li>• Click "Book Ride" to create request</li>
                  <li>• Wait for a nearby driver to accept</li>
                  <li>• No automatic assignment - real drivers decide</li>
                  <li>• You'll see driver details once accepted</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center">
                  <UserCheck size={16} className="mr-2" />
                  For Drivers:
                </h4>
                <ul className="text-sm space-y-1 ml-6">
                  <li>• Go to Driver Dashboard</li>
                  <li>• Toggle "Online" to receive requests</li>
                  <li>• Review ride details</li>
                  <li>• Click "Accept" or "Reject"</li>
                  <li>• Only you control ride acceptance</li>
                </ul>
              </div>
            </div>
            
            <div className="pt-3 border-t border-blue-200">
              <h4 className="font-semibold mb-2 flex items-center">
                <Play size={16} className="mr-2" />
                Demo Flow:
              </h4>
              <p className="text-sm">
                1. Open two browser tabs → 2. Book a ride as customer → 
                3. Switch to driver tab → 4. Go online and accept the ride → 
                5. See real manual driver acceptance in action
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};