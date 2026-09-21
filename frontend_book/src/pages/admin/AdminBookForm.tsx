import { ArrowDown, ArrowUp } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminBooksApi } from '../../api/books';
import { adminCategoriesApi } from '../../api/categories';
import { ApiError } from '../../api/client';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input, { Select, Textarea } from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import type { BookImage } from '../../types/book';
import type { Category } from '../../types/category';
import { getImageUrl } from '../../utils/helpers';

interface FormState {
  title: string;
  author: string;
  categoryId: string;
  price: string;
  description: string;
  language: string;
  pages: string;
  publisher: string;
  format: string;
  rating: string;
  googleDriveUrl: string;
  isEbook: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isActive: boolean;
}

const emptyForm: FormState = {
  title: '',
  author: '',
  categoryId: '',
  price: '',
  description: '',
  language: 'English',
  pages: '',
  publisher: '',
  format: 'PDF',
  rating: '',
  googleDriveUrl: '',
  isEbook: false,
  isFeatured: false,
  isBestSeller: false,
  isActive: true,
};

export default function AdminBookForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [images, setImages] = useState<BookImage[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadBook = useCallback(async () => {
    if (!id) return;
    const book = await adminBooksApi.get(id);
    setForm({
      title: book.title,
      author: book.author,
      categoryId: book.categoryId,
      price: String(book.price),
      description: book.description ?? '',
      language: book.language,
      pages: book.pages == null ? '' : String(book.pages),
      publisher: book.publisher ?? '',
      format: book.format,
      rating: book.rating == null ? '' : String(book.rating),
      googleDriveUrl: book.googleDriveUrl ?? '',
      isEbook: book.isEbook,
      isFeatured: book.isFeatured,
      isBestSeller: book.isBestSeller,
      isActive: book.isActive,
    });
    setImages(book.images);
  }, [id]);

  useEffect(() => {
    adminCategoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    loadBook()
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not load the book'))
      .finally(() => setLoading(false));
  }, [isEdit, loadBook]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      categoryId: form.categoryId,
      price: Number(form.price),
      description: form.description.trim() || undefined,
      language: form.language.trim() || undefined,
      pages: form.pages.trim() === '' ? undefined : Number(form.pages),
      publisher: form.publisher.trim(),
      format: form.format.trim() || undefined,
      rating: form.rating.trim() === '' ? undefined : Number(form.rating),
      googleDriveUrl: form.googleDriveUrl.trim() || '',
      isEbook: form.isEbook,
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      isActive: form.isActive,
    };

    try {
      if (isEdit && id) {
        await adminBooksApi.update(id, payload);
        setSuccess('Book updated');
      } else {
        const created = await adminBooksApi.create(payload);
        navigate(`/admin/books/${created.id}/edit`, { replace: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save the book');
    } finally {
      setSaving(false);
    }
  };

  const uploadFiles = async (files: FileList | File[]) => {
    if (!id) return;
    const list = Array.from(files);
    if (list.length === 0) return;
    setError('');
    setUploading(true);
    try {
      const created = await adminBooksApi.uploadImages(id, list);
      setImages((previous) => [...previous, ...created]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = async (imageId: string) => {
    if (!id) return;
    try {
      await adminBooksApi.deleteImage(id, imageId);
      setImages((previous) => previous.filter((image) => image.id !== imageId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not remove the image');
    }
  };

  const setPrimary = async (imageId: string) => {
    if (!id) return;
    try {
      await adminBooksApi.setPrimaryImage(id, imageId);
      setImages((previous) => previous.map((image) => ({ ...image, isPrimary: image.id === imageId })));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not set the primary image');
    }
  };

  const moveImage = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(index, 1);
    if (!moved) return;
    reordered.splice(target, 0, moved);
    const withOrder = reordered.map((image, position) => ({ ...image, sortOrder: position }));
    setImages(withOrder);
    if (id) {
      try {
        await adminBooksApi.reorderImages(
          id,
          withOrder.map((image) => ({ id: image.id, sortOrder: image.sortOrder }))
        );
      } catch (err) {
        setError(err instanceof ApiError ? err.message : 'Could not reorder images');
      }
    }
  };

  if (loading) return <LoadingSpinner size="lg" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? 'Edit book' : 'New book'}
        </h1>
        <Link to="/admin/books" className="text-sm text-blue-600 hover:underline">
          Back to books
        </Link>
      </div>

      <Card className="p-6">
        <form onSubmit={save} className="space-y-4">
          <Input
            label="Title"
            value={form.title}
            onChange={(event) => setField('title', event.target.value)}
            required
          />
          <Input
            label="Author"
            value={form.author}
            onChange={(event) => setField('author', event.target.value)}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Category"
              value={form.categoryId}
              onChange={(event) => setField('categoryId', event.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Input
              label="Price (TZS)"
              type="number"
              min={0}
              value={form.price}
              onChange={(event) => setField('price', event.target.value)}
              required
            />
          </div>
          <Textarea
            label="Description"
            rows={5}
            value={form.description}
            onChange={(event) => setField('description', event.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Language"
              value={form.language}
              onChange={(event) => setField('language', event.target.value)}
              placeholder="English"
            />
            <Input
              label="Format"
              value={form.format}
              onChange={(event) => setField('format', event.target.value)}
              placeholder="PDF"
            />
            <Input
              label="Pages"
              type="number"
              min={0}
              value={form.pages}
              onChange={(event) => setField('pages', event.target.value)}
              placeholder="e.g. 240"
            />
            <Input
              label="Rating (0-5)"
              type="number"
              min={0}
              max={5}
              step="0.1"
              value={form.rating}
              onChange={(event) => setField('rating', event.target.value)}
              placeholder="e.g. 4.5"
            />
            <Input
              label="Publisher"
              value={form.publisher}
              onChange={(event) => setField('publisher', event.target.value)}
              placeholder="Publisher name"
              className="sm:col-span-2"
            />
          </div>

          <Input
            label="Google Drive URL"
            value={form.googleDriveUrl}
            onChange={(event) => setField('googleDriveUrl', event.target.value)}
            placeholder="https://drive.google.com/file/d/..."
          />
          <p className="-mt-2 text-xs text-gray-500 dark:text-gray-400">
            Hidden from the public. Only revealed after a verified payment.
          </p>
          <fieldset className="grid gap-3 rounded-lg border border-gray-200 p-4 sm:grid-cols-2 dark:border-gray-700">
            <legend className="px-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Visibility &amp; placement
            </legend>
            {(
              [
                { key: 'isActive', label: 'Active (visible to the public)' },
                { key: 'isEbook', label: 'E-book (downloadable)' },
                { key: 'isFeatured', label: 'Featured (home E-Books section)' },
                { key: 'isBestSeller', label: 'Best Seller (home & Best Sellers page)' },
              ] as const
            ).map((item) => (
              <label
                key={item.key}
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <input
                  type="checkbox"
                  checked={form[item.key]}
                  onChange={(event) => setField(item.key, event.target.checked)}
                  className="h-4 w-4 rounded border-gray-300"
                />
                {item.label}
              </label>
            ))}
          </fieldset>

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex gap-3">
            <Button type="submit" isLoading={saving}>
              {isEdit ? 'Save changes' : 'Create book'}
            </Button>
            <Link to="/admin/books">
              <Button type="button" variant="ghost">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">Cover images</h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Upload one or more images (JPEG, PNG, WebP — max 5 MB each).
        </p>

        {!isEdit ? (
          <p className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
            Save the book first, then you can upload cover images.
          </p>
        ) : (
          <>
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragActive(false);
                void uploadFiles(event.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) void uploadFiles(event.target.files);
                }}
              />
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {uploading ? 'Uploading…' : 'Drag and drop images here, or click to select'}
              </p>
            </div>

            {images.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-700">
                      <img src={getImageUrl(image.path)} alt="" className="h-full w-full object-cover" />
                      {image.isPrimary && (
                        <span className="absolute left-2 top-2 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 p-2">
                      <div className="flex justify-between gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={index === 0}
                          onClick={() => void moveImage(index, -1)}
                          aria-label="Move image up"
                        >
                          <ArrowUp className="h-4 w-4" aria-hidden="true" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={index === images.length - 1}
                          onClick={() => void moveImage(index, 1)}
                          aria-label="Move image down"
                        >
                          <ArrowDown className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        {!image.isPrimary && (
                          <Button size="sm" variant="outline" onClick={() => void setPrimary(image.id)}>
                            Primary
                          </Button>
                        )}
                        <Button size="sm" variant="danger" onClick={() => void removeImage(image.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
