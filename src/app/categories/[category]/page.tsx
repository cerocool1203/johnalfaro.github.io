import { getPostsByCategory, getAllCategories } from '@/lib/posts';
import { PostCard } from '@/components/PostCard';
import { notFound } from 'next/navigation';
import { Folder } from 'lucide-react';
import { Metadata } from 'next';

export async function generateStaticParams() {
    const categories = getAllCategories();
    return categories.map(([category]) => ({
        category: category,
    }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    return {
        title: `${decodedCategory} | The Cloud Journey`,
        description: `Posts in category ${decodedCategory}`,
    };
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    const posts = getPostsByCategory(decodedCategory);

    if (posts.length === 0) {
        notFound();
    }

    return (
        <section className="container mx-auto px-4 py-12">
            <div className="flex items-center gap-3 mb-8">
                <Folder size={32} className="text-primary" />
                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                    Category: {decodedCategory}
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
