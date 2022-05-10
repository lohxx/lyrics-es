FROM node

COPY . .

RUN npm install .

ENTRYPOINT ["node", "crawler.js"]