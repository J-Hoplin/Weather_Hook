FROM node

RUN mkdir app

WORKDIR /app
COPY . .

RUN npm i

VOLUME [ "/app/dist/logfile" ]

CMD [ "start" ]
ENTRYPOINT [ "npm", "run" ]