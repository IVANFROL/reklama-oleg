FROM python:3.11-alpine

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN adduser -D -s /bin/sh app && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Command to run the application
CMD ["python", "main.py"]
