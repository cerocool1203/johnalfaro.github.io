const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const POSTS_DIR = path.join(__dirname, '../content/posts');

// Helper to slugify title
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
        .replace(/^-+/, '')       // Trim - from start of text
        .replace(/-+$/, '');      // Trim - from end of text
}

// Get today's date YYYY-MM-DD
function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function createPost(title, tags, categories) {
    const date = getTodayDate();
    const slug = slugify(title);
    const filename = `${date}-${slug}.md`;
    const filePath = path.join(POSTS_DIR, filename);

    if (fs.existsSync(filePath)) {
        console.error(`\n❌ Error: File '${filename}' already exists!`);
        rl.close();
        return;
    }

    const tagList = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : ['Blog'];
    const categoryList = categories ? categories.split(',').map(c => c.trim()).filter(Boolean) : ['Blog'];

    const frontmatter = `---
layout: single
title: "${title}"
date: ${date}
excerpt: "Enter your excerpt here..."
header:
  teaser: /assets/images/splash.jpg
  image: /assets/images/splash.jpg
  caption: "Photo credit"
categories:
${categoryList.map(c => `  - ${c}`).join('\n')}
tags:
${tagList.map(t => `  - ${t}`).join('\n')}
toc: true
toc_label: "Table of Contents"
toc_icon: "laptop-code"
toc_sticky: true
---

Your content goes here...

> **TL;DR:**  
> Summary of your post.
{: .notice--info}

## Introduction

Start writing! 🚀

---

**☕ Liked this content? You can sponsor my next deep dive below!**

[![Buy Me A Coffee](https://user-images.githubusercontent.com/1376749/120938564-50c59780-c6e1-11eb-814f-22a0399623c5.png)](https://www.buymeacoffee.com/cerocool)
`;

    fs.writeFileSync(filePath, frontmatter, 'utf8');
    console.log(`\n✅ Post created successfully:\n   ${filePath}`);
    console.log(`\nStart editing: content/posts/${filename}`);
}

// Main execution
console.log('📝 New Post Generator');
console.log('---------------------');

rl.question('Enter Post Title: ', (title) => {
    if (!title) {
        console.error('Title is required!');
        rl.close();
        return;
    }

    rl.question('Enter Tags (comma separated, e.g. Azure, Terraform): ', (tags) => {
        rl.question('Enter Categories (comma separated, default: Blog): ', (categories) => {
            createPost(title, tags, categories);
            rl.close();
        });
    });
});
