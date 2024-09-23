FROM node:16

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port the app runs on
EXPOSE 3100

#COPY wait-for-it.sh .
#RUN chmod +x wait-for-it.sh
# Command to run the application
CMD ["node", "server.js"]

