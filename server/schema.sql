CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==================== KULLANICILAR ====================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         BIGINT UNIQUE NOT NULL,        -- Benzersiz sayısal ID (ör: 1000000001)
    username        VARCHAR(32) UNIQUE NOT NULL,    -- Benzersiz! Her kullanıcı adı 1 kez alınabilir
    display_name    VARCHAR(32),
    password_hash   TEXT NOT NULL,
    avatar_url      TEXT,
    banner_url      TEXT,
    about_me        TEXT,
    status          VARCHAR(20) DEFAULT 'offline',  -- online, idle, dnd, offline, invisible
    custom_status   TEXT,
    global_role     VARCHAR(20) DEFAULT 'user',     -- user, moderator, admin, developer, owner
    is_bot          BOOLEAN DEFAULT FALSE,
    is_banned       BOOLEAN DEFAULT FALSE,          -- Platform geneli ban
    ban_reason      TEXT,
    two_factor_secret      TEXT,
    is_two_factor_enabled BOOLEAN DEFAULT FALSE,
    -- banned_by       UUID REFERENCES users(id),  -- Added later to avoid circular dependency
    banned_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_user_id ON users(user_id);
CREATE INDEX idx_users_global_role ON users(global_role);

ALTER TABLE users ADD COLUMN banned_by UUID REFERENCES users(id);

-- User ID sayaç (Snowflake benzeri, 10 haneli benzersiz numara)
CREATE SEQUENCE user_id_seq START WITH 1000000001 INCREMENT BY 1;

-- ==================== ROZETLER (BADGES) ====================
CREATE TABLE badges (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) UNIQUE NOT NULL,    -- owner, developer, moderator, early_supporter, bug_hunter, vb.
    name            VARCHAR(100) NOT NULL,          -- Gösterim adı
    description     TEXT,
    icon_url        TEXT NOT NULL,                  -- Rozet ikonu URL
    color           VARCHAR(7),                     -- Hex renk (#FFD700 gibi)
    priority        INT DEFAULT 0,                  -- Sıralama (yüksek = önce gösterilir)
    is_system       BOOLEAN DEFAULT TRUE,           -- Sistem rozeti mi (manuel verilemez)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== KULLANICI ROZETLERİ ====================
CREATE TABLE user_badges (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    badge_id        UUID REFERENCES badges(id) ON DELETE CASCADE,
    granted_by      UUID REFERENCES users(id),     -- Rozeti kim verdi (NULL = otomatik)
    granted_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, badge_id)
);

-- ==================== PLATFORM YÖNETİM LOGLARI ====================
CREATE TABLE platform_audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    executor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action          VARCHAR(50) NOT NULL,          -- user_ban, user_unban, badge_grant, badge_revoke,
                                                   -- role_change, user_delete, announcement, vb.
    target_user_id  UUID REFERENCES users(id) ON DELETE SET NULL,
    target_type     VARCHAR(50),
    details         JSONB,                         -- Ek detaylar
    reason          TEXT,
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_platform_audit ON platform_audit_logs(created_at DESC);

-- ==================== PLATFORM DUYURULARI ====================
CREATE TABLE platform_announcements (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    title           VARCHAR(200) NOT NULL,
    content         TEXT NOT NULL,
    type            VARCHAR(20) DEFAULT 'info',    -- info, warning, maintenance, update
    is_active       BOOLEAN DEFAULT TRUE,
    pinned          BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SUNUCULAR (GUILD) ====================
CREATE TABLE guilds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(100) NOT NULL,
    icon_url        TEXT,
    banner_url      TEXT,
    description     TEXT,
    owner_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    region          VARCHAR(50) DEFAULT 'auto',
    verification_level INT DEFAULT 0,              -- 0-4 (none, low, medium, high, highest)
    default_channel_id UUID,
    member_count    INT DEFAULT 0,
    boost_count     INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== KANALLAR ====================
CREATE TABLE channels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    topic           TEXT,
    type            VARCHAR(20) NOT NULL,          -- text, voice, category, dm, group_dm, announcement
    position        INT DEFAULT 0,
    parent_id       UUID REFERENCES channels(id),  -- Kategori altındaki kanallar için
    is_nsfw         BOOLEAN DEFAULT FALSE,
    slowmode        INT DEFAULT 0,                 -- Saniye cinsinden
    bitrate         INT DEFAULT 64000,             -- Ses kanalları için
    user_limit      INT DEFAULT 0,                 -- Ses kanalları için
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== MESAJLAR ====================
CREATE TABLE messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    author_id       UUID REFERENCES users(id) ON DELETE SET NULL,
    content         TEXT,
    type            VARCHAR(20) DEFAULT 'default', -- default, reply, system, pin
    reference_id    UUID REFERENCES messages(id),  -- Yanıt verilen mesaj
    is_pinned       BOOLEAN DEFAULT FALSE,
    is_edited       BOOLEAN DEFAULT FALSE,
    edited_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_channel ON messages(channel_id, created_at DESC);

-- ==================== MESAJ EKLERİ ====================
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

-- ==================== REAKSİYONLAR ====================
CREATE TABLE reactions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID REFERENCES messages(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    emoji           VARCHAR(100) NOT NULL,         -- Unicode emoji veya custom emoji id
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id, emoji)
);

