# Shaping Lab - Neural Network Training Simulator

A web-based interactive simulator for training neural network agents through shaping techniques. The agent learns to navigate a 2D environment using manual rewards/punishments and intrinsic feedback mechanisms.

## Features

### Core Components

- **Neural Network Agent**: TensorFlow.js-powered agent that learns to navigate based on environmental inputs
- **Interactive Canvas**: Real-time 2D visualization with shapes (circle, square, triangle) as targets
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

- Intrinsic punishment toggle and timeframe
- Gradient reward distribution
- Reward/punishment value ranges
- Canvas dimensions
- Manual punishment enable/disable

## Architecture

### Agent System
- **Position & Movement**: 2D position with heading and velocity
- **Neural Network Interface**: 7-input network (position, distances to shapes, heading, velocity)
- **Action Space**: Rotation direction/speed and forward movement speed

### Learning Pipeline
1. Agent perceives environment state
2. Neural network predicts movement actions
3. Agent applies actions and moves
4. States are buffered for learning
5. Manual or intrinsic rewards trigger training
6. Network weights are updated based on reward gradients

## Usage

### Basic Training Session

1. **Start**: Agent begins moving randomly
2. **Observe**: Watch agent behavior and movement patterns
3. **Reward**: Click "Reward" when agent performs desired actions (e.g., entering the circle)
4. **Configure**: Use settings to enable gradient rewards and intrinsic punishment
5. **Iterate**: Continue rewarding good behavior until patterns emerge

### Recommended Training Scenario

**Goal**: Teach agent to stay inside the circle

1. Enable intrinsic punishment (3-10 second timeframe)
2. Enable gradient rewards (min=0, max=1)
3. Reward agent every time it enters or stays in the circle
4. After 10-15 reward events, agent should prefer the circle area
5. Reduce manual rewards to test learned behavior

## Technical Stack

- **Frontend**: React + TypeScript
- **Neural Network**: TensorFlow.js
- **Rendering**: HTML5 Canvas
- **Build Tool**: Vite
- **Styling**: CSS3 with responsive design

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern web browser with WebGL support

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building

```bash
npm run build
```

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
- Input layer: 7 neurons
- Hidden layers: 32 → 16 → 8 neurons (ReLU activation)
- Output layer: 3 neurons (tanh activation)
- Optimizer: Adam with learning rate 0.001

## Mobile Support

The application is fully responsive and touch-friendly:
- Responsive canvas sizing
- Touch-optimized controls
- Mobile-friendly settings drawer
- Adaptive layout for small screens

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

WebGL support required for TensorFlow.js operations.

## License

MIT License - see LICENSE file for details.
