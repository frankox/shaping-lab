# Interactive Agent Environment with Neural Network Learning

A TypeScript-based interactive web application that simulates a 2D environment with an autonomous agent powered by TensorFlow.js. The agent uses a neural network to learn from user feedback and adapt its behavior over time.

## Features

- **Neural Network Agent**: A small character controlled by a TensorFlow.js neural network
- **Reinforcement Learning**: Agent learns from positive user feedback (rewards)
- **Real-time Training**: Neural network trains periodically on collected reward data
- **Static Objects**: Three different shapes (circle, square, diamond) positioned in the environment
- **Visual Feedback**: Agent changes color and size when rewarded
- **Real-time Stats**: Display of agent's position, training data size, and neural network status
- **Responsive Design**: Modern UI that works on different screen sizes

## How the Learning Works

### Neural Network Architecture
- **Input Layer**: 5 features
  - Agent's normalized position (x, y)
  - Distances to three static objects (circle, square, diamond)
- **Hidden Layers**: Two hidden layers with ReLU activation (16 and 8 neurons)
- **Output Layer**: 2 outputs with tanh activation (movement direction: deltaX, deltaY)

### Learning Process
1. **State Calculation**: The agent's state includes its position and distances to static objects
2. **Action Prediction**: Neural network predicts movement direction based on current state
3. **User Feedback**: When you click "Reward Agent", the current state-action pair is saved as positive training data
4. **Periodic Training**: Every 5 seconds, if enough reward data exists, the network retrains on positive examples
5. **Behavior Adaptation**: Over time, the agent learns to repeat behaviors that earned rewards

## Technologies Used

- **TypeScript**: For type-safe application logic
- **TensorFlow.js**: For neural network implementation and training
- **p5.js**: For 2D graphics rendering and animation
- **HTML5 & CSS3**: For structure and modern styling
- **Node.js**: For development tooling and local server

## Project Structure

```
shaping-lab/
├── src/                    # TypeScript source files
│   ├── Agent.ts           # Agent class with neural network integration
│   ├── NeuralNetwork.ts   # TensorFlow.js neural network implementation
│   ├── StaticObjects.ts   # Static object classes (Circle, Square, Diamond)
│   ├── types.ts           # Shared TypeScript interfaces
│   ├── main.ts            # Main environment controller
│   └── p5-globals.d.ts    # p5.js type declarations
├── public/                # Static files served to browser
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Application styles
│   └── *.js               # Compiled JavaScript files (generated)
├── dist/                  # Compiled TypeScript output
└── package.json           # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Build the TypeScript code**:
   ```bash
   npm run build
   ```

3. **Copy compiled files to public directory**:
   ```bash
   cp dist/main.js public/
   ```

### Running the Application

#### Option 1: Development Mode (Build + Serve)
```bash
npm run dev
```
This will compile the TypeScript code and start a local server on `http://localhost:3000`, automatically opening it in your browser.

#### Option 2: Production Mode (Serve Only)
```bash
npm start
```
This serves the existing compiled code on `http://localhost:3000`.

#### Option 3: Manual Steps
1. Build the project: `npm run build`
2. Copy the compiled main.js: `cp dist/main.js public/`
3. Start the server: `npx http-server public -p 3000 -o`

### Development Workflow

1. **Make changes** to TypeScript files in the `src/` directory
2. **Compile** with `npm run build`
3. **Copy** the main.js file: `cp dist/main.js public/`
4. **Refresh** your browser to see changes

For continuous development, you can use:
```bash
npm run watch
```
This will automatically recompile TypeScript files when they change (you'll still need to copy the main.js file and refresh the browser).

## How to Use

1. **Observe the Agent**: Watch the red agent move around using its neural network
2. **Notice Static Objects**: See the blue circle, green square, and orange diamond
3. **Reward Good Behavior**: Click the "🎉 Reward Agent" button when you like what the agent is doing
4. **Monitor Learning**: Watch the training data counter increase and check console logs (F12)
5. **See Adaptation**: Over time, observe how the agent learns to repeat rewarded behaviors
6. **Track Progress**: Monitor real-time stats showing position, training data, and network status

## Code Architecture

### Agent Class (`src/Agent.ts`)
- Handles autonomous movement with random velocity changes
- Manages collision detection with canvas boundaries
- Implements visual trail effect
- Provides reward feedback with temporary visual changes

### Static Objects (`src/StaticObjects.ts`)
- Abstract base class for all static objects
- Specific implementations for Circle, Square, and Diamond
- Each object has unique colors and rendering methods

### Environment (`src/main.ts`)
- Coordinates all objects and rendering
- Integrates with p5.js for canvas management
- Handles UI interactions and reward button
- Manages the main game loop

## Customization

### Modify Agent Behavior
- Change movement speed in `Agent.ts` by adjusting velocity multipliers
- Modify reward visual effects (color, size, duration)
- Adjust trail length and appearance

### Add New Objects
- Extend the `StaticObject` class in `StaticObjects.ts`
- Implement the required `draw()` method
- Add new instances to the `Environment` class

### Styling Changes
- Modify `public/styles.css` for UI appearance
- Adjust canvas background gradient in `Environment.draw()`
- Change object colors in their respective class constructors

## Browser Compatibility

This application works in all modern browsers that support:
- ES6+ JavaScript features
- HTML5 Canvas
- CSS3 features

## License

MIT License - feel free to use this code for learning and experimentation.

## Testing the Neural Network Learning

### How to Test Locally

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Open the developer console** (F12) to see detailed learning logs

3. **Test the learning process**:
   - Watch the agent move around (initially using neural network predictions)
   - Click "🎉 Reward Agent" when you want to reinforce specific behaviors
   - Check the console for reward logs showing:
     - Agent's current state (position and distances to objects)
     - Agent's current action (movement direction)
     - Training data size
     - Neural network training status

4. **Observe learning over time**:
   - After collecting 5+ rewards, the network will start periodic training
   - Watch the "Training Data" counter increase with each reward
   - Notice how the agent's behavior may gradually change based on your feedback
   - The agent will attempt to repeat behaviors that earned rewards

### What to Look For

- **Console Logs**: Detailed information about each reward event and training session
- **UI Stats**: Real-time display of training data size and neural network status
- **Behavioral Changes**: Over time, the agent should start preferring movements that earned rewards
- **Training Indicators**: The status will show "Training..." when the neural network is updating

### Expected Learning Timeline

- **0-4 rewards**: Agent uses mostly random/initial neural network predictions
- **5+ rewards**: Periodic training begins every 5 seconds
- **10+ rewards**: More noticeable behavioral patterns may emerge
- **20+ rewards**: Agent should show clear preference for rewarded behaviors

### Tips for Effective Training

- **Be consistent**: Reward similar behaviors to help the agent learn patterns
- **Be patient**: Neural network learning takes time and multiple examples
- **Use the console**: Monitor the logs to understand what the agent is learning
- **Experiment**: Try rewarding different types of movements or positions
