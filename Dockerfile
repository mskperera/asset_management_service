# Use the official Node.js image with Alpine Linux
FROM node:20-alpine

# Create a directory for the application
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose the port the application runs on
EXPOSE 8010

# Command to start the application
CMD ["node", "server.js"]



# commands
# docker build -t asset-service .

# docker run -d --env-file .env -p 8010:8010 asset-service

# docker ps -a
# Stop the Running Containers: docker stop deabf4792901
# Remove the Stopped Container: docker rm deabf4792901
    