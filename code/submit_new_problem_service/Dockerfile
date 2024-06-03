# # Use an official Node.js runtime as a parent image
# FROM node:14

# # Set the working directory in the container
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json (if available)
# COPY package*.json ./

# # Install project dependencies
# RUN npm install

# # Bundle app source inside Docker image
# COPY . .

# # Expose port for RabbitMQ and node app (if any)
# EXPOSE 3000
# COPY wait-for-it.sh .
# RUN chmod +x wait-for-it.sh

# # Command to run the app
# CMD ["node", "server.js"]

FROM node:14

# Install dos2unix
RUN apt-get update && apt-get install -y dos2unix

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Bundle app source inside Docker image
COPY . .

# Convert line endings of wait-for-it.sh
RUN dos2unix /usr/src/app/wait-for-it.sh

# Make wait-for-it.sh executable
RUN chmod +x wait-for-it.sh

# Expose port for RabbitMQ and node app (if any)
EXPOSE 3000

# Command to run the app
CMD ["node", "server.js"]
