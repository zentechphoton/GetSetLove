-- ============================
-- CHAT TABLES
-- ============================

CREATE TABLE IF NOT EXISTS chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(20) NOT NULL CHECK (type IN ('dm', 'group')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_message_id UUID,
    last_message_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS chat_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP NOT NULL DEFAULT NOW(),
    left_at TIMESTAMP,
    muted BOOLEAN DEFAULT FALSE,
    archived BOOLEAN DEFAULT FALSE,
    last_read_message_id UUID,
    last_read_at TIMESTAMP,
    unread_count INTEGER DEFAULT 0,
    UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,

    -- Content
    content TEXT,
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video', 'audio', 'file')),
    media_url TEXT,
    media_metadata JSONB,

    -- Metadata
    reply_to_message_id UUID REFERENCES messages(id),
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'media', 'system')),
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Ordering
    sequence_number BIGSERIAL NOT NULL,

    -- Moderation
    is_flagged BOOLEAN DEFAULT FALSE,
    moderation_status VARCHAR(20) DEFAULT 'pending',

    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS message_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('delivered', 'read')),
    timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(message_id, user_id, status)
);

-- ============================
-- MATCHING TABLES
-- ============================

CREATE TABLE IF NOT EXISTS user_preferences (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    min_age INTEGER DEFAULT 18,
    max_age INTEGER DEFAULT 99,
    max_distance_km INTEGER DEFAULT 50,
    gender_preference VARCHAR(50)[],
    relationship_goals VARCHAR(50)[],
    interests VARCHAR(100)[],
    dealbreakers VARCHAR(100)[],
    verified_only BOOLEAN DEFAULT FALSE,
    premium_only BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles_extended (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    height_cm INTEGER,
    education VARCHAR(100),
    occupation VARCHAR(100),
    religion VARCHAR(50),
    smoking VARCHAR(20),
    drinking VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city VARCHAR(100),
    country VARCHAR(100),
    response_rate DECIMAL(5, 2) DEFAULT 0.0,
    profile_completeness INTEGER DEFAULT 0,
    last_active_at TIMESTAMP,
    photo_urls TEXT[],
    verified_photo BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    matched_at TIMESTAMP NOT NULL DEFAULT NOW(),
    match_score DECIMAL(5, 2),
    match_reason TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unmatched', 'blocked')),
    chat_id UUID REFERENCES chats(id),
    first_message_at TIMESTAMP,
    CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

CREATE TABLE IF NOT EXISTS likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    like_type VARCHAR(20) DEFAULT 'like' CHECK (like_type IN ('like', 'superlike', 'pass')),
    UNIQUE(from_user_id, to_user_id)
);

CREATE TABLE IF NOT EXISTS match_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    suggested_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score DECIMAL(5, 2) NOT NULL,
    score_breakdown JSONB,
    generated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    shown_at TIMESTAMP,
    interaction VARCHAR(20) CHECK (interaction IN ('like', 'pass', 'superlike')),
    interacted_at TIMESTAMP,
    rank INTEGER,
    batch_id UUID
);

-- ============================
-- INDICES
-- ============================

-- Chat indices
CREATE INDEX IF NOT EXISTS idx_messages_chat_id_created ON messages(chat_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_sequence ON messages(chat_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON messages(deleted_at) WHERE deleted_at IS NOT NULL;

-- Matching indices
CREATE INDEX IF NOT EXISTS idx_likes_from_user ON likes(from_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_to_user ON likes(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id, status);
CREATE INDEX IF NOT EXISTS idx_suggestions_user_score ON match_suggestions(user_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_suggestions_shown ON match_suggestions(user_id, shown_at) WHERE shown_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_profiles_active ON user_profiles_extended(last_active_at DESC);

-- Geospatial extensions and index for location-based matching
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

CREATE INDEX IF NOT EXISTS idx_user_profiles_location ON user_profiles_extended
    USING GIST(ll_to_earth(latitude, longitude))
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- ============================
-- TRIGGERS
-- ============================

-- Update chat.updated_at and last_message info on new message
CREATE OR REPLACE FUNCTION update_chat_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats
    SET updated_at = NEW.created_at,
        last_message_id = NEW.id,
        last_message_at = NEW.created_at
    WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_chat_timestamp ON messages;
CREATE TRIGGER trigger_update_chat_timestamp
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_timestamp();

-- Update unread count on new message
CREATE OR REPLACE FUNCTION update_unread_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_participants
    SET unread_count = unread_count + 1
    WHERE chat_id = NEW.chat_id AND user_id != NEW.sender_id AND left_at IS NULL;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_unread_count ON messages;
CREATE TRIGGER trigger_update_unread_count
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_unread_count();

-- ============================
-- COMMENTS
-- ============================

COMMENT ON TABLE chats IS 'Stores chat conversations (DM or group)';
COMMENT ON TABLE chat_participants IS 'Tracks users participation in chats';
COMMENT ON TABLE messages IS 'Stores all chat messages with content and metadata';
COMMENT ON TABLE message_receipts IS 'Tracks message delivery and read status';
COMMENT ON TABLE user_preferences IS 'User matching preferences and filters';
COMMENT ON TABLE user_profiles_extended IS 'Extended user profile data for matching algorithm';
COMMENT ON TABLE matches IS 'Stores mutual matches between users';
COMMENT ON TABLE likes IS 'Tracks like/pass/superlike actions';
COMMENT ON TABLE match_suggestions IS 'Generated match suggestions for users';
