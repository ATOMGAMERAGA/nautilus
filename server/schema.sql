CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- USERS
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         BIGINT UNIQUE NOT NULL,
    username        VARCHAR(32) UNIQUE NOT NULL,
    display_name    VARCHAR(32),
    password_hash   TEXT NOT NULL,
    avatar_url      TEXT,
    banner_url      TEXT,
    about_me        TEXT,
    status          VARCHAR(20) DEFAULT 'offline',
    custom_status   TEXT,
    global_role     VARCHAR(20) DEFAULT 'user',
    is_bot          BOOLEAN DEFAULT FALSE,
    is_banned       BOOLEAN DEFAULT FALSE,
    ban_reason      TEXT,
    two_factor_secret      TEXT,
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    banned_by       UUID REFERENCES users(id),
    banned_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_global_role ON users(global_role);

-- User ID Sequence
CREATE SEQUENCE user_id_seq START WITH 1000000001 INCREMENT BY 1;

-- BADGES
CREATE TABLE badges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) UNIQUE NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    icon_url        TEXT NOT NULL,
    color           VARCHAR(7),
    priority        INT DEFAULT 0,
    is_system       BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- USER BADGES
CREATE TABLE user_badges (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id        UUID REFERENCES badges(id) ON DELETE CASCADE,
    granted_by      UUID REFERENCES users(id),
    granted_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- PLATFORM AUDIT LOGS
CREATE TABLE platform_audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,
    target_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    target_type     VARCHAR(50),
    details         JSONB,
    reason          TEXT,
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_audit ON platform_audit_logs(created_at DESC);

-- PLATFORM ANNOUNCEMENTS
CREATE TABLE platform_announcements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,
    type            VARCHAR(20) DEFAULT 'info',
    is_active       BOOLEAN DEFAULT TRUE,
    pinned          BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- GUILDS
CREATE TABLE guilds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    icon_url        TEXT,
    banner_url      TEXT,
    description     TEXT,
    owner_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    region          VARCHAR(50) DEFAULT 'auto',
    verification_level INT DEFAULT 0,
    default_channel_id UUID,
    member_count    INT DEFAULT 0,
    boost_count     INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CHANNELS
CREATE TABLE channels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    topic           TEXT,
    type            VARCHAR(20) NOT NULL,
    position        INT DEFAULT 0,
    parent_id       UUID REFERENCES channels(id),
    is_nsfw         BOOLEAN DEFAULT FALSE,
    slowmode        INT DEFAULT 0,
    bitrate         INT DEFAULT 64000,
    user_limit      INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    content         TEXT,
    type            VARCHAR(20) DEFAULT 'default',
    reference_id    UUID REFERENCES messages(id),
    is_pinned       BOOLEAN DEFAULT FALSE,
    is_edited       BOOLEAN DEFAULT FALSE,
    edited_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_channel ON messages(channel_id, created_at DESC);

-- ATTACHMENTS
CREATE TABLE attachments (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID REFERENCES messages(id) ON DELETE CASCADE,
    filename        VARCHAR(255) NOT NULL,
    file_url        TEXT NOT NULL,
    file_size       BIGINT,
    content_type    VARCHAR(100),
    width           INT,
    height          INT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- REACTIONS
CREATE TABLE reactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji           VARCHAR(100) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- GUILD MEMBERS
CREATE TABLE guild_members (
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    nickname        VARCHAR(32),
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    is_muted        BOOLEAN DEFAULT FALSE,
    is_deafened     BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (guild_id, user_id)
);

-- ROLES
CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    color           VARCHAR(7),
    icon_url        TEXT,
    position        INT DEFAULT 0,
    permissions     BIGINT DEFAULT 0,
    is_hoisted      BOOLEAN DEFAULT FALSE,
    is_mentionable  BOOLEAN DEFAULT FALSE,
    is_default      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- MEMBER ROLES
CREATE TABLE member_roles (
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id         UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (guild_id, user_id, role_id)
);

-- CHANNEL PERMISSIONS
CREATE TABLE channel_permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    target_id       UUID NOT NULL,
    target_type     VARCHAR(10) NOT NULL,
    allow           BIGINT DEFAULT 0,
    deny            BIGINT DEFAULT 0
);

-- FRIENDSHIPS
CREATE TABLE friendships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'pending',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id, status);
CREATE INDEX idx_friendships_friend ON friendships(friend_id, status);

