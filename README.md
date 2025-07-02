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
   - A **circle** (target area)
   - A **square** and **green triangle** (other shapes)
   - **Control buttons** at the bottom

2. **Watch and Wait** - Let the agent move around for a few seconds to observe its random behavior

3. **Reward Good Behavior** - When the agent enters or stays in the red circle, click the **"Reward"** button immediately

4. **Configure Settings** (recommended):
   - Click the ⚙️ settings button
   - Enable **"Intrinsic Punishment"** (helps discourage inactivity)
   - Enable **"Gradient Rewards"** (makes learning more effective)

5. **Continue Training** - Keep rewarding the agent when it's in the circle. After 10-15 rewards, you should notice it starts preferring the circle area!

6. **Test Learning** - Stop giving rewards and see if the agent has learned to stay in the circle on its own

### What Makes This Special?

- **Real-time Learning**: Watch the AI change its behavior as you train it
- **Visual Feedback**: See exactly what the agent is "thinking" and how it responds
- **Hands-on ML Education**: Experience machine learning concepts interactively
- **Behavioral Psychology**: Understand how shaping works in both AI and animal training

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
