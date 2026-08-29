FROM node:22

COPY . /app
RUN cd /app && npm install

ENV NODE_ENV=production
ENV NEXT_PUBLIC_OLLAMA_BASEURL=http://localhost:11434

EXPOSE 3000

WORKDIR /app
CMD ["npm", "run", "start"]

