# --- STAGE 1: Build ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- STAGE 2: Nginx ---
FROM nginx:stable-alpine

COPY --from=build /app/dist/lavurger-client/browser /usr/share/nginx/html

COPY --from=build /app/dist/lavurger-admin/browser /usr/share/nginx/html/admin

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
