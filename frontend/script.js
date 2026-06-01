// Configuration
const BACKEND_URL = 'http://localhost:5000';

// Clock & Status Elements
const liveClock = document.getElementById('live-clock');
const globalPulse = document.getElementById('global-pulse');
const globalStatusText = document.getElementById('global-status-text');

// Health Elements
const healthValue = document.getElementById('health-value');
const healthTrend = document.getElementById('health-trend');

// History Elements
const historyPanel = document.getElementById('history-panel');

// Metrics DOM Elements
const cpuValue = document.getElementById('cpu-value');
const cpuProgress = document.getElementById('cpu-progress');
const podsValue = document.getElementById('pods-value');
const podsTrend = document.getElementById('pods-trend');
const latencyValue = document.getElementById('latency-value');
const latencyTrend = document.getElementById('latency-trend');
const requestsValue = document.getElementById('requests-value');
const statusValue = document.getElementById('status-value');
const statusTrend = document.getElementById('status-trend');

// RL Agent Insights DOM Elements
const rlDecisionValue = document.getElementById('rl-decision-value');
const rlDecisionTrend = document.getElementById('rl-decision-trend');
const rlRewardValue = document.getElementById('rl-reward-value');
const rlRewardTrend = document.getElementById('rl-reward-trend');
const rlConfidenceValue = document.getElementById('rl-confidence-value');
const rlConfidenceProgress = document.getElementById('rl-confidence-progress');

// Training Analytics DOM Elements
const episodesValue = document.getElementById('episodes-value');
const avgRewardValue = document.getElementById('avg-reward-value');
const learningProgressValue = document.getElementById('learning-progress-value');
const learningProgressBar = document.getElementById('learning-progress-bar');
const epsilonValue = document.getElementById('epsilon-value');

// XAI Panel DOM Elements
const xaiDecisionValue = document.getElementById('xai-decision-value');
const xaiReasonValue = document.getElementById('xai-reason-value');
const xaiOutcomeValue = document.getElementById('xai-outcome-value');
const xaiRiskValue = document.getElementById('xai-risk-value');
const xaiRiskProgress = document.getElementById('xai-risk-progress');

// Log & Control Elements
const btnNormal = document.getElementById('btn-normal');
const btnHeavy = document.getElementById('btn-heavy');
const logPanel = document.getElementById('log-panel');

/**
 * Clock Updater
 */
setInterval(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    liveClock.textContent = `${dateStr} | ${timeStr}`;
}, 1000);

/**
 * Applies a smooth update animation to an element's text
 */
function animateValueUpdate(element, newValue) {
    if (!element) return;
    if (element.textContent !== String(newValue)) {
        element.textContent = newValue;
        element.classList.remove('value-update');
        void element.offsetWidth; // Trigger reflow
        element.classList.add('value-update');
    }
}

/**
 * Appends a log entry to the log panel.
 */
function addLog(message, type = 'normal') {
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    
    const now = new Date();
    const timeStr = now.toISOString().split('T')[1].slice(0, 12);
    
    entry.innerHTML = `<span class="time">[${timeStr}]</span> ${message}`;
    logPanel.appendChild(entry);
    logPanel.scrollTop = logPanel.scrollHeight;
}

let historyCount = 0;
let lastPodCount = 3;
let lastActionTime = 0;

/**
 * Add a Scaling History Event
 */
function addHistoryEvent(action, prevPods, newPods, color) {
    if (historyCount === 0 && document.querySelector('.history-item.empty')) {
        historyPanel.innerHTML = '';
    }

    const entry = document.createElement('div');
    entry.className = 'history-item';
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { hour12: false });
    
    let podText = `${prevPods} → ${newPods} Pods`;
    if (action === "Maintain") {
        podText = `${newPods} Pods`;
    }

    entry.innerHTML = `
        <div class="history-meta">
            <span class="history-action" style="color: ${color}">${action}</span>
            <span class="history-time">${timeStr}</span>
        </div>
        <div class="history-pods">${podText}</div>
    `;
    
    historyPanel.prepend(entry);
    historyCount++;
    
    // Keep only last 10
    if (historyPanel.children.length > 10) {
        historyPanel.removeChild(historyPanel.lastChild);
    }
}

/**
 * Calculate and Update System Health
 */
function updateSystemHealth(cpu, latency) {
    let score = 100 - (cpu * 0.5) - (latency > 500 ? 20 : 0);
    score = Math.max(0, Math.min(100, score));
    
    animateValueUpdate(healthValue, `${Math.round(score)}%`);
    
    globalPulse.className = 'pulse-indicator';
    
    if (score > 80) {
        healthTrend.textContent = "Healthy";
        healthTrend.style.color = "var(--success)";
        healthValue.style.color = "var(--text-primary)";
        globalPulse.classList.add('healthy');
        globalStatusText.textContent = "ONLINE - HEALTHY";
        globalStatusText.style.color = "var(--success)";
    } else if (score > 50) {
        healthTrend.textContent = "Warning";
        healthTrend.style.color = "var(--warning)";
        healthValue.style.color = "var(--warning)";
        globalPulse.classList.add('warning');
        globalStatusText.textContent = "ONLINE - WARNING";
        globalStatusText.style.color = "var(--warning)";
    } else {
        healthTrend.textContent = "Critical";
        healthTrend.style.color = "var(--danger)";
        healthValue.style.color = "var(--danger)";
        globalPulse.classList.add('critical');
        globalStatusText.textContent = "ONLINE - CRITICAL";
        globalStatusText.style.color = "var(--danger)";
    }
}

