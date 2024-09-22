# Use an official Node.js runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install project dependencies
RUN npm install


# Bundle app source inside Docker image
COPY . .

# Expose port for RabbitMQ and node app (if any)
EXPOSE 9103

# Command to run the app
CMD ["node", "server.js"]