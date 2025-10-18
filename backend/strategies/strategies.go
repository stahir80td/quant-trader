package strategies

import (
	"fmt"
	"math"
)

// AnalyzeAll runs all strategies and generates consensus with conviction scoring
func AnalyzeAll(prices []float64) StrategyResults {
	// Run all 4 strategies
	results := StrategyResults{
		MeanReversion: MeanReversion(prices),
		Momentum:      Momentum(prices),
		Breakout:      Breakout(prices),
		RSI:           RSI(prices),
	}

	// Generate consensus using ensemble voting with conviction weighting
	results.Consensus = GenerateConsensus(results)

	return results
}

// GenerateConsensus implements weighted ensemble voting
func GenerateConsensus(results StrategyResults) string {
	strategies := []Signal{
		results.MeanReversion,
		results.Momentum,
		results.Breakout,
		results.RSI,
	}

	// Calculate weighted scores (strength acts as conviction weight)
	buyScore := 0.0
	sellScore := 0.0
	totalWeight := 0.0

	for _, sig := range strategies {
		weight := float64(sig.Strength) / 100.0 // Normalize to 0-1

		switch sig.Type {
		case "BUY":
			buyScore += weight
		case "SELL":
			sellScore += weight
		}

		totalWeight += weight
	}

	// Normalize scores
	if totalWeight > 0 {
		buyScore = buyScore / totalWeight * 100
		sellScore = sellScore / totalWeight * 100
	}

	// Count raw agreement
	buyCount := 0
	sellCount := 0
	neutralCount := 0

	for _, sig := range strategies {
		switch sig.Type {
		case "BUY":
			buyCount++
		case "SELL":
			sellCount++
		case "NEUTRAL":
			neutralCount++
		}
	}

	// Decision logic with conviction thresholds
	// Strong signals: 3+ strategies agree + high weighted score
	if buyCount >= 3 && buyScore > 60 {
		return "STRONG BUY"
	}
	if sellCount >= 3 && sellScore > 60 {
		return "STRONG SELL"
	}

	// Moderate signals: 2+ strategies agree + moderate weighted score
	if buyCount >= 2 && buyScore > 50 {
		return "BUY"
	}
	if sellCount >= 2 && sellScore > 50 {
		return "SELL"
	}

	// Weak signals: majority but low conviction
	if buyCount > sellCount && buyScore > 40 {
		return "BUY"
	}
	if sellCount > buyCount && sellScore > 40 {
		return "SELL"
	}

	return "NEUTRAL"
}

// Strategy 1: Mean Reversion
func MeanReversion(prices []float64) Signal {
	if len(prices) < 20 {
		return Signal{
			Type:     "NEUTRAL",
			Strength: 0,
			Reason:   "Need at least 20 data points",
		}
	}

	// Calculate 20-period Simple Moving Average (SMA)
	sum := 0.0
	period := 20
	for i := len(prices) - period; i < len(prices); i++ {
		sum += prices[i]
	}
	sma := sum / float64(period)

	currentPrice := prices[len(prices)-1]
	deviation := ((currentPrice - sma) / sma) * 100

	// Calculate standard deviation for dynamic thresholds
	variance := 0.0
	for i := len(prices) - period; i < len(prices); i++ {
		diff := prices[i] - sma
		variance += diff * diff
	}
	stdDev := math.Sqrt(variance / float64(period))
	stdDevPercent := (stdDev / sma) * 100

	threshold := stdDevPercent * 1.5

	if deviation < -threshold {
		strength := int(math.Min(math.Abs(deviation/threshold)*100, 100))
		return Signal{
			Type:     "BUY",
			Strength: strength,
			Reason:   fmt.Sprintf("Price %.2f%% below SMA (oversold)", math.Abs(deviation)),
		}
	} else if deviation > threshold {
		strength := int(math.Min((deviation/threshold)*100, 100))
		return Signal{
			Type:     "SELL",
			Strength: strength,
			Reason:   fmt.Sprintf("Price %.2f%% above SMA (overbought)", deviation),
		}
	}

	return Signal{
		Type:     "NEUTRAL",
		Strength: 50,
		Reason:   fmt.Sprintf("Price near SMA (%.2f%% deviation)", deviation),
	}
}

// Strategy 2: Momentum
func Momentum(prices []float64) Signal {
	if len(prices) < 14 {
		return Signal{
			Type:     "NEUTRAL",
			Strength: 0,
			Reason:   "Need at least 14 data points",
		}
	}

	period := 10
	currentPrice := prices[len(prices)-1]
	oldPrice := prices[len(prices)-period-1]
	roc := ((currentPrice - oldPrice) / oldPrice) * 100

	consecutiveUps := 0
	consecutiveDowns := 0

	for i := len(prices) - period; i < len(prices); i++ {
		if prices[i] > prices[i-1] {
			consecutiveUps++
		} else if prices[i] < prices[i-1] {
			consecutiveDowns++
		}
	}

	momentumScore := float64(consecutiveUps) / float64(period) * 100

	if roc > 2.0 && momentumScore >= 70 {
		strength := int(math.Min(momentumScore, 100))
		return Signal{
			Type:     "BUY",
			Strength: strength,
			Reason:   fmt.Sprintf("Strong uptrend: %.1f%% ROC, %d/%d ticks up", roc, consecutiveUps, period),
		}
	} else if roc < -2.0 && momentumScore <= 30 {
		strength := int(math.Min(100-momentumScore, 100))
		return Signal{
			Type:     "SELL",
			Strength: strength,
			Reason:   fmt.Sprintf("Strong downtrend: %.1f%% ROC, %d/%d ticks down", roc, consecutiveDowns, period),
		}
	} else if roc > 0.5 && momentumScore >= 60 {
		return Signal{
			Type:     "BUY",
			Strength: int(momentumScore),
			Reason:   fmt.Sprintf("Moderate uptrend: %.1f%% ROC", roc),
		}
	} else if roc < -0.5 && momentumScore <= 40 {
		return Signal{
			Type:     "SELL",
			Strength: int(100 - momentumScore),
			Reason:   fmt.Sprintf("Moderate downtrend: %.1f%% ROC", roc),
		}
	}

	return Signal{
		Type:     "NEUTRAL",
		Strength: 50,
		Reason:   fmt.Sprintf("Mixed signals: %.1f%% ROC, %d/%d up", roc, consecutiveUps, period),
	}
}

