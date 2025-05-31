import { NeuralNetwork } from './NeuralNetwork.js';
import { Circle, Square, Diamond } from './StaticObjects.js';

/**
 * Pretraining script for the Shaping Lab neural network
 * This script trains the network to be interested in objects before the main app runs
 */

async function pretrainNetwork() {
    console.log('🧠 Starting Neural Network Pretraining...');
    
    const canvasWidth = 800;
    const canvasHeight = 600;
    
    // Create the neural network
    const neuralNetwork = new NeuralNetwork();
    
    // Create the same static objects as in the main app
    const staticObjects = [
        new Circle(200, 150, 60),
        new Square(600, 200, 80),
        new Diamond(400, 450, 70)
    ];
    
    // Update status
    const statusElement = document.getElementById('status');
    if (statusElement) {
        statusElement.textContent += '🧠 Neural network initialized\n';
        statusElement.textContent += '📊 Generating synthetic training data...\n';
    }
    
    // Pretrain the network to be interested in objects
    console.log('📚 Running pretraining with object-interest examples...');
    await neuralNetwork.pretrainObjectInterest(canvasWidth, canvasHeight, staticObjects);
    
    // Mark as ready
    neuralNetwork.markAsReady();
    
    // Get training stats
    const stats = neuralNetwork.getStats();
    console.log('✅ Pretraining completed!');
    console.log(`Training data size: ${stats.dataSize} examples`);
    console.log(`Network ready: ${stats.isReady}`);
    
    if (statusElement) {
        statusElement.textContent += `✅ Training completed with ${stats.dataSize} examples\n`;
        statusElement.textContent += '🎯 Neural network is now ready for use!\n';
        statusElement.textContent += '🎮 You can now go to the main app for manual training\n';
    }
    
    // Store the trained network for the main app to use
    (window as any).pretrainedNetwork = neuralNetwork;
    
    return neuralNetwork;
}

export { pretrainNetwork };
