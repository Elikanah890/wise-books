import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/admin';
import { ApiError } from '../../api/client';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import ThemeToggle from '../common/ThemeToggle';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Modal from '../ui/Modal';

const navItems = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/books', label: 'Books' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/comments', label: 'Comments' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/payments', label: 'Payments' },
  { to: '/admin/revenue', label: 'Revenue' },
  { to: '/admin/settings', label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout, updateUser } = useAdminAuth();
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const clearFieldError = (field: string) =>
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const openSettings = () => {
    setName(user?.name ?? '');
    setEmail(user?.email ?? '');
    setCurrentPassword('');
    setNewPassword('');
    setError('');
    setSuccess('');
    setFieldErrors({});
    setSettingsOpen(true);
  };

  const saveSettings = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setFieldErrors({});
    setSaving(true);
    try {
      const profileChanged = name !== (user?.name ?? '') || email !== (user?.email ?? '');
      if (!profileChanged && !newPassword) {
        setError('Change your name, email or password first');
        return;
      }

      if (profileChanged) {
        const updated = await authApi.updateProfile({
          name,
          email,
          currentPassword,
        });
        updateUser(updated);
      }
      if (newPassword) {
        await authApi.changePassword(currentPassword, newPassword);
      }

      setSuccess('Account updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      if (err instanceof ApiError && Array.isArray(err.details)) {
        const map: Record<string, string> = {};
        for (const detail of err.details as Array<{ path?: string; message?: string }>) {
          if (detail.path) map[detail.path] = detail.message ?? 'Invalid value';
        }
        setFieldErrors(map);
        setError(Object.keys(map).length > 0 ? 'Please fix the highlighted fields' : err.message);
      } else {
        setError(err instanceof ApiError ? err.message : 'Could not update account');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      <aside className="hidden w-60 flex-shrink-0 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900 md:block">
        <Link to="/admin" className="mb-8 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600">
            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-extrabold text-gray-900 dark:text-white">Admin</span>
        </Link>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-900">
          <div className="md:hidden">
            <Link to="/admin" className="font-extrabold text-gray-900 dark:text-white">
              Admin
            </Link>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-sm text-gray-500 dark:text-gray-400 sm:block">
              {user?.name}
            </span>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={openSettings}>
              Account settings
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-2 py-2 dark:border-gray-800 dark:bg-gray-900 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : 'text-gray-600 dark:text-gray-300'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Account settings"
      >
        <form onSubmit={saveSettings} className="space-y-4">
          <Input
            label="Name"
            type="text"
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
            placeholder="name@example.com"
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
            minLength={1}
            placeholder="Leave blank to keep your current password"
            error={fieldErrors.newPassword}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}
          <Button type="submit" isLoading={saving}>
            Save changes
          </Button>
        </form>
      </Modal>
    </div>
  );
}
