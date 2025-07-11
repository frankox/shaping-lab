import React from 'react';
import { AppConfig, NetworkArchitecture } from '../types';

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
          <h3>Neural Network Architecture</h3>
          
          <div className="setting-item">
            <label>
              Architecture Type
            </label>
            <select
              value={config.networkArchitecture}
              onChange={(e) => handleChange('networkArchitecture', e.target.value as NetworkArchitecture)}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '4px',
                border: '1px solid #ccc',
                backgroundColor: '#fff',
                fontSize: '0.9rem',
                marginTop: '0.25rem',
              }}
            >
              <option value="simple-mlp">Simple MLP</option>
              <option value="residual-mlp">Residual MLP</option>
              <option value="recurrent-lstm">Recurrent LSTM</option>
              <option value="recurrent-gru">Recurrent GRU</option>
            </select>
            
            <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#666' }}>
              {config.networkArchitecture === 'simple-mlp' && (
                <div>
                  <strong>Simple MLP:</strong> A basic multi-layer neural network with 3 hidden layers. 
                  Good for learning simple patterns and quick training. Uses layers of 32, 16, and 8 neurons 
                  with ReLU activation.
                </div>
              )}
              {config.networkArchitecture === 'residual-mlp' && (
                <div>
                  <strong>Residual MLP:</strong> An advanced network with skip connections that help 
                  information flow directly between layers. Better at learning complex behaviors and 
                  avoiding vanishing gradients. Uses 64-64-32 neuron layers with residual connections.
                </div>
              )}
              {config.networkArchitecture === 'recurrent-lstm' && (
                <div>
                  <strong>Recurrent LSTM:</strong> A memory-based network that remembers past actions 
                  and states. Excellent for learning sequences and temporal patterns. Can develop 
                  strategies that depend on recent history.
                </div>
              )}
              {config.networkArchitecture === 'recurrent-gru' && (
                <div>
                  <strong>Recurrent GRU:</strong> A simplified memory-based network similar to LSTM 
                  but with fewer parameters. Faster training than LSTM while still maintaining memory 
                  of past states. Good balance between performance and computational efficiency.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="setting-group">
          <h3>Reward Configuration</h3>
          
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
          
          {config.gradientReward ? (
            <>
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

              <div className="setting-item">
                <label>
                  Reward Buffer Size
                  <span className="value-display">{config.rewardBufferSize} states</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={config.rewardBufferSize}
                  onChange={(e) => handleChange('rewardBufferSize', Number(e.target.value))}
                />
              </div>
            </>
          ) : (
            <div className="setting-item">
              <label>
                Reward Amount
                <span className="value-display">{config.rewardAmount.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={config.rewardAmount}
                onChange={(e) => handleChange('rewardAmount', Number(e.target.value))}
              />
            </div>
          )}
        </div>

        <div className="setting-group">
          <h3>Punishment Configuration</h3>
          
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

          {config.manualPunishmentEnabled && (
            <>
              <div className="setting-item">
                <label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    Gradient Punishment
                    <div className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={config.gradientPunishment}
                        onChange={(e) => handleChange('gradientPunishment', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </div>
                  </div>
                </label>
              </div>
              
              {config.gradientPunishment ? (
                <>
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

                  <div className="setting-item">
                    <label>
                      Punishment Buffer Size
                      <span className="value-display">{config.punishmentBufferSize} states</span>
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="300"
                      step="10"
                      value={config.punishmentBufferSize}
                      onChange={(e) => handleChange('punishmentBufferSize', Number(e.target.value))}
                    />
                  </div>
                </>
              ) : (
                <div className="setting-item">
                  <label>
                    Punishment Amount
                    <span className="value-display">{config.punishmentAmount.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    value={config.punishmentAmount}
                    onChange={(e) => handleChange('punishmentAmount', Number(e.target.value))}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className="setting-group">
          <h3>Intrinsic Punishment Configuration</h3>
          
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
            <>
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
              <div className="setting-item">
                <label>
                  Intrinsic Gradient Punishment Min
                  <span className="value-display">{config.intrinsicGradientPunishmentMin.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.intrinsicGradientPunishmentMin}
                  onChange={(e) => handleChange('intrinsicGradientPunishmentMin', Number(e.target.value))}
                />
              </div>
              <div className="setting-item">
                <label>
                  Intrinsic Gradient Punishment Max
                  <span className="value-display">{config.intrinsicGradientPunishmentMax.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={config.intrinsicGradientPunishmentMax}
                  onChange={(e) => handleChange('intrinsicGradientPunishmentMax', Number(e.target.value))}
                />
              </div>
              <div className="setting-item">
                <label>
                  Intrinsic Buffer Size
                  <span className="value-display">{config.intrinsicBufferSize} states</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={config.intrinsicBufferSize}
                  onChange={(e) => handleChange('intrinsicBufferSize', Number(e.target.value))}
                />
              </div>
            </>
          )}
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
