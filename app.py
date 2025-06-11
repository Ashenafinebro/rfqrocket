
import os
from flask import Flask
from config import Config, setup_directories
from routes import init_routes

app = Flask(__name__)

# Configure Flask app
app.config.update(vars(Config))

# Setup directories
setup_directories()

# Initialize routes
init_routes(app)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))  # Railway sets this automatically
    app.run(host='0.0.0.0', port=port, threaded=True)
