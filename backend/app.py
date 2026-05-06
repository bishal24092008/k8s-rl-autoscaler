from flask import Flask, jsonify
from flask_cors import CORS
import time

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

if __name__ == '__main__':
    # Run the app on all interfaces, port 5000
    app.run(host='0.0.0.0', port=5000, debug=True)