// Strategy 3: Breakout Detection
func Breakout(prices []float64) Signal {
	if len(prices) < 50 {
		return Signal{
			Type:     "NEUTRAL",
			Strength: 0,
			Reason:   "Need at least 50 data points",
		}
	}

	lookback := 50
	high := prices[len(prices)-lookback]
	low := prices[len(prices)-lookback]

	for i := len(prices) - lookback; i < len(prices)-1; i++ {
		if prices[i] > high {
			high = prices[i]
		}
		if prices[i] < low {
			low = prices[i]
		}
	}

	currentPrice := prices[len(prices)-1]
	priceRange := high - low
	rangePosition := ((currentPrice - low) / priceRange) * 100

	if currentPrice > high {
		breakoutStrength := ((currentPrice - high) / high) * 1000
		strength := int(math.Min(50+breakoutStrength, 100))
		return Signal{
			Type:     "BUY",
			Strength: strength,
			Reason:   fmt.Sprintf("Breakout above resistance: $%.2f (was $%.2f)", currentPrice, high),
		}
	}

	if currentPrice < low {
		breakdownStrength := ((low - currentPrice) / low) * 1000
		strength := int(math.Min(50+breakdownStrength, 100))
		return Signal{
			Type:     "SELL",
			Strength: strength,
			Reason:   fmt.Sprintf("Breakdown below support: $%.2f (was $%.2f)", currentPrice, low),
		}
	}

	if rangePosition > 90 {
		return Signal{
			Type:     "SELL",
			Strength: 60,
			Reason:   fmt.Sprintf("Near resistance at $%.2f", high),
		}
	}

	if rangePosition < 10 {
		return Signal{
			Type:     "BUY",
			Strength: 60,
			Reason:   fmt.Sprintf("Near support at $%.2f", low),
		}
	}

	return Signal{
		Type:     "NEUTRAL",
		Strength: 50,
		Reason:   fmt.Sprintf("Within range: $%.2f - $%.2f", low, high),
	}
}

// Strategy 4: RSI (Relative Strength Index)
func RSI(prices []float64) Signal {
	period := 14

	if len(prices) < period+1 {
		return Signal{
			Type:     "NEUTRAL",
			Strength: 0,
			Reason:   "Need at least 15 data points",
		}
	}

	gains := 0.0
	losses := 0.0

	for i := len(prices) - period; i < len(prices); i++ {
		change := prices[i] - prices[i-1]
		if change > 0 {
			gains += change
		} else {
			losses += math.Abs(change)
		}
	}

	avgGain := gains / float64(period)
	avgLoss := losses / float64(period)

	if avgLoss == 0 {
		if avgGain == 0 {
			return Signal{
				Type:     "NEUTRAL",
				Strength: 50,
				Reason:   "No price movement detected",
			}
		}
		return Signal{
			Type:     "SELL",
			Strength: 100,
			Reason:   "RSI: 100 (extreme overbought)",
		}
	}

	rs := avgGain / avgLoss
	rsi := 100 - (100 / (1 + rs))

	if rsi < 30 {
		strength := int((30 - rsi) * 3.33)
		if strength > 100 {
			strength = 100
		}
		return Signal{
			Type:     "BUY",
			Strength: strength,
			Reason:   fmt.Sprintf("RSI oversold: %.1f (< 30)", rsi),
		}
	} else if rsi > 70 {
		strength := int((rsi - 70) * 3.33)
		if strength > 100 {
			strength = 100
		}
		return Signal{
			Type:     "SELL",
			Strength: strength,
			Reason:   fmt.Sprintf("RSI overbought: %.1f (> 70)", rsi),
		}
	} else if rsi >= 30 && rsi <= 40 {
		return Signal{
			Type:     "BUY",
			Strength: 40,
			Reason:   fmt.Sprintf("RSI approaching oversold: %.1f", rsi),
		}
	} else if rsi >= 60 && rsi <= 70 {
		return Signal{
			Type:     "SELL",
			Strength: 40,
			Reason:   fmt.Sprintf("RSI approaching overbought: %.1f", rsi),
		}
	}

	return Signal{
		Type:     "NEUTRAL",
		Strength: 50,
		Reason:   fmt.Sprintf("RSI neutral: %.1f", rsi),
	}
}
