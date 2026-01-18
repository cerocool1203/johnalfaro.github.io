import Link from 'next/link';
import { getAllCategories } from '@/lib/posts';
import { Folder } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Categories | The Cloud Journey',
    description: 'Browse posts by categories',
};

export default function Categories() {
    const categories = getAllCategories();

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Categories
            </h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categories.map(([category, count]) => (
                    <Link
                        key={category}
                        href={`/categories/${category}`}
                        className="flex items-center justify-between p-4 rounded-xl bg-zinc-800/50 hover:bg-zinc-700 hover:text-white transition-all border border-white/5 group"
                    >
                        <div className="flex items-center gap-3">
                            <Folder size={20} className="text-primary group-hover:scale-110 transition-transform" />
                            <span className="font-medium">{category}</span>
                        </div>
                        <span className="text-muted-foreground text-sm px-2 py-0.5 rounded-md bg-white/5">
                            {count}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
