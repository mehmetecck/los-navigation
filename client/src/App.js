import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LanguageProvider, useLanguage } from './LanguageContext';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import JourneyPlanner from './components/JourneyPlanner';
import SavedJourneys from './components/SavedJourneys';
import Account from './components/Account';
import './App.css';

function AppContent() {
  const [view, setView] = useState('search'); // 'search', 'journey', 'saved', 'account'
  const [journeyData, setJourneyData] = useState(null);
  const [user, setUser] = useState(null);
  const [savedStops, setSavedStops] = useState([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('los-user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('los-user');
      }
    }
  }, []);

  // Fetch saved stops when user changes
  useEffect(() => {
    const fetchSavedStops = async () => {
      if (!user) {
        setSavedStops([]);
        return;
      }
      try {
        const response = await axios.get(`/api/saved/stops?userId=${user.id}`);
        setSavedStops(response.data);
      } catch (error) {
        console.error('Failed to fetch saved stops:', error);
      }
    };
    fetchSavedStops();
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('los-user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('los-user');
    setView('search');
  };

  const handleSearch = (origin, destination, stopovers) => {
    setJourneyData({ origin, destination, stopovers });
    setView('journey');
  };

  const handleBack = () => {
    setView('search');
    setJourneyData(null);
  };

  const handleJourneyComplete = () => {
    setView('search');
    setJourneyData(null);
  };

  const handleSelectSaved = (journey) => {
    setJourneyData({
      origin: { id: journey.origin_id, name: journey.origin_name },
      destination: { id: journey.destination_id, name: journey.destination_name },
      stopovers: journey.stopovers || []
    });
    setView('journey');
  };

  const refreshSavedStops = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/saved/stops?userId=${user.id}`);
      setSavedStops(response.data);
    } catch (error) {
      console.error('Failed to fetch saved stops:', error);
    }
  };

  return (
    <div className="app">
      <Header 
        view={view} 
        onViewChange={setView} 
        onBack={view === 'journey' ? handleBack : null}
      />
      
      <main className="main-content">
        {view === 'search' && (
          <SearchForm onSearch={handleSearch} user={user} savedStops={savedStops} onStopsChange={refreshSavedStops} />
        )}
        
        {view === 'journey' && journeyData && (
          <JourneyPlanner 
            origin={journeyData.origin}
            destination={journeyData.destination}
            stopovers={journeyData.stopovers}
            onComplete={handleJourneyComplete}
            onBack={handleBack}
            user={user}
          />
        )}
        
        {view === 'saved' && (
          <SavedJourneys 
            onSelectJourney={handleSelectSaved}
            user={user}
            onStopsChange={refreshSavedStops}
          />
        )}
        
        {view === 'account' && (
          <Account 
            user={user}
            onLogin={handleLogin}
            onLogout={handleLogout}
          />
        )}
      </main>
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
