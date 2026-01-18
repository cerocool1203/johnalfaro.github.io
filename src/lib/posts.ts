import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
// import html from 'remark-html'; // Removed in favor of rehype
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import GithubSlugger from 'github-slugger';

const postsDirectory = path.join(process.cwd(), 'content/posts');

export interface PostData {
  slug: string;
  date: string;
  title: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  contentHtml?: string;
  categories?: string[];
  toc?: { level: number; text: string; id: string }[];
  [key: string]: any;
}

function isBadge(url: string) {
  return url.includes('buymeacoffee') || url.includes('img.shields.io') || url.includes('badge');
}

export function getSortedPostsData(): PostData[] {
  // Get file names under /posts
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames.map((fileName) => {
    // Remove ".md" from file name to get id
    const id = fileName.replace(/\.md$/, '');

    // Extract date from filename (YYYY-MM-DD-title)
    const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
    let date = '';
    let slug = id;

    if (match) {
      date = match[1];
      slug = match[2]; // Use the title part as slug
    }

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents);

    // Extract images from content to find a suitable cover image
    const imageMatches = [...fileContents.matchAll(/!\[.*?\]\((.*?)\)/g)];
    let contentImage = null;

    // Find the first image that isn't a badge/button
    for (const match of imageMatches) {
      const imageUrl = match[1];
      if (!imageUrl.includes('buymeacoffee') && !imageUrl.includes('img.shields.io') && !imageUrl.includes('badge')) {
        contentImage = imageUrl;
        break;
      }
    }

    // Combine the data with the id
    return {
      slug: id,
      date: date || (matterResult.data.date ? new Date(matterResult.data.date).toISOString().split('T')[0] : ''),
      title: matterResult.data.title,
      excerpt: matterResult.data.excerpt,
      // Prioritize explicit coverImage -> teaser (top or header) -> content image -> header image -> generic fallback
      coverImage: matterResult.data.coverImage || matterResult.data.teaser || matterResult.data.header?.teaser || contentImage || matterResult.data.header?.image || matterResult.data.image,
      tags: matterResult.data.tags,
      ...matterResult.data,
    } as PostData;
  });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();

    // Handle invalid dates (NaN)
    if (isNaN(dateA)) return 1;
    if (isNaN(dateB)) return -1;

    return dateB - dateA;
  });
}

export async function getPostData(slug: string) {
  // We need to find the file that matches the slug.
  const fileNames = fs.readdirSync(postsDirectory);
  const fileName = fileNames.find(fname => fname.replace(/\.md$/, '') === slug);

  if (!fileName) {
    throw new Error(`Post not found: ${slug}`);
  }

  const fullPath = path.join(postsDirectory, fileName);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Extract images from content to find a suitable cover image
  const imageMatches = [...fileContents.matchAll(/!\[.*?\]\((.*?)\)/g)];
  let contentImage = null;

  for (const match of imageMatches) {
    const imageUrl = match[1];
    if (!imageUrl.includes('buymeacoffee') && !imageUrl.includes('img.shields.io') && !imageUrl.includes('badge')) {
      contentImage = imageUrl;
      break;
    }
  }

  // Pre-process content to handle Jekyll Liquid syntax/Attributes
  let content = matterResult.content;

  // 1. Handle "Notice" blocks
  content = content.replace(/((?:>.*(?:\r?\n|$))+)\{:\s*\.(notice--[a-z]+)\}/g, (match, blockquoteContent, className) => {
    let cleanText = blockquoteContent.replace(/^>\s?/gm, '');
    // Parse basic markdown inside the notice header/body
    cleanText = cleanText
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

    return `<div class="${className}">${cleanText}</div>`;
  });

  // Handle image alignment classes
  content = content.replace(/!\[(.*?)\]\((.*?)\)\{:\s*\.(.*?)\}/g, (match, alt, url, classes) => {
    return `<img src="${url}" alt="${alt}" class="${classes}" />`;
  });

  // Remove other liquid tags like {% capture %} or {{ mynote }}
  content = content.replace(/\{% capture mynote%\}([\s\S]*?)\{% endcapture %\}/g, '$1');
  content = content.replace(/\{\{mynote\}\}\{:\s*\.(.*?)\}/g, '');
  content = content.replace(/\{% capture mynote%\}/g, '<div class="notice--info">');
  content = content.replace(/\{% endcapture %\}/g, '</div>');
  content = content.replace(/\{\{mynote\}\}\{:\s*\.notice--info\}/g, '');
  content = content.replace(/\{:\s*\.[a-z0-9-]+\}/g, '');

  // Extract TOC from content using AST (more robust)
  const headings: { level: number; text: string; id: string }[] = [];
  const slugger = new GithubSlugger();

  // Custom plugin to extract TOC
  const extractToc = () => {
    return (tree: any) => {
      visit(tree, 'heading', (node: any) => {
        const text = toString(node);
        const id = slugger.slug(text);
        headings.push({ level: node.depth, text, id });
      });
    };
  };

  // Use remark->rehype pipeline to convert markdown into HTML string
  const processedContent = await remark()
    .use(remarkGfm)
    .use(extractToc) // Extract TOC during processing
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: 'wrap' })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);

  const contentHtml = processedContent.toString();
  const toc = headings; // Assign extracted headings to toc variable

  const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.md$/);
  let date = '';

  if (match) {
    date = match[1];
  }

  // Destructure toc from data to avoid overwrite
  const { toc: frontmatterToc, ...metaData } = matterResult.data;

  return {
    slug,
    contentHtml,
    toc,
    date: date || (matterResult.data.date ? new Date(matterResult.data.date).toISOString().split('T')[0] : ''),
    title: matterResult.data.title,
    excerpt: matterResult.data.excerpt,
    coverImage:
      matterResult.data.coverImage ||
      (matterResult.data.header?.image && !isBadge(matterResult.data.header.image) ? matterResult.data.header.image : null) ||
      (matterResult.data.image && !isBadge(matterResult.data.image) ? matterResult.data.image : null) ||
      (contentImage && !isBadge(contentImage) ? contentImage : null) ||
      (matterResult.data.header?.teaser && !isBadge(matterResult.data.header.teaser) ? matterResult.data.header.teaser : null) ||
      (matterResult.data.teaser && !isBadge(matterResult.data.teaser) ? matterResult.data.teaser : null),
    tags: matterResult.data.tags,
    ...metaData,
  } as PostData;
}

