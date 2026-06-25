/**
 * Dynamic Fare API Service
 * Integrates with the Dynamic-Fare pricing engine
 */

const DYNAMIC_FARE_BASE_URL = 'http://localhost:8080/api/v1';

/**
 * Calculate dynamic fare with AI-powered explanation
 * @param {Object} pricingData - Pricing request data
 * @returns {Promise<Object>} Dynamic fare result with explanation
 */
export const getDynamicFareExplanation = async (pricingData) => {
  try {
    const response = await fetch(`${DYNAMIC_FARE_BASE_URL}/api/fare/explain`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pricingData),
    });

    if (!response.ok) {
      throw new Error(`Dynamic Fare API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling Dynamic Fare API:', error);
    throw error;
  }
};

/**
 * Calculate dynamic fare without RAG (faster, no policy retrieval)
 * @param {Object} pricingData - Pricing request data
 * @returns {Promise<Object>} Dynamic fare result
 */
export const getDynamicFareQuick = async (pricingData) => {
  try {
    const response = await fetch(`${DYNAMIC_FARE_BASE_URL}/api/fare/explain/no-rag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pricingData),
    });

    if (!response.ok) {
      throw new Error(`Dynamic Fare API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling Dynamic Fare API:', error);
    throw error;
  }
};

/**
 * Build pricing request for Dynamic Fare API
 * @param {Object} params - Ride parameters
 * @returns {Object} Formatted pricing request
 */
export const buildPricingRequest = ({
  vehicleType,
  distanceKm,
  timeMinutes,
  baseFare,
  perKmRate,
  perMinuteRate,
  surgeMultiplier = 1.0,
  demandSupplyRatio = 1.0,
  city = 'Hyderabad',
  pickupLat,
  pickupLng,
  dropLat,
  dropLng
}) => {
  // Calculate base charges
  const distanceCharge = distanceKm * perKmRate;
  const timeCharge = timeMinutes * perMinuteRate;

  // Calculate basic fare (without dynamic adjustments)
  const basicFare = baseFare + distanceCharge + timeCharge;
  const finalFare = basicFare * surgeMultiplier;

  return {
    base_fare: baseFare,
    distance_km: distanceKm,
    distance_charge: distanceCharge,
    time_minutes: timeMinutes,
    time_charge: timeCharge,
    surge_multiplier: surgeMultiplier,
    demand_supply_ratio: demandSupplyRatio,
    final_fare: finalFare,
    ride_type: vehicleType,
    city: city,
    pickup_lat: pickupLat,
    pickup_lng: pickupLng,
    drop_lat: dropLat,
    drop_lng: dropLng
  };
};

/**
 * Health check for Dynamic Fare service
 * @returns {Promise<Object>} Service status
 */
export const checkDynamicFareHealth = async () => {
  try {
    const response = await fetch(`${DYNAMIC_FARE_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error('Service unavailable');
    }
    return await response.json();
  } catch (error) {
    console.error('Dynamic Fare service health check failed:', error);
    return { status: 'unavailable' };
  }
};
