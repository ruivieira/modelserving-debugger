// Define a TypeScript interface for the payload based on the structure received from the backend
export interface Payload {
    id: string; // Unique identifier for the payload
    name: string; // Human-readable name for the payload
    kind: "request" | "response";
}

export interface PayloadHistory {
    Timestamp: string;
    Payload: Payload;
    ProtobufJSON: string;
}

export interface PayloadWithId {
    id: string;  // Unique identifier for the payload
    name: string; // Human-readable name for the payload
    kind: 'request' | 'response';
}