FROM node:23-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy files to the container
COPY . .

# Install dependencies
RUN npm ci

# Expose the port the dev server will run on
EXPOSE 8000

# Run the dev server
CMD ["npm", "run", "dev"]
