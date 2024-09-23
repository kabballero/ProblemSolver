FROM python:3.10-slim

# Set the working directory in the container
WORKDIR /app

# Copy the local code to the container's workspace
COPY . /app

# Install required packages
RUN pip install --no-cache-dir pika ortools 

# Expose the port the app runs on,no need??
#EXPOSE 5672

#COPY wait-for-it.sh .
#RUN chmod +x wait-for-it.sh
# Run main_program.py when the container launches
CMD ["python", "father.py"]
