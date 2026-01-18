import { getPostData, getSortedPostsData, getRelatedPosts } from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import { notFound } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import { Calendar, User, Tag, Laptop, ChartLine, List } from 'lucide-react';
import Link from 'next/link';
import { Metadata } from 'next';

export async function generateStaticParams() {
    const posts = getSortedPostsData();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const post = await getPostData(slug);
        return {
            title: `${post.title} | The Cloud Journey`,
            description: post.excerpt,
        };
    } catch {
        return {
            title: 'Post Not Found',
        };
    }
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let post;
    try {
        post = await getPostData(slug);
        if (!post) {
            notFound();
        }
    } catch {
        notFound();
    }

    const dateFormatted = post.date ? format(parseISO(post.date), 'MMMM dd, yyyy') : '';

    const hasCover = !!post.coverImage;

    return (
        <article className="min-h-screen bg-black/20">
            {/* Full Width Hero / Header */}
            {hasCover ? (
                <div className="relative w-full h-[50vh] md:h-[60vh] min-h-[400px]">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-black/60 to-black/30" />

                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                        <div className="container mx-auto max-w-4xl">
                            <div className="flex items-center gap-4 text-sm text-zinc-300 mb-4 font-medium">
                                <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                    <Calendar size={14} />
                                    <time dateTime={post.date}>{dateFormatted}</time>
                                </div>
                                {post.author && (
                                    <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md border border-white/10">
                                        <User size={14} />
                                        <span>{post.author}</span>
                                    </div>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 text-white drop-shadow-lg leading-tight">
                                {post.title}
                            </h1>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl text-center">
                    <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground mb-6">
                        <time className="flex items-center gap-1"><Calendar size={14} /> {dateFormatted}</time>
                        {post.author && <span className="flex items-center gap-1"><User size={14} /> {post.author}</span>}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                        {post.title}
                    </h1>
                </div>
            )}

            {/* Main Content Grid */}
            <div className="container mx-auto px-4 py-12 max-w-6xl">
                <div className={`grid grid-cols-1 ${post.toc && post.toc.length > 0 ? 'lg:grid-cols-[1fr_300px]' : ''} gap-12`}>
                    <main className={!post.toc || post.toc.length === 0 ? 'max-w-4xl mx-auto w-full' : ''}>
                        {/* Inline TOC (Visible) */}
                        {post.toc && post.toc.length > 0 && (
                            <div className="mb-10 p-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-sm lg:hidden">
                                <h3 className="text-lg font-bold text-white mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
                                    {post.toc_icon === 'laptop-code' && <Laptop size={20} />}
                                    {post.toc_icon === 'chart-line' && <ChartLine size={20} />}
                                    {!['laptop-code', 'chart-line'].includes(post.toc_icon) && <List size={20} />}
                                    {post.toc_label || 'Table of Contents'}
                                </h3>
                                <nav className="flex flex-col gap-2">
                                    {post.toc.filter(item => item.level <= 4).map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className="text-zinc-400 hover:text-cyan-400 transition-colors text-sm font-medium block"
                                            style={{ marginLeft: `${Math.max(0, item.level - 2) * 16}px` }}
                                        >
                                            {item.text}
                                        </a>
                                    ))}
                                </nav>
                            </div>
                        )}

                        <div
                            className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-zinc-300 prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-img:rounded-xl prose-img:shadow-lg"
                            dangerouslySetInnerHTML={{ __html: post.contentHtml || '' }}
                        />
                    </main>

                    {/* Sidebar TOC (Desktop Sticky) */}
                    {post.toc && post.toc.length > 0 && (
                        <aside className="hidden lg:block">
                            <div className="sticky top-24">
                                <div className="p-6 rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm">
                                    <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        {post.toc_icon === 'laptop-code' && <Laptop size={16} />}
                                        {post.toc_icon === 'chart-line' && <ChartLine size={16} />}
                                        {!['laptop-code', 'chart-line'].includes(post.toc_icon) && <List size={16} />}
                                        {post.toc_label || 'On this page'}
                                    </h3>
                                    <nav className="flex flex-col gap-3">
                                        {post.toc.filter(item => item.level <= 4).map((item) => (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                className={`text-sm transition-colors block leading-snug ${item.level === 2 ? 'text-zinc-300 hover:text-white font-medium' : 'text-zinc-500 hover:text-zinc-300 pl-3'
                                                    }`}
                                            >
                                                {item.text}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            </div>
                        </aside>
                    )}
                </div>

                {/* Footer / Tags */}
                <div className="mt-20 pt-10 border-t border-white/10">
                    {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-8">
                            {post.tags.map((tag: string) => (
                                <span key={tag} className="flex items-center gap-1 text-sm px-4 py-1.5 rounded-full bg-zinc-800 text-zinc-300 border border-white/5">
                                    <Tag size={12} /> {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Related Posts Section */}
                <div className="mt-16 mb-12">
                    <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-2">
                        You May Also Like <span className="text-xl">☕️</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* We need to fetch related posts. Since getRelatedPosts is async/server-side compatible, we can call it here */}
                        {(() => {
                            const relatedPosts = getRelatedPosts(slug, post.tags);
                            return relatedPosts.map((relatedPost) => (
                                <PostCard key={relatedPost.slug} post={relatedPost} />
                            ));
                        })()}
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8">
                    <Link href="/" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                        &larr; Back to all posts
                    </Link>
                </div>
            </div>
        </article>
    );
}
