import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import './TransportOptions.css';

function TransportOptions({ options, onSelectTime }) {
  const { strings } = useLanguage();
  const [expandedOption, setExpandedOption] = useState(null);

  const getTransportColor = (product) => {
    return strings.transportColors[product] || strings.transportColors.default;
  };

  const getProductIcon = (product) => {
    return strings.productIcons[product] || '?';
  };

  const handleToggleExpand = (index) => {
    setExpandedOption(expandedOption === index ? null : index);
  };

  const initialTimesCount = 5;

  return (
    <div className="transport-options">
      {options.map((option, index) => {
        const isExpanded = expandedOption === index;
        const visibleTimes = isExpanded ? option.times : option.times.slice(0, initialTimesCount);
        const hasMoreTimes = option.times.length > initialTimesCount;

        return (
          <div 
            key={index} 
            className="transport-option"
            style={{ '--product-color': getTransportColor(option.product) }}
          >
            <div className="option-header">
              <div className="line-badge" style={{ background: getTransportColor(option.product) }}>
                <span className="line-icon">{getProductIcon(option.product)}</span>
                <span className="line-name">{option.line}</span>
              </div>
              <div className="option-info">
                <span className="option-direction">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 8 12 12 14 14"/>
                  </svg>
                  {option.direction}
                </span>
              </div>
            </div>

            <div className="times-row">
              <div className="times-list">
                {visibleTimes.map((time, timeIndex) => (
                  <button
                    key={timeIndex}
                    className="time-chip"
                    onClick={() => onSelectTime(option, time)}
                    title={strings.transport.minJourney(time.duration)}
                  >
                    {time.departureFormatted}
                  </button>
                ))}
                
                {hasMoreTimes && !isExpanded && (
                  <button 
                    className="more-times-btn"
                    onClick={() => handleToggleExpand(index)}
                  >
                    {strings.transport.more(option.times.length - initialTimesCount)}
                  </button>
                )}
                
                {isExpanded && hasMoreTimes && (
                  <button 
                    className="less-times-btn"
                    onClick={() => handleToggleExpand(index)}
                  >
                    {strings.transport.showLess}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {options.length === 0 && (
        <div className="no-options">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/>
            <path d="M16 16s-1.5-2-4-2-4 2-4 2"/>
            <line x1="9" y1="9" x2="9.01" y2="9"/>
            <line x1="15" y1="9" x2="15.01" y2="9"/>
          </svg>
          <span>{strings.transport.noDirectOptions}</span>
        </div>
      )}
    </div>
  );
}

export default TransportOptions;