/**
 * Updates the Explainable AI (XAI) Panel and History based on current CPU metrics
 */
function processXAIAndHistory(data) {
    if (!xaiDecisionValue) return;

    let decision = "Maintain";
    let reason = "System operating within normal thresholds.";
    let outcome = "Keep current pod count.";
    let risk = "Low";
    let riskProgress = "30%";
    let color = "var(--success)"; // Green = Maintain
    let riskColor = "var(--success)";

    if (data.simulated_cpu_usage > 75) {
        decision = "Scale Up";
        reason = "High CPU utilization and increasing response time.";
        outcome = "Add pods to reduce latency.";
        risk = "Medium";
        riskProgress = "60%";
        color = "var(--accent-cyan)"; // Blue = Scale Up
        riskColor = "var(--warning)";
    } else if (data.simulated_cpu_usage < 30) {
        decision = "Scale Down";
        reason = "Underutilized resources.";
        outcome = "Reduce pod count and save resources.";
        risk = "Low";
        riskProgress = "20%";
        color = "var(--danger)"; // Orange/Red = Scale Down
        riskColor = "var(--success)";
    }

    animateValueUpdate(xaiDecisionValue, decision);
    xaiDecisionValue.style.color = color;
    
    animateValueUpdate(xaiReasonValue, reason);
    animateValueUpdate(xaiOutcomeValue, outcome);
    
    animateValueUpdate(xaiRiskValue, risk);
    xaiRiskValue.style.color = riskColor;
    if(xaiRiskProgress) {
        xaiRiskProgress.style.width = riskProgress;
        xaiRiskProgress.style.backgroundColor = riskColor;
    }

    // Process History (Auto-generate simulated events)
    const now = Date.now();
    // Simulate real pod scaling changes or just record the decision
    if (data.pod_count !== lastPodCount) {
        const action = data.pod_count > lastPodCount ? "Scale Up" : "Scale Down";
        const actionColor = data.pod_count > lastPodCount ? "var(--accent-cyan)" : "var(--danger)";
        addHistoryEvent(action, lastPodCount, data.pod_count, actionColor);
        lastPodCount = data.pod_count;
        lastActionTime = now;
    } else if (now - lastActionTime > 8000) {
        // Log a Maintain event occasionally if nothing is happening
        addHistoryEvent("Maintain", lastPodCount, lastPodCount, "var(--success)");
        lastActionTime = now;
    }
}

/**
 * Simulates RL Agent values based on current metrics
 */
function simulateRLInsights(data) {
    if (!rlDecisionValue) return;

    const confidence = Math.floor(Math.random() * (99 - 75 + 1)) + 75;
    rlConfidenceValue.textContent = `${confidence}%`;
    rlConfidenceProgress.style.width = `${confidence}%`;

    let decision = "Maintain";
    let reward = 0;
    let trendColor = "var(--text-primary)";

    if (data.simulated_cpu_usage > 75) {
        decision = "Scale Up";
        reward = 15.5;
        trendColor = "var(--warning)";
    } else if (data.simulated_cpu_usage < 30) {
        decision = "Scale Down";
        reward = 12.0;
        trendColor = "var(--accent-cyan)";
    } else {
        decision = "Maintain";
        reward = 10.0;
        trendColor = "var(--success)";
    }

    reward += (Math.random() * 2 - 1);

    animateValueUpdate(rlDecisionValue, decision);
    rlDecisionValue.style.color = trendColor;

    animateValueUpdate(rlRewardValue, `+${reward.toFixed(1)}`);
    
    if (Math.random() > 0.7) {
        rlDecisionTrend.textContent = "Processing state...";
    } else {
        rlDecisionTrend.textContent = "Action Decided";
    }
}

/**
 * Fetches live metrics from the backend.
 */
