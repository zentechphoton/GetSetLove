package natsutil

import (
	"fmt"
	"log"
	"time"

	"github.com/nats-io/nats.go"
)

// JetStreamConfig holds JetStream configuration
type JetStreamConfig struct {
	URL             string
	MaxReconnects   int
	ReconnectWait   time.Duration
	StreamPrefix    string
}

// StreamConfigurator manages JetStream streams
type StreamConfigurator struct {
	js nats.JetStreamContext
}

// NewStreamConfigurator creates a new stream configurator
func NewStreamConfigurator(js nats.JetStreamContext) *StreamConfigurator {
	return &StreamConfigurator{js: js}
}

// SetupChatStreams creates all required chat streams
func (sc *StreamConfigurator) SetupChatStreams() error {
	// Chat Messages Stream - durable, replay-able
	chatMessagesStream := &nats.StreamConfig{
		Name:        "CHAT_MESSAGES",
		Description: "Stream for all chat messages",
		Subjects:    []string{"chat.message.>"},
		Storage:     nats.FileStorage,
		Retention:   nats.LimitsPolicy,
		MaxAge:      30 * 24 * time.Hour, // 30 days retention
		MaxBytes:    10 * 1024 * 1024 * 1024, // 10GB max
		Replicas:    1, // Set to 3 in production cluster
		Discard:     nats.DiscardOld,
		Duplicates:  2 * time.Minute, // Deduplication window
	}

	if err := sc.createOrUpdateStream(chatMessagesStream); err != nil {
		return fmt.Errorf("failed to create chat messages stream: %w", err)
	}

	// Presence & Typing Stream - ephemeral, short-lived
	presenceStream := &nats.StreamConfig{
		Name:        "PRESENCE",
		Description: "Stream for presence and typing indicators",
		Subjects:    []string{"chat.presence.>", "chat.typing.>"},
		Storage:     nats.MemoryStorage,
		Retention:   nats.WorkQueuePolicy,
		MaxAge:      5 * time.Minute,
		MaxMsgs:     10000,
		Replicas:    1,
		Discard:     nats.DiscardOld,
	}

	if err := sc.createOrUpdateStream(presenceStream); err != nil {
		return fmt.Errorf("failed to create presence stream: %w", err)
	}

	log.Println("✅ Chat streams configured successfully")
	return nil
}

// SetupMatchingStreams creates all required matching streams
func (sc *StreamConfigurator) SetupMatchingStreams() error {
	// Matching Events Stream
	matchingStream := &nats.StreamConfig{
		Name:        "MATCHES",
		Description: "Stream for matching and like events",
		Subjects:    []string{"match.>"},
		Storage:     nats.FileStorage,
		Retention:   nats.InterestPolicy,
		MaxAge:      7 * 24 * time.Hour, // 7 days retention
		MaxBytes:    5 * 1024 * 1024 * 1024, // 5GB max
		Replicas:    1,
		Discard:     nats.DiscardOld,
		Duplicates:  1 * time.Minute,
	}

	if err := sc.createOrUpdateStream(matchingStream); err != nil {
		return fmt.Errorf("failed to create matching stream: %w", err)
	}

	log.Println("✅ Matching streams configured successfully")
	return nil
}

// SetupNotificationStreams creates notification streams
func (sc *StreamConfigurator) SetupNotificationStreams() error {
	// Notifications Stream
	notificationStream := &nats.StreamConfig{
		Name:        "NOTIFICATIONS",
		Description: "Stream for push notifications and system events",
		Subjects:    []string{"notification.>", "user.>"},
		Storage:     nats.FileStorage,
		Retention:   nats.WorkQueuePolicy,
		MaxAge:      24 * time.Hour, // 1 day retention
		MaxBytes:    1 * 1024 * 1024 * 1024, // 1GB max
		Replicas:    1,
		Discard:     nats.DiscardOld,
	}

	if err := sc.createOrUpdateStream(notificationStream); err != nil {
		return fmt.Errorf("failed to create notification stream: %w", err)
	}

	log.Println("✅ Notification streams configured successfully")
	return nil
}

