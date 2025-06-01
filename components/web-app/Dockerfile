FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

#SOOOO BAD im just want to get this done at this point
ENV VITE_API_URL=http://127.0.0.1:3000
# Build the application
RUN npm run build

# Expose port for Vite preview (default is 4173)
EXPOSE 4173

# Start the application using Vite preview
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"] 