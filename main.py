import sys
import os

# Add the 'model' directory to the Python path so we can import from it
sys.path.append(os.path.join(os.path.dirname(__file__), 'model'))

from model.server import app

if __name__ == "__main__":
    import uvicorn
    # Use the PORT environment variable provided by Render, defaulting to 8000
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