-- ==================== SUNUCU ÜYELERİ ====================
CREATE TABLE guild_members (
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    nickname        VARCHAR(32),
    joined_at       TIMESTAMPTZ DEFAULT NOW(),
    is_muted        BOOLEAN DEFAULT FALSE,
    is_deafened     BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (guild_id, user_id)
);

-- ==================== ROLLER ====================
CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    color           VARCHAR(7),                    -- Hex renk kodu (#FF5733)
    icon_url        TEXT,
    position        INT DEFAULT 0,
    permissions     BIGINT DEFAULT 0,              -- Bit bazlı izin sistemi
    is_hoisted      BOOLEAN DEFAULT FALSE,         -- Üye listesinde ayrı göster
    is_mentionable  BOOLEAN DEFAULT FALSE,
    is_default      BOOLEAN DEFAULT FALSE,         -- @everyone rolü
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== ÜYE ROLLERİ ====================
CREATE TABLE member_roles (
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id         UUID REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (guild_id, user_id, role_id)
);

-- ==================== KANAL İZİNLERİ ====================
CREATE TABLE channel_permissions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    target_id       UUID NOT NULL,                 -- Role veya user ID
    target_type     VARCHAR(10) NOT NULL,          -- 'role' veya 'user'
    allow           BIGINT DEFAULT 0,
    deny            BIGINT DEFAULT 0
);

-- ==================== ARKADAŞLIKLAR ====================
CREATE TABLE friendships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    friend_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    status          VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

CREATE INDEX idx_friendships_user ON friendships(user_id, status);
CREATE INDEX idx_friendships_friend ON friendships(friend_id, status);

