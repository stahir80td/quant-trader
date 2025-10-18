package rag

import "strings"

var knowledgeBase = map[string]string{
	"mean_reversion_buy":  "Mean reversion signals BUY when price drops 2%+ below the 20-tick moving average, indicating oversold conditions. Historical win rate: 67% in volatile markets.",
	"mean_reversion_sell": "Mean reversion signals SELL when price rises 2%+ above the 20-tick moving average, indicating overbought conditions.",
	"momentum_buy":        "Momentum signals BUY when 7+ out of 10 recent ticks show upward movement, indicating a strong uptrend. Best on high-volume assets.",
	"momentum_sell":       "Momentum signals SELL when 7+ out of 10 ticks show downward movement, indicating bearish momentum.",
	"breakout_buy":        "Breakout signals BUY when price exceeds the 50-tick high, suggesting a bullish breakout. Success rate: 58%.",
	"breakout_sell":       "Breakout signals SELL when price falls below the 50-tick low, indicating a bearish breakdown.",
	"rsi_buy":             "RSI signals BUY when the index falls below 30, indicating oversold conditions. Often precedes price rebounds.",
	"rsi_sell":            "RSI signals SELL when the index exceeds 70, indicating overbought conditions. Often precedes corrections.",
	"why_buy":             "Multiple strategies agree on bullish conditions: price below average (mean reversion), upward momentum, or breakout above resistance.",
	"why_sell":            "Multiple strategies agree on bearish conditions: price above average, downward momentum, or breakdown below support.",
	"ring_buffer":         "The ring buffer stores the last 1000 price ticks in a circular structure. When full, new data overwrites the oldest data automatically.",
	"parallel_strategies": "All 4 strategies analyze the same ring buffer data simultaneously without blocking each other, enabling real-time multi-strategy analysis.",
}

func Query(question string) string {
	question = strings.ToLower(question)

	// Simple keyword matching
	if strings.Contains(question, "mean reversion") {
		if strings.Contains(question, "buy") {
			return knowledgeBase["mean_reversion_buy"]
		}
		if strings.Contains(question, "sell") {
			return knowledgeBase["mean_reversion_sell"]
		}
	}

	if strings.Contains(question, "momentum") {
		if strings.Contains(question, "buy") {
			return knowledgeBase["momentum_buy"]
		}
		if strings.Contains(question, "sell") {
			return knowledgeBase["momentum_sell"]
		}
	}

	if strings.Contains(question, "breakout") {
		if strings.Contains(question, "buy") {
			return knowledgeBase["breakout_buy"]
		}
		if strings.Contains(question, "sell") {
			return knowledgeBase["breakout_sell"]
		}
	}

	if strings.Contains(question, "rsi") {
		if strings.Contains(question, "buy") {
			return knowledgeBase["rsi_buy"]
		}
		if strings.Contains(question, "sell") {
			return knowledgeBase["rsi_sell"]
		}
	}

	if strings.Contains(question, "why") && strings.Contains(question, "buy") {
		return knowledgeBase["why_buy"]
	}

	if strings.Contains(question, "why") && strings.Contains(question, "sell") {
		return knowledgeBase["why_sell"]
	}

	if strings.Contains(question, "ring buffer") {
		return knowledgeBase["ring_buffer"]
	}

	if strings.Contains(question, "parallel") || strings.Contains(question, "strategies") {
		return knowledgeBase["parallel_strategies"]
	}

	return "I can answer questions about mean reversion, momentum, breakout, RSI strategies, and the ring buffer architecture. Try asking: 'Why is momentum signaling BUY?' or 'How does the ring buffer work?'"
}