export function getAllTags() {
  const posts = getSortedPostsData();
  const tags: Record<string, number> = {};
  posts.forEach((post) => {
    if (post.tags) {
      post.tags.forEach((tag) => {
        if (tags[tag]) {
          tags[tag]++;
        } else {
          tags[tag] = 1;
        }
      });
    }
  });
  // Sort by count descending
  return Object.entries(tags).sort((a, b) => b[1] - a[1]);
}

export function getAllCategories() {
  const posts = getSortedPostsData();
  const categories: Record<string, number> = {};
  posts.forEach((post) => {
    if (post.categories) {
      post.categories.forEach((category: string) => {
        if (categories[category]) {
          categories[category]++;
        } else {
          categories[category] = 1;
        }
      });
    }
  });
  return Object.entries(categories).sort((a, b) => b[1] - a[1]);
}

export function getPostsByTag(tag: string) {
  const posts = getSortedPostsData();
  return posts.filter((post) => post.tags && post.tags.includes(tag));
}

export function getPostsByCategory(category: string) {
  const posts = getSortedPostsData();
  return posts.filter((post) => post.categories && post.categories.includes(category));
}

export function getRelatedPosts(currentSlug: string, tags: string[] = [], limit: number = 3) {
  const posts = getSortedPostsData();

  // If no tags, just return recent posts excluding current one
  if (!tags || tags.length === 0) {
    return posts.filter(post => post.slug !== currentSlug).slice(0, limit);
  }

  // Calculate relevance score for each post
  const relatedPosts = posts
    .filter(post => post.slug !== currentSlug) // Exclude current post
    .map(post => {
      // intersection of tags
      const sharedTags = post.tags?.filter(tag => tags.includes(tag)) || [];
      return {
        ...post,
        sharedTagCount: sharedTags.length
      };
    })
    .filter(post => post.sharedTagCount > 0) // Must share at least one tag
    .sort((a, b) => {
      // Sort by number of shared tags (descending)
      if (b.sharedTagCount !== a.sharedTagCount) {
        return b.sharedTagCount - a.sharedTagCount;
      }
      // If same number of tags, sort by date (descending)
      return a.date < b.date ? 1 : -1;
    });

  // If we don't have enough related posts, fill with recent posts
  if (relatedPosts.length < limit) {
    const remainingCount = limit - relatedPosts.length;
    const existingSlugs = new Set([currentSlug, ...relatedPosts.map(p => p.slug)]);

    const fillerPosts = posts
      .filter(post => !existingSlugs.has(post.slug))
      .slice(0, remainingCount);

    return [...relatedPosts, ...fillerPosts];
  }

  return relatedPosts.slice(0, limit);
}
