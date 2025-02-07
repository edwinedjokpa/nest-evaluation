# Development Stage
FROM node:20-alpine3.17 AS development

WORKDIR /usr/src/app

ENV NODE_ENV=development

COPY package*.json ./

# Install both dependencies and devDependencies for development
RUN npm install

# Copy all files
COPY . .

# Build the application
RUN npm run build

# Production Stage
FROM node:20-alpine3.17 AS production

WORKDIR /usr/src/app

ENV NODE_ENV=production

COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the built application from the development stage
COPY --from=development /usr/src/app/dist ./dist

# Expose the default port for NestJS
EXPOSE 3000

# Run the migration before starting the server
RUN npm run migration:docker

# Run the application in production mode
CMD ["npm", "run", "start:prod"]
