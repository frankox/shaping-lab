import React from 'react';
import { DEMO_SCENARIOS, DemoScenario, applyDemoScenario } from '../demoScenarios';

interface DemoSelectorProps {
  onScenarioSelect: (scenario: DemoScenario) => void;
  onConfigChange: (config: any) => void;
}

export const DemoSelector: React.FC<DemoSelectorProps> = ({
  onScenarioSelect,
  onConfigChange,
}) => {
  const handleScenarioClick = (scenario: DemoScenario) => {
    applyDemoScenario(scenario, onConfigChange);
    onScenarioSelect(scenario);
  };

  return (
    <div className="setting-group">
      <h3>Demo Scenarios</h3>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
        Quick-start scenarios to explore different training approaches
      </p>
      
      {DEMO_SCENARIOS.map((scenario, index) => (
        <div key={index} className="demo-scenario" style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => handleScenarioClick(scenario)}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: 'white',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
              e.currentTarget.style.borderColor = '#2196F3';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#ddd';
            }}
          >
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              {scenario.name}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#666' }}>
              {scenario.description}
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};
