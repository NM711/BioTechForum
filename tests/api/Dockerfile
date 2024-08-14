FROM node:20-alpine

RUN mkdir test

WORKDIR ./test

COPY . .

RUN ["npm", "install"]

CMD ["npm", "run", "api-test"]
