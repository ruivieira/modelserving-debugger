# Start from the Go image to build your Go application
FROM golang:1.21.7-bookworm as gobuilder

WORKDIR /app
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server .

# Start from the Node image to build your React application
FROM node:16-alpine as uibuilder

# Copy the UI source files from the previous stage
WORKDIR /app/ui/modelserving-debugger
COPY --from=gobuilder /app/ui/modelserving-debugger .
# Install dependencies and build the React application
RUN npm install && npm run build

# Final stage: Copy the Go binary and static files into a new Alpine image
FROM alpine:latest

RUN apk --no-cache add ca-certificates
WORKDIR /root/

# Copy the server binary from the Go builder stage
COPY --from=gobuilder /app/server .

# Copy the built UI from the UI builder stage
COPY --from=uibuilder /app/ui/modelserving-debugger/build ./ui/modelserving-debugger/build

EXPOSE 8080

# Run the server binary
CMD ["./server"]
