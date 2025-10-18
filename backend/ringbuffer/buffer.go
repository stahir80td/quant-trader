package ringbuffer

import (
	"sync"
)

type RingBuffer struct {
	data       []float64
	writeIndex int
	size       int
	count      int
	mu         sync.RWMutex
}

func New(size int) *RingBuffer {
	return &RingBuffer{
		data:       make([]float64, size),
		size:       size,
		writeIndex: 0,
		count:      0,
	}
}

func (rb *RingBuffer) Write(price float64) {
	rb.mu.Lock()
	defer rb.mu.Unlock()

	rb.data[rb.writeIndex] = price
	rb.writeIndex = (rb.writeIndex + 1) % rb.size

	if rb.count < rb.size {
		rb.count++
	}
}

func (rb *RingBuffer) ReadLast(n int) []float64 {
	rb.mu.RLock()
	defer rb.mu.RUnlock()

	if n > rb.count {
		n = rb.count
	}

	result := make([]float64, n)
	startIdx := (rb.writeIndex - n + rb.size) % rb.size

	for i := 0; i < n; i++ {
		idx := (startIdx + i) % rb.size
		result[i] = rb.data[idx]
	}

	return result
}

func (rb *RingBuffer) GetWriteIndex() int {
	rb.mu.RLock()
	defer rb.mu.RUnlock()
	return rb.writeIndex
}

func (rb *RingBuffer) GetCount() int {
	rb.mu.RLock()
	defer rb.mu.RUnlock()
	return rb.count
}

func (rb *RingBuffer) GetSize() int {
	return rb.size
}

func (rb *RingBuffer) GetCurrentPrice() float64 {
	rb.mu.RLock()
	defer rb.mu.RUnlock()

	if rb.count == 0 {
		return 0
	}

	lastIdx := (rb.writeIndex - 1 + rb.size) % rb.size
	return rb.data[lastIdx]
}
