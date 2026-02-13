import React, { useState, useEffect, useCallback } from 'react';
import { useThemeStore } from '../../store/themeStore';
import { CURRENT_USER } from '../../data/mock';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'account', label: 'My Account', icon: 'person' },
  { id: 'profile', label: 'Profile', icon: 'badge' },
  { id: 'appearance', label: 'Appearance', icon: 'palette' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
  { id: 'voice', label: 'Voice & Audio', icon: 'mic' },
  { id: 'privacy', label: 'Privacy', icon: 'shield' },
  { id: 'language', label: 'Language', icon: 'translate' },
  { id: 'keybinds', label: 'Keybinds', icon: 'keyboard' },
  { id: 'about', label: 'About Nautilus', icon: 'info' },
];

const ACCENT_COLORS = [
  { name: 'Blue', value: '#6750A4' },
  { name: 'Teal', value: '#006A6A' },
  { name: 'Rose', value: '#984061' },
  { name: 'Green', value: '#386A20' },
  { name: 'Orange', value: '#8B5000' },
  { name: 'Indigo', value: '#4355B9' },
];

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ja', label: '日本語' },
];

const KEYBINDS = [
  { action: 'Send Message', keys: 'Enter' },
  { action: 'New Line', keys: 'Shift + Enter' },
  { action: 'Search', keys: 'Ctrl + K' },
  { action: 'Upload File', keys: 'Ctrl + U' },
  { action: 'Toggle Mute', keys: 'Ctrl + Shift + M' },
  { action: 'Toggle Deafen', keys: 'Ctrl + Shift + D' },
  { action: 'Mark as Read', keys: 'Escape' },
  { action: 'Navigate Servers', keys: 'Ctrl + Alt + ↑/↓' },
  { action: 'Navigate Channels', keys: 'Alt + ↑/↓' },
  { action: 'Edit Last Message', keys: '↑ (in empty input)' },
];

/* ── Reusable Toggle Switch ─────────────────────────────────── */
const ToggleSwitch: React.FC<{ enabled: boolean; onToggle: () => void; disabled?: boolean }> = ({
  enabled,
  onToggle,
  disabled = false,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onToggle}
    className={`relative inline-flex h-8 w-[52px] shrink-0 items-center rounded-full border-2 transition-colors duration-200 focus:outline-none ${
      enabled
        ? 'bg-primary border-primary'
        : 'bg-surface-container-highest border-outline-variant'
    } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-6 w-6 transform rounded-full shadow-elevation-1 transition-transform duration-200 ${
        enabled
          ? 'translate-x-[22px] bg-on-primary'
          : 'translate-x-[2px] bg-on-surface-variant'
      }`}
    />
  </button>
);

/* ── Slider ──────────────────────────────────────────────────── */
const Slider: React.FC<{
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  label?: string;
  unit?: string;
}> = ({ min, max, value, onChange, label, unit }) => (
  <div className="w-full">
    {label && (
      <div className="flex justify-between mb-1">
        <span className="text-label-large text-on-surface-variant">{label}</span>
        <span className="text-label-large text-primary font-medium">
          {value}
          {unit}
        </span>
      </div>
    )}
    <input
      type="range"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 rounded-full appearance-none cursor-pointer bg-surface-container-highest accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-elevation-2"
    />
  </div>
);

/* ════════════════════════════════════════════════════════════════
   Settings Panel
   ════════════════════════════════════════════════════════════════ */
