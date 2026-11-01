import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Helmet } from 'react-helmet';
import { API_BASE_URL } from '../config/api';
import TopHeader from '../assets/components/TopHeader';
import MainHeader from '../assets/components/MainHeader';
import Footer from '../assets/components/Footer';
import PageHeader from '../assets/components/PageHeader';
import { blogImageUrl, cleanText, excerpt, readingTime, formatPostDate } from '../assets/components/blog/blogUtils';

const chipClass = (active) =>
  `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
    active ? 'border-plum-600 bg-plum-600 text-white' : 'border-line bg-white text-ink hover:border-plum-300 hover:text-plum-700'
  }`;

function PostImage({ post, featured }) {
  const src = blogImageUrl(post.image);
  if (src) {
    return <img src={src} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />;
  }
  // Branded cover for posts without an image
  return (
    <div className="relative w-full h-full overflow-hidden bg-gradient-to-br from-plum-700 via-plum-900 to-ink flex flex-col justify-between p-5 md:p-7">
      <div aria-hidden="true" className="absolute -right-10 -bottom-12 w-48 h-48 rounded-full bg-gold/25 blur-2xl transition-transform duration-500 group-hover:scale-125" />
      <span className="relative font-display text-white/90 text-lg">Posh Choice<span className="text-gold">.</span></span>
      <span className={`relative font-display text-gold-soft leading-tight ${featured ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>
        {post.categories?.[0] || 'Journal'}
      </span>
    </div>
  );
}

function PostMeta({ post }) {
  return (
    <p className="text-xs text-ink-soft">
      {formatPostDate(post)} · {readingTime(post.content)} min read
    </p>
  );
}

function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';

  const { data: categories = [] } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => (await axios.get(`${API_BASE_URL}/blog/categories`)).data,
  });

  // Only published posts are shown publicly (also when an admin is signed in)
  const { data: posts = [], isPending, isError } = useQuery({
    queryKey: ['blog-posts', selectedCategory],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/blog`, {
        params: { status: 'published', category: selectedCategory || undefined },
      });
      return res.data.filter(post => post.status === 'published');
    },
  });

  const [featured, ...rest] = posts;

  return (
    <>
      <Helmet>
        <title>Blog - Posh Choice Store</title>
        <meta name="description" content="Gift ideas, kitchen tips and home inspiration from the Posh Choice Store team." />
      </Helmet>
      <TopHeader />
      <MainHeader />
      <main>
        <PageHeader
          title="The Posh Choice blog"
          subtitle="Gift ideas, kitchen tips and inspiration for your home and events."
          crumbs={[{ label: 'Blog' }]}
        />

        <section className="bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
            {categories.length > 0 && (
              <div className="mb-8 flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap" role="group" aria-label="Filter by topic">
                <button type="button" className={chipClass(!selectedCategory)} onClick={() => setSearchParams({})}>All posts</button>
                {categories.map(cat => (
                  <button key={cat} type="button" className={chipClass(selectedCategory === cat)} aria-pressed={selectedCategory === cat}
                    onClick={() => setSearchParams({ category: cat })}>
                    {cat}
                  </button>
                ))}
              </div>
            )}

            {isPending ? (
              <div className="grid md:grid-cols-3 gap-6" aria-busy="true">
                <div className="md:col-span-3 h-80 rounded-3xl bg-cream animate-pulse" />
                {[0, 1, 2].map(i => <div key={i} className="h-72 rounded-3xl bg-cream animate-pulse" />)}
              </div>
            ) : isError || posts.length === 0 ? (
              <div className="flex flex-col items-center text-center py-16 px-4 rounded-3xl border border-dashed border-line bg-cream">
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-plum-50 text-plum-600 mb-4">
                  <BookOpen className="w-7 h-7" strokeWidth={1.75} />
                </span>
                <h2 className="font-display text-xl font-semibold text-ink">
                  {isError ? "We couldn't load the blog" : 'No posts yet'}
                </h2>
                <p className="mt-2 text-sm text-ink-soft max-w-sm">
                  {isError ? 'Please refresh the page or try again later.' : selectedCategory ? `There are no posts in ${selectedCategory} yet.` : 'New articles are on the way. Check back soon.'}
                </p>
                <Link to="/app/shop" className="mt-5 rounded-full bg-plum-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-plum-700 transition">Browse the shop</Link>
              </div>
            ) : (
              <>
                {/* Featured (latest) post */}
                <Link to={`/app/blogdetails/${featured._id}`} className="group grid md:grid-cols-2 rounded-3xl border border-line overflow-hidden bg-white hover:shadow-[0_16px_40px_-20px_rgba(15,27,61,0.3)] transition">
                  <div className="aspect-[16/10] md:aspect-auto md:min-h-80 overflow-hidden bg-cream">
                    <PostImage post={featured} featured />
                  </div>
                  <div className="p-6 md:p-10 flex flex-col justify-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
                      Latest{featured.categories?.[0] ? ` · ${featured.categories[0]}` : ''}
                    </p>
                    <h2 className="font-display mt-3 text-2xl md:text-3xl font-semibold text-ink leading-tight group-hover:text-plum-700 transition">
                      {cleanText(featured.title)}
                    </h2>
                    <p className="mt-3 text-ink-soft leading-relaxed">{excerpt(featured.content, 220)}</p>
                    <div className="mt-5 flex items-center justify-between gap-4">
                      <PostMeta post={featured} />
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-plum-700">
                        Read article <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Link>

                {rest.length > 0 && (
                  <ul className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rest.map(post => (
                      <li key={post._id}>
                        <Link to={`/app/blogdetails/${post._id}`} className="group flex flex-col h-full rounded-3xl border border-line overflow-hidden bg-white hover:-translate-y-1 hover:shadow-[0_16px_40px_-20px_rgba(15,27,61,0.3)] transition">
                          <div className="aspect-[16/10] overflow-hidden bg-cream">
                            <PostImage post={post} />
                          </div>
                          <div className="flex flex-col flex-1 p-5">
                            {post.categories?.[0] && (
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">{post.categories[0]}</p>
                            )}
                            <h3 className="font-display mt-2 text-xl font-semibold text-ink leading-snug group-hover:text-plum-700 transition line-clamp-2">
                              {cleanText(post.title)}
                            </h3>
                            <p className="mt-2 text-sm text-ink-soft leading-relaxed line-clamp-3">{excerpt(post.content)}</p>
                            <div className="mt-auto pt-4">
                              <PostMeta post={post} />
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Blog;
