"""
environment.py

This file contains the KubernetesEnvironment class, which simulates a 
Kubernetes cluster for our Reinforcement Learning (RL) agent.

The agent interacts with this environment by taking actions (scaling up/down)
and receives feedback in the form of a new state and a reward.
"""

import random
import numpy as np

class KubernetesEnvironment:
    def __init__(self):
        """
        Initialize the simulation environment with default values.
        """
        # Define the limits of our cluster simulation
        self.min_pods = 1
        self.max_pods = 10
        
        # Call reset to set initial state values
        self.reset()

    def reset(self):
        """
        Resets the environment to a starting state.
        This is called at the beginning of every new training episode.
        """
        self.pod_count = 3
        self.active_requests = random.randint(50, 150)
        self.cpu_usage = 50.0  # Percentage
        self.memory_usage = 40.0 # Percentage
        self.response_time = 200.0 # Milliseconds
        
        # 'done' indicates if the episode has ended (e.g., if the cluster crashed)
        self.done = False
        
        return self.get_state()

    def get_state(self):
        """
        Returns the current state of the environment.
        The state is the information the agent uses to make a decision.
        """
        # We return the state as a numpy array, which is standard for RL models
        return np.array([
            self.cpu_usage,
            self.memory_usage,
            self.active_requests,
            self.response_time,
            self.pod_count
        ], dtype=np.float32)

    def step(self, action):
        """
        Applies the agent's action to the environment and calculates the next state and reward.
        
        Actions:
        0 = Scale Down (-1 pod)
        1 = Maintain (0 pods changed)
        2 = Scale Up (+1 pod)
        """
        # 1. Apply the action to change pod count
        if action == 0 and self.pod_count > self.min_pods:
            self.pod_count -= 1
        elif action == 2 and self.pod_count < self.max_pods:
            self.pod_count += 1
            
        # 2. Simulate changing traffic load randomly
        # Requests can go up or down by up to 50
        traffic_change = random.randint(-50, 50)
        self.active_requests = max(10, self.active_requests + traffic_change) # Ensure requests don't go below 10
        
        # 3. Recalculate metrics based on new traffic and pod count
        # More pods = lower CPU per pod. More traffic = higher CPU.
        # This is a simplified formula for educational purposes.
        self.cpu_usage = (self.active_requests * 2.5) / self.pod_count
        
        # Ensure CPU usage stays within 0-100%
        self.cpu_usage = max(5.0, min(100.0, self.cpu_usage))
        
        # Memory usage slightly correlates with CPU and pod count
        self.memory_usage = min(100.0, 30.0 + (self.cpu_usage * 0.4))
        
        # Increase response time drastically if CPU is high (simulating overload)
        if self.cpu_usage > 85.0:
            self.response_time = float(random.randint(800, 2000)) # Very slow response
        else:
            # Normal response time based on base delay + some CPU factor
            self.response_time = 100.0 + (self.cpu_usage * 2.0)

        # 4. Calculate the Reward
        reward = self._calculate_reward()
        
        # If CPU reaches 100%, we consider the episode 'done' (crashed)
        if self.cpu_usage >= 100.0:
            self.done = True # Cluster crashed! End of episode.

        # 5. Return the results (next_state, reward, done)
        return self.get_state(), reward, self.done

    def _calculate_reward(self):
        """
        Internal method to calculate the reward based on the current state.
        We want to reward keeping CPU around 60-70% and penalize waste or overload.
        """
        reward = 0.0
        
        # Penalize severe CPU overload (e.g., above 85%)
        if self.cpu_usage > 85.0:
            # Negative reward grows as CPU gets closer to 100%
            reward -= (self.cpu_usage - 85.0) * 2.0
            
        # Penalize under-utilization / wasted resources (e.g., CPU below 30% means too many pods)
        elif self.cpu_usage < 30.0:
            reward -= (30.0 - self.cpu_usage)
            
        # Reward efficient scaling (CPU between 60% and 80% is the sweet spot)
        elif 60.0 <= self.cpu_usage <= 80.0:
            reward += 10.0
            
        # Penalize having too many pods unnecessarily to encourage cost savings
        reward -= (self.pod_count * 0.5)
        
        return reward

# Alias for compatibility with existing train.py code
KubernetesEnv = KubernetesEnvironment
