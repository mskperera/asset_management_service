# Use the official Node.js image with Alpine Linux
FROM node:16.20.0-alpine

# Create a directory for the application
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the application runs on
EXPOSE 8002

# Command to start the application
CMD ["node", "server.js"]



# commands
# docker build -t submit-jokes-microservice .

# docker run -d --env-file .env -p 8002:8002 submit-jokes-microservice

# docker ps -a
# Stop the Running Containers: docker stop deabf4792901
# Remove the Stopped Container: docker rm deabf4792901
    