-- ==================== DİREKT MESAJ KANALLARI ====================
CREATE TABLE dm_channels (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type            VARCHAR(10) DEFAULT 'dm',      -- dm, group_dm
    name            VARCHAR(100),                  -- Grup DM için
    icon_url        TEXT,                          -- Grup DM için
    owner_id        UUID REFERENCES users(id),     -- Grup DM sahibi
    last_message_id UUID,                          -- Son mesaj (hızlı sıralama için)
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE dm_members (
    dm_channel_id   UUID REFERENCES dm_channels(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    is_closed       BOOLEAN DEFAULT FALSE,         -- Kullanıcı DM'yi kapattı mı (listeden gizle)
    last_read_at    TIMESTAMPTZ,                   -- Son okunma zamanı (okunmamış sayacı için)
    notifications   VARCHAR(20) DEFAULT 'all',     -- all, mentions, nothing
    PRIMARY KEY (dm_channel_id, user_id)
);

-- ==================== DM SESLİ/GÖRÜNTÜLÜ ARAMA ====================
CREATE TABLE dm_calls (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dm_channel_id   UUID REFERENCES dm_channels(id) ON DELETE CASCADE,
    initiator_id    UUID REFERENCES users(id) ON DELETE SET NULL,
    type            VARCHAR(10) NOT NULL,          -- voice, video
    status          VARCHAR(20) DEFAULT 'ringing', -- ringing, ongoing, ended, missed, declined, no_answer
    started_at      TIMESTAMPTZ,                   -- Arama başlangıcı (kabul edildiğinde)
    ended_at        TIMESTAMPTZ,
    duration_sec    INT,                           -- Toplam süre
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

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

-- ==================== DAVETLER ====================
CREATE TABLE invites (
    code            VARCHAR(10) PRIMARY KEY,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    inviter_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    max_uses        INT DEFAULT 0,                 -- 0 = sınırsız
    uses            INT DEFAULT 0,
    max_age         INT DEFAULT 86400,             -- Saniye, 0 = sınırsız
    is_temporary    BOOLEAN DEFAULT FALSE,
    expires_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== KULLANICI AYARLARI ====================
CREATE TABLE user_settings (
    user_id         UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    theme           VARCHAR(10) DEFAULT 'dark',    -- dark, light
    locale          VARCHAR(10) DEFAULT 'tr',
    message_display VARCHAR(20) DEFAULT 'cozy',    -- cozy, compact
    show_embeds     BOOLEAN DEFAULT TRUE,
    animate_emoji   BOOLEAN DEFAULT TRUE,
    enable_tts      BOOLEAN DEFAULT FALSE,
    notification    VARCHAR(20) DEFAULT 'all',     -- all, mentions, nothing
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== SUNUCU EMOJİLERİ ====================
CREATE TABLE custom_emojis (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(32) NOT NULL,
    image_url       TEXT NOT NULL,
    uploader_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    is_animated     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== WEBHOOK'LAR ====================
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

-- ==================== AUDIT LOG ====================
CREATE TABLE audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    executor_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    action_type     VARCHAR(50) NOT NULL,          -- member_kick, channel_create, role_update, vb.
    target_id       UUID,
    target_type     VARCHAR(50),
    changes         JSONB,
    reason          TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_guild ON audit_logs(guild_id, created_at DESC);

-- ==================== BAN LİSTESİ ====================
CREATE TABLE bans (
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    reason          TEXT,
    banned_by       UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (guild_id, user_id)
);

-- ==================== SES DURUMU (VOICE STATE) ====================
CREATE TABLE voice_states (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    session_id      VARCHAR(100) NOT NULL,
    is_muted        BOOLEAN DEFAULT FALSE,         -- Kendini susturdu
    is_deafened     BOOLEAN DEFAULT FALSE,         -- Kendini sağırlaştırdı
    is_server_muted BOOLEAN DEFAULT FALSE,         -- Sunucu tarafından susturuldu
    is_server_deafened BOOLEAN DEFAULT FALSE,      -- Sunucu tarafından sağırlaştırıldı
    is_streaming    BOOLEAN DEFAULT FALSE,         -- Ekran paylaşıyor
    is_video        BOOLEAN DEFAULT FALSE,         -- Kamera açık
    connected_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, guild_id)
);

CREATE INDEX idx_voice_channel ON voice_states(channel_id);

-- ==================== SES OTURUM GEÇMİŞİ ====================
CREATE TABLE voice_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE SET NULL,
    action          VARCHAR(20) NOT NULL,          -- join, leave, mute, deafen, move, server_mute
    connected_at    TIMESTAMPTZ,
    disconnected_at TIMESTAMPTZ,
    duration_sec    INT,                           -- Toplam bağlı kalma süresi
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== REFRESH TOKEN ====================
CREATE TABLE refresh_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash      TEXT NOT NULL,                 -- bcrypt hash of refresh token
    device_info     TEXT,                          -- "Windows / Chrome 120" gibi
    ip_address      INET,
    expires_at      TIMESTAMPTZ NOT NULL,
    is_revoked      BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);

-- ==================== GİRİŞ GEÇMİŞİ ====================
CREATE TABLE login_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    ip_address      INET,
    device_info     TEXT,
    location        TEXT,                          -- GeoIP ile tespit
    success         BOOLEAN NOT NULL,
    failure_reason  VARCHAR(50),                   -- invalid_password, account_locked, vb.
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== OKUNDU DURUMU (READ STATE) ====================
CREATE TABLE read_states (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE,
    last_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
    mention_count   INT DEFAULT 0,                 -- Okunmamış mention sayısı
    last_read_at    TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, channel_id)
);

-- ==================== BİLDİRİM AYARLARI ====================
CREATE TABLE notification_settings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE CASCADE, -- NULL ise sunucu geneli
    level           VARCHAR(20) DEFAULT 'all',     -- all, mentions, nothing, inherit
    suppress_everyone BOOLEAN DEFAULT FALSE,       -- @everyone/@here sustur
    suppress_roles  BOOLEAN DEFAULT FALSE,         -- @rol bildirimlerini sustur
    muted_until     TIMESTAMPTZ,                   -- Geçici susturma
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, guild_id, channel_id)
);

-- ==================== BİLDİRİMLER ====================
CREATE TABLE notifications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(30) NOT NULL,          -- message_mention, friend_request, guild_invite, system
    title           TEXT,
    body            TEXT,
    reference_id    UUID,                          -- İlgili mesaj/davet/istek ID'si
    reference_type  VARCHAR(30),                   -- message, invite, friend_request, guild
    is_read         BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);

