FROM node:18-alpine
WORKDIR /app
COPY package.json /app
RUN npm install
ENV PORT=8000
ENV JWT_SECRET=abc
ENV DB_URL=postgres
ENV GROQ_API_KEY=abc
ENV FRONTEND_URL=http://localhost:5173
ENV GEOAPIFY_API_KEY=xyz
COPY . /app
CMD ["node", "src/server.js"]
