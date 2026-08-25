import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  User, Building2, Users, Bell, Settings as SettingsIcon,
  Mail, Trash2, Shield, Send, AlertTriangle, Loader2, Camera, Sun, Moon
} from "lucide-react";

// ─── Profile Tab ────────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a JPG, PNG, WebP, or GIF image.", variant: "destructive" });
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      toast({ title: "File too large", description: "Avatar must be under 5 MB.", variant: "destructive" });
      return;
    }

    const allowedExts = ["jpg", "jpeg", "png", "webp", "gif"];
    const fileExt = (file.name.split(".").pop() || "").toLowerCase();
    if (!allowedExts.includes(fileExt)) {
      toast({ title: "Invalid file extension", description: "Please upload a JPG, PNG, WebP, or GIF image.", variant: "destructive" });
      return;
    }

    setUploadingAvatar(true);
    const filePath = `${user.id}/avatar.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file, { upsert: true });
    if (uploadError) { toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" }); setUploadingAvatar(false); return; }
    const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    const { error: updateError } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("user_id", user.id);
    setUploadingAvatar(false);
    if (updateError) toast({ title: "Error", description: updateError.message, variant: "destructive" });
    else { toast({ title: "Avatar updated" }); await refreshProfile(); }
  };

  useEffect(() => {
    if (profile) { setFullName(profile.full_name || ""); setJobTitle(profile.job_title || ""); }
  }, [profile]);

  const initials = fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ full_name: fullName, job_title: jobTitle }).eq("user_id", user.id);
    setSaving(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Profile updated" }); await refreshProfile(); }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) { toast({ title: "Error", description: "Password must be at least 6 characters.", variant: "destructive" }); return; }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Password updated" }); setNewPassword(""); }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[13px] font-medium mb-1">Profile Information</p>
        <p className="text-[12px] text-muted-foreground mb-4">Update your name, job title, and avatar.</p>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative group">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url || ""} className="object-contain" />
              <AvatarFallback className="bg-primary/10 text-primary text-[14px] font-medium">{initials || "?"}</AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Camera className="h-4 w-4 text-white" />}
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
          </div>
          <div>
            <p className="text-[14px] font-medium">{fullName || "Your Name"}</p>
            <p className="text-[12px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 max-w-lg">
          <div className="space-y-1.5">
            <Label className="text-[12px]">Full Name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="h-9 text-[13px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12px]">Job Title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer" className="h-9 text-[13px]" />
          </div>
        </div>
        <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="h-9 text-[13px] mt-4">
          {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[13px] font-medium mb-1">Change Password</p>
        <p className="text-[12px] text-muted-foreground mb-4">Set a new password for your account.</p>
        <div className="max-w-xs space-y-1.5">
          <Label className="text-[12px]">New Password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-9 text-[13px]" />
        </div>
        <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline" size="sm" className="h-9 text-[13px] mt-4">
          {changingPassword && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Update Password
        </Button>
      </div>
    </div>
  );
}

// ─── Company Tab ────────────────────────────────────────────────────────────────

function CompanyTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ company_name: "", company_website: "", industry: "", company_size: "", address: "", phone: "" });
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("company_settings").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setForm({ company_name: data.company_name || "", company_website: data.company_website || "", industry: data.industry || "", company_size: data.company_size || "", address: data.address || "", phone: data.phone || "" }); setExistingId(data.id); }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    if (existingId) {
      const { error } = await supabase.from("company_settings").update(form).eq("id", existingId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" }); else toast({ title: "Company settings saved" });
    } else {
      const { data, error } = await supabase.from("company_settings").insert({ ...form, user_id: user.id }).select().single();
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" }); else { setExistingId(data.id); toast({ title: "Company settings created" }); }
    }
    setSaving(false);
  };

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-[13px] font-medium mb-1">Company Information</p>
      <p className="text-[12px] text-muted-foreground mb-4">Details about your organization.</p>
      <div className="grid gap-3 sm:grid-cols-2 max-w-lg">
        <div className="space-y-1.5"><Label className="text-[12px]">Company Name</Label><Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="Acme Inc." className="h-9 text-[13px]" /></div>
        <div className="space-y-1.5"><Label className="text-[12px]">Website</Label><Input value={form.company_website} onChange={(e) => update("company_website", e.target.value)} placeholder="https://acme.com" className="h-9 text-[13px]" /></div>
        <div className="space-y-1.5"><Label className="text-[12px]">Industry</Label>
          <Select value={form.industry} onValueChange={(v) => update("industry", v)}><SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Technology","Healthcare","Finance","Education","Retail","Manufacturing","Other"].map(i => <SelectItem key={i} value={i.toLowerCase()}>{i}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label className="text-[12px]">Company Size</Label>
          <Select value={form.company_size} onValueChange={(v) => update("company_size", v)}><SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["1-10","11-50","51-200","201-500","501-1000","1000+"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5 sm:col-span-2"><Label className="text-[12px]">Address</Label><Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Main St" className="h-9 text-[13px]" /></div>
        <div className="space-y-1.5"><Label className="text-[12px]">Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" className="h-9 text-[13px]" /></div>
      </div>
      <Button onClick={handleSave} disabled={saving} size="sm" className="h-9 text-[13px] mt-4">
        {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save
      </Button>
    </div>
  );
}

// ─── Team Tab ───────────────────────────────────────────────────────────────────

function TeamTab() {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("user");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchData = async () => {
    const [teamRes, invitationsRes] = await Promise.all([
      supabase.rpc("get_team_members"),
      supabase.from("invitations").select("*").eq("status", "pending"),
    ]);
    setMembers(teamRes.data || []);
    setInvitations(invitationsRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleInvite = async () => {
    if (!user || !inviteEmail) return;
    setSending(true);
    const { error } = await supabase.from("invitations").insert({ email: inviteEmail, role: inviteRole as any, invited_by: user.id });
    setSending(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Invitation sent", description: `Invited ${inviteEmail}` }); setInviteEmail(""); fetchData(); }
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from("invitations").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Invitation revoked" }); fetchData(); }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[13px] font-medium mb-1">Invite Team Member</p>
        <p className="text-[12px] text-muted-foreground mb-4">Send an invitation by email.</p>
        <div className="flex gap-2 max-w-lg">
          <Input placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="h-9 text-[13px] flex-1" />
          <Select value={inviteRole} onValueChange={setInviteRole}>
            <SelectTrigger className="w-[100px] h-9 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
          </Select>
          <Button onClick={handleInvite} disabled={sending || !inviteEmail} size="sm" className="h-9 text-[13px] gap-1">
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Invite
          </Button>
        </div>
      </div>

      {invitations.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-[13px] font-medium mb-3">Pending Invitations</p>
          <div className="space-y-1">
            {invitations.map((inv: any) => (
              <div key={inv.id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[13px]">{inv.email}</span>
                  <Badge variant="outline" className="text-[10px] h-4 px-1">{inv.role}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRevoke(inv.id)} className="h-7 w-7 p-0">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[13px] font-medium mb-3">Team Members · {members.length}</p>
        <div className="space-y-1">
          {members.map((m: any) => (
            <div key={m.user_id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/30">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={m.avatar_url || ""} />
                  <AvatarFallback className="bg-primary/10 text-primary text-[9px]">{(m.full_name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-[13px] font-medium">{m.full_name || "Unnamed"}</span>
                <span className="text-[12px] text-muted-foreground">{m.job_title || ""}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] h-4 px-1 gap-0.5">
                  <Shield className="h-2.5 w-2.5" />{m.role}
                </Badge>
                {m.user_id === user?.id && <Badge variant="secondary" className="text-[10px] h-4 px-1">You</Badge>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Email Tab ──────────────────────────────────────────────────────────────────

function EmailTab() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({ email_on_new_bug: true, email_on_assignment: true, email_on_status_change: true, email_on_comment: true, email_on_sla_breach: true, daily_digest: false });
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("notification_preferences").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => {
      if (data) { setPrefs({ email_on_new_bug: data.email_on_new_bug, email_on_assignment: data.email_on_assignment, email_on_status_change: data.email_on_status_change, email_on_comment: data.email_on_comment, email_on_sla_breach: data.email_on_sla_breach, daily_digest: data.daily_digest }); setExistingId(data.id); }
      setLoading(false);
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    if (existingId) {
      const { error } = await supabase.from("notification_preferences").update(prefs).eq("id", existingId);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" }); else toast({ title: "Preferences saved" });
    } else {
      const { data, error } = await supabase.from("notification_preferences").insert({ ...prefs, user_id: user.id }).select().single();
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" }); else { setExistingId(data.id); toast({ title: "Preferences saved" }); }
    }
    setSaving(false);
  };

  const togglePref = (key: keyof typeof prefs) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const items = [
    { key: "email_on_new_bug" as const, label: "New Bug Reported" },
    { key: "email_on_assignment" as const, label: "Bug Assigned to You" },
    { key: "email_on_status_change" as const, label: "Status Changes" },
    { key: "email_on_comment" as const, label: "New Comments" },
    { key: "email_on_sla_breach" as const, label: "SLA Breach Warning" },
    { key: "daily_digest" as const, label: "Daily Digest" },
  ];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 flex items-start gap-2 bg-muted/30 border-b border-border">
        <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-[12px] text-muted-foreground">Email delivery not yet connected. Preferences will take effect once an email provider is configured.</p>
      </div>
      <div className="p-5">
        <p className="text-[13px] font-medium mb-1">Email Notifications</p>
        <p className="text-[12px] text-muted-foreground mb-4">Choose which events you want to hear about.</p>
        <div className="space-y-1">
          {items.map(item => (
            <div key={item.key} className="flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/30">
              <span className="text-[13px]">{item.label}</span>
              <Switch checked={prefs[item.key]} onCheckedChange={() => togglePref(item.key)} />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="h-9 text-[13px] mt-4">
          {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save Preferences
        </Button>
      </div>
    </div>
  );
}

// ─── General Tab ────────────────────────────────────────────────────────────────

function GeneralTab() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[13px] font-medium mb-1">Appearance</p>
        <p className="text-[12px] text-muted-foreground mb-4">Control how SliceUI looks.</p>
        <div className="flex items-center justify-between max-w-lg">
          <span className="text-[13px]">Theme</span>
          <Select value={theme} onValueChange={setTheme}>
            <SelectTrigger className="w-[120px] h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-[13px] font-medium mb-1">Defaults</p>
        <p className="text-[12px] text-muted-foreground mb-4">Presets for new conversions.</p>
        <div className="grid gap-3 sm:grid-cols-2 max-w-lg">
          <div className="space-y-1.5"><Label className="text-[12px]">Default Severity</Label>
            <Select defaultValue="medium"><SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label className="text-[12px]">Default Environment</Label>
            <Select defaultValue="production"><SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="production">Production</SelectItem><SelectItem value="staging">Staging</SelectItem><SelectItem value="development">Development</SelectItem><SelectItem value="qa">QA</SelectItem></SelectContent></Select></div>
        </div>
      </div>

      <div className="rounded-lg border border-destructive/20 bg-background p-5">
        <p className="text-[13px] text-destructive font-medium mb-4">Danger Zone</p>
        <div className="flex items-center justify-between max-w-lg">
          <div>
            <p className="text-[13px] font-medium">Delete Account</p>
            <p className="text-[12px] text-muted-foreground">Permanently delete your account and all data.</p>
          </div>
          <Button variant="destructive" size="sm" disabled className="h-9 text-[13px]">Coming Soon</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Settings Page ─────────────────────────────────────────────────────────

export default function Settings() {
  return (
    <AppLayout title="Settings">
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-auto">
          <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-6">
            {/* Page intro */}
            <div>
              <h2 className="text-xl font-medium tracking-[-0.02em]">Settings</h2>
              <p className="text-[13px] text-muted-foreground mt-1">
                Manage your profile, team, and preferences.
              </p>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              {/* Horizontal segmented tab bar — no nested sidebar */}
              <div className="sticky top-0 z-10 -mx-4 md:-mx-8 px-4 md:px-8 py-2 bg-background/85 backdrop-blur-lg">
                <TabsList className="flex w-full h-auto p-1 gap-1 rounded-xl bg-muted/50 border border-border">
                  <TabsTrigger value="profile" className="flex-1 justify-center gap-1.5 text-[12.5px] h-8 px-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm sm:gap-2 sm:text-[13px]">
                    <User className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="company" className="flex-1 justify-center gap-1.5 text-[12.5px] h-8 px-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm sm:gap-2 sm:text-[13px]">
                    <Building2 className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Company</span>
                  </TabsTrigger>
                  <TabsTrigger value="team" className="flex-1 justify-center gap-1.5 text-[12.5px] h-8 px-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm sm:gap-2 sm:text-[13px]">
                    <Users className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Team</span>
                  </TabsTrigger>
                  <TabsTrigger value="email" className="flex-1 justify-center gap-1.5 text-[12.5px] h-8 px-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm sm:gap-2 sm:text-[13px]">
                    <Bell className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Notifications</span>
                  </TabsTrigger>
                  <TabsTrigger value="general" className="flex-1 justify-center gap-1.5 text-[12.5px] h-8 px-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm sm:gap-2 sm:text-[13px]">
                    <SettingsIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">General</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="profile" className="m-0"><ProfileTab /></TabsContent>
              <TabsContent value="company" className="m-0"><CompanyTab /></TabsContent>
              <TabsContent value="team" className="m-0"><TeamTab /></TabsContent>
              <TabsContent value="email" className="m-0"><EmailTab /></TabsContent>
              <TabsContent value="general" className="m-0"><GeneralTab /></TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
