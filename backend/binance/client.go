package binance

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gorilla/websocket"
	"github.com/stahir80td/quantum-trader/ringbuffer"
)

type BinanceClient struct {
	buffer *ringbuffer.RingBuffer
}

type CoinbaseMessage struct {
	Type      string `json:"type"`
	ProductID string `json:"product_id"`
	Price     string `json:"price"`
	Time      string `json:"time"`
}

func NewClient(buffer *ringbuffer.RingBuffer) *BinanceClient {
	return &BinanceClient{buffer: buffer}
}

func (bc *BinanceClient) Connect(pair string) {
	// Map our pairs to Coinbase format
	coinbaseProducts := map[string]string{
		"btcusdt": "BTC-USD",
		"ethusdt": "ETH-USD",
		"solusdt": "SOL-USD",
		"bnbusdt": "BTC-USD", // Coinbase doesn't have BNB, use BTC instead
	}

	product := coinbaseProducts[pair]
	url := "wss://ws-feed.exchange.coinbase.com"

	dialer := websocket.Dialer{
		HandshakeTimeout: 10 * time.Second,
	}

	headers := http.Header{}
	headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")

	for {
		conn, resp, err := dialer.Dial(url, headers)
		if err != nil {
			if resp != nil {
				log.Printf("❌ Coinbase connection failed for %s: HTTP %d - %v", pair, resp.StatusCode, err)
			} else {
				log.Printf("❌ Coinbase connection failed for %s: %v", pair, err)
			}
			time.Sleep(5 * time.Second)
			continue
		}

		// Subscribe to ticker channel
		subscribe := map[string]interface{}{
			"type":        "subscribe",
			"product_ids": []string{product},
			"channels":    []string{"ticker"},
		}

		if err := conn.WriteJSON(subscribe); err != nil {
			log.Printf("❌ Subscribe failed for %s: %v", pair, err)
			conn.Close()
			time.Sleep(5 * time.Second)
			continue
		}

		log.Printf("✅ Connected to Coinbase: %s (%s)", pair, product)

		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Printf("⚠️  Connection lost for %s: %v", pair, err)
				conn.Close()
				break
			}

			var msg CoinbaseMessage
			if err := json.Unmarshal(message, &msg); err != nil {
				continue
			}

			// Only process ticker messages with price
			if msg.Type == "ticker" && msg.Price != "" {
				var price float64
				if _, err := fmt.Sscanf(msg.Price, "%f", &price); err == nil {
					bc.buffer.Write(price)
				}
			}
		}

		log.Printf("🔄 Reconnecting to Coinbase: %s", pair)
		time.Sleep(2 * time.Second)
	}
}