export const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('account');

  // ── Theme (Appearance) ──
  const { theme, setTheme } = useThemeStore();
  const [selectedTheme, setSelectedTheme] = useState<'dark' | 'light' | 'system'>(
    theme === 'contrast' ? 'system' : theme,
  );
  const [fontSize, setFontSize] = useState(16);
  const [messageDensity, setMessageDensity] = useState<'cozy' | 'compact' | 'normal'>('cozy');
  const [colorScheme, setColorScheme] = useState(ACCENT_COLORS[0].value);

  // ── Account ──
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // ── Profile ──
  const [displayName, setDisplayName] = useState(CURRENT_USER.username);
  const [aboutMe, setAboutMe] = useState(CURRENT_USER.aboutMe ?? '');
  const [bannerColor, setBannerColor] = useState('#004A8A');
  const [profileAccent, setProfileAccent] = useState(ACCENT_COLORS[0].value);

  // ── Notifications ──
  const [notifMaster, setNotifMaster] = useState(true);
  const [notifDM, setNotifDM] = useState(true);
  const [notifMention, setNotifMention] = useState(true);
  const [notifSound, setNotifSound] = useState(true);
  const [notifReaction, setNotifReaction] = useState(false);
  const [notifEvent, setNotifEvent] = useState(true);
  const [notifFriendReq, setNotifFriendReq] = useState(true);

  // ── Voice & Audio ──
  const [inputDevice, setInputDevice] = useState('default');
  const [outputDevice, setOutputDevice] = useState('default');
  const [inputVolume, setInputVolume] = useState(80);
  const [outputVolume, setOutputVolume] = useState(100);
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoSensitivity, setAutoSensitivity] = useState(true);

  // ── Privacy ──
  const [allowDMs, setAllowDMs] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);

  // ── Language ──
  const [language, setLanguage] = useState('en');

  /* ── ESC to close ────────────────────────────────────────── */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  /* ── Apply theme when user picks one ─────────────────────── */
  const handleThemeChange = (picked: 'dark' | 'light' | 'system') => {
    setSelectedTheme(picked);
    if (picked === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    } else {
      setTheme(picked);
    }
  };

  if (!isOpen) return null;

  /* ── Render helpers ──────────────────────────────────────── */
  const sectionHeading = (text: string) => (
    <h2 className="text-title-large font-bold mb-6 text-on-surface">{text}</h2>
  );

  const fieldRow = (label: string, value: string, action: string = 'Edit') => (
    <div className="flex flex-col space-y-1">
      <label className="text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
        {label}
      </label>
      <div className="p-3 bg-surface-container-high rounded-[12px] flex justify-between items-center">
        <span className="text-on-surface">{value}</span>
        <button className="text-primary text-label-large font-medium hover:underline">
          {action}
        </button>
      </div>
    </div>
  );

  const settingRow = (
    label: string,
    description: string,
    enabled: boolean,
    onToggle: () => void,
    disabled = false,
  ) => (
    <div className="flex items-center justify-between p-4 bg-surface-container rounded-[16px]">
      <div className="flex-1 mr-4">
        <div className="font-medium text-on-surface">{label}</div>
        <div className="text-body-small text-on-surface-variant mt-0.5">{description}</div>
      </div>
      <ToggleSwitch enabled={enabled} onToggle={onToggle} disabled={disabled} />
    </div>
  );

  /* ──────────────────────────────────────────────────────────
     TAB CONTENT
     ────────────────────────────────────────────────────────── */

  const renderAccount = () => (
    <div className="space-y-6 max-w-lg animate-fade-in">
      {sectionHeading('My Account')}

      {/* Banner / Avatar card */}
      <div className="bg-primary rounded-[16px] p-4 text-on-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8" />
        <div className="flex items-center relative z-10">
          <div className="w-20 h-20 rounded-full border-4 border-surface bg-surface mr-4 overflow-hidden">
            <img
              src={CURRENT_USER.avatar}
              alt="avatar"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="text-title-medium font-bold">{CURRENT_USER.username}</div>
            <div className="text-body-medium opacity-80">#{CURRENT_USER.discriminator}</div>
          </div>
          <button className="ml-auto bg-primary-container text-on-primary-container px-4 py-2 rounded-full text-label-large font-medium hover:brightness-95 transition-all shadow-elevation-1">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        {fieldRow('Username', CURRENT_USER.username)}
        {fieldRow('Email', 'user@nautilus.app')}
        {fieldRow('Phone Number', 'Not Set', 'Add')}
      </div>

      {/* Password & 2FA */}
      <div className="pt-6 border-t border-outline-variant/20 space-y-4">
        <h3 className="text-title-medium font-bold text-on-surface">Password & Authentication</h3>
        <button className="bg-primary text-on-primary px-6 py-2.5 rounded-full font-medium hover:bg-primary/90 transition-colors shadow-elevation-1">
          Change Password
        </button>
        {settingRow(
          'Two-Factor Authentication',
          'Protect your account with an extra layer of security.',
          twoFactorEnabled,
          () => setTwoFactorEnabled((p) => !p),
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="space-y-6 max-w-lg animate-fade-in">
      {sectionHeading('Profile')}

      {/* Display name */}
      <div className="space-y-1">
        <label className="text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
          Display Name
        </label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full p-3 bg-surface-container-high rounded-[12px] text-on-surface outline-none focus:ring-2 focus:ring-primary transition-shadow"
        />
      </div>

      {/* About me */}
      <div className="space-y-1">
        <label className="text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
          About Me
        </label>
        <textarea
          value={aboutMe}
          onChange={(e) => setAboutMe(e.target.value)}
          maxLength={190}
          rows={4}
          className="w-full p-3 bg-surface-container-high rounded-[12px] text-on-surface outline-none focus:ring-2 focus:ring-primary resize-none transition-shadow"
        />
        <div className="text-right text-body-small text-on-surface-variant">
          {aboutMe.length}/190
        </div>
      </div>

      {/* Banner color */}
      <div className="space-y-2">
        <label className="text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
          Banner Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={bannerColor}
            onChange={(e) => setBannerColor(e.target.value)}
            className="w-10 h-10 rounded-full border-2 border-outline-variant cursor-pointer"
          />
          <div
            className="flex-1 h-16 rounded-[12px] transition-colors"
            style={{ backgroundColor: bannerColor }}
          />
        </div>
      </div>

      {/* Accent color picker */}
      <div className="space-y-2">
        <label className="text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
          Accent Color
        </label>
        <div className="flex gap-3 flex-wrap">
          {ACCENT_COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setProfileAccent(c.value)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform ${
                profileAccent === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
              title={c.name}
            >
              {profileAccent === c.value && (
                <span className="material-symbols-outlined text-white text-[18px]">check</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div className="pt-4 border-t border-outline-variant/20">
        <h3 className="text-title-small font-bold text-on-surface-variant mb-3">PREVIEW</h3>
        <div className="rounded-[16px] overflow-hidden border border-outline-variant/30 bg-surface-container">
          <div className="h-20" style={{ backgroundColor: bannerColor }} />
          <div className="px-4 pb-4 -mt-8 flex items-end gap-3">
            <div className="w-16 h-16 rounded-full border-4 border-surface-container overflow-hidden bg-surface-container">
              <img src={CURRENT_USER.avatar} alt="avatar" className="w-full h-full" />
            </div>
            <div className="pb-1">
              <div className="font-bold text-on-surface">{displayName || CURRENT_USER.username}</div>
              <div className="text-body-small text-on-surface-variant">{aboutMe}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => {
    const themes: { id: 'light' | 'dark' | 'system'; label: string; bg: string }[] = [
      { id: 'light', label: 'Light', bg: 'bg-[#FBF8FF]' },
      { id: 'dark', label: 'Dark', bg: 'bg-[#111318]' },
      { id: 'system', label: 'System', bg: 'bg-gradient-to-br from-[#FBF8FF] to-[#111318]' },
    ];

    return (
      <div className="space-y-8 max-w-lg animate-fade-in">
        {sectionHeading('Appearance')}

        {/* Theme cards */}
        <div>
          <label className="text-label-large font-bold text-on-surface-variant block mb-3 uppercase tracking-wide">
            Theme
          </label>
          <div className="grid grid-cols-3 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className="flex flex-col items-center group"
              >
                <div
                  className={`w-full aspect-video ${t.bg} border-2 rounded-[12px] mb-2 relative overflow-hidden transition-colors ${
                    selectedTheme === t.id
                      ? 'border-primary'
                      : 'border-outline-variant group-hover:border-primary/50'
                  }`}
                >
                  {selectedTheme === t.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary text-[14px]">
                        check
                      </span>
                    </div>
                  )}
                </div>
                <span
                  className={`text-label-medium ${
                    selectedTheme === t.id ? 'font-bold text-primary' : 'text-on-surface-variant'
                  }`}
                >
                  {t.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Color scheme chips */}
        <div>
          <label className="text-label-large font-bold text-on-surface-variant block mb-3 uppercase tracking-wide">
            Color Scheme
          </label>
          <div className="flex gap-3 flex-wrap">
            {ACCENT_COLORS.map((c) => (
              <button
                key={c.value}
                onClick={() => setColorScheme(c.value)}
                className={`px-4 py-2 rounded-full text-label-medium font-medium flex items-center gap-2 transition-all ${
                  colorScheme === c.value
                    ? 'text-white shadow-elevation-1 scale-105'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
                style={colorScheme === c.value ? { backgroundColor: c.value } : undefined}
              >
                <span
                  className="w-4 h-4 rounded-full inline-block"
                  style={{ backgroundColor: c.value }}
                />
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Font size */}
        <div>
          <Slider
            min={12}
            max={20}
            value={fontSize}
            onChange={setFontSize}
            label="FONT SIZE"
            unit="px"
          />
          <div className="mt-3 p-3 bg-surface-container rounded-[12px]">
            <p style={{ fontSize: `${fontSize}px` }} className="text-on-surface">
              This is a preview of your selected font size.
            </p>
          </div>
        </div>

        {/* Message density */}
        <div>
          <label className="text-label-large font-bold text-on-surface-variant block mb-3 uppercase tracking-wide">
            Message Density
          </label>
          <div className="space-y-2">
            {(
              [
                { id: 'cozy', label: 'Cozy', desc: 'Modern, spacious, and beautiful.' },
                { id: 'compact', label: 'Compact', desc: 'Fit more messages on screen.' },
                { id: 'normal', label: 'Normal', desc: 'A balanced default experience.' },
              ] as const
            ).map((d) => (
              <label
                key={d.id}
                className={`flex items-center p-3 rounded-[12px] border cursor-pointer transition-colors ${
                  messageDensity === d.id
                    ? 'border-primary bg-secondary-container/30'
                    : 'border-outline-variant/40 hover:bg-surface-container-high'
                }`}
              >
                <input
                  type="radio"
                  name="density"
                  checked={messageDensity === d.id}
                  onChange={() => setMessageDensity(d.id)}
                  className="w-4 h-4 accent-primary"
                />
                <div className="ml-3">
                  <div className="font-bold text-on-surface">{d.label}</div>
                  <div className="text-body-small text-on-surface-variant">{d.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderNotifications = () => (
    <div className="space-y-4 max-w-lg animate-fade-in">
      {sectionHeading('Notifications')}
      {settingRow(
        'Enable Notifications',
        'Master toggle for all notifications.',
        notifMaster,
        () => setNotifMaster((p) => !p),
      )}
      {settingRow(
        'Direct Messages',
        'Get notified when someone sends you a DM.',
        notifDM,
        () => setNotifDM((p) => !p),
        !notifMaster,
      )}
      {settingRow(
        'Mentions',
        'Get notified when someone @mentions you.',
        notifMention,
        () => setNotifMention((p) => !p),
        !notifMaster,
      )}
      {settingRow(
        'Sounds',
        'Play notification sounds.',
        notifSound,
        () => setNotifSound((p) => !p),
        !notifMaster,
      )}
      <div className="pt-4 border-t border-outline-variant/20">
        <h3 className="text-title-small font-bold text-on-surface-variant mb-3 uppercase tracking-wide">
          Per-Type Notifications
        </h3>
        <div className="space-y-3">
          {settingRow(
            'Reactions',
            'Notify when someone reacts to your message.',
            notifReaction,
            () => setNotifReaction((p) => !p),
            !notifMaster,
          )}
          {settingRow(
            'Server Events',
            'Notify for scheduled server events.',
            notifEvent,
            () => setNotifEvent((p) => !p),
            !notifMaster,
          )}
          {settingRow(
            'Friend Requests',
            'Notify when someone sends a friend request.',
            notifFriendReq,
            () => setNotifFriendReq((p) => !p),
            !notifMaster,
          )}
        </div>
      </div>
    </div>
  );

  const renderVoice = () => (
    <div className="space-y-6 max-w-lg animate-fade-in">
      {sectionHeading('Voice & Audio')}

      {/* Input device */}
      <div className="space-y-1">
        <label className="text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
          Input Device
        </label>
        <select
          value={inputDevice}
          onChange={(e) => setInputDevice(e.target.value)}
          className="w-full p-3 bg-surface-container-high rounded-[12px] text-on-surface outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none"
        >
          <option value="default">Default - System Microphone</option>
          <option value="headset">Headset Microphone</option>
          <option value="webcam">Webcam Microphone</option>
        </select>
      </div>

      {/* Output device */}
      <div className="space-y-1">
        <label className="text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
          Output Device
        </label>
        <select
          value={outputDevice}
          onChange={(e) => setOutputDevice(e.target.value)}
          className="w-full p-3 bg-surface-container-high rounded-[12px] text-on-surface outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none"
        >
          <option value="default">Default - System Speakers</option>
          <option value="headphones">Headphones</option>
          <option value="monitor">Monitor Speakers</option>
        </select>
      </div>

      {/* Volumes */}
      <Slider
        min={0}
        max={100}
        value={inputVolume}
        onChange={setInputVolume}
        label="INPUT VOLUME"
        unit="%"
      />
      <Slider
        min={0}
        max={100}
        value={outputVolume}
        onChange={setOutputVolume}
        label="OUTPUT VOLUME"
        unit="%"
      />

      {/* Processing */}
      <div className="pt-4 border-t border-outline-variant/20 space-y-3">
        <h3 className="text-title-small font-bold text-on-surface-variant uppercase tracking-wide mb-2">
          Audio Processing
        </h3>
        {settingRow(
          'Noise Suppression',
          'Reduce background noise from your microphone.',
          noiseSuppression,
          () => setNoiseSuppression((p) => !p),
        )}
        {settingRow(
          'Echo Cancellation',
          'Prevent audio feedback loops.',
          echoCancellation,
          () => setEchoCancellation((p) => !p),
        )}
        {settingRow(
          'Automatic Sensitivity',
          'Automatically determine input sensitivity.',
          autoSensitivity,
          () => setAutoSensitivity((p) => !p),
        )}
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="space-y-6 max-w-lg animate-fade-in">
      {sectionHeading('Privacy')}

      {settingRow(
        'Allow Direct Messages',
        'Let server members send you direct messages.',
        allowDMs,
        () => setAllowDMs((p) => !p),
      )}
      {settingRow(
        'Data Usage Sharing',
        'Help improve Nautilus by sharing anonymous usage data.',
        dataSharing,
        () => setDataSharing((p) => !p),
      )}

      {/* Block list */}
      <div className="pt-4 border-t border-outline-variant/20">
        <h3 className="text-title-small font-bold text-on-surface-variant uppercase tracking-wide mb-3">
          Blocked Users
        </h3>
        <div className="p-8 bg-surface-container rounded-[16px] flex flex-col items-center justify-center text-center">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant/40 mb-2">
            block
          </span>
          <p className="text-on-surface-variant">No blocked users</p>
          <p className="text-body-small text-on-surface-variant/60 mt-1">
            Users you block will appear here.
          </p>
        </div>
      </div>

      {/* Data info */}
      <div className="pt-4 border-t border-outline-variant/20">
        <h3 className="text-title-small font-bold text-on-surface-variant uppercase tracking-wide mb-3">
          Data Usage
        </h3>
        <div className="space-y-2 text-body-medium text-on-surface-variant">
          <p>Nautilus collects minimal data to provide the service:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Messages are encrypted in transit and at rest.</li>
            <li>Voice data is never stored on our servers.</li>
            <li>You can request a copy of your data at any time.</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderLanguage = () => (
    <div className="space-y-6 max-w-lg animate-fade-in">
      {sectionHeading('Language')}

      <div className="space-y-1">
        <label className="text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
          App Language
        </label>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="w-full p-3 bg-surface-container-high rounded-[12px] text-on-surface outline-none focus:ring-2 focus:ring-primary cursor-pointer appearance-none"
        >
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>
              {l.label}
            </option>
          ))}
        </select>
      </div>

      <div className="p-4 bg-surface-container rounded-[16px]">
        <p className="text-body-medium text-on-surface-variant">
          Changing the language will update all interface text. Some user-generated content will
          remain in its original language.
        </p>
      </div>
    </div>
  );

  const renderKeybinds = () => (
    <div className="space-y-6 max-w-lg animate-fade-in">
      {sectionHeading('Keybinds')}

      <div className="bg-surface-container rounded-[16px] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant/20">
              <th className="text-left p-4 text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
                Action
              </th>
              <th className="text-right p-4 text-label-large font-bold text-on-surface-variant uppercase tracking-wide">
                Shortcut
              </th>
            </tr>
          </thead>
          <tbody>
            {KEYBINDS.map((kb, i) => (
              <tr
                key={kb.action}
                className={
                  i < KEYBINDS.length - 1 ? 'border-b border-outline-variant/10' : ''
                }
              >
                <td className="p-4 text-on-surface">{kb.action}</td>
                <td className="p-4 text-right">
                  <kbd className="px-2 py-1 bg-surface-container-highest rounded-[8px] text-label-medium text-on-surface-variant font-mono">
                    {kb.keys}
                  </kbd>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAbout = () => (
    <div className="space-y-6 max-w-lg animate-fade-in flex flex-col items-center text-center">
      <img
        src="/icon.png"
        alt="Nautilus logo"
        className="w-24 h-24 rounded-[28px] shadow-elevation-3"
      />
      <div>
        <h2 className="text-headline-medium font-bold text-on-surface">Nautilus</h2>
        <p className="text-body-large text-on-surface-variant mt-1">Version 1.2.1</p>
      </div>

      <div className="w-full pt-4 border-t border-outline-variant/20 text-left space-y-4">
        <div className="p-4 bg-surface-container rounded-[16px]">
          <h3 className="text-title-small font-bold text-on-surface mb-2">Credits</h3>
          <p className="text-body-medium text-on-surface-variant">
            Built with love by the Nautilus team. Inspired by the legendary submarine from Jules
            Verne's <em>Twenty Thousand Leagues Under the Seas</em>.
          </p>
        </div>

        <div className="p-4 bg-surface-container rounded-[16px] space-y-2">
          <h3 className="text-title-small font-bold text-on-surface mb-2">Links</h3>
          <a
            href="#"
            className="flex items-center gap-2 text-primary hover:underline text-body-medium"
          >
            <span className="material-symbols-outlined text-[18px]">language</span>
            Website
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-primary hover:underline text-body-medium"
          >
            <span className="material-symbols-outlined text-[18px]">code</span>
            Source Code
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-primary hover:underline text-body-medium"
          >
            <span className="material-symbols-outlined text-[18px]">bug_report</span>
            Report a Bug
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-primary hover:underline text-body-medium"
          >
            <span className="material-symbols-outlined text-[18px]">description</span>
            Terms of Service
          </a>
          <a
            href="#"
            className="flex items-center gap-2 text-primary hover:underline text-body-medium"
          >
            <span className="material-symbols-outlined text-[18px]">privacy_tip</span>
            Privacy Policy
          </a>
        </div>

        <p className="text-body-small text-on-surface-variant/60 text-center pt-2">
          Copyright 2024-2026 Nautilus. All rights reserved.
        </p>
      </div>
    </div>
  );

  const tabContent: Record<string, () => React.ReactNode> = {
    account: renderAccount,
    profile: renderProfile,
    appearance: renderAppearance,
    notifications: renderNotifications,
    voice: renderVoice,
    privacy: renderPrivacy,
    language: renderLanguage,
    keybinds: renderKeybinds,
    about: renderAbout,
  };

  /* ── Main render ─────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Settings Card */}
      <div className="relative w-full h-full md:w-[800px] md:h-[600px] bg-surface md:rounded-[28px] shadow-elevation-5 flex flex-col md:flex-row overflow-hidden animate-scale-in">
        {/* ── Sidebar ── */}
        <div className="w-full md:w-[240px] bg-surface-container-low p-4 flex flex-col border-r border-outline-variant/20 shrink-0">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between mb-4">
            <h2 className="text-title-large font-bold text-on-surface">Settings</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-surface-container-high text-on-surface-variant"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center px-4 py-3 rounded-full text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-secondary-container text-on-secondary-container font-bold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined mr-3 text-[20px]">{tab.icon}</span>
                <span className="text-label-large">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop version label */}
          <div className="hidden md:block mt-4 pt-4 border-t border-outline-variant/20 text-xs text-on-surface-variant opacity-60">
            Nautilus v1.2.1
          </div>
        </div>

        {/* ── Content area ── */}
        <div className="flex-1 flex flex-col bg-surface relative min-h-0">
          {/* Desktop close button */}
          <div className="hidden md:flex absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="flex flex-col items-center justify-center w-8 h-8 rounded-full hover:bg-surface-container-high text-on-surface-variant transition-colors group"
            >
              <span className="material-symbols-outlined group-hover:text-on-surface">close</span>
              <span className="text-[10px] mt-0.5">ESC</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            {tabContent[activeTab]?.()}
          </div>
        </div>
      </div>
    </div>
  );
};
