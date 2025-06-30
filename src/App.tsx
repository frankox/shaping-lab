import { useEffect, useRef, useState, useCallback } from 'react';
import { Agent } from './Agent';
import { CanvasManager } from './CanvasManager';
import { NeuralNetworkWrapper } from './NeuralNetworkWrapper';
import { RewardManager } from './RewardManager';
import { Settings } from './components/Settings';
import { AppConfig, DEFAULT_CONFIG, SHAPES, LearningEvent } from './types';

const App = () => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const agentRef = useRef<Agent | null>(null);
  const canvasManagerRef = useRef<CanvasManager | null>(null);
  const neuralNetworkRef = useRef<NeuralNetworkWrapper | null>(null);
  const rewardManagerRef = useRef<RewardManager | null>(null);
  
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [stateBufferSize, setStateBufferSize] = useState(0);
  const [timeSinceLastLearning, setTimeSinceLastLearning] = useState(0);
  const [rewardFeedback, setRewardFeedback] = useState<{
    type: 'reward' | 'punishment';
    timestamp: number;
  } | null>(null);
  
  // Add throttling for UI updates
  const lastUIUpdateRef = useRef<number>(0);
  const UI_UPDATE_INTERVAL = 100; // Update UI every 100ms

  // Initialize components
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Clear any existing canvas elements
        if (canvasContainerRef.current) {
          canvasContainerRef.current.innerHTML = '';
        }

        // Initialize neural network
        neuralNetworkRef.current = new NeuralNetworkWrapper();
        
        // Initialize agent
        agentRef.current = new Agent(
          { x: config.canvasWidth / 2, y: config.canvasHeight / 2 },
          0
        );

        // Initialize canvas manager
        canvasManagerRef.current = new CanvasManager(config.canvasWidth, config.canvasHeight);
        
        // Initialize reward manager
        rewardManagerRef.current = new RewardManager(config, handleLearningEvent);

        // Add canvas to DOM
        if (canvasContainerRef.current && canvasManagerRef.current) {
          canvasContainerRef.current.appendChild(canvasManagerRef.current.getCanvas());
        }

        // Start the simulation
        startSimulation();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      if (canvasManagerRef.current) {
        canvasManagerRef.current.dispose();
      }
      if (neuralNetworkRef.current) {
        neuralNetworkRef.current.dispose();
      }
      if (rewardManagerRef.current) {
        rewardManagerRef.current.dispose();
      }
      // Clear canvas container
      if (canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Handle learning events
  const handleLearningEvent = useCallback(async (event: LearningEvent) => {
    if (!neuralNetworkRef.current || !canvasManagerRef.current) return;

    setIsTraining(true);
    
    try {
      const canvasDimensions = canvasManagerRef.current.getDimensions();
      const rewards = new Array(event.states.length).fill(event.reward);
      
      await neuralNetworkRef.current.trainOnExperience(
        event.states,
        rewards,
        SHAPES,
        canvasDimensions.width,
        canvasDimensions.height
      );
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      setIsTraining(false);
    }
  }, []);

  // Simulation render callback
  const renderFrame = useCallback((deltaTime: number) => {
    if (isPaused || isSettingsOpen) return;

    if (!agentRef.current || !neuralNetworkRef.current || !rewardManagerRef.current || !canvasManagerRef.current) {
      return;
    }

    const agent = agentRef.current;
    const neuralNetwork = neuralNetworkRef.current;
    const rewardManager = rewardManagerRef.current;
    const canvasManager = canvasManagerRef.current;

    try {
      // Get current state and network input
      const currentState = agent.getState();
      const canvasDimensions = canvasManager.getDimensions();
      const networkInput = agent.getNetworkInput(SHAPES, canvasDimensions.width, canvasDimensions.height);

      // Get neural network prediction (use cached prediction for smooth rendering)
      const networkOutput = neuralNetwork.getCachedPrediction() || { 
        forwardSpeed: 0, 
        rotationDirection: 0, 
        rotationSpeed: 0 
      };

      // Apply action to agent
      agent.applyAction(networkOutput, deltaTime * 60); // Normalize to 60fps for consistent movement
      agent.constrainToCanvas(canvasDimensions.width, canvasDimensions.height);

      // Add state to reward manager buffer
      rewardManager.addState(currentState);

      // Render everything in order for best performance
      canvasManager.renderShapes(SHAPES);
      canvasManager.renderAgent(agent);

      // Render feedback if active
      if (rewardFeedback && Date.now() - rewardFeedback.timestamp < 1000) {
        canvasManager.renderRewardFeedback(
          agent.getPosition(),
          rewardFeedback.type
        );
      } else if (rewardFeedback) {
        setRewardFeedback(null);
      }

      // Render info
      canvasManager.renderInfo({
        stateBufferSize: rewardManager.getStateBufferSize(),
        timeSinceLastLearning: rewardManager.getTimeSinceLastLearning(),
        isTraining: neuralNetwork.isCurrentlyTraining(),
        agentPosition: agent.getPosition(),
        agentHeading: agent.getHeading(),
        agentVelocity: agent.getVelocity(),
        networkOutput: networkOutput,
      });

      // Update neural network prediction asynchronously (don't block rendering)
      neuralNetwork.predict(networkInput).catch(error => {
        console.error('Neural network prediction error:', error);
      });

      // Update UI state with throttling to avoid too frequent React updates
      const now = performance.now();
      if (now - lastUIUpdateRef.current > UI_UPDATE_INTERVAL) {
        setStateBufferSize(rewardManager.getStateBufferSize());
        setTimeSinceLastLearning(rewardManager.getTimeSinceLastLearning());
        setIsTraining(neuralNetwork.isCurrentlyTraining());
        lastUIUpdateRef.current = now;
      }

    } catch (error) {
      console.error('Simulation error:', error);
    }
  }, [isPaused, isSettingsOpen, rewardFeedback]);

  // Start simulation loop
  const startSimulation = useCallback(() => {
    if (!canvasManagerRef.current || !agentRef.current || !neuralNetworkRef.current || !rewardManagerRef.current) {
      return;
    }

    canvasManagerRef.current.start(renderFrame);
  }, [renderFrame]);

  // Handle config changes
  useEffect(() => {
    if (rewardManagerRef.current) {
      rewardManagerRef.current.updateConfig(config);
    }

    if (canvasManagerRef.current) {
      canvasManagerRef.current.resize(config.canvasWidth, config.canvasHeight);
    }
  }, [config]);

  // Handle pause/resume when settings open/close or manual pause
  useEffect(() => {
    if (rewardManagerRef.current) {
      if (isSettingsOpen || isPaused) {
        rewardManagerRef.current.pause();
        // Also pause the canvas animation loop
        if (canvasManagerRef.current) {
          canvasManagerRef.current.pause();
        }
      } else {
        rewardManagerRef.current.resume();
        // Resume the canvas animation loop
        if (canvasManagerRef.current) {
          canvasManagerRef.current.resume(renderFrame);
        }
      }
    }
  }, [isSettingsOpen, isPaused, renderFrame]);

  const handleReward = () => {
    if (rewardManagerRef.current && !isSettingsOpen) {
      rewardManagerRef.current.applyManualReward();
      setRewardFeedback({ type: 'reward', timestamp: Date.now() });
    }
  };

  const handlePunishment = () => {
    if (rewardManagerRef.current && !isSettingsOpen && config.manualPunishmentEnabled) {
      rewardManagerRef.current.applyManualPunishment();
      setRewardFeedback({ type: 'punishment', timestamp: Date.now() });
    }
  };

  const handleReset = () => {
    if (agentRef.current && rewardManagerRef.current && neuralNetworkRef.current) {
      // Reset agent position
      agentRef.current.reset(
        { x: config.canvasWidth / 2, y: config.canvasHeight / 2 },
        0
      );
      
      // Reset reward manager
      rewardManagerRef.current.reset();
      
      // Reset neural network
      neuralNetworkRef.current.resetModel();
      
      setRewardFeedback(null);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const toggleSettings = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  return (
    <div className="app">
      <div className={`main-content ${isSettingsOpen ? 'sidebar-open' : ''}`}>
        <div className="canvas-container" ref={canvasContainerRef}>
          {/* Canvas will be inserted here */}
        </div>
        
        <div className="controls">
          <button
            className="reward-btn"
            onClick={handleReward}
            disabled={isSettingsOpen}
          >
            Reward
          </button>
          
          {config.manualPunishmentEnabled && (
            <button
              className="punish-btn"
              onClick={handlePunishment}
              disabled={isSettingsOpen}
            >
              Punish
            </button>
          )}
          
          <button
            className="pause-btn"
            onClick={togglePause}
            disabled={isSettingsOpen}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
          
          <button
            className="reset-btn"
            onClick={handleReset}
            disabled={isSettingsOpen}
          >
            Reset
          </button>
          
          <button
            className="settings-btn"
            onClick={toggleSettings}
          >
            Settings
          </button>
        </div>
      </div>

      <Settings
        isOpen={isSettingsOpen}
        config={config}
        onConfigChange={setConfig}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;
