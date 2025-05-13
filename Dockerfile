FROM node:lts AS development
WORKDIR /usr/app
COPY ./ ./
RUN npm install
RUN npm run build
CMD [ "npm", "run", "start" ]

FROM node:lts-slim AS build
WORKDIR /usr/app
COPY ./package*.json ./
COPY ./tsconfig*.json ./
COPY ./src ./src
COPY ./scripts ./scripts
COPY ./prisma ./prisma
COPY ./nest-cli.json ./nest-cli.json
RUN npm ci
RUN npm run build


FROM node:lts AS production
WORKDIR /usr/app
COPY --from=build /usr/app/dist ./
COPY --from=build /usr/app/prisma ./prisma
COPY --from=build /usr/app/node_modules ./node_modules
CMD ["node", "main"]