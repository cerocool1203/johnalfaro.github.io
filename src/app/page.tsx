import { getSortedPostsData } from "@/lib/posts";
import { PostCard } from "@/components/PostCard";
import { Hero } from "@/components/Hero";

export default function Home() {
  const posts = getSortedPostsData();

  return (
    <>
      <Hero latestPostSlug={posts[0]?.slug} />
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">Latest Posts</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
