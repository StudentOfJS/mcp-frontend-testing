# Build stage
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the TypeScript application
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm ci --production

# Copy built application from build stage
COPY --from=build /app/dist ./dist
COPY --from=build /app/templates ./templates

# Expose the HTTP port
EXPOSE 3000

# Set the default command to run the server with HTTP transport
CMD ["node", "dist/index.js", "--transport=http"]