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
	// Embed templates directly
	//go:embed templates/history.html
	historyPage string
	//go:embed templates/models.html
	modelsPage string
	//go:embed images/logo.png
	logoImage []byte

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

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		mutex.Lock()
		defer mutex.Unlock()
		tmpl, _ := template.New("models").Parse(modelsPage)
		tmpl.Execute(w, history)
	})

	http.HandleFunc("/models/", func(w http.ResponseWriter, r *http.Request) {
		modelId := r.URL.Path[len("/models/"):]

		mutex.Lock()
		modelPayloads, exists := history[modelId]
		mutex.Unlock()

		if !exists {
			http.NotFound(w, r)
			return
		}

		tmpl, _ := template.New("history").Parse(historyPage)
		tmpl.Execute(w, struct {
			ModelId  string
			Payloads []PayloadHistory
		}{ModelId: modelId, Payloads: modelPayloads})
	})

	http.HandleFunc("/payload-json/", func(w http.ResponseWriter, r *http.Request) {
		// This endpoint now needs to handle both request and response data.
		// The URL is expected to include the kind (request or response) and the ID.
		// For example: /payload-json/request/12345 or /payload-json/response/12345

		segments := strings.Split(r.URL.Path, "/")
		if len(segments) < 4 {
			http.Error(w, "URL must include the kind and ID of the payload", http.StatusBadRequest)
			return
		}

		kind := segments[2]
		payloadID := segments[3]

		mutex.Lock()
		defer mutex.Unlock()

		for _, historyItems := range history {
			for _, item := range historyItems {
				if item.Payload.ID == payloadID && string(item.Payload.Kind) == kind {
					w.Header().Set("Content-Type", "application/json")
					w.Write([]byte(item.ProtobufJSON))
					return
				}
			}
		}

		http.NotFound(w, r)
	})

	http.HandleFunc("/ingest", func(w http.ResponseWriter, r *http.Request) {
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

	http.HandleFunc("/images/logo.png", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "image/png")
		w.Write(logoImage)
	})

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
