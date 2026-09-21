import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminCommentsApi, type CommentInput } from '../../api/comments';
import { ApiError } from '../../api/client';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useT } from '../../contexts/LanguageContext';
import type { Comment } from '../../types/comment';

interface RowState {
  name: string;
  location: string;
  quote: string;
  sortOrder: string;
  isActive: boolean;
}

function toRow(comment: Comment): RowState {
  return {
    name: comment.name,
    location: comment.location ?? '',
    quote: comment.quote,
    sortOrder: String(comment.sortOrder),
    isActive: comment.isActive,
  };
}

function CommentRow({
  comment,
  onSaved,
  onDeleted,
}: {
  comment: Comment;
  onSaved: (comment: Comment) => void;
  onDeleted: (id: string) => void;
}) {
  const [row, setRow] = useState<RowState>(toRow(comment));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setRow(toRow(comment));
  }, [comment]);

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const updated = await adminCommentsApi.update(comment.id, {
        name: row.name,
        location: row.location,
        quote: row.quote,
        sortOrder: Number(row.sortOrder) || 0,
        isActive: row.isActive,
      });
      onSaved(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await adminCommentsApi.remove(comment.id);
      onDeleted(comment.id);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete');
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Name"
          value={row.name}
          onChange={(event) => setRow({ ...row, name: event.target.value })}
        />
        <Input
          label="Location"
          value={row.location}
          onChange={(event) => setRow({ ...row, location: event.target.value })}
        />
      </div>
      <textarea
        value={row.quote}
        onChange={(event) => setRow({ ...row, quote: event.target.value })}
        rows={3}
        aria-label="Comment"
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
      />
      <div className="flex flex-wrap items-end gap-4">
        <div className="w-28">
          <Input
            label="Order"
            type="number"
            value={row.sortOrder}
            onChange={(event) => setRow({ ...row, sortOrder: event.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={row.isActive}
            onChange={(event) => setRow({ ...row, isActive: event.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          Visible on site
        </label>
        <div className="ml-auto flex gap-2">
          <Button size="sm" onClick={() => void save()} isLoading={saving} leftIcon={<Save className="h-4 w-4" />}>
            Save
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => void remove()}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Delete
          </Button>
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

const emptyForm: CommentInput = { name: '', location: '', quote: '', sortOrder: 0 };

export default function AdminComments() {
  const t = useT();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<CommentInput>(emptyForm);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminCommentsApi
      .list()
      .then(setComments)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load comments'))
      .finally(() => setLoading(false));
  }, []);

  const add = async (event: React.FormEvent) => {
    event.preventDefault();
    setCreating(true);
    setError('');
    try {
      const created = await adminCommentsApi.create(form);
      setComments((prev) => [...prev, created]);
      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not create comment');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-gray-900 dark:text-white">
          {t.testimonials.heading}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Reader comments shown on the home page as a scrolling loop. Add, edit, hide or delete them
          here.
        </p>
      </div>

      <form
        onSubmit={add}
        className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
      >
        <h2 className="font-semibold text-gray-900 dark:text-white">Add a comment</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <Input
            label="Location"
            value={form.location ?? ''}
            onChange={(event) => setForm({ ...form, location: event.target.value })}
          />
        </div>
        <textarea
          value={form.quote}
          onChange={(event) => setForm({ ...form, quote: event.target.value })}
          rows={3}
          placeholder="Comment text"
          aria-label="Comment text"
          required
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
        />
        <Button type="submit" isLoading={creating} leftIcon={<Plus className="h-4 w-4" />}>
          Add comment
        </Button>
      </form>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <div className="h-32 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-700" />
      ) : comments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-300 py-12 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
          No comments yet.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              onSaved={(updated) =>
                setComments((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
              }
              onDeleted={(id) => setComments((prev) => prev.filter((c) => c.id !== id))}
            />
          ))}
        </div>
      )}
    </div>
  );
}
