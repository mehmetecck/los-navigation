/**
 * Centralized text strings for the LOS! Berlin Transport application
 * This file contains all UI text in multiple languages
 */

const strings = {
  // English
  eng: {
    // App-wide
    app: {
      name: 'LOS!',
      subtitle: 'Berlin Transport',
      accountTitle: 'Account',
      accountComingSoon: 'Account features coming soon...',
    },

    // Header
    header: {
      saved: 'Saved',
      account: 'Account',
    },

    // Search Form
    search: {
      enterStart: 'Enter Start...',
      enterDestination: 'Enter Destination...',
      enterStopover: 'Enter Stopover...',
      addStopover: 'Add Stopover',
      search: 'Search',
      searching: 'Searching...',
      noStationsFound: 'No stations found',
      stopoverDuration: 'Stay',
      durationMin: (mins) => `${mins} min`,
      durationHour: (hrs) => `${hrs} hr`,
      saveStop: 'Save stop',
      stopSaved: 'Saved!',
      loginToSaveStop: 'Login to save stops',
      savedStops: 'Saved Stops',
    },

    // Journey Planner
    journey: {
      loading: 'Loading...',
      findingOptions: 'Finding transport options...',
      noConnections: 'No connections found for this route',
      failedToLoad: 'Failed to load transport options',
      retry: 'Retry',
      planAgain: 'Plan Again',
      done: 'Done',
      newSearch: 'New Search',
      startOver: 'Start Over',
      saveToFavorites: 'Save to Favorites',
      saved: 'Saved',
      removing: 'Removing...',
      loginToSave: 'Login to save journeys',
    },

    // Journey Progress
    progress: {
      selectedJourney: 'Selected Journey',
      journeyComplete: 'Completed Journey',
      minUnit: 'min',
      leg: 'leg',
      legs: 'legs',
    },

    // Transport Options
    transport: {
      more: (count) => `+${count} more`,
      showLess: 'Show less',
      noDirectOptions: 'No direct transport options available',
      minJourney: (mins) => `${mins} min journey`,
    },

    // Saved Journeys & Stops
    saved: {
      mySaved: 'My Saved',
      journeysTab: 'Journeys',
      stopsTab: 'Stops',
      loadingData: 'Loading...',
      noSavedJourneys: 'No saved journeys',
      saveRoutesHint: 'Save your frequent routes for quick access',
      noSavedStops: 'No saved stops',
      saveStopsHint: 'Save your favorite stops for quick access',
      via: 'via',
      loginRequired: 'Please login to see your saved journeys and stops',
      backToList: 'Back',
      replanJourney: 'Replan',
      deleteJourney: 'Delete',
      addStop: 'Add Stop',
      searchStopPlaceholder: 'Search for a stop...',
      customNamePlaceholder: 'Custom name (optional)',
      cancel: 'Cancel',
      save: 'Save',
    },

    // Account
    account: {
      title: 'Account',
      login: 'Login',
      register: 'Register',
      logout: 'Logout',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      usernamePlaceholder: 'Enter username',
      emailPlaceholder: 'Enter email',
      passwordPlaceholder: 'Enter password',
      confirmPasswordPlaceholder: 'Confirm password',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      welcome: (name) => `Welcome, ${name}!`,
      memberSince: 'Member since',
      dangerZone: 'Danger Zone',
      deleteData: 'Delete All Saved Data',
      deleteDataDesc: 'This will delete all your saved journeys and stops.',
      deleteAccount: 'Delete Account',
      deleteAccountDesc: 'This will permanently delete your account and all data.',
      confirmDelete: 'Are you sure? This cannot be undone.',
      cancel: 'Cancel',
      confirm: 'Confirm',
      loginError: 'Invalid email or password',
      registerError: 'Registration failed. Email may already be in use.',
      passwordMismatch: 'Passwords do not match',
      fieldRequired: 'All fields are required',
    },

    // Transport product names
    products: {
      suburban: 'S-Bahn',
      subway: 'U-Bahn',
      tram: 'Tram',
      bus: 'Bus',
      ferry: 'Ferry',
      express: 'Express',
      regional: 'Regional',
    },
  },

  // German
  de: {
    // App-wide
    app: {
      name: 'LOS!',
      subtitle: 'Berliner Verkehr',
      accountTitle: 'Konto',
      accountComingSoon: 'Kontofunktionen demnächst verfügbar...',
    },

    // Header
    header: {
      saved: 'Gespeichert',
      account: 'Konto',
    },

    // Search Form
    search: {
      enterStart: 'Start eingeben...',
      enterDestination: 'Ziel eingeben...',
      enterStopover: 'Zwischenhalt eingeben...',
      enterStart: 'Startbahnhof eingeben...',
      enterDestination: 'Zielbahnhof eingeben...',
      enterStopover: 'Zwischenhalt eingeben...',
      addStopover: 'Zwischenhalt hinzufügen',
      search: 'Suchen',
      searching: 'Suche läuft...',
      noStationsFound: 'Keine Stationen gefunden',
      stopoverDuration: 'Aufenthalt',
      durationMin: (mins) => `${mins} Min`,
      durationHour: (hrs) => `${hrs} Std`,
      saveStop: 'Speichern',
      stopSaved: 'Gespeichert!',
      loginToSaveStop: 'Anmelden um Haltestellen zu speichern',
      savedStops: 'Gespeicherte Haltestellen',
    },

    // Journey Planner
    journey: {
      loading: 'Laden...',
      findingOptions: 'Verbindungen werden gesucht...',
      noConnections: 'Keine Verbindungen für diese Strecke gefunden',
      failedToLoad: 'Verbindungen konnten nicht geladen werden',
      retry: 'Erneut versuchen',
      planAgain: 'Neu planen',
      done: 'Fertig',
      newSearch: 'Neue Suche',
      startOver: 'Von vorn',
      saveToFavorites: 'Zu Favoriten hinzufügen',
      saved: 'Gespeichert',
      removing: 'Wird entfernt...',
      loginToSave: 'Anmelden um Reisen zu speichern',
    },

    // Journey Progress
    progress: {
      selectedJourney: 'Ausgewählte Reise',
      journeyComplete: 'Reise vollständig',
      minUnit: 'Min',
      leg: 'Abschnitt',
      legs: 'Abschnitte',
    },

    // Transport Options
    transport: {
      more: (count) => `+${count} weitere`,
      showLess: 'Weniger anzeigen',
      noDirectOptions: 'Keine direkten Verbindungen verfügbar',
      minJourney: (mins) => `${mins} Min Fahrt`,
    },

    // Saved Journeys & Stops
    saved: {
      mySaved: 'Gespeichert',
      journeysTab: 'Reisen',
      stopsTab: 'Haltestellen',
      loadingData: 'Laden...',
      noSavedJourneys: 'Keine gespeicherten Reisen',
      saveRoutesHint: 'Speichere häufige Strecken für schnellen Zugriff',
      noSavedStops: 'Keine gespeicherten Haltestellen',
      saveStopsHint: 'Speichere deine Lieblingshaltestellen für schnellen Zugriff',
      via: 'über',
      loginRequired: 'Bitte anmelden, um gespeicherte Reisen und Haltestellen zu sehen',
      backToList: 'Zurück',
      replanJourney: 'Neu planen',
      deleteJourney: 'Löschen',
      addStop: 'Haltestelle hinzufügen',
      searchStopPlaceholder: 'Haltestelle suchen...',
      customNamePlaceholder: 'Eigener Name (optional)',
      cancel: 'Abbrechen',
      save: 'Speichern',
    },

    // Account
    account: {
      title: 'Konto',
      login: 'Anmelden',
      register: 'Registrieren',
      logout: 'Abmelden',
      username: 'Benutzername',
      email: 'E-Mail',
      password: 'Passwort',
      confirmPassword: 'Passwort bestätigen',
      usernamePlaceholder: 'Benutzername eingeben',
      emailPlaceholder: 'E-Mail eingeben',
      passwordPlaceholder: 'Passwort eingeben',
      confirmPasswordPlaceholder: 'Passwort bestätigen',
      noAccount: 'Noch kein Konto?',
      hasAccount: 'Bereits ein Konto?',
      welcome: (name) => `Willkommen, ${name}!`,
      memberSince: 'Mitglied seit',
      dangerZone: 'Gefahrenbereich',
      deleteData: 'Alle gespeicherten Daten löschen',
      deleteDataDesc: 'Dies löscht alle gespeicherten Reisen und Haltestellen.',
      deleteAccount: 'Konto löschen',
      deleteAccountDesc: 'Dies löscht dein Konto und alle Daten unwiderruflich.',
      confirmDelete: 'Bist du sicher? Dies kann nicht rückgängig gemacht werden.',
      cancel: 'Abbrechen',
      confirm: 'Bestätigen',
      loginError: 'Ungültige E-Mail oder Passwort',
      registerError: 'Registrierung fehlgeschlagen. E-Mail wird möglicherweise bereits verwendet.',
      passwordMismatch: 'Passwörter stimmen nicht überein',
      fieldRequired: 'Alle Felder sind erforderlich',
    },

    // Transport product names
    products: {
      suburban: 'S-Bahn',
      subway: 'U-Bahn',
      tram: 'Straßenbahn',
      bus: 'Bus',
      ferry: 'Fähre',
      express: 'Express',
      regional: 'Regionalbahn',
    },
  },

  // Shared (language-independent) - icons and emojis
  shared: {
    // Transport product icons 
    productIcons: {
      suburban: 'S',
      subway: 'U',
      tram: 'M',
      bus: 'BUS',
      ferry: '⛴',
      express: 'RE',
      regional: 'RB',
    },
    // Transport product emojis
    transportEmojis: {
      suburban: '🚈',
      subway: '🚇',
      tram: '🚊',
      bus: '🚌',
      ferry: '⛴️',
      express: '🚄',
      regional: '🚆',
      default: '🚉',
    },

    transportColors: {
      suburban: 'var(--sbahn-green)',
      subway: 'var(--ubahn-blue)',
      tram: 'var(--tram-red)',
      bus: 'var(--bus-purple)',
      ferry: 'var(--ferry-blue)',
      express: 'var(--regional-red)',
      regional: 'var(--regional-red)',
      default: 'var(--text-muted)',
    },
  },
};

export default strings;
