# Shaping Lab - Neural Network Training Simulator

A web-based interactive simulator for training neural network agents through shaping techniques. The agent learns to navigate a 2D environment using manual rewards/punishments and intrinsic feedback mechanisms.

## What is Shaping Lab?

Shaping Lab is an educational and experimental tool that demonstrates **behavioral shaping** - a machine learning technique inspired by psychology. You control a virtual environment where an AI agent (represented by a small circle) learns to behave through positive and negative feedback, just like training a pet or teaching a child.

### How it Works

The AI agent starts with a basic neural network "brain" that doesn't know how to behave. It moves around randomly at first. As you watch its behavior and give it rewards (when it does something good) or punishments (when it does something bad), the neural network learns and adapts its behavior over time.

### Quick Start Guide

**🎯 Goal: Train your agent to stay inside the circle**

1. **Start the app** - You'll see a canvas with:
   - A **red dot** (your AI agent) moving randomly
   - A **green circle** (target area)
   - A **blue square** and **orange triangle** (other shapes)
   - **Control buttons** at the bottom

2. **Manual Training** (hands-on experience):
   - Click the ⚙️ settings button
   - Enable **"Intrinsic Punishment"** (helps discourage inactivity)
   - Enable **"Gradient Rewards"** (makes learning more effective)
   - Close settings and watch the agent move
   - Click **"Reward"** when the agent enters the green circle

3. **Experiment with Networks**:
   - Try different neural network architectures (Simple MLP, Residual MLP, Recurrent LSTM)
   - Each has different learning characteristics and capabilities

4. **Advanced Features**:
   - Adjust reward and punishment settings for different learning behaviors
   - Try different timeframes for intrinsic punishment
   - Experiment with gradient reward ranges

### What Makes This Special?

- **Real-time Learning**: Watch the AI change its behavior as you train it
- **Visual Feedback**: See exactly what the agent is "thinking" and how it responds
- **Hands-on ML Education**: Experience machine learning concepts interactively
- **Behavioral Psychology**: Understand how shaping works in both AI and animal training

## Features

### Core Components

- **Neural Network Agent**: TensorFlow.js-powered agent that learns to navigate based on environmental inputs
- **Interactive Canvas**: Real-time 2D visualization with shapes (circle, square, triangle) as targets
- **Multiple Network Architectures**: Choose between Simple MLP, Residual MLP, and Recurrent LSTM
- **Reward System**: Manual reward/punishment with gradient distribution options
- **Intrinsic Learning**: Automatic punishment for inactivity to encourage exploration
- **Real-time Training**: Live neural network updates during interaction

### Training Mechanics

- **Manual Reward**: Click to reward current behavior
- **Manual Punishment**: Optional negative reinforcement (configurable)
- **Gradient Rewards**: Distribute rewards across state history for better learning
- **Intrinsic Punishment**: Automatic neutral punishment after periods of inactivity
- **State Buffering**: Maintains history of agent states for training

### Configuration Options

- Neural network architecture selection (Simple MLP, Residual MLP, Recurrent LSTM)
- Intrinsic punishment toggle and timeframe
- Gradient reward distribution
- Reward/punishment value ranges
- Canvas dimensions
- Manual punishment enable/disable

## Architecture

### Component Structure

- **App.tsx**: Main application component managing state and coordination
- **Agent.ts**: Agent logic with position, movement, and neural network integration
- **CanvasManager.ts**: Rendering engine for 2D canvas visualization
- **NeuralNetworkWrapper.ts**: TensorFlow.js integration with multiple architectures
- **RewardManager.ts**: Handles reward distribution, gradient calculation, and state buffering
- **Settings.tsx**: Configuration UI with network selection and parameter tuning

### Agent System
- **Position & Movement**: 2D position with heading and velocity
- **Neural Network Interface**: 7-input network (position, distances to shapes, heading, velocity)
- **Action Space**: Rotation direction/speed and forward movement speed
- **Constraint System**: Keeps agent within canvas boundaries

### Learning Pipeline
1. Agent perceives environment state (position, distances to shapes)
2. Neural network predicts movement actions based on current architecture
3. Agent applies actions and moves in the environment
4. States are buffered for batch learning
5. Manual rewards/punishments trigger training
6. Network weights are updated using gradient-based learning
7. Experience replay improves learning stability

## Usage

### Manual Training Session

For hands-on experience with reinforcement learning:

1. **Start**: Agent begins moving randomly
2. **Observe**: Watch agent behavior and movement patterns
3. **Reward**: Click "Reward" when agent performs desired actions (e.g., entering the circle)
4. **Configure**: Use settings to enable gradient rewards and intrinsic punishment
5. **Iterate**: Continue rewarding good behavior until patterns emerge

### Network Architecture Comparison

- **Simple MLP**: Fast training, good for basic behaviors (32→16→8 neurons)
- **Residual MLP**: Better for complex behaviors, uses skip connections (64→64→32 neurons)
- **Recurrent LSTM**: Memory-based, excellent for temporal patterns and sequences

### Recommended Training Scenario

**Goal**: Teach agent to stay inside the circle

**Manual Training Method**:
1. Enable intrinsic punishment (3-10 second timeframe)
2. Enable gradient rewards (min=0, max=1)
3. Reward agent every time it enters or stays in the circle
4. After 10-15 reward events, agent should prefer the circle area
5. Reduce manual rewards to test learned behavior

## Educational Value

### Learning Objectives

