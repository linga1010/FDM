# Use an official Python 3.11 slim image to avoid pandas build issues on Python 3.13
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Avoid prompts from apt and reduce image size
ENV DEBIAN_FRONTEND=noninteractive

# Install build dependencies needed for some packages (pandas, numpy) and pip
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc g++ libatlas-base-dev libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python deps first (leverages Docker cache)
COPY requirements.txt ./
RUN pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Expose the port and use gunicorn to run the app
ENV PORT=10000
EXPOSE ${PORT}

CMD ["gunicorn", "--bind", "0.0.0.0:10000", "app:app"]
