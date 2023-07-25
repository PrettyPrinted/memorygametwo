FROM node:latest

#COPY package.json ./
#COPY package-lock.json ./
COPY memory-game-two/package.json /app/package.json
WORKDIR /app
#WORKDIR /app/memory-game-two
#RUN npm create vite@latest
# install nodemon
RUN npm install -g nodemon
RUN npm install
#CMD ["npm", "run", "dev"]