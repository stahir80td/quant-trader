package strategies

type Signal struct {
	Type     string `json:"type"`     // "BUY", "SELL", "NEUTRAL"
	Strength int    `json:"strength"` // 0-100
	Reason   string `json:"reason"`
}

type StrategyResults struct {
	MeanReversion Signal `json:"meanReversion"`
	Momentum      Signal `json:"momentum"`
	Breakout      Signal `json:"breakout"`
	RSI           Signal `json:"rsi"`
	Consensus     string `json:"consensus"`
}