-- DM CHANNELS
CREATE TABLE dm_channels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(10) DEFAULT 'dm',
    name            VARCHAR(100),
    icon_url        TEXT,
    owner_id        UUID REFERENCES users(id),
    last_message_id UUID,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- DM MEMBERS
CREATE TABLE dm_members (
    dm_channel_id   UUID REFERENCES dm_channels(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    is_closed       BOOLEAN DEFAULT FALSE,
    last_read_at    TIMESTAMPTZ,
    notifications   VARCHAR(20) DEFAULT 'all',
    PRIMARY KEY (dm_channel_id, user_id)
);

-- DM CALLS
CREATE TABLE dm_calls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dm_channel_id   UUID REFERENCES dm_channels(id) ON DELETE CASCADE,
    initiator_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    type            VARCHAR(10) NOT NULL,
    status          VARCHAR(20) DEFAULT 'ringing',
    started_at      TIMESTAMPTZ,
    ended_at        TIMESTAMPTZ,
    duration_sec    INT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- DM CALL PARTICIPANTS
CREATE TABLE dm_call_participants (
    call_id         UUID REFERENCES dm_calls(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    left_at         TIMESTAMPTZ,
    is_muted        BOOLEAN DEFAULT FALSE,
    is_deafened     BOOLEAN DEFAULT FALSE,
    is_video        BOOLEAN DEFAULT FALSE,
    is_screen_share BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (call_id, user_id)
);

CREATE INDEX idx_dm_calls_channel ON dm_calls(dm_channel_id, created_at DESC);

-- INVITES
CREATE TABLE invites (
    code            VARCHAR(10) PRIMARY KEY,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    inviter_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    max_uses        INT DEFAULT 0,
    uses            INT DEFAULT 0,
    max_age         INT DEFAULT 86400,
    is_temporary    BOOLEAN DEFAULT FALSE,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- USER SETTINGS
CREATE TABLE user_settings (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme           VARCHAR(10) DEFAULT 'dark',
    locale          VARCHAR(10) DEFAULT 'tr',
    message_display VARCHAR(20) DEFAULT 'cozy',
    show_embeds     BOOLEAN DEFAULT TRUE,
    animate_emoji   BOOLEAN DEFAULT TRUE,
    enable_tts      BOOLEAN DEFAULT FALSE,
    notification    VARCHAR(20) DEFAULT 'all',
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CUSTOM EMOJIS
CREATE TABLE custom_emojis (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(32) NOT NULL,
    image_url       TEXT NOT NULL,
    uploader_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    is_animated     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- WEBHOOKS
CREATE TABLE webhooks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    name            VARCHAR(80) NOT NULL,
    avatar_url      TEXT,
    token           TEXT UNIQUE NOT NULL,
    creator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    executor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type     VARCHAR(50) NOT NULL,
    target_id       UUID,
    target_type     VARCHAR(50),
    changes         JSONB,
    reason          TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_guild ON audit_logs(guild_id, created_at DESC);

-- BANS
CREATE TABLE bans (
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    reason          TEXT,
    banned_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (guild_id, user_id)
);

-- VOICE STATES
CREATE TABLE voice_states (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    session_id      VARCHAR(100) NOT NULL,
    is_muted        BOOLEAN DEFAULT FALSE,
    is_deafened     BOOLEAN DEFAULT FALSE,
    is_server_muted BOOLEAN DEFAULT FALSE,
    is_server_deafened BOOLEAN DEFAULT FALSE,
    is_streaming    BOOLEAN DEFAULT FALSE,
    is_video        BOOLEAN DEFAULT FALSE,
    connected_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, guild_id)
);

CREATE INDEX idx_voice_channel ON voice_states(channel_id);

-- VOICE LOGS
CREATE TABLE voice_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE SET NULL,
    action          VARCHAR(20) NOT NULL,
    connected_at    TIMESTAMPTZ,
    disconnected_at TIMESTAMPTZ,
    duration_sec    INT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- REFRESH TOKENS
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT NOT NULL,
    device_info     TEXT,
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_revoked      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);

-- LOGIN HISTORY
CREATE TABLE login_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address      INET,
    device_info     TEXT,
    location        TEXT,
    success         BOOLEAN NOT NULL,
    failure_reason  VARCHAR(50),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- READ STATES
CREATE TABLE read_states (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    mention_count   INT DEFAULT 0,
    last_read_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, channel_id)
);

-- NOTIFICATION SETTINGS
CREATE TABLE notification_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    level           VARCHAR(20) DEFAULT 'all',
    suppress_everyone BOOLEAN DEFAULT FALSE,
    suppress_roles  BOOLEAN DEFAULT FALSE,
    muted_until     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, guild_id, channel_id)
);

