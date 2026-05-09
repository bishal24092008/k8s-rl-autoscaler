"""
train.py

This is the main script to train our Reinforcement Learning Agent.
It connects the Agent (the "brain") and the Environment (the "Kubernetes cluster") 
in a loop so the agent can learn how to autoscale effectively.
"""

import torch
from environment import KubernetesEnvironment
from rl_agent import DQNAgent

def main():
    print("=============================================")
    print("🚀 Starting RL Agent Training Simulation...")
    print("=============================================")
    
    # 1. Initialize the Environment
    # This represents our simulated Kubernetes cluster
    env = KubernetesEnvironment()
    
    # Define the sizes based on our environment design
    state_size = 5  # CPU, Memory, Requests, Response Time, Pod Count
    action_size = 3 # 0: Scale Down, 1: Maintain, 2: Scale Up
    
    # 2. Initialize the DQN Agent
    agent = DQNAgent(state_size, action_size)
    
    # Training Configuration
    episodes = 100         # Number of full simulations to run
    max_steps = 50         # Max actions the agent can take per episode before we force a reset
    batch_size = 32        # Number of past experiences to learn from at once
    sync_target_every = 10 # Update the target model every 10 episodes
    
    # 3. Training Loop
    for e in range(1, episodes + 1):
        # Reset the environment at the start of each episode and get initial state
        state = env.reset()
        total_reward = 0
        
        # 4. Episode Loop
        for time in range(max_steps):
            # A. The agent looks at the current state and decides what to do
            action = agent.act(state)
            
            # B. The environment reacts to the action
            next_state, reward, done = env.step(action)
            
            # C. The agent remembers what just happened so it can learn from it later
            agent.remember(state, action, reward, next_state, done)
            
            # Update the current state to the new state
            state = next_state
            total_reward += reward
            
            # D. The agent trains its neural network using a batch of past experiences
            agent.replay(batch_size)
            
            # If the environment signals 'done' (e.g., cluster crashed), end the episode early
            if done:
                print(f"⚠️ Episode {e} crashed at step {time + 1} due to high CPU load.")
                break
                
        # Update the stable target model periodically
        if e % sync_target_every == 0:
            agent.update_target_model()
            
        # 5. Print out the results for this episode
        # We print the episode number, the total score (reward), and the current exploration rate (epsilon)
        print(f"Episode: {e}/{episodes} | Total Reward: {total_reward:.2f} | Epsilon: {agent.epsilon:.3f}")

    print("=============================================")
    print("✅ Training Complete!")
    
    # 6. Save the trained model weights
    # We save the model so we don't have to retrain it from scratch every time
    model_save_path = "dqn_autoscaler.pth"
    torch.save(agent.model.state_dict(), model_save_path)
    print(f"💾 Model weights saved to {model_save_path}")

if __name__ == "__main__":
    main()
