"""
rl_agent.py

This file defines the Reinforcement Learning Agent.
The agent uses the DQN model to choose actions and learns from the environment over time.
"""

import random
from collections import deque
import torch
import torch.optim as optim
import torch.nn as nn
import numpy as np

# Import our neural network architecture
from model import DQNModel

class DQNAgent:
    def __init__(self, state_size=5, action_size=3):
        """
        Initialize the RL Agent.
        
        Args:
            state_size: Number of inputs from the environment (e.g., CPU, pods).
            action_size: Number of possible actions (scale down, maintain, scale up).
        """
        self.state_size = state_size
        self.action_size = action_size
        
        # 1. Experience Replay Memory
        # A 'deque' is a list that automatically removes the oldest items when full.
        # We store past experiences here so the agent can learn from them later.
        self.memory = deque(maxlen=2000)
        
        # 2. Hyperparameters for training
        self.gamma = 0.95    # Discount rate: How much we value future rewards vs immediate rewards
        self.epsilon = 1.0   # Exploration rate: Start by taking 100% random actions to explore
        self.epsilon_min = 0.01 # The lowest we want the exploration rate to go
        self.epsilon_decay = 0.995 # How fast the exploration rate decreases over time
        self.learning_rate = 0.001 # How quickly the neural network updates its weights
        
        # 3. Create the Main Model and the Target Model
        # The main model is used to make decisions.
        self.model = DQNModel(state_size, action_size)
        
        # The target model is a copy used to calculate stable target Q-values during training.
        self.target_model = DQNModel(state_size, action_size)
        self.update_target_model() # Make target model match main model initially
        
        # 4. Optimizer and Loss Function
        # Adam is a popular optimizer that adjusts the network's weights based on the loss.
        # MSE (Mean Squared Error) loss measures how far off our Q-value predictions are.
        self.optimizer = optim.Adam(self.model.parameters(), lr=self.learning_rate)
        self.criterion = nn.MSELoss()

    def update_target_model(self):
        """
        Copies the current weights from the main model to the target model.
        This provides a stable target during training, preventing oscillations.
        """
        self.target_model.load_state_dict(self.model.state_dict())

    def remember(self, state, action, reward, next_state, done):
        """
        Store a single experience (a step taken in the environment) into memory.
        """
        self.memory.append((state, action, reward, next_state, done))

    def act(self, state):
        """
        Choose an action based on the current state using an Epsilon-Greedy strategy.
        - With probability 'epsilon', pick a random action (Explore).
        - Otherwise, pick the best action predicted by the neural network (Exploit).
        """
        # Explore: Choose a random action
        if np.random.rand() <= self.epsilon:
            return random.randrange(self.action_size)
            
        # Exploit: Use the neural network to choose the best action
        # Convert the state array into a PyTorch tensor
        state_tensor = torch.FloatTensor(state)
        
        # Pass the state through the network to get Q-values for all actions
        with torch.no_grad(): # We don't need to track gradients for making a decision
            q_values = self.model(state_tensor)
            
        # Return the action (index) with the highest predicted Q-value
        return torch.argmax(q_values).item()

    def replay(self, batch_size):
        """
        Train the neural network using a random batch of past experiences.
        """
        # We can't train if we haven't collected enough experiences yet
        if len(self.memory) < batch_size:
            return
            
        # Randomly sample a batch of experiences from memory
        minibatch = random.sample(self.memory, batch_size)
        
        # We will collect states and targets to train the network in one go (batch processing)
        states = []
        targets = []
        
        for state, action, reward, next_state, done in minibatch:
            # Convert states to PyTorch tensors
            state_tensor = torch.FloatTensor(state)
            next_state_tensor = torch.FloatTensor(next_state)
            
            # Predict the Q-values for the current state using the main model
            target = self.model(state_tensor).detach()
            
            if done:
                # If the episode ended, the target Q-value is just the immediate reward
                target[action] = reward
            else:
                # Calculate the Target Q-value using the Bellman Equation
                # reward + gamma * max(future_Q_values)
                # We use the target_model to predict future Q-values for stability
                future_q_values = self.target_model(next_state_tensor).detach()
                target[action] = reward + self.gamma * torch.max(future_q_values).item()
                
            states.append(state_tensor)
            targets.append(target)
            
        # Convert lists to single tensors for efficient training
        states_tensor = torch.stack(states)
        targets_tensor = torch.stack(targets)
        
        # --- PyTorch Training Step ---
        
        # 1. Clear old gradients
        self.optimizer.zero_grad()
        
        # 2. Forward pass: Get predictions for all states in the batch
        predictions = self.model(states_tensor)
        
        # 3. Calculate the loss between our predictions and our targets
        loss = self.criterion(predictions, targets_tensor)
        
        # 4. Backward pass: Calculate gradients (how much to adjust weights)
        loss.backward()
        
        # 5. Update the neural network weights
        self.optimizer.step()
        
        # --- Epsilon Decay ---
        # Slowly decrease exploration rate over time as the agent learns
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.epsilon_decay
