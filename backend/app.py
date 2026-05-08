from flask import Flask, jsonify
from flask_cors import CORS
import time
import random

app = Flask(__name__)
# Enable CORS so the frontend can easily communicate with this backend
CORS(app)

@app.route('/')
def normal_traffic():
    """Simulates a normal, lightweight workload."""
    # Small delay to simulate processing
    time.sleep(0.1)
    return jsonify({
        "status": "success",
        "message": "Normal traffic processed successfully.",
        "workload": "low"
    })

@app.route('/heavy')
def heavy_traffic():
    """Simulates a heavy, resource-intensive workload."""
    # Longer delay to simulate heavy processing
    time.sleep(2.0)
    return jsonify({
        "status": "success",
        "message": "Heavy traffic processed. System under load.",
        "workload": "high"
    })

@app.route('/metrics')
def metrics():
    """
    Returns simulated system metrics for the dashboard.
    In a real scenario, this would query Prometheus or the Kubernetes Metrics API.
    """
    # Generate realistic simulated values
    cpu_usage = round(random.uniform(10.0, 95.0), 1)
    
    # Simulate workload status and pod count based on CPU usage
    # This keeps compatibility with typical Kubernetes HPA logic (e.g., scaling at 70% CPU)
    if cpu_usage > 70.0:
        status = "High Load"
        pods = random.randint(5, 10)  # Simulate scaled-up state
    else:
        status = "Normal"
        pods = random.randint(2, 4)   # Simulate scaled-down state

    return jsonify({
        "simulated_cpu_usage": cpu_usage,
        "response_time_ms": random.randint(40, 800),
        "active_requests": random.randint(5, 200),
        "pod_count": pods,
        "workload_status": status
    })

if __name__ == '__main__':
    # Run the app on all interfaces, port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
