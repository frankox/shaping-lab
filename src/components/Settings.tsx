import React, { useState } from 'react';
import { AppConfig } from '../types';
import { DemoSelector } from './DemoSelector';
import { DemoScenario } from '../demoScenarios';

interface SettingsProps {
  isOpen: boolean;
  config: AppConfig;
  onConfigChange: (config: AppConfig) => void;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({
  isOpen,
  config,
  onConfigChange,
  onClose,
}) => {
  const handleChange = (key: keyof AppConfig, value: any) => {
    onConfigChange({
      ...config,
      [key]: value,
    });
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h2>Settings</h2>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
      </div>
      
      <div className="sidebar-content">
        <div className="setting-group">
          <h3>Learning Configuration</h3>
          
          <div className="setting-item">
            <label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Intrinsic Punishment
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config.intrinsicPunishment}
                    onChange={(e) => handleChange('intrinsicPunishment', e.target.checked)}
                  />
                  <span className="slider"></span>
                </div>
              </div>
            </label>
          </div>

          {config.intrinsicPunishment && (
            <div className="setting-item">
              <label>
                Intrinsic Timeframe (seconds)
                <span className="value-display">{config.intrinsicTimeframe}</span>
              </label>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={config.intrinsicTimeframe}
                onChange={(e) => handleChange('intrinsicTimeframe', Number(e.target.value))}
              />
            </div>
          )}

          <div className="setting-item">
            <label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Gradient Reward
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config.gradientReward}
                    onChange={(e) => handleChange('gradientReward', e.target.checked)}
                  />
                  <span className="slider"></span>
                </div>
              </div>
            </label>
          </div>

          <div className="setting-item">
            <label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                Manual Punishment
                <div className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={config.manualPunishmentEnabled}
                    onChange={(e) => handleChange('manualPunishmentEnabled', e.target.checked)}
                  />
                  <span className="slider"></span>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="setting-group">
          <h3>Reward Configuration</h3>
          
          <div className="setting-item">
            <label>
              Reward Min
              <span className="value-display">{config.rewardMin.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.rewardMin}
              onChange={(e) => handleChange('rewardMin', Number(e.target.value))}
            />
          </div>

          <div className="setting-item">
            <label>
              Reward Max
              <span className="value-display">{config.rewardMax.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.rewardMax}
              onChange={(e) => handleChange('rewardMax', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="setting-group">
          <h3>Punishment Configuration</h3>
          
          <div className="setting-item">
            <label>
              Punishment Min
              <span className="value-display">{config.gradientPunishmentMin.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.gradientPunishmentMin}
              onChange={(e) => handleChange('gradientPunishmentMin', Number(e.target.value))}
            />
          </div>

          <div className="setting-item">
            <label>
              Punishment Max
              <span className="value-display">{config.gradientPunishmentMax.toFixed(2)}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.gradientPunishmentMax}
              onChange={(e) => handleChange('gradientPunishmentMax', Number(e.target.value))}
            />
          </div>
        </div>

        <div className="setting-group">
          <h3>Canvas Configuration</h3>
          
          <div className="setting-item">
            <label>
              Canvas Width
              <span className="value-display">{config.canvasWidth}px</span>
            </label>
            <input
              type="range"
              min="400"
              max="1200"
              step="50"
              value={config.canvasWidth}
              onChange={(e) => handleChange('canvasWidth', Number(e.target.value))}
            />
          </div>

          <div className="setting-item">
            <label>
              Canvas Height
              <span className="value-display">{config.canvasHeight}px</span>
            </label>
            <input
              type="range"
              min="300"
              max="900"
              step="50"
              value={config.canvasHeight}
              onChange={(e) => handleChange('canvasHeight', Number(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
