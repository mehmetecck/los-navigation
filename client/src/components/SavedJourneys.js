import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../LanguageContext';
import './SavedJourneys.css';
import { BsTrash, BsGeoAlt, BsPencilSquare, BsCheck, BsX, BsPlus, BsBookmark, BsPersonCircle, BsArrowLeft, BsArrowRight, BsArrowCounterclockwise, BsMap} from "react-icons/bs";

function SavedJourneys({ onSelectJourney, user, onStopsChange }) {
  const { strings } = useLanguage();
  const [savedJourneys, setSavedJourneys] = useState([]);
  const [savedStops, setSavedStops] = useState([]);
  const [activeTab, setActiveTab] = useState('journeys');
  const [loading, setLoading] = useState(true);
  const [selectedJourney, setSelectedJourney] = useState(null); // For viewing journey details
  
  // Add stop state
  const [showAddStop, setShowAddStop] = useState(false);
  const [stopSearchQuery, setStopSearchQuery] = useState('');
  const [stopSuggestions, setStopSuggestions] = useState([]);
  const [searchingStops, setSearchingStops] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const [customStopName, setCustomStopName] = useState('');
  
  // Edit stop name state
  const [editingStopId, setEditingStopId] = useState(null);
  const [editStopName, setEditStopName] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setSavedJourneys([]);
      setSavedStops([]);
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const [journeysRes, stopsRes] = await Promise.all([
        axios.get(`/api/saved/journeys?userId=${user.id}`),
        axios.get(`/api/saved/stops?userId=${user.id}`)
      ]);
      setSavedJourneys(journeysRes.data);
      setSavedStops(stopsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
    setLoading(false);
  };

  const handleDeleteJourney = async (id) => {
    try {
      await axios.delete(`/api/saved/journeys/${id}`);
      setSavedJourneys(savedJourneys.filter(j => j.id !== id));
    } catch (error) {
      console.error('Failed to delete journey:', error);
    }
  };

  const handleDeleteStop = async (id) => {
    try {
      await axios.delete(`/api/saved/stops/${id}`);
      setSavedStops(savedStops.filter(s => s.id !== id));
      if (onStopsChange) onStopsChange(); // Refresh saved stops in App
    } catch (error) {
      console.error('Failed to delete stop:', error);
    }
  };

  // Search for stops to add
  useEffect(() => {
    if (stopSearchQuery.length < 2) {
      setStopSuggestions([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSearchingStops(true);
      try {
        const response = await axios.get(`/api/stops/search?query=${encodeURIComponent(stopSearchQuery)}`);
        setStopSuggestions(response.data);
      } catch (error) {
        console.error('Search stops error:', error);
        setStopSuggestions([]);
      }
      setSearchingStops(false);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [stopSearchQuery]);

  const handleSelectStopToAdd = (stop) => {
    setSelectedStop(stop);
    setCustomStopName('');
    setStopSearchQuery('');
    setStopSuggestions([]);
  };

  const handleSaveNewStop = async () => {
    if (!selectedStop || !user) return;

    try {
      const response = await axios.post('/api/saved/stops', {
        stop_id: selectedStop.id,
        stop_name: selectedStop.name,
        custom_name: customStopName || null,
        userId: user.id
      });
      setSavedStops([response.data, ...savedStops]);
      setSelectedStop(null);
      setCustomStopName('');
      setShowAddStop(false);
      if (onStopsChange) onStopsChange(); // Refresh saved stops in App
    } catch (error) {
      console.error('Failed to save stop:', error);
    }
  };

  const handleCancelAddStop = () => {
    setShowAddStop(false);
    setSelectedStop(null);
    setCustomStopName('');
    setStopSearchQuery('');
    setStopSuggestions([]);
  };

  const handleStartEditStop = (stop) => {
    setEditingStopId(stop.id);
    setEditStopName(stop.custom_name || '');
  };

  const handleSaveEditStop = async (stopId) => {
    try {
      const response = await axios.put(`/api/saved/stops/${stopId}`, {
        custom_name: editStopName || null
      });
      setSavedStops(savedStops.map(s => s.id === stopId ? response.data : s));
      setEditingStopId(null);
      setEditStopName('');
    } catch (error) {
      console.error('Failed to update stop:', error);
    }
  };

  const handleCancelEditStop = () => {
    setEditingStopId(null);
    setEditStopName('');
  };

  const handleJourneyClick = (journey) => {
    // If journey has legs (saved with details), show details view
    if (journey.legs && journey.legs.length > 0) {
      setSelectedJourney(journey);
    } else {
      // Old journeys without legs - redirect to planner
      onSelectJourney(journey);
    }
  };

  const getTransportColor = (product) => {
    return strings.transportColors[product] || strings.transportColors.default;
  };

  const getTransportEmoji = (product) => {
    return strings.transportEmojis[product] || strings.transportEmojis.default;
  };

  return (
    <div className="saved-journeys animate-fadeIn">
      <div className="saved-header">
        <h2>{strings.saved.mySaved}</h2>
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'journeys' ? 'active' : ''}`}
            onClick={() => setActiveTab('journeys')}
          >
            <BsMap size={18}/>
            {strings.saved.journeysTab}
          </button>
          <button 
            className={`tab ${activeTab === 'stops' ? 'active' : ''}`}
            onClick={() => setActiveTab('stops')}
          >
            <BsGeoAlt size={18}/>
            {strings.saved.stopsTab}
          </button>
        </div>
      </div>

      {!user ? (
        <div className="empty-state login-required">
          <BsPersonCircle size={48}/>
          <h3>{strings.saved.loginRequired}</h3>
        </div>
      ) : loading ? (
        <div className="loading-state">
          <div className="loading-spinner-large"></div>
          <span>{strings.saved.loadingData}</span>
        </div>
      ) : (
        <>
          {activeTab === 'journeys' && (
            <div className="journeys-list">
              {/* Journey detail view */}
              {selectedJourney ? (
                <div className="journey-detail-view">
                  <button className="back-to-list" onClick={() => setSelectedJourney(null)}>
                    <BsArrowLeft size={18}/>
                    {strings.saved.backToList}
                  </button>
                  
                  <div className="journey-detail-header">
                    <div className="journey-route-detail">
                      <span className="route-origin">{selectedJourney.origin_name}</span>
                      <BsArrowRight size={16} className="route-arrow"/>
                      <span className="route-destination">{selectedJourney.destination_name}</span>
                    </div>
                  </div>

                  <div className="journey-legs-detail">
                    {selectedJourney.legs.map((leg, index) => (
                      <div key={index} className="leg-detail-card">
                        <div className="leg-detail-number">{index + 1}</div>
                        <div className="leg-detail-content">
                          <div className="leg-detail-line" style={{ borderLeftColor: getTransportColor(leg.product) }}>
                            <span className="leg-emoji">{getTransportEmoji(leg.product)}</span>
                            <span className="leg-line-name">{leg.line}</span>
                            <span className="leg-direction">→ {leg.direction}</span>
                          </div>
                          <div className="leg-detail-stops">
                            <div className="leg-stop from">
                              <span className="stop-time">{leg.departureFormatted}</span>
                              <span className="stop-name">{leg.from.name}</span>
                            </div>
                            <div className="leg-stop to">
                              <span className="stop-time">{leg.arrivalFormatted}</span>
                              <span className="stop-name">{leg.to.name}</span>
                            </div>
                          </div>
                          <div className="leg-detail-duration">
                            {leg.duration} {strings.progress.minUnit}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="journey-detail-actions">
                    <button 
                      className="replan-btn"
                      onClick={() => {
                        setSelectedJourney(null);
                        onSelectJourney(selectedJourney);
                      }}
                    >
                      <BsArrowCounterclockwise size={18}/>
                      {strings.saved.replanJourney}
                    </button>
                    <button 
                      className="delete-detail-btn"
                      onClick={() => {
                        handleDeleteJourney(selectedJourney.id);
                        setSelectedJourney(null);
                      }}
                    >
                      <BsTrash size={18}/>
                    </button>
                  </div>
                </div>
              ) : savedJourneys.length === 0 ? (
                <div className="empty-state">
                  <BsBookmark size={48}/>
                  <h3>{strings.saved.noSavedJourneys}</h3>
                  <p>{strings.saved.saveRoutesHint}</p>
                </div>
              ) : (
                savedJourneys.map((journey) => (
                  <div key={journey.id} className="journey-card">
                    <div className="journey-card-content" onClick={() => handleJourneyClick(journey)}>
                      <div className="journey-route">
                        <span className="route-origin">{journey.origin_name}</span>
                        <BsArrowRight size={16} className="route-arrow"/>
                        <span className="route-destination">{journey.destination_name}</span>
                      </div>
                      {journey.name && (
                        <span className="journey-name">{journey.name}</span>
                      )}
                      {journey.legs && journey.legs.length > 0 && (
                        <span className="journey-legs-count">
                          {journey.legs.length} {journey.legs.length === 1 ? strings.progress.leg : strings.progress.legs}
                        </span>
                      )}
                      {journey.stopovers && journey.stopovers.length > 0 && (
                        <span className="journey-stopovers">
                          {strings.saved.via} {journey.stopovers.map(s => s.name || s.stop?.name).join(', ')}
                        </span>
                      )}
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteJourney(journey.id);
                      }}
                    >
                      <BsTrash size={18}/>
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'stops' && (
            <div className="stops-list">
              {/* Add Stop Button/Form */}
              {!showAddStop ? (
                <button className="add-stop-btn" onClick={() => setShowAddStop(true)}>
                  <BsPlus size={18}/>
                  {strings.saved.addStop}
                </button>
              ) : (
                <div className="add-stop-form">
                  {!selectedStop ? (
                    <>
                      <div className="stop-search-input">
                        <input
                          type="text"
                          placeholder={strings.saved.searchStopPlaceholder}
                          value={stopSearchQuery}
                          onChange={(e) => setStopSearchQuery(e.target.value)}
                          autoFocus
                        />
                        <button className="cancel-search-btn" onClick={handleCancelAddStop}>
                          <BsX size={18}/>
                        </button>
                      </div>
                      {searchingStops && (
                        <div className="stop-search-loading">
                          <div className="loading-spinner"></div>
                          {strings.search.searching}
                        </div>
                      )}
                      {!searchingStops && stopSuggestions.length > 0 && (
                        <ul className="stop-suggestions">
                          {stopSuggestions.map((stop) => (
                            <li key={stop.id} onClick={() => handleSelectStopToAdd(stop)}>
                              <BsGeoAlt size={18}/>
                              {stop.name}
                            </li>
                          ))}
                        </ul>
                      )}
                      {!searchingStops && stopSearchQuery.length >= 2 && stopSuggestions.length === 0 && (
                        <div className="no-stop-results">{strings.search.noStationsFound}</div>
                      )}
                    </>
                  ) : (
                    <div className="stop-name-form">
                      <div className="selected-stop-info">
                        <BsGeoAlt size={18}/>
                        <span>{selectedStop.name}</span>
                      </div>
                      <input
                        type="text"
                        placeholder={strings.saved.customNamePlaceholder}
                        value={customStopName}
                        onChange={(e) => setCustomStopName(e.target.value)}
                      />
                      <div className="stop-form-actions">
                        <button className="cancel-btn" onClick={handleCancelAddStop}>
                          {strings.saved.cancel}
                        </button>
                        <button className="save-btn" onClick={handleSaveNewStop}>
                          {strings.saved.save}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {savedStops.length === 0 && !showAddStop ? (
                <div className="empty-state">
                  <BsGeoAlt size={48}/>
                  <h3>{strings.saved.noSavedStops}</h3>
                  <p>{strings.saved.saveStopsHint}</p>
                </div>
              ) : (
                savedStops.map((stop) => (
                  <div key={stop.id} className="stop-card">
                    {editingStopId === stop.id ? (
                      <div className="stop-edit-form">
                        <input
                          type="text"
                          placeholder={strings.saved.customNamePlaceholder}
                          value={editStopName}
                          onChange={(e) => setEditStopName(e.target.value)}
                          autoFocus
                        />
                        <div className="stop-edit-actions">
                          <button className="cancel-edit-btn" onClick={handleCancelEditStop}>
                            <BsX size={20}/>
                          </button>
                          <button className="save-edit-btn" onClick={() => handleSaveEditStop(stop.id)}>
                            <BsCheck size={20}/>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="stop-card-content">
                          <div className="stop-icon">
                            <BsGeoAlt size={18}/>
                          </div>
                          <div className="stop-info">
                            {stop.custom_name && (
                              <span className="stop-custom-name">{stop.custom_name}</span>
                            )}
                            <span className={`stop-name ${stop.custom_name ? 'has-custom' : ''}`}>
                              {stop.stop_name}
                            </span>
                          </div>
                        </div>
                        <button 
                          className="edit-btn"
                          onClick={() => handleStartEditStop(stop)}
                        >
                          <BsPencilSquare size={18}/>
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteStop(stop.id)}
                        >
                          <BsTrash size={18}/>
                        </button>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default SavedJourneys;
