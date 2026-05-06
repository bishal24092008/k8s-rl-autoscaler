// Configuration
const BACKEND_URL = 'http://localhost:5000';

// DOM Elements
const btnNormal = document.getElementById('btn-normal');
const btnHeavy = document.getElementById('btn-heavy');
const logPanel = document.getElementById('log-panel');

const cpuValue = document.getElementById('cpu-value');
const cpuProgress = document.getElementById('cpu-progress');
const podsValue = document.getElementById('pods-value');
const podsTrend = document.getElementById('pods-trend');
const latencyValue = document.getElementById('latency-value');
const latencyTrend = document.getElementById('latency-trend');

// State Simulation
let currentCpu = 12;
let currentPods = 3;

/**
 * Appends a log entry to the log panel.
 */
function addLog(message, type = 'normal') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
    
    entry.innerHTML = `<span class="time">[${timeStr}]</span> ${message}`;
    logPanel.appendChild(entry);
    
    // Auto-scroll to bottom
    logPanel.scrollTop = logPanel.scrollHeight;
}

/**
 * Updates UI cards to simulate system reaction to traffic.
 */
function updateMetricsUI(trafficType, responseTime) {
    // Simulate CPU and Pod changes based on traffic type
    if (trafficType === 'heavy') {
        // Spike CPU heavily
        currentCpu = Math.min(98, currentCpu + Math.floor(Math.random() * 30 + 40));
        
        // Simulate Autoscaler kicking in if CPU is high
        if (currentCpu > 70) {
            currentPods = Math.min(10, currentPods + Math.floor(Math.random() * 2 + 1));
            podsTrend.textContent = 'Scaling Up ↗';
            podsTrend.style.color = 'var(--warning)';
        }
        
        // Update styling for heavy load
        cpuProgress.style.backgroundColor = 'var(--danger)';
        latencyTrend.style.color = 'var(--danger)';
        latencyTrend.textContent = 'High Load';
        
    } else {
        // Normal traffic causes slight fluctuations
        currentCpu = Math.max(10, currentCpu + Math.floor(Math.random() * 10 - 5));
        
        // Simulate Autoscaler scaling down if CPU is low
        if (currentCpu < 30 && currentPods > 3) {
            currentPods--;
            podsTrend.textContent = 'Scaling Down ↘';
            podsTrend.style.color = 'var(--accent-cyan)';
        } else if (currentPods === 3) {
            podsTrend.textContent = 'Target: 3 (Stable)';
            podsTrend.style.color = 'var(--success)';
        }
        
        // Restore styling
        cpuProgress.style.backgroundColor = currentCpu > 60 ? 'var(--warning)' : 'var(--accent-cyan)';
        latencyTrend.style.color = 'var(--success)';
        latencyTrend.textContent = 'Optimal';
    }

    // Apply values to DOM
    cpuValue.textContent = `${currentCpu}%`;
    cpuProgress.style.width = `${currentCpu}%`;
    podsValue.textContent = currentPods;
    latencyValue.textContent = `${responseTime}ms`;
}

/**
 * Sends a request to the backend API.
 */
async function sendTraffic(type) {
    const endpoint = type === 'heavy' ? '/heavy' : '/';
    const btn = type === 'heavy' ? btnHeavy : btnNormal;
    
    // Disable button during request
    btn.disabled = true;
    const btnOriginalText = btn.innerHTML;
    btn.innerHTML = `<span class="icon">⏳</span> Processing...`;
    
    addLog(`Initiating ${type} traffic simulation via ${endpoint}`, 'system');
    
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        const endTime = Date.now();
        const latency = endTime - startTime;
        
        addLog(`[Success] Backend responded: "${data.message}" | Latency: ${latency}ms`, type);
        updateMetricsUI(type, latency);
        
    } catch (error) {
        addLog(`[Error] Failed to connect to backend: ${error.message}. Is Flask running on port 5000?`, 'heavy');
        
        // Simulate the metrics change anyway for demo purposes if backend isn't running
        const simulatedLatency = type === 'heavy' ? 2000 + Math.random()*500 : 100 + Math.random()*50;
        updateMetricsUI(type, Math.floor(simulatedLatency));
        
    } finally {
        // Re-enable button
        btn.disabled = false;
        btn.innerHTML = btnOriginalText;
    }
}

// Event Listeners
btnNormal.addEventListener('click', () => sendTraffic('normal'));
btnHeavy.addEventListener('click', () => sendTraffic('heavy'));

// Background task to simulate system cooling down over time
setInterval(() => {
    if (currentCpu > 15) {
        currentCpu = Math.max(12, currentCpu - Math.floor(Math.random() * 5 + 2));
        cpuValue.textContent = `${currentCpu}%`;
        cpuProgress.style.width = `${currentCpu}%`;
        
        if (currentCpu < 60) {
            cpuProgress.style.backgroundColor = 'var(--accent-cyan)';
        }
    }
}, 4000);
