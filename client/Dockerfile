FROM node:20-alpine as builder

WORKDIR /usr/server

COPY ./package.json ./
RUN npm install
COPY ./ .

FROM builder as production
ENV NODE_ENV=production
RUN npm run build
CMD ["npm", "run", "start"]

FROM builder as development
ENV NODE_ENV=development
CMD ["npm", "run", "dev"]
