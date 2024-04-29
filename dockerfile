FROM node:12.2.0-alpine
COPY server.js /app/
WORKDIR /app
COPY . .
RUN npm install
RUN npm run test
EXPOSE 5000
CMD ["node","server.js"]
