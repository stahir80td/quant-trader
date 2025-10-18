package api

import (
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/stahir80td/quantum-trader/ringbuffer"
	"github.com/stahir80td/quantum-trader/strategies"
)

type WSMessage struct {
	Price       float64                    `json:"price"`
	BufferIndex int                        `json:"bufferIndex"`
	Signals     strategies.StrategyResults `json:"signals"`
	Timestamp   int64                      `json:"timestamp"`
}

func WebSocketHandler(buffer *ringbuffer.RingBuffer, upgrader websocket.Upgrader) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("WebSocket upgrade error:", err)
			return
		}
		defer conn.Close()

		log.Println("✅ WebSocket client connected")

		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			prices := buffer.ReadLast(100)
			if len(prices) < 20 {
				continue
			}

			signals := strategies.AnalyzeAll(prices)

			msg := WSMessage{
				Price:       buffer.GetCurrentPrice(),
				BufferIndex: buffer.GetWriteIndex(),
				Signals:     signals,
				Timestamp:   time.Now().Unix(),
			}

			if err := conn.WriteJSON(msg); err != nil {
				log.Println("WebSocket write error:", err)
				return
			}
		}
	}
}
