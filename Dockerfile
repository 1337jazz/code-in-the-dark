FROM node:22-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@12.9.1
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:alpine

# Set the default password for the preview page - change this!
ENV PREVIEW_PASSWORD=secret 
COPY nginx/ /etc/nginx/templates/
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
