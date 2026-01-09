import React from 'react';
import { useLanguage } from '../LanguageContext';
import './JourneyProgress.css';

function JourneyProgress({ legs, isComplete, onEditLeg }) {
  const { strings } = useLanguage();

  const getTransportEmoji = (product) => {
    return strings.transportEmojis[product] || strings.transportEmojis.default;
  };

  const getTotalDuration = () => {
    if (legs.length === 0) return 0;
    const firstDeparture = new Date(legs[0].departure);
    const lastArrival = new Date(legs[legs.length - 1].arrival);
    return Math.round((lastArrival - firstDeparture) / 60000);
  };

  const handleLegClick = (index) => {
    if (onEditLeg && !isComplete) {
      onEditLeg(index);
    }
  };

  const canEdit = onEditLeg && !isComplete;

  return (
    <div className={`journey-progress ${isComplete ? 'complete' : ''}`}>
      <div className="progress-header">
        <h3>{isComplete ? strings.progress.journeyComplete : strings.progress.selectedJourney}</h3>
        {legs.length > 0 && (
          <div className="journey-summary">
            <span className="summary-total">{getTotalDuration()} {strings.progress.minUnit}</span>
            <span className="summary-legs">
              {legs.length} {legs.length > 1 ? strings.progress.legs : strings.progress.leg}
            </span>
          </div>
        )}
      </div>

      <div className="legs-list">
        {legs.map((leg, index) => (
          <div 
            key={index}
            className={`leg-card ${canEdit ? 'editable' : ''}`}
            onClick={() => canEdit && handleLegClick(index)}
          >
            <div className="leg-number">{index + 1}</div>
            <div className="leg-details">
              <div className="leg-line">
                <span className="leg-emoji">{getTransportEmoji(leg.product)}</span>
                <span className="leg-line-name">{leg.line}</span>
              </div>
              <div className="leg-route">
                {leg.from.name} → {leg.to.name}
              </div>
              <div className="leg-times">
                {leg.departureFormatted} - {leg.arrivalFormatted}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default JourneyProgress;
