import { getPostsByTag, getAllTags } from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import { notFound } from 'next/navigation';
import { Tag } from 'lucide-react';
import { Metadata } from 'next';

export async function generateStaticParams() {
    const tags = getAllTags();
    return tags.map(([tag]) => ({
        tag: tag,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);
    return {
        title: `${decodedTag} | The Cloud Journey`,
        description: `Posts tagged with ${decodedTag}`,
    };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = await params;
    const decodedTag = decodeURIComponent(tag);
    const posts = getPostsByTag(decodedTag);

    if (posts.length === 0) {
        notFound();
    }

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-8">
                <Tag size={32} className="text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                    Tag: {decodedTag}
                </h1>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                ))}
            </div>
        </section>
    );
}
