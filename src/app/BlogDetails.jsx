import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRight, BookOpen, Check, Link2, MessageCircle } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { API_BASE_URL } from '../config/api';
import TopHeader from '../assets/components/TopHeader';
import MainHeader from '../assets/components/MainHeader';
import Footer from '../assets/components/Footer';
import PageHeader from '../assets/components/PageHeader';
import DOMPurify from 'dompurify';
import { blogImageUrl, cleanText, excerpt, isHtml, readingTime, formatPostDate } from '../assets/components/blog/blogUtils';

function BlogDetail() {
  const { id } = useParams();
  const [copied, setCopied] = useState(false);

  const { data: blog, isPending, isError } = useQuery({
    queryKey: ['blog-post', id],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/blog/${id}`)).data,
    retry: false,
  });

  const { data: morePosts = [] } = useQuery({
    queryKey: ['blog-posts', ''],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/blog`, { params: { status: 'published' } });
      return res.data.filter(post => post.status === 'published');
    },
    enabled: Boolean(blog),
  });
  const related = morePosts.filter(post => post._id !== id).slice(0, 3);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable; the address bar still has the link
    }
  };

  if (isPending) {
    return (
      <>
        <TopHeader />
        <MainHeader />
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-12 space-y-5" aria-busy="true" aria-label="Loading article">
          <div className="h-4 w-32 rounded bg-cream animate-pulse" />
          <div className="h-10 w-3/4 rounded bg-cream animate-pulse" />
          <div className="aspect-[16/9] rounded-3xl bg-cream animate-pulse" />
          <div className="h-40 rounded bg-cream animate-pulse" />
        </div>
        <Footer />
      </>
    );
  }

  // Drafts are only visible to admins; everyone else sees "not found"
  if (isError || !blog || (blog.status && blog.status !== 'published')) {
    return (
      <>
        <TopHeader />
        <MainHeader />
        <div className="max-w-xl mx-auto px-4 py-20 text-center">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-plum-50 text-plum-600 mb-4">
            <BookOpen className="w-7 h-7" strokeWidth={1.75} />
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">Article not found</h1>
          <p className="mt-2 text-ink-soft">This article doesn't exist or is no longer available.</p>
          <Link to="/app/blog" className="mt-6 inline-flex rounded-full bg-plum-600 px-6 py-3 text-sm font-semibold text-white hover:bg-plum-700 transition">
            Back to the blog
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const image = blogImageUrl(blog.image);
  const title = cleanText(blog.title);
  const whatsappShare = `https://wa.me/?text=${encodeURIComponent(`${title} ${pageUrl}`)}`;

  return (
    <>
      <Helmet>
        <title>{`${title} - Posh Choice Store`}</title>
        <meta name="description" content={excerpt(blog.content, 155)} />
      </Helmet>
      <TopHeader />
      <MainHeader />
      <main>
        <PageHeader crumbs={[{ label: 'Blog', to: '/app/blog' }, { label: title }]} />

        <article className="bg-white">
          <header className="max-w-3xl mx-auto px-4 md:px-6 pt-10 md:pt-14 text-center">
            {blog.categories?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {blog.categories.map(cat => (
                  <Link key={cat} to={`/app/blog?category=${encodeURIComponent(cat)}`} className="text-xs font-semibold uppercase tracking-[0.16em] text-gold hover:text-plum-700">
                    {cat}
                  </Link>
                ))}
              </div>
            )}
            <h1 className="font-display mt-4 text-3xl md:text-5xl font-semibold text-ink leading-[1.1]">{title}</h1>
            <p className="mt-5 text-sm text-ink-soft">
              {blog.author?.name ? `By ${blog.author.name} · ` : ''}{formatPostDate(blog)} · {readingTime(blog.content)} min read
            </p>
          </header>

          {image && (
            <div className="max-w-5xl mx-auto px-4 md:px-6 mt-10">
              <img src={image} alt="" className="w-full aspect-[16/9] object-cover rounded-3xl bg-cream" />
            </div>
          )}

          <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 md:py-14">
            {isHtml(blog.content) ? (
              <div className="rich-text text-[17px] leading-8" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(blog.content, { ADD_ATTR: ['target'] }) }} />
            ) : (
              <div className="text-[17px] leading-8 text-ink/90 whitespace-pre-line">{blog.content}</div>
            )}

            {/* Share */}
            <div className="mt-12 pt-6 border-t border-line flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm font-semibold text-ink">Share this article</p>
              <div className="flex gap-2">
                <a href={whatsappShare} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-[#25D366] hover:text-[#128C4A] transition">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <button type="button" onClick={copyLink}
                  className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-ink hover:border-plum-300 hover:text-plum-700 transition">
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Link2 className="w-4 h-4" />}
                  {copied ? 'Link copied' : 'Copy link'}
                </button>
              </div>
            </div>

            {/* Shop CTA */}
            <div className="mt-10 rounded-3xl bg-ink p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <p className="font-display text-xl md:text-2xl font-semibold text-white">Find it at Posh Choice</p>
                <p className="mt-1 text-sm text-white/70">Gift items, kitchenware and household essentials, delivered to you.</p>
              </div>
              <Link to="/app/shop" className="shrink-0 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink hover:bg-[#d6b25e] transition">
                Shop now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </article>

        {related.length > 0 && (
          <section className="bg-cream border-t border-line">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
              <div className="flex items-end justify-between gap-4 mb-8">
                <h2 className="font-display text-2xl md:text-3xl font-semibold text-ink">More from the blog</h2>
                <Link to="/app/blog" className="text-sm font-semibold text-plum-700 hover:text-plum-800">View all</Link>
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map(post => (
                  <li key={post._id}>
                    <Link to={`/app/blogdetails/${post._id}`} className="group block h-full rounded-3xl border border-line bg-white overflow-hidden hover:-translate-y-1 transition">
                      {blogImageUrl(post.image) && (
                        <div className="aspect-[16/10] overflow-hidden">
                          <img src={blogImageUrl(post.image)} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      )}
                      <div className="p-5">
                        <h3 className="font-display text-lg font-semibold text-ink leading-snug group-hover:text-plum-700 transition line-clamp-2">{cleanText(post.title)}</h3>
                        <p className="mt-2 text-xs text-ink-soft">{formatPostDate(post)} · {readingTime(post.content)} min read</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

export default BlogDetail;
