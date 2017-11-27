#ROM node:onbuild
#EXPOSE 80 8888

FROM node
WORKDIR /usr/src/app
COPY . .
EXPOSE 80 8888
CMD [ "npm", "start" ]