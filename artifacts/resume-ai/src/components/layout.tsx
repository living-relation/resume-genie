import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, FileText, Briefcase, FileCheck,
  Upload, PlusCircle, Settings, Sun, Moon, Cog, Sparkles, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile.tsx";
import { usePreferences, type Theme, TONE_OPTIONS, STYLE_OPTIONS, TRUTHFULNESS_LEVELS } from "@/context/preferences";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SiteFooter } from "@/components/site-footer";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    shortLabel: "Home",
    description: "Overview & quick actions",
    icon: LayoutDashboard,
  },
  {
    href: "/documents",
    label: "My Uploads",
    shortLabel: "Uploads",
    description: "Resumes & cover letters you've added",
    icon: FileText,
  },
  {
    href: "/jobs",
    label: "Job Listings",
    shortLabel: "Jobs",
    description: "Scraped job postings",
    icon: Briefcase,
  },
  {
    href: "/applications",
    label: "Generated Resumes",
    shortLabel: "Generated",
    description: "AI-tailored resumes & cover letters",
    icon: FileCheck,
  },
];

const themes: { value: Theme; label: string; icon: React.ElementType; preview: string }[] = [
  { value: "light", label: "Light", icon: Sun, preview: "bg-slate-100 border-slate-300" },
  { value: "dark", label: "Dark", icon: Moon, preview: "bg-slate-800 border-slate-600" },
  { value: "steampunk", label: "Steampunk", icon: Cog, preview: "bg-amber-950 border-amber-700" },
  { value: "unicorn", label: "Unicorn", icon: Sparkles, preview: "bg-purple-100 border-pink-400" },
];

function SettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { theme, tone, style, truthfulness, profile, setTheme, setTone, setStyle, setTruthfulness, setProfile } = usePreferences();
  const currentLevel = TRUTHFULNESS_LEVELS[truthfulness];

  const [localProfile, setLocalProfile] = useState(profile);

  const handleProfileSave = () => {
    setProfile(localProfile);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { handleProfileSave(); onClose(); } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            Appearance &amp; Generation Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-7 pt-1">

          {/* Profile */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <User className="w-3.5 h-3.5 text-primary" />
              <p className="text-sm font-semibold text-foreground">Your Profile</p>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Used to autofill contact info in Word exports. LinkedIn is optional and omitted if blank.</p>
            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="profile-name" className="text-xs">Full Name</Label>
                  <Input
                    id="profile-name"
                    placeholder="Jane Smith"
                    value={localProfile.name}
                    onChange={e => setLocalProfile(p => ({ ...p, name: e.target.value }))}
                    className="h-8 text-sm"
                    data-testid="input-profile-name"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-email" className="text-xs">Email</Label>
                  <Input
                    id="profile-email"
                    placeholder="jane@email.com"
                    value={localProfile.email}
                    onChange={e => setLocalProfile(p => ({ ...p, email: e.target.value }))}
                    className="h-8 text-sm"
                    data-testid="input-profile-email"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="profile-phone" className="text-xs">Phone</Label>
                  <Input
                    id="profile-phone"
                    placeholder="(555) 123-4567"
                    value={localProfile.phone}
                    onChange={e => setLocalProfile(p => ({ ...p, phone: e.target.value }))}
                    className="h-8 text-sm"
                    data-testid="input-profile-phone"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="profile-location" className="text-xs">Location</Label>
                  <Input
                    id="profile-location"
                    placeholder="Austin, TX"
                    value={localProfile.location}
                    onChange={e => setLocalProfile(p => ({ ...p, location: e.target.value }))}
                    className="h-8 text-sm"
                    data-testid="input-profile-location"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="profile-linkedin" className="text-xs">LinkedIn URL <span className="text-muted-foreground font-normal">(optional)</span></Label>
                <Input
                  id="profile-linkedin"
                  placeholder="linkedin.com/in/janesmith"
                  value={localProfile.linkedin}
                  onChange={e => setLocalProfile(p => ({ ...p, linkedin: e.target.value }))}
                  className="h-8 text-sm"
                  data-testid="input-profile-linkedin"
                />
              </div>
            </div>
          </div>

          {/* Theme */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3">App appearance</p>
            <div className="grid grid-cols-2 gap-2.5">
              {themes.map(({ value, label, icon: Icon, preview }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg border-2 text-sm font-medium transition-all text-left",
                    theme === value
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:border-primary/40 text-foreground"
                  )}
                  data-testid={`btn-theme-${value}`}
                >
                  <div className={cn("w-5 h-5 rounded-sm border flex-shrink-0", preview)} />
                  <Icon className="w-3.5 h-3.5 flex-shrink-0 text-muted-foreground" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Writing Tone</p>
            <p className="text-xs text-muted-foreground mb-3">Controls the voice and formality of generated content</p>
            <div className="space-y-1.5">
              {TONE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTone(opt.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md border text-sm transition-all text-left",
                    tone === opt.value
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:border-primary/30 text-foreground"
                  )}
                  data-testid={`btn-tone-${opt.value}`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-1">Resume Style</p>
            <p className="text-xs text-muted-foreground mb-3">Controls length and structure of the output</p>
            <div className="grid grid-cols-2 gap-1.5">
              {STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setStyle(opt.value)}
                  className={cn(
                    "flex flex-col px-3 py-2.5 rounded-md border text-left text-sm transition-all",
                    style === opt.value
                      ? "border-primary bg-accent text-accent-foreground"
                      : "border-border hover:border-primary/30 text-foreground"
                  )}
                  data-testid={`btn-style-${opt.value}`}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="text-xs text-muted-foreground mt-0.5">{opt.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Truthfulness */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold text-foreground">Truthfulness</p>
              <Badge variant="outline" className={cn("text-xs border", currentLevel.color)}>
                {currentLevel.label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-4">{currentLevel.description}</p>
            <Slider
              min={0}
              max={4}
              step={1}
              value={[truthfulness]}
              onValueChange={([v]) => setTruthfulness(v as 0|1|2|3|4)}
              className="mb-3"
              data-testid="slider-truthfulness"
            />
            <div className="flex justify-between">
              {TRUTHFULNESS_LEVELS.map((lvl, i) => (
                <button
                  key={i}
                  onClick={() => setTruthfulness(i as 0|1|2|3|4)}
                  className={cn(
                    "text-xs transition-colors text-center w-12",
                    truthfulness === i ? `font-semibold ${lvl.color}` : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
            {truthfulness >= 4 && (
              <p className="mt-3 text-xs text-muted-foreground bg-muted/60 border border-border rounded-md px-3 py-2">
                ⚠️ Maximized mode fabricates plausible numbers and impact. Degrees, certifications, and licenses are never fabricated.
              </p>
            )}
          </div>
        </div>

        <div className="pt-2">
          <Button className="w-full" onClick={() => { handleProfileSave(); onClose(); }}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─── DESKTOP SIDEBAR ────────────────────────────────────────────── */
function DesktopSidebar({ onOpenSettings, cogAttention }: { onOpenSettings: () => void; cogAttention: boolean }) {
  const [location] = useLocation();
  const { theme, tone, truthfulness } = usePreferences();

  return (
    <aside className="w-60 flex-shrink-0 bg-sidebar flex flex-col border-r border-sidebar-border">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-4 h-4 text-sidebar-primary-foreground" />
          </div>
          <span className="text-sidebar-foreground font-semibold text-sm tracking-tight">Resume AI</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-2 pb-2 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-widest">Workspace</p>
        {navItems.map(({ href, label, description, icon: Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href}>
              <div className={cn(
                "flex items-start gap-3 px-3 py-2 rounded-md transition-colors cursor-pointer",
                active
                  ? "bg-sidebar-accent text-sidebar-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
              )}>
                <Icon className={cn("w-4 h-4 flex-shrink-0 mt-0.5", active ? "text-sidebar-primary" : "")} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-tight">{label}</div>
                  <div className={cn(
                    "text-[11px] leading-tight mt-0.5",
                    active ? "text-sidebar-foreground/70" : "text-sidebar-foreground/40"
                  )}>
                    {description}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}

        <div className="pt-4">
          <p className="px-2 pb-2 text-xs font-medium text-sidebar-foreground/40 uppercase tracking-widest">Add New</p>
          {[
            { href: "/upload", label: "Upload Document", icon: Upload },
            { href: "/add-job", label: "Add Job", icon: PlusCircle },
          ].map(({ href, label, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer",
                  active
                    ? "bg-sidebar-accent text-sidebar-foreground"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/60"
                )}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {label}
                </div>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Active settings preview */}
      <div className="px-3 pb-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent/60 transition-colors text-sm"
          data-testid="btn-open-settings"
        >
          <Settings className={cn("w-4 h-4 flex-shrink-0", cogAttention && "cog-attention")} />
          <div className="flex-1 text-left">
            <span className="text-xs">Settings</span>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] opacity-60 capitalize">{tone}</span>
              <span className="text-[10px] opacity-40">·</span>
              <span className="text-[10px] opacity-60">{TRUTHFULNESS_LEVELS[truthfulness].label}</span>
            </div>
          </div>
        </button>
      </div>
      <div className="px-5 py-3 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/30">Powered by GPT · {theme.charAt(0).toUpperCase() + theme.slice(1)} theme</p>
      </div>
    </aside>
  );
}

/* ─── MOBILE LAYOUT ──────────────────────────────────────────────── */
function MobileLayout({ children, onOpenSettings, cogAttention }: { children: React.ReactNode; onOpenSettings: () => void; cogAttention: boolean }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Top header — fixed so it's always visible */}
      <header className="fixed top-0 left-0 right-0 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between z-40 h-14">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-3.5 h-3.5 text-sidebar-primary-foreground" />
          </div>
          <span className="text-sidebar-foreground font-semibold text-sm">Resume AI</span>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/upload">
            <button className="flex items-center gap-1.5 px-2.5 h-8 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Upload</span>
            </button>
          </Link>
          <Link href="/add-job">
            <button className="flex items-center gap-1.5 px-2.5 h-8 rounded-md text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">Add Job</span>
            </button>
          </Link>
          <button
            onClick={onOpenSettings}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            data-testid="btn-open-settings-mobile"
            aria-label="Settings"
          >
            <Settings className={cn("w-4 h-4", cogAttention && "cog-attention")} />
          </button>
        </div>
      </header>

      {/* Scrollable content — padded so fixed header & nav don't overlap it */}
      <main
        className="pt-14"
        style={{ paddingBottom: "calc(4rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {children}
        <SiteFooter />
      </main>

      {/* Bottom tab bar — fixed so it's ALWAYS visible, no matter the page */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-sidebar border-t border-sidebar-border z-40 shadow-[0_-2px_12px_rgba(0,0,0,0.12)]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="flex items-stretch">
          {navItems.map(({ href, shortLabel, icon: Icon }) => {
            const active = location === href;
            return (
              <Link key={href} href={href} className="flex-1">
                <div className={cn(
                  "flex flex-col items-center justify-center py-2 gap-0.5 transition-colors relative",
                  active
                    ? "text-sidebar-primary"
                    : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
                )}>
                  {active && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-b-full bg-sidebar-primary" />
                  )}
                  <Icon className="w-5 h-5" />
                  <span className="text-[11px] font-medium">{shortLabel}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/* ─── SETTINGS ACTIONS CONTEXT ───────────────────────────────────── */
interface SettingsActionsContextValue {
  openSettings: () => void;
  pokeSettingsCog: () => void;
}

const SettingsActionsContext = createContext<SettingsActionsContextValue | null>(null);

export function useSettingsActions() {
  const ctx = useContext(SettingsActionsContext);
  if (!ctx) throw new Error("useSettingsActions must be used within Layout");
  return ctx;
}

/* ─── MAIN LAYOUT ────────────────────────────────────────────────── */
export function Layout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [cogAttention, setCogAttention] = useState(false);
  const cogTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openSettings = useCallback(() => setSettingsOpen(true), []);

  const pokeSettingsCog = useCallback(() => {
    if (cogTimer.current) clearTimeout(cogTimer.current);
    setCogAttention(false);
    requestAnimationFrame(() => {
      setCogAttention(true);
      cogTimer.current = setTimeout(() => setCogAttention(false), 1100);
    });
  }, []);

  const actions: SettingsActionsContextValue = { openSettings, pokeSettingsCog };

  return (
    <SettingsActionsContext.Provider value={actions}>
      {isMobile ? (
        <>
          <MobileLayout onOpenSettings={openSettings} cogAttention={cogAttention}>
            {children}
          </MobileLayout>
          <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
      ) : (
        <div className="flex h-screen overflow-hidden bg-background">
          <DesktopSidebar onOpenSettings={openSettings} cogAttention={cogAttention} />
          <main className="flex-1 overflow-y-auto flex flex-col">
            <div className="flex-1">{children}</div>
            <SiteFooter />
          </main>
          <SettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </div>
      )}
    </SettingsActionsContext.Provider>
  );
}
