const SAFETY_API_BASE = 'http://localhost:8080/api/v1';

export const safetyApi = {
  // Report rash driving with speed data
  async reportRashDriving(driverId, rideId, speedData) {
    try {
      const payload = {
        driver_id: driverId,
        ride_id: rideId,
        speed_data: speedData,
        timestamps: speedData.map((_, i) => new Date(Date.now() - (speedData.length - i) * 1000).toISOString())
      };

      console.log('📡 Sending rash driving report to:', `${SAFETY_API_BASE}/safety/rash-report`);
      console.log('📦 Payload:', payload);

      const response = await fetch(`${SAFETY_API_BASE}/safety/rash-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📨 Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Server error response:', errorData);
        throw new Error(`Server returned ${response.status}: ${errorData}`);
      }

      const result = await response.json();
      console.log('✅ API Response:', result);
      return result;
    } catch (error) {
      console.error('❌ Error in reportRashDriving:', error);
      throw error;
    }
  },

  // Report phone usage while driving
  async reportPhoneUsage(driverId, rideId, detectionTimestamps) {
    try {
      const response = await fetch(`${SAFETY_API_BASE}/safety/phone-usage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driver_id: driverId,
          ride_id: rideId,
          detection_timestamps: detectionTimestamps
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit phone usage report');
      }

      return await response.json();
    } catch (error) {
      console.error('Error reporting phone usage:', error);
      throw error;
    }
  },

  // Get AI support chat response
  async getSupportResponse(query) {
    try {
      const response = await fetch(`${SAFETY_API_BASE}/support/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: query
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get support response');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting support response:', error);
      throw error;
    }
  },

  // Generate mock speed data for demo purposes
  generateMockSpeedData(isRash = false) {
    const baseSpeed = isRash ? 80 : 50;
    const variance = isRash ? 30 : 10;
    return Array.from({ length: 20 }, () =>
      Math.floor(baseSpeed + Math.random() * variance)
    );
  },

  // Generate mock phone usage timestamps
  generateMockPhoneTimestamps(count = 5) {
    return Array.from({ length: count }, (_, i) =>
      new Date(Date.now() - (count - i) * 30000).toISOString()
    );
  }
};
