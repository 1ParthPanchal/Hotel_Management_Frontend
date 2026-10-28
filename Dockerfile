# Multi-stage Dockerfile for Angular Frontend
# Stage 1: Build Angular app
FROM node:21-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npx ng build --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine AS runtime

# Remove default nginx config and replace with our own
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built Angular app to nginx html directory
COPY --from=build /app/dist/localstay-frontend/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
