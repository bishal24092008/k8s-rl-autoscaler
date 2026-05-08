# Use the official Python 3.11 slim image as the base image
# Slim images are smaller and contain just the essentials needed to run Python
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt file into the container first
# We do this before copying the rest of the code to leverage Docker's layer caching
COPY requirements.txt .

# Install the Python dependencies listed in requirements.txt
# --no-cache-dir keeps the image size small by not caching the downloaded packages
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code into the container
COPY . .

# Expose port 5000 so the outside world can communicate with the Flask app
EXPOSE 5000

# Set the command to run our Flask application when the container starts
CMD ["python", "app.py"]
