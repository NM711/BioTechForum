FROM node:20-alpine

RUN mkdir app

WORKDIR ./app

COPY . .

RUN ["npm", "install"]
RUN ["chmod", "500", "./init.sh"]
CMD ["./init.sh"]
