# Intelligent Kubernetes Autoscaling Using Reinforcement Learning

## Project Overview

This project implements an intelligent Kubernetes autoscaling system using Deep Reinforcement Learning (DQN). Traditional Kubernetes Horizontal Pod Autoscaler (HPA) reacts to workload changes only after CPU or memory thresholds are crossed, which can result in latency spikes and inefficient resource utilization.

Our solution introduces a Deep Q-Network (DQN) based autoscaling agent that learns workload patterns and makes proactive scaling decisions to improve application performance and resource efficiency.

This project is inspired by the HCLTech DBS Business / AIX Business problem statement for intelligent cloud infrastructure management.

---

## Problem Statement

Kubernetes Horizontal Pod Autoscaler (HPA) relies on static CPU and memory thresholds.

Challenges:

- Reactive scaling causes delays during sudden traffic spikes.
- Cold-start latency impacts user experience.
- Manual threshold tuning is required for different workloads.
- No self-learning mechanism exists to adapt automatically.

The objective is to develop a Reinforcement Learning based autoscaler that can learn workload behavior and make intelligent scaling decisions.

---

## Objectives

- Simulate Kubernetes cluster behavior.
- Monitor workload metrics in real time.
- Implement a Deep Q-Network (DQN) agent.
- Train the agent using simulated workloads.
- Compare intelligent scaling with traditional autoscaling concepts.
- Improve resource utilization and response times.

---

## Key Features

### Dashboard Monitoring

- Live CPU usage monitoring
- Active pod tracking
- Response time monitoring
- Workload status detection
- Active request monitoring

### Reinforcement Learning

- Deep Q-Network (DQN) implementation
- Experience Replay Memory
- Epsilon-Greedy Exploration Strategy
- Target Network Synchronization
- Reward-based Learning

### Kubernetes Integration

- Deployment Configuration
- Service Configuration
- Horizontal Pod Autoscaler (HPA)
- Containerized Deployment using Docker

### Simulation

- Dynamic traffic generation
- Normal workload simulation
- Heavy workload simulation
- Autoscaling decision simulation

---

## System Architecture

```text
User Traffic
      │
      ▼
 Flask Backend
      │
      ▼
 Metrics Collection
(CPU, Pods, Requests,
 Response Time)
      │
      ▼
 DQN Agent
      │
      ▼
 Scaling Decision
(Scale Up / Hold / Scale Down)
      │
      ▼
 Kubernetes Cluster
      │
      ▼
 Updated Metrics
```

---

## Reinforcement Learning Design

### State Space

The DQN agent observes:

- CPU Usage
- Memory Usage (simulated)
- Active Pod Count
- Request Queue Depth
- Response Time

### Action Space

The agent can perform:

| Action | Description |
|----------|-------------|
| 0 | Scale Down |
| 1 | Maintain Current Pods |
| 2 | Scale Up |

### Reward Function

The agent receives:

Positive Rewards:

- Low response time
- Efficient resource utilization
- Stable workload handling

Negative Rewards:

- High CPU utilization
- High response time
- Excessive pod creation
- System overload

---

## Deep Q-Network (DQN)

The DQN model is implemented using PyTorch.

Features:

- Fully Connected Neural Network
- Experience Replay Buffer
- Bellman Equation Learning
- Target Network Updates
- Adam Optimizer
- Mean Squared Error Loss

Training File:

```text
rl-agent/train.py
```

Model File:

```text
rl-agent/model.py
```

Saved Weights:

```text
rl-agent/dqn_autoscaler.pth
```

---

## Project Structure

```text
Devops_Project
│
├── backend
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── k8s
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── hpa.yaml
│   └── README.md
│
├── rl-agent
│   ├── environment.py
│   ├── model.py
│   ├── rl_agent.py
│   ├── train.py
│   ├── requirements.txt
│   └── dqn_autoscaler.pth
│
└── README.md
```

---

## Technology Stack

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Python
- Flask
- Flask-CORS

### Reinforcement Learning

- PyTorch
- Deep Q-Network (DQN)
- NumPy

### DevOps

- Docker
- Kubernetes
- HPA
- YAML Configuration

### Version Control

- Git
- GitHub

---

## Running the Dashboard

### Backend

```bash
cd backend

pip install -r requirements.txt

python app.py
```

Backend URL:

```text
http://127.0.0.1:5000
```

Metrics Endpoint:

```text
http://127.0.0.1:5000/metrics
```

---

### Frontend

Open:

```text
frontend/index.html
```

Or run using VS Code Live Server.

---

## Training the RL Agent

Navigate to:

```bash
cd rl-agent
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run training:

```bash
python train.py
```

Output:

```text
Training Complete!
Model weights saved to dqn_autoscaler.pth
```

---

## Kubernetes Deployment

Apply Kubernetes resources:

```bash
kubectl apply -f deployment.yaml

kubectl apply -f service.yaml

kubectl apply -f hpa.yaml
```

Verify:

```bash
kubectl get pods

kubectl get svc

kubectl get hpa
```

---

## Docker Support

Build image:

```bash
docker build -t intelligent-autoscaler .
```

Run container:

```bash
docker run -p 5000:5000 intelligent-autoscaler
```

---

## Future Enhancements

- Prometheus Metrics Integration
- Grafana Monitoring Dashboard
- KEDA Benchmarking
- Multi-Agent Reinforcement Learning
- Predictive Autoscaling
- Real Kubernetes Metrics API
- Locust Traffic Generator Integration
- Cloud Deployment (AWS / Azure / GCP)

---

## HCLTech Industry Alignment

This project aligns with HCLTech DBS Business and AIX Business cloud infrastructure initiatives.

Industry Applications:

- Kubernetes Cluster Optimization
- Site Reliability Engineering (SRE)
- Intelligent Infrastructure Management
- Cloud Cost Optimization
- AI-Driven Operations (AIOps)
- Autonomous Scaling Systems

---

## Research Scope

This project can be extended into:

- IEEE Conference Publication
- Scopus Indexed Research Paper
- Industry Research Prototype
- Cloud Infrastructure Patent Concept

---

## Contributors

Team Members:

- Bishal Kumar Sahoo
- Aayush Kumar Mishra
- Priya kumari

---

## License

This project is developed for educational, research, and cloud infrastructure learning purposes.
