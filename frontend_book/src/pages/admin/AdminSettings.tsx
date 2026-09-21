import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { adminSettingsApi } from '../../api/settings';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { useSettings } from '../../contexts/SettingsContext';
import type { SiteSettings, TrustBadge } from '../../types/settings';
import { TRUST_ICON_OPTIONS } from '../../utils/icons';

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

export default function AdminSettings() {
  const { user, updateUser } = useAdminAuth();
  const setPublicSettings = useSettings((state) => state.setSettings);

  // --- Account form ---
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [accountError, setAccountError] = useState('');
  const [accountSuccess, setAccountSuccess] = useState('');
  const [savingAccount, setSavingAccount] = useState(false);

  // --- Site content ---
  const [content, setContent] = useState<SiteSettings | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [savingContent, setSavingContent] = useState(false);
  const [contentError, setContentError] = useState('');
  const [contentSuccess, setContentSuccess] = useState('');

  useEffect(() => {
    adminSettingsApi
      .get()
      .then(setContent)
      .catch((err) => setContentError(err instanceof ApiError ? err.message : 'Could not load site content'))
      .finally(() => setContentLoading(false));
  }, []);

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const saveAccount = async (event: React.FormEvent) => {
    event.preventDefault();
    setAccountError('');
    setAccountSuccess('');
    setFieldErrors({});
    setSavingAccount(true);
    try {
      const profileChanged = name !== (user?.name ?? '') || email !== (user?.email ?? '');
      if (!profileChanged && !newPassword) {
        setAccountError('Change your name, email or password first');
        return;
      }
      if (profileChanged) {
        const updated = await authApi.updateProfile({ name, email, currentPassword });
        updateUser(updated);
      }
      if (newPassword) {
        await authApi.changePassword(currentPassword, newPassword);
      }
      setAccountSuccess('Account updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.details)) {
        const map: Record<string, string> = {};
        for (const detail of err.details as Array<{ path?: string; message?: string }>) {
          if (detail.path) map[detail.path] = detail.message ?? 'Invalid value';
        }
        setFieldErrors(map);
        setAccountError(
          Object.keys(map).length > 0 ? 'Please fix the highlighted fields' : err.message
        );
      } else {
        setAccountError(err instanceof ApiError ? err.message : 'Could not update account');
      }
    } finally {
      setSavingAccount(false);
    }
  };

  const saveContent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!content) return;
    setContentError('');
    setContentSuccess('');
    setSavingContent(true);
    try {
      const updated = await adminSettingsApi.update(content);
      setContent(updated);
      setPublicSettings(updated);
      setContentSuccess('Site content saved');
    } catch (err) {
      setContentError(err instanceof ApiError ? err.message : 'Could not save site content');
    } finally {
      setSavingContent(false);
    }
  };

  const updateSite = (key: keyof SiteSettings['site'], value: string) =>
    setContent((prev) => (prev ? { ...prev, site: { ...prev.site, [key]: value } } : prev));

  const updateHero = (key: keyof SiteSettings['hero'], value: string) =>
    setContent((prev) => (prev ? { ...prev, hero: { ...prev.hero, [key]: value } } : prev));

  const updateBadge = (index: number, key: keyof TrustBadge, value: string) =>
    setContent((prev) => {
      if (!prev) return prev;
      const trustBadges = prev.trustBadges.map((badge, i) =>
        i === index ? { ...badge, [key]: value } : badge
      );
      return { ...prev, trustBadges };
    });

  const addBadge = () =>
    setContent((prev) =>
      prev
        ? {
            ...prev,
            trustBadges: [
              ...prev.trustBadges,
              { icon: 'ShieldCheck', title: 'New badge', text: 'Description' },
            ],
          }
        : prev
    );

  const removeBadge = (index: number) =>
    setContent((prev) =>
      prev ? { ...prev, trustBadges: prev.trustBadges.filter((_, i) => i !== index) } : prev
    );

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>

      <SectionCard title="Account" description="Your admin login details.">
        <form onSubmit={saveAccount} className="space-y-4">
          <Input
            label="Name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearFieldError('name');
            }}
            error={fieldErrors.name}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError('email');
            }}
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            title="Enter a full email address, e.g. name@example.com"
            error={fieldErrors.email}
            required
          />
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              clearFieldError('currentPassword');
            }}
            placeholder="Required to save any change"
            error={fieldErrors.currentPassword}
            required
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(event) => {
              setNewPassword(event.target.value);
              clearFieldError('newPassword');
            }}
            placeholder="Leave blank to keep your current password"
            error={fieldErrors.newPassword}
          />
          {accountError && <p className="text-sm text-red-500">{accountError}</p>}
          {accountSuccess && <p className="text-sm text-green-600">{accountSuccess}</p>}
          <Button type="submit" isLoading={savingAccount} leftIcon={<Save className="h-4 w-4" />}>
            Save account
          </Button>
        </form>
      </SectionCard>

      {contentLoading ? (
        <div className="h-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
      ) : !content ? (
        <p className="text-sm text-red-500">{contentError || 'Could not load site content'}</p>
      ) : (
        <form onSubmit={saveContent} className="space-y-8">
          <SectionCard
            title="Site details"
            description="Name, tagline and contact details shown across the public site and footer."
          >
            <Input
              label="Store name"
              value={content.site.name}
              onChange={(event) => updateSite('name', event.target.value)}
              required
            />
            <Input
              label="Tagline"
              value={content.site.tagline}
              onChange={(event) => updateSite('tagline', event.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Phone"
                value={content.site.phone}
                onChange={(event) => updateSite('phone', event.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                value={content.site.email}
                onChange={(event) => updateSite('email', event.target.value)}
                required
              />
            </div>
            <Input
              label="Location"
              value={content.site.location}
              onChange={(event) => updateSite('location', event.target.value)}
              required
            />
          </SectionCard>

          <SectionCard title="Home hero" description="Headline and subheadline at the top of the home page.">
            <Input
              label="Hero title"
              value={content.hero.title}
              onChange={(event) => updateHero('title', event.target.value)}
              required
            />
            <Input
              label="Hero subtitle"
              value={content.hero.subtitle}
              onChange={(event) => updateHero('subtitle', event.target.value)}
              required
            />
          </SectionCard>

          <SectionCard title="Trust badges" description="The badge strip below the hero.">
            <div className="space-y-4">
              {content.trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-[160px_1fr_1fr_auto] dark:border-gray-700"
                >
                  <select
                    value={badge.icon}
                    onChange={(event) => updateBadge(index, 'icon', event.target.value)}
                    aria-label="Icon"
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    {TRUST_ICON_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={badge.title}
                    onChange={(event) => updateBadge(index, 'title', event.target.value)}
                    placeholder="Title"
                    aria-label="Badge title"
                  />
                  <Input
                    value={badge.text}
                    onChange={(event) => updateBadge(index, 'text', event.target.value)}
                    placeholder="Description"
                    aria-label="Badge description"
                  />
                  <button
                    type="button"
                    onClick={() => removeBadge(index)}
                    aria-label="Remove badge"
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 text-red-600 hover:bg-red-50 dark:border-gray-600 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addBadge} leftIcon={<Plus className="h-4 w-4" />}>
                Add badge
              </Button>
            </div>
          </SectionCard>

          {contentError && <p className="text-sm text-red-500">{contentError}</p>}
          {contentSuccess && <p className="text-sm text-green-600">{contentSuccess}</p>}

          <Button type="submit" isLoading={savingContent} leftIcon={<Save className="h-4 w-4" />}>
            Save site content
          </Button>
        </form>
      )}
    </div>
  );
}
