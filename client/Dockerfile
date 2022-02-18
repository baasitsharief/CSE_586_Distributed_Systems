FROM node:latest
WORKDIR /client
COPY package.json /client
COPY . /client
RUN npm install
CMD ["npm", "run", "start"]