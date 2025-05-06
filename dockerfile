FROM denoland/deno:latest

WORKDIR /app
COPY . .

CMD ["deno", "run", "--watch", "--allow-net", "--allow-read", "--allow-write", "main.ts"]
