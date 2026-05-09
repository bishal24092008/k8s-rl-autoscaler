"""
model.py

This file contains the Deep Q-Network (DQN) architecture built with PyTorch.

A Deep Q-Network is a neural network that takes the current state of our 
Kubernetes environment as input and predicts the "Q-value" (expected future reward) 
for each possible action. The agent will then choose the action with the highest Q-value.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F

class DQNModel(nn.Module):
    def __init__(self, state_size=5, action_size=3):
        """
        Initialize the neural network architecture.
        
        Args:
            state_size (int): Number of inputs from the environment state.
                              (CPU usage, memory usage, active requests, response time, pod count)
            action_size (int): Number of possible actions the agent can take.
                               (0: Scale Down, 1: Maintain, 2: Scale Up)
        """
        # Call the initialization method of the parent class (nn.Module)
        super(DQNModel, self).__init__()
        
        self.state_size = state_size
        self.action_size = action_size
        
        # Define the layers of our Neural Network
        
        # 1. Input Layer to 1st Hidden Layer
        # Takes the 'state_size' inputs and connects them to 24 hidden nodes
        self.fc1 = nn.Linear(state_size, 24)
        
        # 2. 1st Hidden Layer to 2nd Hidden Layer
        # Connects the 24 nodes from the first layer to another 24 hidden nodes
        self.fc2 = nn.Linear(24, 24)
        
        # 3. 2nd Hidden Layer to Output Layer
        # Takes the 24 nodes and predicts the 'action_size' outputs (Q-values)
        self.fc3 = nn.Linear(24, action_size)

    def forward(self, state):
        """
        Pass the current state through the network to get action values (Q-values).
        This is called the "forward pass".
        
        Args:
            state (tensor): The current environment state.
            
        Returns:
            tensor: The predicted Q-values for each possible action.
        """
        # Pass input through the first layer, then apply ReLU activation function
        # ReLU (Rectified Linear Unit) helps the network learn complex, non-linear patterns
        x = F.relu(self.fc1(state))
        
        # Pass through the second layer and apply ReLU again
        x = F.relu(self.fc2(x))
        
        # Pass through the final output layer.
        # We don't apply an activation function here because we want the raw Q-values 
        # (which can be positive or negative depending on the expected reward).
        q_values = self.fc3(x)
        
        return q_values
