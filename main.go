package main

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"strings"
	"sync"
	"time"

	_ "embed"
	p "modelserving-debugger/proto"

	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

type PayloadHistory struct {
	Timestamp    string
	Payload      InferencePartialPayload
	ProtobufJSON template.JS
}

var (
	uiBuildDir = "ui/modelserving-debugger/build"

	history = make(map[string][]PayloadHistory)
	mutex   sync.Mutex
)

type PartialKind string

const (
	KindRequest  PartialKind = "request"
	KindResponse PartialKind = "response"
)

type InferencePartialPayload struct {
	ModelId  string            `json:"modelid"`
	Data     string            `json:"data"`
	Kind     PartialKind       `json:"kind"`
	ID       string            `json:"id"`
	Metadata map[string]string `json:"metadata"`
}

// Model represents the structure of a model to be sent in the JSON response
type Model struct {
	Name string `json:"name"`
}

func main() {

	// API endpoint to list all models
	http.HandleFunc("/api/models", func(w http.ResponseWriter, r *http.Request) {
		// Check if the path is exactly "/api/models", not "/api/models/some-model-id"
		if r.URL.Path != "/api/models" {
			http.NotFound(w, r)
			return
		}

		mutex.Lock()
		defer mutex.Unlock()

		var models []Model
		for modelId := range history {
			models = append(models, Model{Name: modelId})
		}

		jsonData, err := json.Marshal(models)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonData)
	})

	// Handler to list payloads for a specific model
	http.HandleFunc("/api/models/", func(w http.ResponseWriter, r *http.Request) {
		// Extract modelId from the URL path
		pathSegments := strings.Split(r.URL.Path, "/")
		if len(pathSegments) < 4 || pathSegments[3] == "" {
			http.NotFound(w, r)
			return
		}
		modelId := pathSegments[3]

		// Check if the request is for payloads
		if len(pathSegments) > 4 && pathSegments[4] == "payloads" {
			mutex.Lock()
			defer mutex.Unlock()

			modelPayloads, exists := history[modelId]
			if !exists {
				http.NotFound(w, r)
				return
			}

			// Filter or transform modelPayloads as necessary for your response
			jsonData, err := json.Marshal(modelPayloads)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.Write(jsonData)
		} else {
			// Handle other /api/models/:modelId/* requests or return not found
			http.NotFound(w, r)
		}
	})

	http.HandleFunc("/api/payload-json/", func(w http.ResponseWriter, r *http.Request) {
		pathSegments := strings.Split(strings.TrimPrefix(r.URL.Path, "/api/payload-json/"), "/")
		payloadID := pathSegments[0]
		kind := r.URL.Query().Get("kind") // 'request' or 'response'

		mutex.Lock()
		defer mutex.Unlock()

		for _, histories := range history {
			for _, item := range histories {
				if item.Payload.ID == payloadID && string(item.Payload.Kind) == kind {
					w.Header().Set("Content-Type", "application/json")
					w.Write([]byte(item.ProtobufJSON))
					return
				}
			}
		}

		http.NotFound(w, r)
	})

	// API: Ingest endpoint for POST requests
	http.HandleFunc("/api/ingest", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not supported", http.StatusMethodNotAllowed)
			return
		}

		var payload InferencePartialPayload
		if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
			http.Error(w, "Error parsing JSON payload", http.StatusBadRequest)
			return
		}

		dataBytes, err := base64.StdEncoding.DecodeString(payload.Data)
		if err != nil {
			http.Error(w, "Failed to decode Data from Base64", http.StatusBadRequest)
			return
		}

		switch payload.Kind {
		case KindRequest:
			var request p.ModelInferRequest
			if err := proto.Unmarshal(dataBytes, &request); err != nil {
				http.Error(w, "Failed to unmarshal Protobuf message into ModelInferRequest", http.StatusBadRequest)
				return
			}
			jsonBytes, err := protojson.Marshal(&request)
			if err != nil {
				http.Error(w, "Failed to marshal request Protobuf message to JSON", http.StatusBadRequest)
				return
			}
			appendPayloadHistory(payload, string(jsonBytes))
		case KindResponse:
			var response p.ModelInferResponse
			if err := proto.Unmarshal(dataBytes, &response); err != nil {
				http.Error(w, "Failed to unmarshal response Protobuf message into ModelInferResponse", http.StatusBadRequest)
				return
			}
			jsonBytes, err := protojson.Marshal(&response)
			if err != nil {
				http.Error(w, "Failed to marshal Protobuf message to JSON", http.StatusBadRequest)
				return
			}
			appendPayloadHistory(payload, string(jsonBytes))
		default:
			http.Error(w, "Invalid kind specified", http.StatusBadRequest)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Payload processed successfully"))
	})

	// Serve static files from the root
	http.Handle("/", http.FileServer(http.Dir(uiBuildDir)))

	fmt.Println("Server is listening on port 8080...")
	if err := http.ListenAndServe(":8080", nil); err != nil {
		fmt.Println("Failed to start server:", err)
	}
}

func appendPayloadHistory(payload InferencePartialPayload, jsonStr string) {
	mutex.Lock()
	defer mutex.Unlock()
	history[payload.ModelId] = append(history[payload.ModelId], PayloadHistory{
		Timestamp:    time.Now().Format(time.RFC1123),
		Payload:      payload,
		ProtobufJSON: template.JS(jsonStr),
	})
}
