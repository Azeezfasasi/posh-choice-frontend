import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import axios from 'axios';
import { AlertTriangle, Check, ExternalLink, FolderPlus, ImageIcon, Pencil, Search, Trash2, X } from 'lucide-react';
import { useProduct } from '../../context-api/product-context/UseProduct';
import { API_BASE_URL } from '../../../config/api';

// `parent` comes back populated ({ _id, name }) or as a plain id
const parentId = (cat) => (cat.parent ? String(cat.parent._id || cat.parent) : null);

function DeleteDialog({ category, onCancel, onConfirm, busy }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-labelledby="delete-title">
      <button type="button" className="absolute inset-0 bg-ink/40 backdrop-blur-sm" aria-label="Cancel" onClick={onCancel} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-red-50 text-red-600">
          <AlertTriangle className="w-5 h-5" />
        </span>
        <h3 id="delete-title" className="mt-4 font-sans text-lg font-semibold text-ink">Delete "{category.name}"?</h3>
        <p className="mt-1 text-sm text-ink-soft">This removes the category and its image. It can't be undone.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink hover:bg-cream">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            {busy ? 'Deleting…' : 'Delete category'}
          </button>
        </div>
      </div>
    </div>
  );
}

const CategoryList = () => {
  const { categories, fetchCategories, deleteCategory, loading, error, success } = useProduct();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | hidden
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show the latest success/error from the context briefly
  useEffect(() => {
    if (!success && !error) return undefined;
    setShowMessage(true);
    const t = setTimeout(() => setShowMessage(false), 4000);
    return () => clearTimeout(t);
  }, [success, error]);

  // Product count per category (uses the API's total; admins see all statuses)
  const counts = useQueries({
    queries: categories.map(cat => ({
      queryKey: ['admin', 'categoryProductCount', cat._id],
      queryFn: async () => (await axios.get(`${API_BASE_URL}/products`, { params: { category: cat._id, limit: 1 } })).data.totalProducts || 0,
      staleTime: 60 * 1000,
    })),
  });
  const productCount = (cat) => counts[categories.indexOf(cat)]?.data;

  const childrenOf = useMemo(() => {
    const map = {};
    categories.forEach(cat => {
      const p = parentId(cat);
      if (p) (map[p] = map[p] || []).push(cat);
    });
    return map;
  }, [categories]);

  const visible = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return categories
      .filter(cat => (term ? true : !parentId(cat))) // when searching, include subcategories too
      .filter(cat => !term || cat.name.toLowerCase().includes(term) || (cat.description || '').toLowerCase().includes(term))
      .filter(cat => filter === 'all' || (filter === 'active' ? cat.isActive !== false : cat.isActive === false));
  }, [categories, searchTerm, filter]);

  const activeCount = categories.filter(c => c.isActive !== false).length;

  const confirmDelete = async () => {
    setDeleting(true);
    await deleteCategory(toDelete._id);
    setDeleting(false);
    setToDelete(null);
  };

  const filterButton = (value, label, count) => (
    <button key={value} type="button" onClick={() => setFilter(value)} aria-pressed={filter === value}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
        filter === value ? 'border-plum-600 bg-plum-600 text-white' : 'border-line bg-white text-ink hover:border-plum-300'}`}>
      {label}
      <span className={`rounded-full px-1.5 text-xs font-semibold ${filter === value ? 'bg-white/20' : 'bg-cream text-ink-soft'}`}>{count}</span>
    </button>
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {filterButton('all', 'All', categories.length)}
          {filterButton('active', 'Active', activeCount)}
          {filterButton('hidden', 'Hidden', categories.length - activeCount)}
        </div>
        <div className="flex gap-3 lg:ml-auto">
          <div className="relative flex-1 lg:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-soft pointer-events-none" />
            <input type="search" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search categories"
              aria-label="Search categories" className="w-full h-10 pl-10 pr-3 rounded-full border border-line bg-white text-sm" />
          </div>
          <Link to="/app/addproductcategory" className="shrink-0 inline-flex items-center gap-2 h-10 rounded-full bg-plum-600 px-5 text-sm font-semibold text-white hover:bg-plum-700">
            <FolderPlus className="w-4 h-4" /> <span className="hidden sm:inline">New category</span><span className="sm:hidden">New</span>
          </Link>
        </div>
      </div>

      {showMessage && (error || success) && (
        <div role="status" className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${error ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-800'}`}>
          {error ? <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /> : <Check className="w-4 h-4 mt-0.5 shrink-0" />}
          <span className="flex-1">{error || success}</span>
          <button type="button" onClick={() => setShowMessage(false)} aria-label="Dismiss"><X className="w-4 h-4" /></button>
        </div>
      )}

      {loading && categories.length === 0 ? (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-white border border-line animate-pulse" />)}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white py-14 text-center">
          <p className="font-semibold text-ink">{searchTerm ? `No categories match "${searchTerm}"` : 'No categories yet'}</p>
          {!searchTerm && (
            <Link to="/app/addproductcategory" className="mt-4 inline-flex rounded-full bg-plum-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-plum-700">Create your first category</Link>
          )}
        </div>
      ) : (
        <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map(cat => {
            const count = productCount(cat);
            const kids = childrenOf[cat._id] || [];
            const parent = parentId(cat) ? categories.find(c => c._id === parentId(cat)) : null;
            const hidden = cat.isActive === false;
            const deleteBlocked = (count ?? 0) > 0 || kids.length > 0;
            return (
              <li key={cat._id} className="min-w-0 flex flex-col rounded-2xl border border-line bg-white p-4">
                <div className="flex gap-4">
                  <span className="shrink-0 w-16 h-16 rounded-2xl bg-cream border border-line overflow-hidden flex items-center justify-center">
                    {cat.image && !cat.image.startsWith('/placehold')
                      ? <img src={cat.image} alt="" className="w-full h-full object-cover" loading="lazy" />
                      : <ImageIcon className="w-6 h-6 text-ink-soft/60" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-sans text-base font-semibold text-ink leading-snug">{cat.name}</h3>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${
                        hidden ? 'bg-slate-100 text-slate-700 ring-slate-200' : 'bg-emerald-50 text-emerald-800 ring-emerald-200'}`}>
                        {hidden ? 'Hidden' : 'Active'}
                      </span>
                    </div>
                    {parent && <p className="text-xs text-ink-soft">in {parent.name}</p>}
                    <p className="mt-1 text-sm text-ink-soft">
                      {count === undefined ? <span className="inline-block h-3 w-16 rounded bg-cream animate-pulse align-middle" /> : `${count} product${count === 1 ? '' : 's'}`}
                    </p>
                  </div>
                </div>

                {cat.description && <p className="mt-3 text-sm text-ink-soft line-clamp-2">{cat.description}</p>}

                {kids.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {kids.map(k => (
                      <Link key={k._id} to={`/app/editproductcategories/${k._id}`} className="rounded-full bg-plum-50 px-2.5 py-1 text-xs font-medium text-plum-700 hover:bg-plum-100">{k.name}</Link>
                    ))}
                  </div>
                )}

                <div className="mt-auto pt-4 flex items-center gap-2">
                  <Link to={`/app/editproductcategories/${cat._id}`} className="inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink hover:bg-cream">
                    <Pencil className="w-4 h-4" /> Edit
                  </Link>
                  {!hidden && (
                    <Link to={`/app/shop?category=${cat.slug}`} target="_blank" title="View in shop" aria-label={`View ${cat.name} in the shop`}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink-soft hover:bg-cream hover:text-ink">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <button type="button" onClick={() => setToDelete(cat)} disabled={deleteBlocked}
                    title={deleteBlocked ? 'Move or delete its products and subcategories first' : 'Delete category'}
                    aria-label={`Delete ${cat.name}`}
                    className="ml-auto inline-flex items-center justify-center w-9 h-9 rounded-full text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-ink-soft disabled:cursor-not-allowed">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {toDelete && <DeleteDialog category={toDelete} busy={deleting} onCancel={() => setToDelete(null)} onConfirm={confirmDelete} />}
    </div>
  );
};

export default CategoryList;