-- ==================== URL EMBED / LINK PREVIEW ====================
CREATE TABLE url_embeds (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id      UUID REFERENCES messages(id) ON DELETE CASCADE,
    url             TEXT NOT NULL,
    type            VARCHAR(20) DEFAULT 'link',    -- link, image, video, rich, article
    title           TEXT,
    description     TEXT,
    thumbnail_url   TEXT,
    site_name       TEXT,
    author_name     TEXT,
    color           VARCHAR(7),                    -- Embed sol çizgi rengi
    video_url       TEXT,                          -- YouTube, Twitch embed URL
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ==================== KULLANICI NOTLARI ====================
CREATE TABLE user_notes (
    owner_id        UUID REFERENCES users(id) ON DELETE CASCADE,
    target_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (owner_id, target_id)
);

-- ==================== SUNUCU KLASÖRLERİ ====================
CREATE TABLE guild_folders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100),
    color           VARCHAR(7),                    -- Klasör rengi
    position        INT DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE guild_folder_items (
    folder_id       UUID REFERENCES guild_folders(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    position        INT DEFAULT 0,
    PRIMARY KEY (folder_id, guild_id)
);

-- ==================== SUNUCU SİRASI (Sidebar) ====================
CREATE TABLE guild_positions (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    position        INT DEFAULT 0,
    folder_id       UUID REFERENCES guild_folders(id) ON DELETE SET NULL,
    PRIMARY KEY (user_id, guild_id)
);

-- ==================== THREAD (MESAJ KONULARI) ====================
CREATE TABLE threads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    creator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    message_id      UUID REFERENCES messages(id),  -- Thread'in başladığı mesaj
    type            VARCHAR(20) DEFAULT 'public',  -- public, private
    archived        BOOLEAN DEFAULT FALSE,
    auto_archive_minutes INT DEFAULT 1440,         -- 60, 1440, 4320, 10080
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

-- ==================== ZAMANLANMIŞ ETKİNLİKLER ====================
CREATE TABLE scheduled_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    channel_id      UUID REFERENCES channels(id) ON DELETE SET NULL,
    creator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    image_url       TEXT,
    location        TEXT,                          -- Harici konum (URL veya metin)
    entity_type     VARCHAR(20) NOT NULL,          -- stage, voice, external
    status          VARCHAR(20) DEFAULT 'scheduled', -- scheduled, active, completed, cancelled
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

-- ==================== OTO-MODERASYON KURALLARI ====================
CREATE TABLE auto_mod_rules (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guild_id        UUID REFERENCES guilds(id) ON DELETE CASCADE,
    name            VARCHAR(100) NOT NULL,
    creator_id      UUID REFERENCES users(id) ON DELETE SET NULL,
    enabled         BOOLEAN DEFAULT TRUE,
    event_type      VARCHAR(30) NOT NULL,          -- message_send, member_join
    trigger_type    VARCHAR(30) NOT NULL,          -- keyword, spam, mention_spam, link_filter, regex
    trigger_metadata JSONB NOT NULL DEFAULT '{}',  -- { keywords: [], regex_patterns: [], max_mentions: 5 }
    exempt_roles    UUID[] DEFAULT '{}',           -- Muaf roller
    exempt_channels UUID[] DEFAULT '{}',           -- Muaf kanallar
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE auto_mod_actions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id         UUID REFERENCES auto_mod_rules(id) ON DELETE CASCADE,
    action_type     VARCHAR(30) NOT NULL,          -- block_message, send_alert, timeout
    metadata        JSONB DEFAULT '{}',            -- { channel_id: "...", duration_seconds: 300 }
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

-- ==================== MESAJ FULL-TEXT SEARCH INDEX ====================
ALTER TABLE messages ADD COLUMN search_vector TSVECTOR;
CREATE INDEX idx_messages_search ON messages USING GIN(search_vector);

-- Trigger: Mesaj eklenince/güncellenince search_vector otomatik güncelle
CREATE OR REPLACE FUNCTION messages_search_update() RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.content, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_messages_search
  BEFORE INSERT OR UPDATE OF content ON messages
  FOR EACH ROW EXECUTE FUNCTION messages_search_update();

-- ==================== AKTİVİTE / RICH PRESENCE ====================
CREATE TABLE user_activities (
    user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
    type            VARCHAR(20) NOT NULL,          -- playing, listening, watching, streaming, competing, custom
    name            TEXT NOT NULL,                  -- "Minecraft", "Spotify - Şarkı Adı"
    details         TEXT,                          -- Ek bilgi satırı
    state           TEXT,                          -- Durum satırı
    url             TEXT,                          -- Streaming URL
    emoji           VARCHAR(100),                  -- Custom status emoji
    started_at      TIMESTAMPTZ DEFAULT NOW(),
    expires_at      TIMESTAMPTZ,                   -- Custom status süresi
    PRIMARY KEY (user_id, type)
);