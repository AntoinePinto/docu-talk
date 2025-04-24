FROM node:18

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Install a static file server
RUN npm install -g serve

# Copy the rest of the app
COPY . .
COPY .env.prod .env

# Build the app
RUN npm run build

# Set the correct port
EXPOSE 8080

# Serve the built app
CMD ["serve", "-s", "dist", "-l", "8080"]
