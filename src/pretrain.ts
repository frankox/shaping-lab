import { NeuralNetwork } from './NeuralNetwork.js';
import { Circle, Square, Diamond } from './StaticObjects.js';

/**
 * Pretraining script for the Shaping Lab neural network
 * This script trains the network to be interested in objects before the main app runs
 * Run this separately to create a pre-trained model state
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
    
    // Pretrain the network to be interested in objects
    console.log('📚 Running pretraining with 50 positive examples...');
    await neuralNetwork.pretrainObjectInterest(canvasWidth, canvasHeight, staticObjects);
    
    // Get training stats
    const stats = neuralNetwork.getStats();
    console.log('✅ Pretraining completed!');
    console.log(`Training data size: ${stats.dataSize} examples`);
    console.log(`Last training: ${new Date(stats.lastTraining).toLocaleString()}`);
    
    // Save the trained model (this would require additional implementation)
    console.log('💾 Model state is now ready for the main application');
    console.log('🎯 The agent should now show interest in objects when rewarded manually');
    
    return neuralNetwork;
}

// Run pretraining if this script is executed directly
if (typeof window !== 'undefined' && (window as any).runPretraining) {
    pretrainNetwork().catch(console.error);
}

export { pretrainNetwork };
