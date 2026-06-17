FROM nginx:stable-alpine
COPY ./dist /usr/share/nginx/html
ENV VITE_API_BASE_URL=http://localhost:8000/api
EXPOSE 80