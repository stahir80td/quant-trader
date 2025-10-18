package main

import (
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gorilla/websocket"
	"github.com/rs/cors"
	"github.com/stahir80td/quantum-trader/api"
	"github.com/stahir80td/quantum-trader/binance"
	"github.com/stahir80td/quantum-trader/ringbuffer"
	"github.com/stahir80td/quantum-trader/strategies"
)

var (
	buffer   *ringbuffer.RingBuffer
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool { return true },
	}
)

func main() {
	// Initialize ring buffer (1000 slots)
	buffer = ringbuffer.New(1000)

	// Start Binance WebSocket client
	pairs := []string{"btcusdt", "ethusdt", "solusdt", "bnbusdt"}
	binanceClient := binance.NewClient(buffer)

	for _, pair := range pairs {
		go binanceClient.Connect(pair)
	}

	// Start strategy analysis loop
	go runStrategyLoop()

	// Setup HTTP handlers
	mux := http.NewServeMux()

	// API endpoints
	mux.HandleFunc("/api/health", api.HealthHandler)
	mux.HandleFunc("/api/buffer/status", api.BufferStatusHandler(buffer))
	mux.HandleFunc("/api/signals", api.SignalsHandler(buffer))
	mux.HandleFunc("/ws", api.WebSocketHandler(buffer, upgrader))

	// Serve static frontend
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/", fs)

	// CORS middleware
	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	}).Handler(mux)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Quantum Trader starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

func runStrategyLoop() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		prices := buffer.ReadLast(100)
		if len(prices) < 20 {
			continue
		}

		// Run all 4 strategies
		_ = strategies.AnalyzeAll(prices)
		// Results will be sent via WebSocket in api package
	}
}