async function fetchLiveMetrics() {
    try {
        const response = await fetch(`${BACKEND_URL}/metrics`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // System Health
        updateSystemHealth(data.simulated_cpu_usage, data.response_time_ms);

        // Update CPU
        animateValueUpdate(cpuValue, `${data.simulated_cpu_usage}%`);
        cpuProgress.style.width = `${data.simulated_cpu_usage}%`;
        cpuProgress.style.backgroundColor = data.simulated_cpu_usage > 70 ? 'var(--danger)' : 'var(--accent-cyan)';
        
        // Update Pods
        animateValueUpdate(podsValue, data.pod_count);
        if (data.pod_count > 4) {
            podsTrend.textContent = 'Scaling Up ↗';
            podsTrend.style.color = 'var(--warning)';
        } else {
            podsTrend.textContent = 'Target: 3 (Stable)';
            podsTrend.style.color = 'var(--success)';
        }
        
        // Update Latency
        animateValueUpdate(latencyValue, `${data.response_time_ms}ms`);
        latencyTrend.textContent = data.response_time_ms > 500 ? 'High Latency' : 'Optimal';
        latencyTrend.style.color = data.response_time_ms > 500 ? 'var(--warning)' : 'var(--success)';

        // Update Requests
        if(requestsValue) animateValueUpdate(requestsValue, data.active_requests);

        // Update Status
        if(statusValue) animateValueUpdate(statusValue, data.workload_status);
        if(statusTrend) {
            statusTrend.style.color = data.workload_status === 'High Load' ? 'var(--danger)' : 'var(--success)';
        }
        
        // Insights
        simulateRLInsights(data);
        processXAIAndHistory(data);
        
    } catch (error) {
        console.error("Failed to fetch live metrics:", error);
        globalPulse.className = 'pulse-indicator critical';
        globalStatusText.textContent = "OFFLINE";
        globalStatusText.style.color = "var(--danger)";
    }
}

// --- Training Analytics Simulation ---
let currentEpisode = 0;
const maxEpisodes = 100;
let currentEpsilon = 1.0;
let cumulativeReward = 0;
const rewardHistory = [];
const episodeHistory = [];
let rewardChart;

function initChart() {
    const ctx = document.getElementById('rewardChart').getContext('2d');
    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = 'Inter';
    
    rewardChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: episodeHistory,
            datasets: [{
                label: 'Episode Reward',
                data: rewardHistory,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                borderWidth: 2,
                pointRadius: 1,
                pointHoverRadius: 4,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Episode' } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, title: { display: true, text: 'Reward' } }
            }
        }
    });
}

function simulateTrainingAnalytics() {
    if (currentEpisode >= maxEpisodes) {
        if (currentEpisode > maxEpisodes + 5) {
            currentEpisode = 0;
            currentEpsilon = 1.0;
            cumulativeReward = 0;
            rewardHistory.length = 0;
            episodeHistory.length = 0;
        } else {
            currentEpisode++;
            return;
        }
    }
    currentEpisode++;
    currentEpsilon = Math.max(0.01, currentEpsilon * 0.95);
    const episodeReward = 10 + (currentEpisode * 0.5) + ((Math.random() - 0.5) * 20);
    cumulativeReward += episodeReward;
    const avgReward = cumulativeReward / currentEpisode;
    let progress = 70 + (currentEpisode / maxEpisodes) * 30;
    progress = Math.min(100, Math.max(0, progress + (Math.random() * 5 - 2.5)));
    
    animateValueUpdate(episodesValue, currentEpisode);
    animateValueUpdate(avgRewardValue, avgReward.toFixed(1));
    animateValueUpdate(epsilonValue, currentEpsilon.toFixed(3));
    
    const progressStr = `${Math.round(progress)}%`;
    animateValueUpdate(learningProgressValue, progressStr);
    if(learningProgressBar) learningProgressBar.style.width = progressStr;
    
    episodeHistory.push(currentEpisode);
    rewardHistory.push(episodeReward);
    if (rewardChart) rewardChart.update();
}

setTimeout(() => {
    if(document.getElementById('rewardChart')) {
        initChart();
        setInterval(simulateTrainingAnalytics, 1500);
    }
}, 500);

/**
 * Sends a request to the backend API.
 */
async function sendTraffic(type) {
    const endpoint = type === 'heavy' ? '/heavy' : '/';
    const btn = type === 'heavy' ? btnHeavy : btnNormal;
    
    btn.disabled = true;
    const btnOriginalText = btn.innerHTML;
    btn.innerHTML = `<span class="icon">⏳</span> Processing...`;
    
    addLog(`Initiating ${type} traffic simulation via ${endpoint}`, 'system');
    const startTime = Date.now();
    
    try {
        const response = await fetch(`${BACKEND_URL}${endpoint}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const latency = Date.now() - startTime;
        addLog(`[Success] Backend responded: "${data.message}" | Latency: ${latency}ms`, type);
    } catch (error) {
        addLog(`[Error] Failed to connect to backend: ${error.message}`, 'heavy');
    } finally {
        btn.disabled = false;
        btn.innerHTML = btnOriginalText;
    }
}

// Event Listeners
btnNormal.addEventListener('click', () => sendTraffic('normal'));
btnHeavy.addEventListener('click', () => sendTraffic('heavy'));

// Sidebar Active Link Highlight on Scroll
const sections = document.querySelectorAll('section[id], h3[id="system-logs"]');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');

window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight || 400;
        const sectionTop = (section.offsetTop || (section.parentElement && section.parentElement.offsetTop) || 0) - 200;
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
});

// Main Refresh Loop
setInterval(fetchLiveMetrics, 2000);
fetchLiveMetrics();
