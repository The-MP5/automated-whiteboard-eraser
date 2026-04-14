import { useEffect, useState } from 'react';
import { Loader2, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function readDisplayName(metadata: Record<string, unknown> | undefined): string {
  const v = metadata?.display_name;
  return typeof v === 'string' ? v : '';
}

const UserAccountMenu = () => {
  const {
    isBackendConfigured,
    user,
    isLoading,
    signInWithMagicLink,
    signOut,
    updateDisplayName,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [displayDraft, setDisplayDraft] = useState('');
  const [magicSending, setMagicSending] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDisplayDraft(readDisplayName(user?.user_metadata as Record<string, unknown> | undefined));
  }, [user?.id, user?.user_metadata]);

  const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const triggerLabel = user?.email ?? 'Account';

  const onSendMagicLink = async () => {
    if (!emailLooksValid) return;
    setMagicSending(true);
    const { error } = await signInWithMagicLink(email);
    setMagicSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Check your email for the sign-in link.');
    setEmail('');
  };

  const onSaveDisplayName = async () => {
    setProfileSaving(true);
    const { error } = await updateDisplayName(displayDraft);
    setProfileSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Profile name saved.');
  };

  const onSignOut = async () => {
    setSigningOut(true);
    await signOut();
    setSigningOut(false);
    setOpen(false);
    toast.message('Signed out.');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 max-w-[14rem] truncate"
          aria-label={`Account menu. ${user ? `Signed in as ${user.email}` : 'Sign in'}`}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" aria-hidden />
          ) : (
            <UserCircle className="h-4 w-4 shrink-0" aria-hidden />
          )}
          <span className="truncate">{isLoading ? '…' : triggerLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold">Account</p>
            <p className="text-xs text-muted-foreground mt-1">
              FR6 — optional Supabase sign-in. The simulator works without it.
            </p>
          </div>

          {!isBackendConfigured && (
            <p className="text-sm text-muted-foreground">
              Supabase is not configured. Add <span className="font-mono text-xs">VITE_SUPABASE_URL</span> and{' '}
              <span className="font-mono text-xs">VITE_SUPABASE_ANON_KEY</span> to <span className="font-mono text-xs">.env</span> (see{' '}
              <span className="font-mono text-xs">.env.example</span>).
            </p>
          )}

          {isBackendConfigured && !user && (
            <div className="space-y-2">
              <Label htmlFor="account-email">Email</Label>
              <Input
                id="account-email"
                type="email"
                autoComplete="email"
                placeholder="you@school.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="button"
                className="w-full"
                disabled={!emailLooksValid || magicSending}
                onClick={() => void onSendMagicLink()}
              >
                {magicSending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Sending…
                  </>
                ) : (
                  'Send magic link'
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                Add your site URL under Supabase → Authentication → URL Configuration so the redirect works.
              </p>
            </div>
          )}

          {isBackendConfigured && user && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">Signed in</p>
                <p className="text-sm font-medium break-all">{user.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="account-display">Display name (profile)</Label>
                <Input
                  id="account-display"
                  type="text"
                  autoComplete="name"
                  placeholder="e.g. Ms. Lee"
                  value={displayDraft}
                  onChange={(e) => setDisplayDraft(e.target.value)}
                />
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  disabled={profileSaving}
                  onClick={() => void onSaveDisplayName()}
                >
                  {profileSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Saving…
                    </>
                  ) : (
                    'Save display name'
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Stored in auth user metadata for this demo. A production app may use a{' '}
                  <span className="font-mono">profiles</span> table with RLS.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={signingOut}
                onClick={() => void onSignOut()}
              >
                {signingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    Signing out…
                  </>
                ) : (
                  'Sign out'
                )}
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserAccountMenu;
