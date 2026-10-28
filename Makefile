IMAGE := code-in-the-dark
CONTAINER := code-in-the-dark
PORT := 8080

.PHONY: build run stop dev

# Build the Docker image
build:
	docker build -t $(IMAGE) .

# Run the app in the background on http://localhost:$(PORT)
run:
	docker run -d --rm --name $(CONTAINER) -p $(PORT):80 $(IMAGE)

# Stop the running app
stop:
	docker rm -f $(CONTAINER)

# Install dependencies and start the Vite dev server
dev:
	pnpm install
	pnpm dev
