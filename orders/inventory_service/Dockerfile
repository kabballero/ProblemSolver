FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
COPY wait-for-it.sh .
RUN chmod +x wait-for-it.sh
CMD ["node", "inventory_service.js"]
