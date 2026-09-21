import { useCallback, useEffect, useState } from 'react';
import { adminCategoriesApi } from '../../api/categories';
import { ApiError } from '../../api/client';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input, { Textarea } from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Modal from '../../components/ui/Modal';
import type { Category } from '../../types/category';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    adminCategoriesApi
      .list()
      .then(setCategories)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load categories'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setName('');
    setDescription('');
    setError('');
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setName(category.name);
    setDescription(category.description ?? '');
    setError('');
    setModalOpen(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await adminCategoriesApi.update(editing.id, { name, description });
      } else {
        await adminCategoriesApi.create({ name, description });
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the category');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (category: Category) => {
    if (!window.confirm(`Delete "${category.name}"?`)) return;
    setError('');
    try {
      await adminCategoriesApi.remove(category.id);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not delete the category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Categories</h1>
        <Button onClick={openCreate}>Add category</Button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Books</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{category.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{category.description ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{category.bookCount}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(category)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => remove(category)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit category' : 'New category'}
      >
        <form onSubmit={save} className="space-y-4">
          <Input label="Name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Textarea
            label="Description"
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" isLoading={saving}>
            {editing ? 'Save' : 'Create'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
