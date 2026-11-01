import { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { useBlog } from '../../context-api/blog-context/UseBlog';
import { blogImageUrl, isHtml } from '../blog/blogUtils';
import RichTextEditor from '../RichTextEditor';

// Older posts are plain text; turn their line breaks into paragraphs for the editor
const toEditorHtml = (content = '') => {
  if (!content || isHtml(content)) return content;
  const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return content.split(/\n{2,}/).map(block => `<p>${escape(block).replace(/\n/g, '<br>')}</p>`).join('');
};

// Suggested topics for a home, kitchen and gifting store; topics already used on posts are added too
const SUGGESTED_TOPICS = ['Business', 'Promotions', 'Gift ideas', 'Kitchen tips', 'Home & living', 'Store news'];

const inputClass = 'w-full px-4 py-3 rounded-xl border border-line bg-white text-ink placeholder:text-ink-soft/70 focus:outline-none focus:border-plum-400 focus:ring-4 focus:ring-plum-100 transition';

/**
 * Shared create/edit form for blog posts.
 * @param {{ initial?: object, existingImage?: string, submitLabel: string, busyLabel: string, onSubmit: (form) => Promise<void> }} props
 */
function BlogPostForm({ initial, existingImage, submitLabel, busyLabel, onSubmit }) {
  const { categories: usedTopics = [], loading, error, success } = useBlog();
  const [form, setForm] = useState({ title: '', content: '', categories: [], status: 'published', image: null, ...initial });
  const [preview, setPreview] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initial) setForm(f => ({ ...f, ...initial, content: toEditorHtml(initial.content) }));
  }, [initial]);

  // Free the object URL used for the preview
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  const topics = useMemo(
    () => [...new Set([...SUGGESTED_TOPICS, ...usedTopics, ...form.categories])],
    [usedTopics, form.categories]
  );

  const toggleTopic = (topic) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(topic) ? f.categories.filter(t => t !== topic) : [...f.categories, topic],
    }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm(f => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setForm(f => ({ ...f, image: null }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    await onSubmit(form);
  };

  const shownImage = preview || blogImageUrl(existingImage);

  return (
    <form onSubmit={handleSubmit} className="grid xl:grid-cols-[1fr_340px] gap-6 items-start">
      <div className="rounded-2xl border border-line bg-white p-5 md:p-6 space-y-5">
        <div>
          <label htmlFor="post-title" className="block text-sm font-medium text-ink mb-1.5">Title</label>
          <input id="post-title" type="text" name="title" value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            className={`${inputClass} text-lg font-semibold`} placeholder="A clear, catchy headline" required />
        </div>
        <div>
          <label htmlFor="post-content" className="block text-sm font-medium text-ink mb-1.5">Content</label>
          <RichTextEditor id="post-content" value={form.content} minHeight={340}
            onChange={html => setForm(f => ({ ...f, content: html }))}
            placeholder="Write your post. Use headings, lists and links to make it easy to read." />
        </div>
      </div>

      <div className="space-y-6 xl:sticky xl:top-24">
        <div className="rounded-2xl border border-line bg-white p-5 space-y-5">
          <div>
            <p className="text-sm font-medium text-ink mb-2">Status</p>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-cream p-1" role="radiogroup" aria-label="Status">
              {[['draft', 'Draft'], ['published', 'Published']].map(([value, label]) => (
                <button key={value} type="button" role="radio" aria-checked={form.status === value}
                  onClick={() => setForm(f => ({ ...f, status: value }))}
                  className={`rounded-lg py-2 text-sm font-semibold transition ${form.status === value ? 'bg-white text-ink shadow-sm' : 'text-ink-soft hover:text-ink'}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-soft">{form.status === 'draft' ? 'Only admins can see drafts.' : 'Visible on the public blog.'}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-2">Topics</p>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => {
                const on = form.categories.includes(topic);
                return (
                  <button key={topic} type="button" onClick={() => toggleTopic(topic)} aria-pressed={on}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? 'border-plum-600 bg-plum-600 text-white' : 'border-line text-ink hover:border-plum-300'}`}>
                    {topic}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-ink mb-2">Cover image</p>
            {shownImage ? (
              <div className="relative rounded-xl overflow-hidden border border-line">
                <img src={shownImage} alt="Cover preview" className="w-full aspect-[16/10] object-cover" />
                {preview && (
                  <button type="button" onClick={clearImage} aria-label="Remove new image"
                    className="absolute top-2 right-2 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/95 text-ink shadow hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
                <label className="absolute bottom-2 right-2 cursor-pointer rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink shadow hover:bg-white">
                  Change
                  <input type="file" accept="image/*" onChange={handleImage} className="sr-only" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-plum-200 bg-cream px-4 py-8 text-center cursor-pointer hover:bg-plum-50/60 transition">
                <ImagePlus className="w-6 h-6 text-plum-600" />
                <span className="text-sm font-semibold text-plum-700">Add a cover image</span>
                <span className="text-xs text-ink-soft">Shown on the blog and when shared</span>
                <input type="file" accept="image/*" onChange={handleImage} className="sr-only" />
              </label>
            )}
          </div>
        </div>

        <div aria-live="polite">
          {submitted && error && <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}
          {submitted && success && <p className="mb-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-800">{success}</p>}
        </div>
        <button type="submit" disabled={loading}
          className="w-full h-12 inline-flex items-center justify-center gap-2 rounded-full bg-plum-600 text-white font-semibold hover:bg-plum-700 transition disabled:opacity-60">
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? busyLabel : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default BlogPostForm;
