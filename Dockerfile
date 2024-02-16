# Use the official Golang image to create a build artifact.
# This is based on Debian and sets the GOPATH to /go.
FROM golang:1.21.7-bookworm as builder

# Copy local code to the container image.
WORKDIR /app
COPY . .

# Build the binary.
RUN CGO_ENABLED=0 GOOS=linux go build -v -o server

# Use a Docker multi-stage build to create a lean production image.
# https://docs.docker.com/develop/develop-images/multistage-build/
FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary to the production image from the builder stage.
COPY --from=builder /app/server .

# Document that the service listens on port 8080.
EXPOSE 8080

# Run the web service on container startup.
CMD ["./server"]
