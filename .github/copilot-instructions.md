<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Project Context
This is an interactive web application built with TypeScript and p5.js that simulates a 2D environment with:
- An Agent that moves randomly within a canvas
- Static objects (circle, square, diamond) 
- A reward system for reinforcement learning concepts

## Code Standards
- Use TypeScript with strict type checking
- Follow object-oriented programming principles
- Use ES6+ features and modern JavaScript patterns
- Maintain clean separation between classes and responsibilities
- Use meaningful variable and function names

## Architecture
- `Agent.ts`: Contains the Agent class with movement, rendering, and reward logic
- `StaticObjects.ts`: Contains static object classes (Circle, Square, Diamond)
- `types.ts`: Shared TypeScript interfaces and types
- `main.ts`: Main environment controller and p5.js integration
- Public directory contains HTML, CSS, and compiled JavaScript

## Development Workflow
- TypeScript files are in `src/` directory
- Compiled JavaScript goes to `dist/` directory  
- Public files are served from `public/` directory
- Use `npm run build` to compile TypeScript
- Use `npm run dev` to build and start development server
