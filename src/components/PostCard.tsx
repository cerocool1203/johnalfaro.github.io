import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { PostData } from '@/lib/posts';
import { format, parseISO } from 'date-fns';

export function PostCard({ post }: { post: PostData }) {
    const dateFormatted = post.date ? format(parseISO(post.date), 'MMMM dd, yyyy') : '';

    return (
        <article className="group relative flex flex-col justify-between p-6 bg-card border border-border rounded-2xl transition-all hover:bg-zinc-900/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/ z-0">
            {post.coverImage && (
                <div className="relative w-full h-48 mb-4 rounded-xl overflow-hidden">
                    <img
                        src={post.coverImage}
                        alt={post.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                </div>
            )}
            <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Calendar size={14} />
                    <time dateTime={post.date}>{dateFormatted}</time>
                </div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors">
                    <Link href={`/posts/${post.slug}`}>
                        <span className="absolute inset-0 z-10" />
                        {post.title}
                    </Link>
                </h2>
                <p className="text-muted-foreground line-clamp-3 mb-4">
                    {post.excerpt}
                </p>
            </div>

            {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4 relative z-20">
                    {post.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded-full bg-zinc-800 text-zinc-300 pointer-events-none">
                            {tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center text-sm font-medium text-primary mt-auto">
                Read more <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
        </article>
    );
}
