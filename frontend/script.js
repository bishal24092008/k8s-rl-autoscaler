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
const requestsValue = document.getElementById('requests-value');
const statusValue = document.getElementById('status-value');
const statusTrend = document.getElementById('status-trend');

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
 * Fetches live metrics from the backend.
 */
async function fetchLiveMetrics() {
    try {
        const response = await fetch(`${BACKEND_URL}/metrics`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Update CPU
        cpuValue.textContent = `${data.simulated_cpu_usage}%`;
        cpuProgress.style.width = `${data.simulated_cpu_usage}%`;
        cpuProgress.style.backgroundColor = data.simulated_cpu_usage > 70 ? 'var(--danger)' : 'var(--accent-cyan)';
        
        // Update Pods
        podsValue.textContent = data.pod_count;
        if (data.pod_count > 4) {
            podsTrend.textContent = 'Scaling Up ↗';
            podsTrend.style.color = 'var(--warning)';
        } else {
            podsTrend.textContent = 'Target: 3 (Stable)';
            podsTrend.style.color = 'var(--success)';
        }
        
        // Update Latency
        latencyValue.textContent = `${data.response_time_ms}ms`;
        latencyTrend.textContent = data.response_time_ms > 500 ? 'High Latency' : 'Optimal';
        latencyTrend.style.color = data.response_time_ms > 500 ? 'var(--warning)' : 'var(--success)';

        // Update Requests
        if(requestsValue) requestsValue.textContent = data.active_requests;

        // Update Status
        if(statusValue) statusValue.textContent = data.workload_status;
        if(statusTrend) {
            statusTrend.style.color = data.workload_status === 'High Load' ? 'var(--danger)' : 'var(--success)';
        }
        
    } catch (error) {
        console.error("Failed to fetch live metrics:", error);
    }
}

// Start auto-refreshing metrics every 2 seconds
setInterval(fetchLiveMetrics, 2000);
// Initial fetch
fetchLiveMetrics();

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
        
    } catch (error) {
        addLog(`[Error] Failed to connect to backend: ${error.message}. Is Flask running on port 5000?`, 'heavy');
        
    } finally {
        // Re-enable button
        btn.disabled = false;
        btn.innerHTML = btnOriginalText;
    }
}

// Event Listeners
btnNormal.addEventListener('click', () => sendTraffic('normal'));
btnHeavy.addEventListener('click', () => sendTraffic('heavy'));

// End of script
