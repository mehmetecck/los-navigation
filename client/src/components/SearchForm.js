import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../LanguageContext';
import './SearchForm.css';
import { BsPlus, BsArrowDownUp, BsXLg, BsBookmark, BsBookmarkFill, BsSearch} from 'react-icons/bs';

function SearchForm({ onSearch, user, savedStops = [], onStopsChange }) {
  const { strings } = useLanguage();
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [stopovers, setStopovers] = useState([]); // [{ stop: {id, name}, duration: 15 }, ...]
  const [activeInput, setActiveInput] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const searchTimeout = useRef(null);

  // Check if a stop is saved
  const isStopSaved = (stopId) => {
    return savedStops.some(s => s.stop_id === stopId);
  };

  // Filter saved stops based on search query
  const filteredSavedStops = searchQuery.length >= 1 
    ? savedStops.filter(s => 
        s.stop_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.custom_name && s.custom_name.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : savedStops;

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/stops/search?query=${encodeURIComponent(searchQuery)}`);
        setSuggestions(response.data);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      }
      setLoading(false);
    }, 300);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const handleInputFocus = (inputType, index = null) => {
    setActiveInput({ type: inputType, index });
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleInputChange = (value) => {
    setSearchQuery(value);
  };

  const handleSelectStop = (stop) => {
    if (activeInput.type === 'origin') {
      setOrigin(stop);
    } else if (activeInput.type === 'destination') {
      setDestination(stop);
    } else if (activeInput.type === 'stopover') {
      const newStopovers = [...stopovers];
      // Initialize stopover with stop and default duration of 15 minutes
      newStopovers[activeInput.index] = { 
        stop, 
        duration: newStopovers[activeInput.index]?.duration || 15 
      };
      setStopovers(newStopovers);
    }
    setActiveInput(null);
    setSearchQuery('');
    setSuggestions([]);
  };

  const handleAddStopover = () => {
    // Add new stopover with null stop and default 15 min duration
    setStopovers([...stopovers, { stop: null, duration: 15 }]);
  };

  const handleRemoveStopover = (index) => {
    const newStopovers = stopovers.filter((_, i) => i !== index);
    setStopovers(newStopovers);
  };

  const handleDurationChange = (index, duration) => {
    const newStopovers = [...stopovers];
    newStopovers[index] = { ...newStopovers[index], duration };
    setStopovers(newStopovers);
  };

  const handleSearch = () => {
    if (origin && destination) {
      // Filter out stopovers with no stop selected and pass the full stopover objects
      const validStopovers = stopovers.filter(s => s.stop !== null);
      onSearch(origin, destination, validStopovers);
    }
  };

  const handleSaveStop = async (e, stop) => {
    e.stopPropagation(); // Prevent selecting the stop
    if (!user) return;

    const alreadySaved = savedStops.find(s => s.stop_id === stop.id);

    try {
      if (alreadySaved) {
        // Unsave
        await axios.delete(`/api/saved/stops/${alreadySaved.id}`);
      } else {
        // Save
        await axios.post('/api/saved/stops', {
          stop_id: stop.id,
          stop_name: stop.name,
          userId: user.id
        });
      }
      // Refresh saved stops from parent
      if (onStopsChange) onStopsChange();
    } catch (err) {
      console.error('Failed to save/unsave stop:', err);
    }
  };

  const swapOriginDestination = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  // Duration of stopover options in minutes
  const durationOptions = [5, 10, 15, 30, 45, 60, 90, 120];

  const formatDuration = (mins) => {
    if (mins >= 60) {
      const hours = mins / 60;
      return strings.search.durationHour(hours);
    }
    return strings.search.durationMin(mins);
  };

  return (
    <div className="search-form animate-fadeIn">
      <div className="search-card">
        <div className="search-inputs">
          {/* Origin input */}
          <div className="input-row">
            <div className="input-marker origin-marker">A</div>
            <div 
              className={`input-field ${activeInput?.type === 'origin' ? 'active' : ''}`}
              onClick={() => handleInputFocus('origin')}
            >
              {activeInput?.type === 'origin' ? (
                <input
                  type="text"
                  placeholder={strings.search.enterStart}
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  autoFocus
                />
              ) : (
                <span className={origin ? 'selected' : 'placeholder'}>
                  {origin ? origin.name : strings.search.enterStart}
                </span>
              )}
            </div>
          </div>

          {/* Stopovers */}
          {stopovers.map((stopover, index) => (
            <div className="input-row stopover-row" key={index}>
              <div className="input-marker stopover-marker">{index + 1}</div>
              <div 
                className={`input-field stopover-field ${activeInput?.type === 'stopover' && activeInput?.index === index ? 'active' : ''}`}
                onClick={() => handleInputFocus('stopover', index)}
              >
                {activeInput?.type === 'stopover' && activeInput?.index === index ? (
                  <input
                    type="text"
                    placeholder={strings.search.enterStopover}
                    value={searchQuery}
                    onChange={(e) => handleInputChange(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <span className={stopover.stop ? 'selected' : 'placeholder'}>
                    {stopover.stop ? stopover.stop.name : strings.search.enterStopover}
                  </span>
                )}
              </div>
              
              {/* Duration selector */}
              <div className="stopover-duration-wrapper">
                <select
                  className="stopover-duration"
                  value={stopover.duration}
                  onChange={(e) => handleDurationChange(index, parseInt(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  title={strings.search.stopoverDuration}
                >
                  {durationOptions.map((mins) => (
                    <option key={mins} value={mins}>
                      {formatDuration(mins)}
                    </option>
                  ))}
                </select>
              </div>

              <button 
                className="remove-stopover"
                onClick={() => handleRemoveStopover(index)}
              >
                <BsXLg size={14}/>
              </button>
            </div>
          ))}

          {/* Add Stopover button */}
          <div className="input-row add-stopover-row">
            <div className="input-marker add-marker">
              <BsPlus/>
            </div>
            <button className="add-stopover-btn" onClick={handleAddStopover}>
              {strings.search.addStopover}
            </button>
          </div>

          {/* Destination input */}
          <div className="input-row">
            <div className="input-marker destination-marker">B</div>
            <div 
              className={`input-field ${activeInput?.type === 'destination' ? 'active' : ''}`}
              onClick={() => handleInputFocus('destination')}
            >
              {activeInput?.type === 'destination' ? (
                <input
                  type="text"
                  placeholder={strings.search.enterDestination}
                  value={searchQuery}
                  onChange={(e) => handleInputChange(e.target.value)}
                  autoFocus
                />
              ) : (
                <span className={destination ? 'selected' : 'placeholder'}>
                  {destination ? destination.name : strings.search.enterDestination}
                </span>
              )}
            </div>
          </div>

          {/* Swap button */}
          {origin && destination && (
            <button className="swap-button" onClick={swapOriginDestination}>
              <BsArrowDownUp size={16}/>
            </button>
          )}
        </div>

        {/* Suggestions dropdown */}
        {activeInput && (
          <div className="suggestions-container">
            {/* Shows saved stops section */}
            {filteredSavedStops.length > 0 && (
              <div className="saved-stops-section">
                <div className="saved-stops-header">
                  {strings.search.savedStops}
                </div>
                <ul className="suggestions-list saved">
                  {filteredSavedStops.map((savedStop) => (
                    <li 
                      key={`saved-${savedStop.id}`} 
                      className="suggestion-item saved-suggestion"
                      onClick={() => handleSelectStop({ id: savedStop.stop_id, name: savedStop.stop_name })}
                    >
                      <span className="suggestion-name">
                        {savedStop.custom_name || savedStop.stop_name}
                        {savedStop.custom_name && (
                          <span className="original-name"> ({savedStop.stop_name})</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {loading && (
              <div className="suggestions-loading">
                <div className="loading-spinner"></div>
                {strings.search.searching}
              </div>
            )}
            {!loading && suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((stop) => (
                  <li 
                    key={stop.id} 
                    className="suggestion-item"
                    onClick={() => handleSelectStop(stop)}
                  >
                    <span className="suggestion-name">{stop.name}</span>
                    {user && (
                      <button
                        className={`save-stop-btn ${isStopSaved(stop.id) ? 'saved' : ''}`}
                        onClick={(e) => handleSaveStop(e, stop)}
                        title={isStopSaved(stop.id) ? strings.search.stopSaved : strings.search.saveStop}
                      >
                        {isStopSaved(stop.id) ? (
                          <BsBookmarkFill size={16}/>
                        ) : (
                          <BsBookmark size={16} />
                        )}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {!loading && searchQuery.length >= 2 && suggestions.length === 0 && filteredSavedStops.length === 0 && (
              <div className="no-suggestions">{strings.search.noStationsFound}</div>
            )}
          </div>
        )}

        {/* Search button */}
        <button 
          className={`search-button ${origin && destination ? 'active' : ''}`}
          onClick={handleSearch}
          disabled={!origin || !destination}
        >
          <span>{strings.search.search}</span>
          <BsSearch size={18}/>
        </button>
      </div>
    </div>
  );
}

export default SearchForm;
