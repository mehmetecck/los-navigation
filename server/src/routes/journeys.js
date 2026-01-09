const express = require('express');
const fetch = require('node-fetch');

module.exports = (pool, BVG_API) => {
  const router = express.Router();

  // Helper function to filter out pass-through points from stopovers
  // Only keep actual stops where the vehicle stops
  function filterActualStops(stopovers) {
    if (!stopovers || !Array.isArray(stopovers)) return [];
    
    return stopovers.filter(stopover => {
      // Exclude if explicitly marked as pass-by (doesn't stop)
      if (stopover.passBy === true) return false;
      // Exclude if stop is explicitly false
      if (stopover.stop === false) return false;
      // Exclude cancelled stops
      if (stopover.cancelled === true) return false;
      // Must have a valid stop with an id
      if (!stopover.stop || !stopover.stop.id) return false;
      return true;
    });
  }

  // Helper function to clean a leg and only include actual stops
  function cleanLeg(leg) {
    if (!leg) return null;
    
    const cleanedLeg = { ...leg };
    
    // Filter stopovers to only actual stops
    if (leg.stopovers) {
      cleanedLeg.stopovers = filterActualStops(leg.stopovers);
    }
    
    return cleanedLeg;
  }

  // Get journey options between two stops (for a single leg)
  router.get('/leg', async (req, res) => {
    try {
      const { from, to, departure } = req.query;

      if (!from || !to) {
        return res.status(400).json({ error: 'From and To stops are required' });
      }

      const params = new URLSearchParams({
        results: 8,
        stopovers: true,
        remarks: false
      });

      if (departure) {
        params.append('departure', departure);
      }

      const response = await fetch(
        `${BVG_API}/journeys?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&${params}`
      );
      const data = await response.json();

      if (!data.journeys || data.journeys.length === 0) {
        return res.json({ hasDirectConnection: false, journeys: [], transportOptions: [], intermediateStop: null });
      }

      // Extract first leg from each journey and find intermediate stops
      const firstLegs = [];
      let intermediateStop = null;

      data.journeys.forEach(journey => {
        if (!journey.legs || journey.legs.length === 0) return;

        // Find first public transport leg (skip walking)
        const firstTransitLeg = journey.legs.find(leg => leg.line && leg.line.product);
        
        if (firstTransitLeg) {
          // Clean the leg to only include actual stops
          const cleanedLeg = cleanLeg(firstTransitLeg);
          
          firstLegs.push({
            ...journey,
            legs: [cleanedLeg]
          });

          // Check if this journey needs a transfer (destination of first leg is not final destination)
          // Make sure destination is an actual stop
          if (cleanedLeg.destination && cleanedLeg.destination.id !== to && !intermediateStop) {
            intermediateStop = {
              id: cleanedLeg.destination.id,
              name: cleanedLeg.destination.name
            };
          }
        }
      });

      // Group by transport type with their times
      const transportOptions = groupByTransportType(firstLegs);

      // Determine if there's a direct connection (first leg reaches destination)
      const hasDirectConnection = firstLegs.some(j => {
        const leg = j.legs[0];
        return leg && leg.destination && leg.destination.id === to;
      });

      res.json({
        hasDirectConnection,
        journeys: firstLegs,
        transportOptions,
        intermediateStop: hasDirectConnection ? null : intermediateStop
      });
    } catch (error) {
      console.error('Leg journey error:', error);
      res.status(500).json({ error: 'Failed to get journey options' });
    }
  });

  // Get next leg options after selecting a specific departure
  router.get('/next-leg', async (req, res) => {
    try {
      const { from, to, arrival } = req.query;

      if (!from || !to || !arrival) {
        return res.status(400).json({ error: 'From, To, and arrival time are required' });
      }

      // Add buffer time for transfer (5 minutes minimum)
      const arrivalTime = new Date(arrival);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + 5);

      const params = new URLSearchParams({
        results: 8,
        stopovers: true,
        remarks: false,
        departure: arrivalTime.toISOString()
      });

      const response = await fetch(
        `${BVG_API}/journeys?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&${params}`
      );
      const data = await response.json();

      if (!data.journeys || data.journeys.length === 0) {
        return res.json({ hasDirectConnection: false, journeys: [], transportOptions: [], intermediateStop: null });
      }

      // Extract first leg from each journey
      const firstLegs = [];
      let intermediateStop = null;

      data.journeys.forEach(journey => {
        if (!journey.legs || journey.legs.length === 0) return;

        const firstTransitLeg = journey.legs.find(leg => leg.line && leg.line.product);
        
        if (firstTransitLeg) {
          const cleanedLeg = cleanLeg(firstTransitLeg);
          
          firstLegs.push({
            ...journey,
            legs: [cleanedLeg]
          });

          if (cleanedLeg.destination && cleanedLeg.destination.id !== to && !intermediateStop) {
            intermediateStop = {
              id: cleanedLeg.destination.id,
              name: cleanedLeg.destination.name
            };
          }
        }
      });

      const transportOptions = groupByTransportType(firstLegs);

      const hasDirectConnection = firstLegs.some(j => {
        const leg = j.legs[0];
        return leg && leg.destination && leg.destination.id === to;
      });

      res.json({
        hasDirectConnection,
        journeys: firstLegs,
        transportOptions,
        intermediateStop: hasDirectConnection ? null : intermediateStop
      });
    } catch (error) {
      console.error('Next leg error:', error);
      res.status(500).json({ error: 'Failed to get next leg options' });
    }
  });

  // Get full journey breakdown into legs
  router.get('/breakdown', async (req, res) => {
    try {
      const { from, to, stopovers } = req.query;

      if (!from || !to) {
        return res.status(400).json({ error: 'From and To stops are required' });
      }

      const stopoverList = stopovers ? JSON.parse(stopovers) : [];
      const routePoints = [from, ...stopoverList, to];

      const params = new URLSearchParams({
        results: 8,
        stopovers: true,
        remarks: false
      });

      const response = await fetch(
        `${BVG_API}/journeys?from=${encodeURIComponent(routePoints[0])}&to=${encodeURIComponent(routePoints[1])}&${params}`
      );
      const data = await response.json();

      let transportOptions = [];
      let intermediateStop = null;

      if (data.journeys && data.journeys.length > 0) {
        const firstLegs = [];

        data.journeys.forEach(journey => {
          if (!journey.legs || journey.legs.length === 0) return;

          const firstTransitLeg = journey.legs.find(leg => leg.line && leg.line.product);
          
          if (firstTransitLeg) {
            const cleanedLeg = cleanLeg(firstTransitLeg);
            
            firstLegs.push({
              ...journey,
              legs: [cleanedLeg]
            });

            if (cleanedLeg.destination && cleanedLeg.destination.id !== routePoints[1] && !intermediateStop) {
              intermediateStop = {
                id: cleanedLeg.destination.id,
                name: cleanedLeg.destination.name
              };
            }
          }
        });

        transportOptions = groupByTransportType(firstLegs);
      }

      res.json({
        currentLeg: 0,
        totalLegs: routePoints.length - 1,
        from: routePoints[0],
        to: routePoints[1],
        finalDestination: to,
        transportOptions,
        intermediateStop,
        remainingStops: routePoints.slice(2)
      });
    } catch (error) {
      console.error('Journey breakdown error:', error);
      res.status(500).json({ error: 'Failed to break down journey' });
    }
  });

  // Helper function to group journeys by transport type
  function groupByTransportType(journeys) {
    const grouped = {};

    journeys.forEach(journey => {
      if (!journey.legs || journey.legs.length === 0) return;

      const leg = journey.legs[0];
      if (!leg.line) return;
      
      // Skip if origin or destination is not a valid stop
      if (!leg.origin || !leg.origin.id || !leg.destination || !leg.destination.id) return;

      const lineKey = `${leg.line.product}-${leg.line.name}`;
      const departureTime = new Date(leg.departure);
      const arrivalTime = new Date(leg.arrival);

      if (!grouped[lineKey]) {
        grouped[lineKey] = {
          line: leg.line.name,
          product: leg.line.product,
          productName: getProductName(leg.line.product),
          direction: leg.direction,
          origin: {
            id: leg.origin.id,
            name: leg.origin.name
          },
          destination: {
            id: leg.destination.id,
            name: leg.destination.name
          },
          times: []
        };
      }

      grouped[lineKey].times.push({
        departure: leg.departure,
        arrival: leg.arrival,
        departureFormatted: formatTime(departureTime),
        arrivalFormatted: formatTime(arrivalTime),
        duration: Math.round((arrivalTime - departureTime) / 60000),
        platform: leg.departurePlatform,
        journeyId: journey.refreshToken || `${leg.departure}-${leg.line.name}`
      });
    });

    // Sort times for each transport option and remove duplicates
    Object.values(grouped).forEach(option => {
      option.times.sort((a, b) => new Date(a.departure) - new Date(b.departure));
      // Remove duplicate times (same departure time)
      const seen = new Set();
      option.times = option.times.filter(time => {
        const key = time.departureFormatted;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    });

    return Object.values(grouped);
  }

  function getProductName(product) {
    const names = {
      suburban: 'S-Bahn',
      subway: 'U-Bahn',
      tram: 'Tram',
      bus: 'Bus',
      ferry: 'Ferry',
      express: 'Express',
      regional: 'Regional'
    };
    return names[product] || product;
  }

  function formatTime(date) {
    return date.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  return router;
};
