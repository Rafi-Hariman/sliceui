import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { AppHeader } from "@/components/AppHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import {
  User, Mail, Trash2, Shield, Send, AlertTriangle, Loader2, Camera, Settings as SettingsIcon,
} from "lucide-react";

// ─── shared form primitives ────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6">
      <p className="text-[13px] font-medium text-muted-foreground mb-4">{title}</p>
      {children}
    </div>
  );
}

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
    <div className="divide-y divide-border">
      <Section title="Profile information">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative group">
            <Avatar className="h-14 w-14 ring-1 ring-border">
              <AvatarImage src={profile?.avatar_url || ""} className="object-contain" />
              <AvatarFallback className="text-[14px]">{initials || "?"}</AvatarFallback>
            </Avatar>
            <label htmlFor="avatar-upload" className="absolute inset-0 flex items-center justify-center rounded-full bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Camera className="h-4 w-4 text-white" />}
            </label>
            <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploadingAvatar} />
          </div>
          <div>
            <p className="text-[13.5px] font-medium">{fullName || "Your Name"}</p>
            <p className="text-[12.5px] text-muted-foreground">{user?.email}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
          <div className="space-y-1.5">
            <Label className="text-[12.5px]">Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className="h-9 text-[13.5px]" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[12.5px]">Job title</Label>
            <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Software Engineer" className="h-9 text-[13.5px]" />
          </div>
        </div>
        <Button onClick={handleSaveProfile} disabled={saving} size="sm" className="h-9 text-[13px] mt-5">
          {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save changes
        </Button>
      </Section>

      <Section title="Change password">
        <div className="max-w-sm space-y-1.5">
          <Label className="text-[12.5px]">New password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" className="h-9 text-[13.5px]" />
        </div>
        <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline" size="sm" className="h-9 text-[13px] mt-5">
          {changingPassword && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Update password
        </Button>
      </Section>
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

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <Section title="Company information">
      <div className="grid gap-4 sm:grid-cols-2 max-w-xl">
        <div className="space-y-1.5"><Label className="text-[12.5px]">Company name</Label><Input value={form.company_name} onChange={(e) => update("company_name", e.target.value)} placeholder="Your company" className="h-9 text-[13.5px]" /></div>
        <div className="space-y-1.5"><Label className="text-[12.5px]">Website</Label><Input value={form.company_website} onChange={(e) => update("company_website", e.target.value)} placeholder="https://example.com" className="h-9 text-[13.5px]" /></div>
        <div className="space-y-1.5"><Label className="text-[12.5px]">Industry</Label>
          <Select value={form.industry} onValueChange={(v) => update("industry", v)}><SelectTrigger className="h-9 text-[13.5px]"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["Technology","Healthcare","Finance","Education","Retail","Manufacturing","Other"].map(i => <SelectItem key={i} value={i.toLowerCase()}>{i}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5"><Label className="text-[12.5px]">Company size</Label>
          <Select value={form.company_size} onValueChange={(v) => update("company_size", v)}><SelectTrigger className="h-9 text-[13.5px]"><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{["1-10","11-50","51-200","201-500","501-1000","1000+"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-1.5 sm:col-span-2"><Label className="text-[12.5px]">Address</Label><Input value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="123 Main St" className="h-9 text-[13.5px]" /></div>
        <div className="space-y-1.5"><Label className="text-[12.5px]">Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 (555) 000-0000" className="h-9 text-[13.5px]" /></div>
      </div>
      <Button onClick={handleSave} disabled={saving} size="sm" className="h-9 text-[13px] mt-5">
        {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save
      </Button>
    </Section>
  );
}

// ─── Team Tab ───────────────────────────────────────────────────────────────────

function TeamTab() {
  const { user } = useAuth();
  type TeamMember = Database["public"]["Functions"]["get_team_members"]["Returns"][number];
  type Invitation = Database["public"]["Tables"]["invitations"]["Row"];
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
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
    const { error } = await supabase.from("invitations").insert({ email: inviteEmail, role: inviteRole as Database["public"]["Enums"]["app_role"], invited_by: user.id });
    setSending(false);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Invitation sent", description: `Invited ${inviteEmail}` }); setInviteEmail(""); fetchData(); }
  };

  const handleRevoke = async (id: string) => {
    const { error } = await supabase.from("invitations").delete().eq("id", id);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else { toast({ title: "Invitation revoked" }); fetchData(); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="divide-y divide-border">
      <Section title="Invite team member">
        <div className="flex gap-2 max-w-xl">
          <Input placeholder="colleague@company.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} className="h-9 text-[13.5px] flex-1" />
          <Select value={inviteRole} onValueChange={setInviteRole}>
            <SelectTrigger className="w-[110px] h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="user">User</SelectItem><SelectItem value="moderator">Moderator</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
          </Select>
          <Button onClick={handleInvite} disabled={sending || !inviteEmail} size="sm" className="h-9 text-[13px] gap-1.5">
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Invite
          </Button>
        </div>
      </Section>

      {invitations.length > 0 && (
        <Section title="Pending invitations">
          <div className="space-y-1.5 max-w-xl">
            {invitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30">
                <div className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[13.5px]">{inv.email}</span>
                  <Badge variant="outline" className="text-[10px] h-5 px-1.5">{inv.role}</Badge>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleRevoke(inv.id)} className="h-8 w-8 p-0" aria-label="Revoke invitation">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </Section>
      )}

      <Section title={`Team members · ${members.length}`}>
        <div className="space-y-1.5 max-w-xl">
          {members.map((m) => (
            <div key={m.user_id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/30">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={m.avatar_url || ""} />
                  <AvatarFallback className="text-2xs">{(m.full_name || "?").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}</AvatarFallback>
                </Avatar>
                <span className="text-[13.5px] font-medium">{m.full_name || "Unnamed"}</span>
                <span className="text-[12.5px] text-muted-foreground">{m.job_title || ""}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-[10px] h-5 px-1.5 gap-0.5">
                  <Shield className="h-2.5 w-2.5" />{m.role}
                </Badge>
                {m.user_id === user?.id && <Badge variant="secondary" className="text-[10px] h-5 px-1.5">You</Badge>}
              </div>
            </div>
          ))}
        </div>
      </Section>
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

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="divide-y divide-border">
      <div className="p-6 pb-4 flex items-start gap-2.5 bg-muted/20">
        <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-[12.5px] text-muted-foreground">Email delivery not yet connected. Preferences will take effect once an email provider is configured.</p>
      </div>
      <Section title="Email notifications">
        <div className="space-y-1.5 max-w-xl">
          {items.map(item => (
            <div key={item.key} className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/30">
              <span className="text-[13.5px]">{item.label}</span>
              <Switch checked={prefs[item.key]} onCheckedChange={() => togglePref(item.key)} />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={saving} size="sm" className="h-9 text-[13px] mt-5">
          {saving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save preferences
        </Button>
      </Section>
    </div>
  );
}

// ─── General Tab ────────────────────────────────────────────────────────────────

function GeneralTab() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const current = (theme === "system" ? resolvedTheme : theme) ?? "dark";

  return (
    <div className="divide-y divide-border">
      <Section title="Appearance">
        <div className="flex items-center justify-between max-w-xl">
          <div>
            <p className="text-[13.5px] font-medium">Theme</p>
            <p className="text-[12.5px] text-muted-foreground">Switch between light and dark, or follow your system.</p>
          </div>
          <Select value={current} onValueChange={setTheme}>
            <SelectTrigger className="w-[120px] h-9 text-[13px]"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="Danger zone">
        <div className="flex items-center justify-between max-w-xl border border-destructive/25 rounded-lg p-4">
          <div>
            <p className="text-[13.5px] font-medium">Delete account</p>
            <p className="text-[12.5px] text-muted-foreground">Permanently delete your account and all data.</p>
          </div>
          <Button variant="destructive" size="sm" disabled className="h-9 text-[13px]">Coming soon</Button>
        </div>
      </Section>
    </div>
  );
}

// ─── Main Settings Page ─────────────────────────────────────────────────────────

export default function Settings() {
  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        <AppHeader title="Settings" />

        <div className="flex-1 overflow-auto">
          <Tabs defaultValue="profile" className="flex flex-col md:flex-row h-full">
            <div className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border p-3">
              <TabsList className="flex md:flex-col items-stretch w-full bg-transparent h-auto gap-1">
                <TabsTrigger value="profile" className="justify-start gap-2.5 text-[13px] h-9 px-3 font-medium data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground w-full">
                  <User className="h-4 w-4" /> Profile
                </TabsTrigger>
                <TabsTrigger value="general" className="justify-start gap-2.5 text-[13px] h-9 px-3 font-medium data-[state=active]:bg-sidebar-accent data-[state=active]:text-sidebar-accent-foreground w-full">
                  <SettingsIcon className="h-4 w-4" /> General
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 min-w-0">
              <TabsContent value="profile" className="m-0"><ProfileTab /></TabsContent>
              <TabsContent value="company" className="m-0"><CompanyTab /></TabsContent>
              <TabsContent value="team" className="m-0"><TeamTab /></TabsContent>
              <TabsContent value="email" className="m-0"><EmailTab /></TabsContent>
              <TabsContent value="general" className="m-0"><GeneralTab /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}
