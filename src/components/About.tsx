import React from 'react';
import './About.css';

const About: React.FC<{ onClose: () => void } > = ({ onClose }) => (
  <div className="about-modal">
    <div className="about-content">
      <button className="about-close" onClick={onClose}>&times;</button>
      <h2>What is Shaping Lab?</h2>
      <p>
        <strong>Shaping Lab</strong> is an interactive simulator for training a neural network agent using behavioral shaping techniques. Inspired by psychology, it lets you teach an AI agent to navigate a 2D environment by giving rewards and punishments, just like training a pet!
      </p>
      <h3>How to Use</h3>
      <ol>
        <li><strong>Start the app:</strong> The agent (white dot) moves randomly in a field with a red circle, blue square, and green triangle.</li>
        <li><strong>Reward good behavior:</strong> When the agent enters or stays in the red circle, click the <b>Reward</b> button.</li>
        <li><strong>Configure settings:</strong> Use the ⚙️ button to enable <b>Intrinsic Punishment</b> and <b>Gradient Rewards</b> for better learning.</li>
        <li><strong>Repeat:</strong> Keep rewarding the agent for good behavior. After several rewards, it will learn to prefer the circle!</li>
        <li><strong>Test:</strong> Stop rewarding and see if the agent stays in the circle on its own.</li>
      </ol>
      <h3>Why Try This?</h3>
      <ul>
        <li>See real-time AI learning</li>
        <li>Hands-on machine learning education</li>
        <li>Visualize how feedback shapes behavior</li>
      </ul>
    </div>
  </div>
);

export default About;
