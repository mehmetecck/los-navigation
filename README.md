# LOS! - Berlin Transport Journey Planner

A modern web application for planning journeys on Berlin's public transport system (BVG). Unlike traditional journey planners, LOS! breaks down your journey into individual legs, allowing you to choose specific departures for each part of your trip.

## Features

- **Leg-by-Leg Journey Planning**: View and select individual transport options for each part of your journey
- **Multiple Transport Options**: See all available transport types (S-Bahn, U-Bahn, Tram, Bus) with departure times
- **Stopover Support**: Add intermediate stops to customize your route
- **Real-time Data**: Powered by the BVG REST API for accurate departure times
- **Journey History**: Track your past journeys
- **Saved Routes**: Save frequently used routes for quick access

## Tech Stack

- **Frontend**: React 18
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **API**: BVG REST API (v6.bvg.transport.rest)

## Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## Installation

### 1. Clone and Install Dependencies

```bash
cd los
npm run install:all
```

### 2. Set Up PostgreSQL Database

Create a new PostgreSQL database:

```bash
createdb los_transport
```

Initialize the database schema:

```bash
psql -d los_transport 
```

### 3. Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=los_transport
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=5000
NODE_ENV=development

# BVG API Base URL
BVG_API_URL=https://v6.bvg.transport.rest
```

### 4. Start the Application

Development mode (runs both frontend and backend):

```bash
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## How to use:

### Planning a Journey

1. **Enter Start and Destination**
   - Click on the "Enter Start..." field and type your starting station
   - Select from the autocomplete suggestions
   - Do the same for your destination

2. **Add Stopovers (Optional)**
   - Click "Add Stopover" to add intermediate stops
   - Useful for picking up friends or making planned stops

3. **Search**
   - Click the "Search" button to start planning

4. **Select Transport Options**
   - For each leg of your journey, you'll see available transport options
   - Each option shows the line (e.g., S7, U5, Bus M48) and departure times
   - Click on a departure time to select it
   - Times are shown in a row - click "more" to see additional times

5. **Complete Your Journey**
   - After selecting a time, the next leg's options appear
   - Continue until you reach your destination
   - View a summary of your complete journey

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stops/search?query=` | GET | Search for stops/stations |
| `/api/stops/:id` | GET | Get stop details |
| `/api/stops/:id/departures` | GET | Get departures from a stop |
| `/api/journeys/leg?from=&to=` | GET | Get transport options for a leg |
| `/api/journeys/next-leg?from=&to=&arrival=` | GET | Get next leg options after arrival |
| `/api/saved` | GET | Get saved journeys |
| `/api/saved` | POST | Save a journey |
| `/api/saved/:id` | DELETE | Delete a saved journey |
| `/api/saved/history` | GET | Get journey history |

## Project Structure

```
los/
├── client/                 # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.js
│   │   │   ├── SearchForm.js
│   │   │   ├── JourneyPlanner.js
│   │   │   ├── TransportOptions.js
│   │   │   ├── JourneyProgress.js
│   │   │   └── SavedJourneys.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── routes/
│   │   │   ├── stops.js
│   │   │   ├── journeys.js
│   │   │   └── saved.js
│   │   └── index.js
│   └── package.json
├── package.json
└── README.md
```

## Color Scheme

The app uses Berlin's official transport colors:

- **S-Bahn**: Green (#00A651)
- **U-Bahn**: Blue (#005DA8)
- **Tram**: Red (#CC1B41)
- **Bus**: Purple (#9C449C)
- **Ferry**: Blue (#0095DB)
- **BVG Yellow**: (#F9D423)

## References

- BVG REST API: https://v6.bvg.transport.rest

