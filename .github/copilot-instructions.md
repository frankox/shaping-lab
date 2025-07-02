# copilot-instruction.md

## Project: Shaping-Lab – Web-Based Shaping Simulator

### 1. Project Goal

Build an interactive web simulator for shaping sessions. A neural-network-controlled agent moves in a 2D space and can be trained by the user via manual reinforcement and intrinsic or manual punishement. The goal is to enable observable learning behavior directly in the browser.

### 2. Architecture Overview

**Components:**

- **CanvasManager**: Renders environment and agent at \~30 FPS.
- **Agent**: Maintains position, heading, and velocity. Receives actions from a neural network. Moves forward and rotates.
- **NeuralNetworkWrapper**: Built with TensorFlow\.js. Handles inference and learning. Runs entirely in-browser.
- **RewardManager**: Buffers states and applies manual/intrinsic rewards and punishments. Supports reward gradients.
- **UIController**: Provides all UI elements. Manages configuration, toggles, and sliders.

### 3. Neural Network Interface

**Input (7 floats):**

- posX
- posY
- distToSquare
- distToCircle
- distToTriangle
- heading -> current rotation
- velocity

**Output (3 floats):**

- rotationDirection: right/left
- rotationSpeed: [0, 1]
- forwardSpeed: [0, 1]

The agent should rotate gradually, like an animal or a robot would do in a natural context. Add other outputs or change the ones above if other are necessary to achieve this behaviour 

### 4. Agent Lifecycle

1. Initialized on page load.
2. At each frame: perceives state -> predicts movement -> updates position.
3. On reward/punishment: learns from buffered states.
4. Loop continues until user resets or closes session.

### 5. Learning Mechanics

#### 5.1 Manual Reward

- User clicks a "Reward" button.
- Optional gradient mode.

5.1.1 Gradient Mode: toggle

- If enabled:
  - Buffer of states since last learning is passed to th
  - Buffer of states since last learning is passed to the network.e network.
  * &#x20;Assigns distributed reward/punishment to buffered states.
  * Range: minValue to maxValue.
- If disabled:
  - Only the state coinciding with the reward is passed.
  - User can configure the amount of rewarding power.

#### 5.2 Manual Punishment (optional)

- Works like reward but for negative values.
- Has gradient mode toggle

#### 5.3 Intrinsic Punishment: toggle

- Auto-triggers if no manual input for N seconds (>=1).
- This tipe of learning mechanic is always in gradient mode
- Default gradient is neutral (0).
- Configurable gradient and timeframe.


### 6. Configuration Options

When the settings drawer is open, the agent and the canvas must pause.



| Option                        | Default | Description                        |
| ----------------------------- | ------- | ---------------------------------- |
| Intrinsic Punishment          | Off     | Auto-punish if inactive            |
| Timeframe                     | 10 sec  | Min 1 sec                          |
| Gradient Reward               | Off     | Enables linear reward distribution |
| Reward Min / Max              | 0 / 1   | Float values                       |
| Gradient Punishment Min / Max | 0 / 1   | Float values                       |
| Manual Punishment Enabled     | Off     | Enables punish button              |

### 7. Technical Stack

In choosing the technology to use, prioritize efficiency of the neural network and training process.

Suggestions:

- TypeScript
- React
- HTML5 Canvas (or p5.js)
- TensorFlow\.js v4+
- Vite or Webpack

### 8. UI & UX

- Canvas area: configurable in the settings drawer.
- Side drawer with settings: when open, the canvas and the neural network are paused and the reward and punishement button are disabled
- Reward, Punish (if enabled)
- Visual feedback for agent state changes.
- It must be mobile friendly

### 9. Training Scenario – Teach the Agent to Stay Inside the Circle

**Goal:** Train the agent to recognize and remain inside the circle.

**Session Flow:**

1. Agent initializes and moves randomly.
2. Intrinsic punishment is enabled with 3s neutral gradient.
3. User rewards agent every time it enters the circle.
4. Gradient reward is active (min=0, max=1).
5. Repetition (\~10–15 events) leads agent to favor the circle.
6. Intrinsic punishment discourages unrelated behaviors.
7. Agent behavior stabilizes toward staying inside the circle.
8. User stops rewarding. Behavior remains consistent.
9. Session ends. Model can optionally be saved.

### 10. Glossary

- **State Buffer**: States collected since last learning.
- **Gradient Reward**: Linearly distributed values across state history.
- **Intrinsic Punishment**: Automatic feedback for agent activities that did't bring to a manual reward or punishement.
- **Manual Reward/Punishment**: User-issued learning signals.

###

## Coding Standards
- **comments**: comment only what strictly necessary, avoid redundant comment generation
