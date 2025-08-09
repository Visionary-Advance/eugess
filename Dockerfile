# Stage 1: Build static site with Node
FROM node:18 as builder

WORKDIR /app

COPY package*.json ./
COPY tailwind.config.mjs postcss.config.mjs next.config.mjs jsconfig.json ./
COPY public/ public/
COPY app/ app/
COPY Components/ Components/
COPY data/ data

RUN npm install
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/out /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
