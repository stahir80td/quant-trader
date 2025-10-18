package api

import (
	"encoding/json"
	"net/http"

	"github.com/stahir80td/quantum-trader/ringbuffer"
	"github.com/stahir80td/quantum-trader/strategies"
)

func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
}

func BufferStatusHandler(buffer *ringbuffer.RingBuffer) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"writeIndex":   buffer.GetWriteIndex(),
			"count":        buffer.GetCount(),
			"size":         buffer.GetSize(),
			"currentPrice": buffer.GetCurrentPrice(),
		})
	}
}

func SignalsHandler(buffer *ringbuffer.RingBuffer) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		prices := buffer.ReadLast(100)
		results := strategies.AnalyzeAll(prices)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(results)
	}
}
