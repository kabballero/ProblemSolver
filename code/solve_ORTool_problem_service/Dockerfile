# # Use an official Python runtime as a parent image
# FROM python:3.10-slim

# # Set the working directory in the container
# WORKDIR /app

# # Copy the local code to the container's workspace
# COPY . /app

# # Install required packages
# RUN pip install --no-cache-dir pika ortools

# # Expose the port the app runs on,no need??
# #EXPOSE 5672

# COPY wait-for-it.sh .
# RUN chmod +x wait-for-it.sh
# # Run main_program.py when the container launches
# CMD ["python", "main_program.py"]

FROM python:3.10-slim

# Install dos2unix
RUN apt-get update && apt-get install -y dos2unix

# Set the working directory in the container
WORKDIR /app

# Copy the local code to the container's workspace
COPY . /app

# Convert line endings of wait-for-it.sh
RUN dos2unix /app/wait-for-it.sh

# Install required packages
RUN pip install --no-cache-dir pika ortools

# Make wait-for-it.sh executable
RUN chmod +x wait-for-it.sh

# Run main_program.py when the container launches
CMD ["python", "main_program.py"]
