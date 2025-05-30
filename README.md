# Interactive Agent Environment

A TypeScript-based interactive web application that simulates a 2D environment with an autonomous agent and static objects. The agent moves randomly within a canvas, and users can provide positive reinforcement through a reward system.

## Features

- **Autonomous Agent**: A small character that moves randomly within the canvas bounds
- **Static Objects**: Three different shapes (circle, square, diamond) positioned in the environment
- **Reward System**: Interactive button to reward the agent's behavior
- **Visual Feedback**: Agent changes color and size when rewarded
- **Real-time Position Tracking**: Display of agent's current coordinates
- **Responsive Design**: Modern UI that works on different screen sizes

## Technologies Used

- **TypeScript**: For type-safe application logic
- **p5.js**: For 2D graphics rendering and animation
- **HTML5 & CSS3**: For structure and modern styling
- **Node.js**: For development tooling and local server

## Project Structure

```
shaping-lab/
├── src/                    # TypeScript source files
│   ├── Agent.ts           # Agent class with movement and reward logic
│   ├── StaticObjects.ts   # Static object classes (Circle, Square, Diamond)
│   ├── types.ts           # Shared TypeScript interfaces
│   └── main.ts            # Main environment controller
├── public/                # Static files served to browser
│   ├── index.html         # Main HTML file
│   ├── styles.css         # Application styles
│   └── main.js            # Compiled JavaScript (generated)
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

1. **Observe the Agent**: Watch the red agent move randomly around the canvas
2. **Notice Static Objects**: See the blue circle, green square, and orange diamond
3. **Reward the Agent**: Click the "🎉 Reward Agent" button when you want to reinforce the agent's behavior
4. **Visual Feedback**: The agent will briefly turn green and grow larger when rewarded
5. **Track Position**: Monitor the agent's real-time coordinates in the top-left corner

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