-- NOTIFICATIONS
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL,
    title           TEXT,
    body            TEXT,
    reference_id    UUID,
    reference_type  VARCHAR(30),
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- URL EMBEDS
CREATE TABLE url_embeds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID REFERENCES messages(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    type            VARCHAR(20) DEFAULT 'link',
    title           TEXT,
    description     TEXT,
    thumbnail_url   TEXT,
    site_name       TEXT,
    author_name     TEXT,
    color           VARCHAR(7),
    video_url       TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- USER NOTES
CREATE TABLE user_notes (
    owner_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (owner_id, target_id)
);

-- GUILD FOLDERS
CREATE TABLE guild_folders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100),
    color           VARCHAR(7),
    position        INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guild_folder_items (
    folder_id       UUID REFERENCES guild_folders(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    position        INT DEFAULT 0,
    PRIMARY KEY (folder_id, guild_id)
);

-- GUILD POSITIONS
CREATE TABLE guild_positions (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    position        INT DEFAULT 0,
    folder_id       UUID REFERENCES guild_folders(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, guild_id)
);

-- THREADS
CREATE TABLE threads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    creator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    message_id      UUID REFERENCES messages(id),
    type            VARCHAR(20) DEFAULT 'public',
    archived        BOOLEAN DEFAULT FALSE,
    auto_archive_minutes INT DEFAULT 1440,
    locked          BOOLEAN DEFAULT FALSE,
    message_count   INT DEFAULT 0,
    member_count    INT DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    archived_at     TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE thread_members (
    thread_id       UUID REFERENCES threads(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    last_read_message_id UUID,
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (thread_id, user_id)
);

-- SCHEDULED EVENTS
CREATE TABLE scheduled_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE SET NULL,
    creator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    image_url       TEXT,
    location        TEXT,
    entity_type     VARCHAR(20) NOT NULL,
    status          VARCHAR(20) DEFAULT 'scheduled',
    start_time      TIMESTAMPTZ NOT NULL,
    end_time        TIMESTAMPTZ,
    interested_count INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE event_subscribers (
    event_id        UUID REFERENCES scheduled_events(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, user_id)
);

-- AUTO MOD RULES
CREATE TABLE auto_mod_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    creator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    enabled         BOOLEAN DEFAULT TRUE,
    event_type      VARCHAR(30) NOT NULL,
    trigger_type    VARCHAR(30) NOT NULL,
    trigger_metadata JSONB NOT NULL DEFAULT '{}',
    exempt_roles    UUID[] DEFAULT '{}',
    exempt_channels UUID[] DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auto_mod_actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id         UUID REFERENCES auto_mod_rules(id) ON DELETE CASCADE,
    action_type     VARCHAR(30) NOT NULL,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auto_mod_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    rule_id         UUID REFERENCES auto_mod_rules(id) ON DELETE SET NULL,
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    channel_id      UUID REFERENCES channels(id) ON DELETE SET NULL,
    message_id      UUID,
    message_content TEXT,
    matched_keyword TEXT,
    action_taken    VARCHAR(30),
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- FULL TEXT SEARCH
ALTER TABLE messages ADD COLUMN search_vector TSVECTOR;
CREATE INDEX idx_messages_search ON messages USING GIN(search_vector);

CREATE OR REPLACE FUNCTION messages_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_search
  BEFORE INSERT OR UPDATE OF content ON messages
  FOR EACH ROW EXECUTE FUNCTION messages_search_update();

-- ACTIVITIES
CREATE TABLE user_activities (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL,
    name            TEXT NOT NULL,
    details         TEXT,
    state           TEXT,
    url             TEXT,
    emoji           VARCHAR(100),
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,
    PRIMARY KEY (user_id, type)
);
