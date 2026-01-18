import Link from 'next/link';
import { getAllTags } from '@/lib/posts';
import { Tag } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tags | The Cloud Journey',
    description: 'Browse posts by tags',
};

export default function Tags() {
    const tags = getAllTags();

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                Tags
            </h1>

            <div className="flex flex-wrap gap-4">
                {tags.map(([tag, count]) => (
                    <Link
                        key={tag}
                        href={`/tags/${tag}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 hover:bg-zinc-700 hover:text-white transition-colors border border-white/5"
                    >
                        <Tag size={16} className="text-primary" />
                        <span className="font-medium">{tag}</span>
                        <span className="text-muted-foreground text-sm ml-1">({count})</span>
                    </Link>
                ))}
            </div>
        </div>
    );
}
