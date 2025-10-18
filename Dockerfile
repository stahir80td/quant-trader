# Stage 1: Build React Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Go Backend
FROM golang:1.21-alpine AS backend-build
WORKDIR /app
COPY backend/ ./
RUN go mod download
RUN CGO_ENABLED=0 GOOS=linux go build -o quantum-trader main.go

# Stage 3: Final lightweight image
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=backend-build /app/quantum-trader .
COPY --from=frontend-build /app/frontend/dist ./static
EXPOSE 8080
CMD ["./quantum-trader"]