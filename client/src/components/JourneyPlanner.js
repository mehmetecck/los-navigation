import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import TransportOptions from './TransportOptions';
import JourneyProgress from './JourneyProgress';
import { useLanguage } from '../LanguageContext';
import './JourneyPlanner.css';
import { BsArrowCounterclockwise, BsArrowRight, BsBookmark, BsBookmarkFill, BsArrowLeft, BsCheckLg } from 'react-icons/bs';

function JourneyPlanner({ origin, destination, stopovers, onComplete, onBack, user }) {
  const { strings } = useLanguage();
  const [currentLegIndex, setCurrentLegIndex] = useState(0);
  const [selectedLegs, setSelectedLegs] = useState([]);
  const [transportOptions, setTransportOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentFrom, setCurrentFrom] = useState(origin);
  const [currentTo, setCurrentTo] = useState(null);
  const [intermediateStops, setIntermediateStops] = useState([]);
  const [journeyComplete, setJourneyComplete] = useState(false);
  const [lastArrivalTime, setLastArrivalTime] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null); 
  const [savedJourneyId, setSavedJourneyId] = useState(null); // Track saved journey ID for unsaving

  // Build the route including stopovers
  const buildRoute = useCallback(() => {
    const route = [{ stop: origin, duration: 0 }]; // Origin has no wait duration
    if (stopovers && stopovers.length > 0) {
      route.push(...stopovers);
    }
    route.push({ stop: destination, duration: 0 }); // Destination has no wait duration
    return route;
  }, [origin, destination, stopovers]);

  // Get the stop object from a route point
  const getStopFromRoutePoint = (routePoint) => {
    if (routePoint.stop) {
      return routePoint.stop;
    }
    // Fallback for old structure
    return routePoint;
  };

  // Get the duration from a route point
  const getDurationFromRoutePoint = (routePoint) => {
    return routePoint.duration || 0;
  };

  const fetchLegOptions = useCallback(async (from, to, arrivalTime = null) => {
    setLoading(true);
    setError(null);

    try {
      let url;
      
      if (arrivalTime) {
        url = `/api/journeys/next-leg?from=${encodeURIComponent(from.id)}&to=${encodeURIComponent(to.id)}&arrival=${encodeURIComponent(arrivalTime)}`;
      } else {
        url = `/api/journeys/leg?from=${encodeURIComponent(from.id)}&to=${encodeURIComponent(to.id)}`;
      }

      const response = await axios.get(url);
      const data = response.data;

      if (data.hasDirectConnection) {
        setTransportOptions(data.transportOptions || []);
        setCurrentTo(to);
      } else if (data.intermediateStop) {
        setIntermediateStops(prev => [...prev, data.intermediateStop]);
        setCurrentTo(data.intermediateStop);
        
        let intermediateUrl;
        if (arrivalTime) {
          intermediateUrl = `/api/journeys/next-leg?from=${encodeURIComponent(from.id)}&to=${encodeURIComponent(data.intermediateStop.id)}&arrival=${encodeURIComponent(arrivalTime)}`;
        } else {
          intermediateUrl = `/api/journeys/leg?from=${encodeURIComponent(from.id)}&to=${encodeURIComponent(data.intermediateStop.id)}`;
        }
        
        const intermediateResponse = await axios.get(intermediateUrl);
        setTransportOptions(intermediateResponse.data.transportOptions || []);
      } else {
        setError(strings.journey.noConnections);
        setTransportOptions([]);
      }
    } catch (err) {
      console.error('Failed to fetch leg options:', err);
      setError(strings.journey.failedToLoad);
      setTransportOptions([]);
    }

    setLoading(false);
  }, [strings.journey.noConnections, strings.journey.failedToLoad]);

  useEffect(() => {
    const route = buildRoute();
    if (route.length >= 2) {
      const fromStop = getStopFromRoutePoint(route[0]);
      const toStop = getStopFromRoutePoint(route[1]);
      setCurrentFrom(fromStop);
      fetchLegOptions(fromStop, toStop, null);
    }
  }, [buildRoute, fetchLegOptions]);

  const handleSelectTime = (option, time) => {
    const newLeg = {
      from: currentFrom,
      to: currentTo,
      line: option.line,
      product: option.product,
      productName: option.productName,
      direction: option.direction,
      departure: time.departure,
      arrival: time.arrival,
      departureFormatted: time.departureFormatted,
      arrivalFormatted: time.arrivalFormatted,
      duration: time.duration
    };

    const newSelectedLegs = [...selectedLegs, newLeg];
    setSelectedLegs(newSelectedLegs);

    const route = buildRoute();
    
    // Find the current destination in the route to get its duration
    let stopoverDuration = 0;
    let nextIndex = -1;
    
    for (let i = 0; i < route.length; i++) {
      const routeStop = getStopFromRoutePoint(route[i]);
      if (routeStop.id === currentTo.id) {
        nextIndex = i;
        // Get the stopover duration for this stop (how long to wait)
        stopoverDuration = getDurationFromRoutePoint(route[i]);
        break;
      }
    }
    
    if (nextIndex === -1) {
      if (currentTo.id === destination.id) {
        setJourneyComplete(true);
        return;
      }
      nextIndex = currentLegIndex;
    }

    if (currentTo.id === destination.id) {
      setJourneyComplete(true);
      return;
    }

    // Calculate the adjusted arrival time including stopover duration
    const arrivalDate = new Date(time.arrival);
    if (stopoverDuration > 0) {
      arrivalDate.setMinutes(arrivalDate.getMinutes() + stopoverDuration);
    }
    const adjustedArrivalTime = arrivalDate.toISOString();
    
    setLastArrivalTime(adjustedArrivalTime);

    const nextFrom = currentTo;
    let nextTo = null;

    for (let i = nextIndex + 1; i < route.length; i++) {
      nextTo = getStopFromRoutePoint(route[i]);
      break;
    }

    if (!nextTo) {
      nextTo = destination;
    }

    setCurrentLegIndex(currentLegIndex + 1);
    setCurrentFrom(nextFrom);
    // Pass the adjusted arrival time (includes stopover wait time)
    fetchLegOptions(nextFrom, nextTo, adjustedArrivalTime);
  };

  const handleEditLeg = (legIndex) => {
    if (legIndex === 0) {
      handleRestart();
      return;
    }

    const legsToKeep = selectedLegs.slice(0, legIndex);
    setSelectedLegs(legsToKeep);
    
    const lastKeptLeg = legsToKeep[legsToKeep.length - 1];
    let arrivalTime = lastKeptLeg ? lastKeptLeg.arrival : null;
    
    // Add stopover duration if the last kept leg ends at a stopover
    if (lastKeptLeg) {
      const route = buildRoute();
      for (let i = 0; i < route.length; i++) {
        const routeStop = getStopFromRoutePoint(route[i]);
        if (routeStop.id === lastKeptLeg.to.id) {
          const stopoverDuration = getDurationFromRoutePoint(route[i]);
          if (stopoverDuration > 0) {
            const arrivalDate = new Date(arrivalTime);
            arrivalDate.setMinutes(arrivalDate.getMinutes() + stopoverDuration);
            arrivalTime = arrivalDate.toISOString();
          }
          break;
        }
      }
    }
    
    setLastArrivalTime(arrivalTime);
    
    const editFrom = lastKeptLeg ? lastKeptLeg.to : origin;
    setCurrentFrom(editFrom);
    setCurrentLegIndex(legIndex);
    
    const route = buildRoute();
    let nextTo = destination;
    
    for (let i = 0; i < route.length; i++) {
      const routeStop = getStopFromRoutePoint(route[i]);
      if (routeStop.id === editFrom.id && i < route.length - 1) {
        nextTo = getStopFromRoutePoint(route[i + 1]);
        break;
      }
    }
    
    fetchLegOptions(editFrom, nextTo, arrivalTime);
  };

  const handleRestart = () => {
    setCurrentLegIndex(0);
    setSelectedLegs([]);
    setIntermediateStops([]);
    setJourneyComplete(false);
    setLastArrivalTime(null);
    const route = buildRoute();
    const fromStop = getStopFromRoutePoint(route[0]);
    const toStop = getStopFromRoutePoint(route[1]);
    setCurrentFrom(fromStop);
    fetchLegOptions(fromStop, toStop, null);
  };

  const handleDone = () => {
    onComplete();
  };

  const handleSaveJourney = async () => {
    if (!user) return;
    
    setSaveStatus('saving');
    try {
      const response = await axios.post('/api/saved/journeys', {
        origin_id: origin.id,
        origin_name: origin.name,
        destination_id: destination.id,
        destination_name: destination.name,
        stopovers: stopovers || [],
        legs: selectedLegs, 
        userId: user.id
      });
      setSavedJourneyId(response.data.id); // Store the saved journey ID
      setSaveStatus('saved');
    } catch (err) {
      console.error('Failed to save journey:', err);
      setSaveStatus(null);
    }
  };

  const handleUnsaveJourney = async () => {
    if (!user || !savedJourneyId) return;
    
    setSaveStatus('unsaving');
    try {
      await axios.delete(`/api/saved/journeys/${savedJourneyId}`);
      setSavedJourneyId(null);
      setSaveStatus(null); // Back to initial state
    } catch (err) {
      console.error('Failed to unsave journey:', err);
      setSaveStatus('saved'); // Revert to saved state on error
    }
  };

  const handleToggleSave = () => {
    if (saveStatus === 'saved') {
      handleUnsaveJourney();
    } else if (!saveStatus || saveStatus === null) {
      handleSaveJourney();
    }
  };

  {/* Complete view of the journey */}
  if (journeyComplete) {
    return (
      <div className="journey-planner animate-fadeIn">
        <JourneyProgress 
          legs={selectedLegs} 
          isComplete={true}
        />
        
        {/* Save only if user logged in */}
        {user ? (
          <button 
            className={`save-journey-btn ${saveStatus === 'saved' ? 'saved' : ''}`}
            onClick={handleToggleSave}
            disabled={saveStatus === 'saving' || saveStatus === 'unsaving'}
          >
            {/* Toggle between save/unsave states */}
            {saveStatus === 'saved' ? ( 
              <> 
                {/* Show "Saved" with filled icon - click to unsave */}
                {strings.journey.saved}
                <BsBookmarkFill size={20} />
              </>
            ) : saveStatus === 'unsaving' ? (
              <>
                {/* Show loading state while unsaving */}
                {strings.journey.removing || '...'}
                <BsBookmarkFill size={20} />
              </>
            ) : (
              <>
                {/* Shows "Save to Favorites" button to add to saved */}
                {saveStatus === 'saving' ? '...' : strings.journey.saveToFavorites}
                <BsBookmark size={20} />
              </>
            )}
          </button>
        ) : (
          <div className="login-to-save-hint">
            {strings.journey.loginToSave}
            <BsBookmark size={16} />
          </div>
        )}
        
        <div className="journey-complete-actions">
          <button className="restart-btn" onClick={handleRestart}>
            {strings.journey.planAgain}
            <BsArrowCounterclockwise size={20} />
          </button>
          <button className="done-btn" onClick={handleDone}>
            {strings.journey.done}
            <BsCheckLg size={20} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="journey-planner animate-fadeIn">
      {/* Journey Progress */}
      {selectedLegs.length > 0 && (
        <JourneyProgress 
          legs={selectedLegs} 
          isComplete={false}
          onEditLeg={handleEditLeg}
        />
      )}

      {/* User can select current leg */}
      <div className="current-leg-card">
        <div className="leg-header">
          <div className="leg-number">{currentLegIndex + 1}</div>
          <div className="leg-route">
            <span className="leg-from">{currentFrom?.name}</span>
            <BsArrowRight size={16}/>
            <span className="leg-to">{currentTo?.name || strings.journey.loading}</span>
          </div>
        </div>

        {loading && (
          <div className="transport-loading">
            <div className="loading-spinner-large"></div>
            <span>{strings.journey.findingOptions}</span>
          </div>
        )}

        {error && (
          <div className="transport-error">
            <BsExclamationCricleFill size={24} color="#e74c3c" />
            <span>{error}</span>
            <button onClick={() => fetchLegOptions(currentFrom, currentTo, lastArrivalTime)}>
              {strings.journey.retry}
            </button>
          </div>
        )}

        {!loading && !error && transportOptions.length > 0 && (
          <TransportOptions 
            options={transportOptions}
            onSelectTime={handleSelectTime}
          />
        )}
      </div>

      {/* Back to planning journey and restart to home page */}
      <div className="journey-actions">
        <button className="back-journey-btn" onClick={onBack}>
          <BsArrowLeft size={20} />
        </button>
        
        {selectedLegs.length > 0 && (
          <button className="restart-journey-btn" onClick={handleRestart}>
            <BsArrowCounterclockwise size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

export default JourneyPlanner;