// createOrUpdateStream creates or updates a stream
func (sc *StreamConfigurator) createOrUpdateStream(cfg *nats.StreamConfig) error {
	// Try to get existing stream info
	info, err := sc.js.StreamInfo(cfg.Name)

	if err != nil {
		// Stream doesn't exist, create it
		_, err = sc.js.AddStream(cfg)
		if err != nil {
			return fmt.Errorf("failed to add stream %s: %w", cfg.Name, err)
		}
		log.Printf("✅ Created stream: %s", cfg.Name)
		return nil
	}

	// Stream exists, update it
	if info != nil {
		_, err = sc.js.UpdateStream(cfg)
		if err != nil {
			return fmt.Errorf("failed to update stream %s: %w", cfg.Name, err)
		}
		log.Printf("✅ Updated stream: %s", cfg.Name)
	}

	return nil
}

// ConnectNATS establishes a NATS connection with JetStream
func ConnectNATS(config JetStreamConfig) (*nats.Conn, nats.JetStreamContext, error) {
	// Connection options
	opts := []nats.Option{
		nats.Name("GSL-Backend"),
		nats.MaxReconnects(config.MaxReconnects),
		nats.ReconnectWait(config.ReconnectWait),
		nats.DisconnectErrHandler(func(nc *nats.Conn, err error) {
			log.Printf("⚠️  NATS disconnected: %v", err)
		}),
		nats.ReconnectHandler(func(nc *nats.Conn) {
			log.Printf("✅ NATS reconnected: %s", nc.ConnectedUrl())
		}),
		nats.ClosedHandler(func(nc *nats.Conn) {
			log.Printf("❌ NATS connection closed")
		}),
	}

	// Connect to NATS
	nc, err := nats.Connect(config.URL, opts...)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to connect to NATS: %w", err)
	}

	// Create JetStream context
	js, err := nc.JetStream(nats.PublishAsyncMaxPending(256))
	if err != nil {
		nc.Close()
		return nil, nil, fmt.Errorf("failed to create JetStream context: %w", err)
	}

	log.Printf("✅ Connected to NATS at %s", nc.ConnectedUrl())

	// Setup all streams
	configurator := NewStreamConfigurator(js)

	if err := configurator.SetupChatStreams(); err != nil {
		log.Printf("⚠️  Warning: Failed to setup chat streams: %v", err)
	}

	if err := configurator.SetupMatchingStreams(); err != nil {
		log.Printf("⚠️  Warning: Failed to setup matching streams: %v", err)
	}

	if err := configurator.SetupNotificationStreams(); err != nil {
		log.Printf("⚠️  Warning: Failed to setup notification streams: %v", err)
	}

	return nc, js, nil
}

// PublishEvent publishes an event to a NATS subject
func PublishEvent(js nats.JetStreamContext, subject string, data []byte, msgID string) error {
	opts := []nats.PubOpt{}

	if msgID != "" {
		opts = append(opts, nats.MsgId(msgID))
	}

	_, err := js.Publish(subject, data, opts...)
	if err != nil {
		return fmt.Errorf("failed to publish to %s: %w", subject, err)
	}

	return nil
}

// CreateConsumer creates a durable consumer for a stream
func CreateConsumer(js nats.JetStreamContext, streamName, consumerName, filterSubject string) (*nats.Subscription, error) {
	sub, err := js.Subscribe(
		filterSubject,
		func(msg *nats.Msg) {
			// Handler will be added by the service
			msg.Ack()
		},
		nats.Durable(consumerName),
		nats.ManualAck(),
		nats.AckExplicit(),
		nats.DeliverAll(),
	)

	if err != nil {
		return nil, fmt.Errorf("failed to create consumer %s: %w", consumerName, err)
	}

	return sub, nil
}
