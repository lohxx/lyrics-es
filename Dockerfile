FROM node

COPY . .

RUN npm install .

ENTRYPOINT ["node", "src/crawler.js"]