import React from 'react';
import { DemoScenarioState } from '../types';
import { DEMO_SCENARIOS, DemoScenario } from '../demoScenarios';

interface DemoSelectorProps {
  demoState: DemoScenarioState;
  onScenarioSelect: (scenario: DemoScenario | null) => void;
  onStartDemo: () => void;
  onStopDemo: () => void;
  onIntervalChange: (interval: number) => void;
  disabled?: boolean;
}

export const DemoSelector: React.FC<DemoSelectorProps> = ({
  demoState,
  onScenarioSelect,
  onStartDemo,
  onStopDemo,
  onIntervalChange,
  disabled = false,
}) => {
  const selectedScenario = DEMO_SCENARIOS.find(s => s.name === demoState.selectedScenario);

  const handleScenarioChange = (scenarioName: string) => {
    if (scenarioName === '') {
      onScenarioSelect(null);
    } else {
      const scenario = DEMO_SCENARIOS.find(s => s.name === scenarioName);
      onScenarioSelect(scenario || null);
    }
  };

  return (
    <div className="setting-group">
      <h3>Demo Scenarios</h3>
      
      <div className="setting-item">
        <label>Select Demo Scenario</label>
        <select
          value={demoState.selectedScenario || ''}
          onChange={(e) => handleScenarioChange(e.target.value)}
          disabled={disabled || demoState.isActive}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            backgroundColor: disabled || demoState.isActive ? '#f5f5f5' : '#fff',
            fontSize: '0.9rem',
          }}
        >
          <option value="">Manual Training (No Demo)</option>
          {DEMO_SCENARIOS.map((scenario) => (
            <option key={scenario.name} value={scenario.name}>
              {scenario.name}
            </option>
          ))}
        </select>
      </div>

      {selectedScenario && (
        <>
          <div className="setting-item">
            <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
              Description
            </label>
            <p style={{ 
              fontSize: '0.85rem', 
              color: '#666', 
              margin: 0,
              lineHeight: '1.4',
              padding: '0.5rem',
              backgroundColor: '#f9f9f9',
              borderRadius: '4px'
            }}>
              {selectedScenario.description}
            </p>
          </div>

          <div className="setting-item">
            <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
              Instructions
            </label>
            <ul style={{ 
              fontSize: '0.8rem', 
              color: '#666', 
              margin: 0,
              paddingLeft: '1.2rem',
              lineHeight: '1.4'
            }}>
              {selectedScenario.instructions.map((instruction, index) => (
                <li key={index} style={{ marginBottom: '0.3rem' }}>
                  {instruction}
                </li>
              ))}
            </ul>
          </div>

          {selectedScenario.lockedSettings.length > 0 && (
            <div className="setting-item">
              <label style={{ fontWeight: 'bold', marginBottom: '0.5rem', display: 'block' }}>
                Locked Settings
              </label>
              <p style={{ 
                fontSize: '0.8rem', 
                color: '#e65100', 
                margin: 0,
                fontStyle: 'italic',
                backgroundColor: '#fff3e0',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ffcc02'
              }}>
                The following settings are locked in this scenario: {selectedScenario.lockedSettings.join(', ')}
              </p>
            </div>
          )}

          <div className="setting-item">
            <label>Auto Training Interval (ms)</label>
            <input
              type="number"
              min="100"
              max="2000"
              step="50"
              value={demoState.autoTrainingInterval}
              onChange={(e) => onIntervalChange(parseInt(e.target.value))}
              disabled={disabled || demoState.isActive}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: disabled || demoState.isActive ? '#f5f5f5' : '#fff',
              }}
            />
            <small style={{ color: '#666', fontSize: '0.75rem' }}>
              How often the demo evaluates the agent for automatic rewards/punishments
            </small>
          </div>

          <div className="setting-item">
            {!demoState.isActive ? (
              <button
                onClick={onStartDemo}
                disabled={disabled}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.6 : 1,
                }}
              >
                Start Auto Training
              </button>
            ) : (
              <button
                onClick={onStopDemo}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }}
              >
                Stop Auto Training
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};
