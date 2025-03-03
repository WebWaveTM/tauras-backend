FROM node:22 AS setup
WORKDIR /usr/app
COPY ./package*.json ./
RUN npm install
COPY . .

FROM node:22 AS development
WORKDIR /usr/app
COPY --from=setup /usr/app ./
CMD ["npm", "run", "start"]

FROM node:22 AS build
WORKDIR /usr/app
COPY --from=setup /usr/app ./
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /usr/app
COPY --from=build /usr/app/dist ./
CMD [ "node", "dist/main" ]