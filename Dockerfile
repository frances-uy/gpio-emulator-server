FROM node:18

# Install Python3 for optional use
RUN apt-get update && apt-get install -y python3 openssh-client

# Create app directory
WORKDIR /app

# Copy files into container
COPY . .

# Install dependencies
RUN npm install

# Expose ports
EXPOSE 3000
EXPOSE 3001

# Run server
CMD ["node", "server.js"]