- **Reinforcement Learning Fundamentals**: Understand how rewards and punishments shape behavior
- **Neural Network Architectures**: Compare different network types and their learning characteristics
- **Behavioral Shaping**: Experience how gradual reinforcement creates complex behaviors
- **Exploration vs Exploitation**: Observe the balance between trying new actions and repeating successful ones
- **Temporal Credit Assignment**: See how gradient rewards distribute learning across time

### Suitable For

- **Students**: Interactive introduction to machine learning concepts
- **Educators**: Visual demonstration tool for AI/ML courses  
- **Researchers**: Rapid prototyping of shaping algorithms
- **Enthusiasts**: Hands-on exploration of neural network training

### Key Concepts Demonstrated

- **Policy Gradient Methods**: Direct optimization of action selection
- **Experience Replay**: Batch learning from stored state-action pairs
- **Reward Shaping**: Using domain knowledge to guide learning
- **Intrinsic Motivation**: Self-directed exploration and learning
- **Network Architecture Effects**: How model structure affects learning capability

## Technical Stack

- **Frontend Framework**: React 18 + TypeScript 5
- **Neural Network**: TensorFlow.js 4.20+ (with WebGL acceleration)
- **Rendering**: HTML5 Canvas API (2D context)
- **Build Tool**: Vite 5 (fast HMR, optimized builds)
- **Styling**: CSS3 with responsive design and CSS Grid/Flexbox
- **Code Quality**: ESLint + TypeScript strict mode

### Key Dependencies

```json
{
  "@tensorflow/tfjs": "^4.20.0",
  "react": "^18.2.0", 
  "react-dom": "^18.2.0"
}
```

### Performance Optimizations

- **Prediction Caching**: Neural network outputs cached for 50ms to reduce computation
- **Batch Training**: States processed in batches for efficient GPU utilization
- **UI Update Throttling**: React state updates limited to 10fps for smooth performance
- **Memory Management**: Proper tensor disposal to prevent memory leaks
- **Canvas Optimization**: Efficient 2D rendering with minimal state changes

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Modern web browser with WebGL support (for TensorFlow.js)

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

### Building

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Neural Network Details

### Input Features (7 dimensions)
- `posX`, `posY`: Normalized agent position [0,1]
- `distToCircle`, `distToSquare`, `distToTriangle`: Normalized distances to shapes
- `heading`: Normalized rotation angle [0,1]
- `velocity`: Normalized movement speed [0,1]

### Output Actions (3 dimensions)
- `rotationDirection`: Turn left/right [-1,1]
- `rotationSpeed`: How fast to turn [0,1]
- `forwardSpeed`: Movement speed [0,1]

### Network Architecture

The application supports three different neural network architectures:

#### Simple MLP (Multi-Layer Perceptron)
- **Structure**: Input(7) → 32 → 16 → 8 → Output(3)
- **Activation**: ReLU hidden layers, tanh output
- **Best for**: Quick learning, simple behaviors
- **Characteristics**: Fast training, good for basic patterns

#### Residual MLP
- **Structure**: Input(7) → 64 → 64 → 32 → Output(3) with skip connections
- **Activation**: ReLU hidden layers, tanh output
- **Best for**: Complex behaviors, avoiding vanishing gradients
- **Characteristics**: Better information flow, more stable training

#### Recurrent LSTM
- **Structure**: Input(7) → LSTM(32) → Dense(16) → Output(3)
- **Memory**: Maintains sequence buffer of last 10 states
- **Best for**: Temporal patterns, sequential decision making
- **Characteristics**: Learns from history, develops strategies based on recent actions

All architectures use:
- **Optimizer**: Adam with learning rate 0.001
- **Input normalization**: All inputs scaled to [0,1] range
- **Output ranges**: Rotation direction [-1,1], speeds [0,1]

## Mobile Support

The application is fully responsive and touch-friendly:

- **Responsive Canvas**: Automatically scales to fit mobile screens
- **Touch Controls**: All buttons optimized for touch interaction
- **Mobile Settings Drawer**: Slide-out configuration panel
- **Adaptive Layout**: Stacked controls and compact information display
- **Touch Feedback**: Visual feedback for all touch interactions
- **Portrait/Landscape**: Works in both orientations

### Mobile-Specific Features

- **Large Touch Targets**: Buttons sized for easy finger interaction
- **Swipe Gestures**: Settings drawer can be swiped open/closed
- **Viewport Optimization**: Prevents zooming and ensures full-screen experience
- **Performance Scaling**: Automatic quality adjustments for mobile GPUs

## User Interface

### Main Interface

- **Canvas Area**: Central visualization with agent and environment shapes
- **Control Panel**: Reward, Punish, Pause, Reset, and Settings buttons
- **Status Display**: Real-time information about training state and agent status
- **About Button**: Quick access to getting started guide

### Settings Drawer

- **Network Architecture**: Neural network type selection with explanations
- **Reward Configuration**: Gradient settings, value ranges, and timing
- **Canvas Settings**: Dimension controls and visual preferences

### Visual Feedback

- **Agent Visualization**: Color-coded agent with direction indicator
- **Reward Feedback**: Visual effects when rewards/punishments are applied
- **Training Status**: Real-time indicators of learning activity
- **Shape Highlighting**: Interactive environment elements
- **Information Overlay**: Debugging and monitoring information

## Browser Compatibility

- Chrome 88+ (recommended for best TensorFlow.js performance)
- Firefox 78+
- Safari 14+
- Edge 88+

**Requirements:**
- WebGL 2.0 support for TensorFlow.js operations
- ES2020 module support
- Canvas 2D API for rendering

**Performance Notes:**
- Simple MLP: Fastest training, works on all supported browsers
- Residual MLP: Good performance on modern browsers
- Recurrent LSTM: Requires more computational resources, best on Chrome/Edge
