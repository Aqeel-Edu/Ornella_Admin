# Blog Schema for Customer-Facing Website

## Firestore Collection: `blogs`

### TypeScript Interface

```typescript
import { Timestamp } from 'firebase/firestore';

export interface Blog {
  id: string;
  
  // Core Content
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML formatted content from TinyMCE
  
  // Media
  imageUrl: string;
  imagePath?: string;
  altText: string;
  
  // Categorization
  category: string; // e.g., "Interior Design", "Bedroom Design", "Sustainability"
  tags: string[]; // Array of tags for filtering
  
  // Publishing
  publishedDate: Timestamp;
  status: 'published' | 'draft';
  readTime: number; // in minutes
  
  // SEO Metadata
  metaTitle: string; // Max 60 characters for Google
  metaDescription: string; // Max 160 characters for Google
  keywords: string[]; // Array of SEO keywords
  
  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Sample Blog Document

```json
{
  "id": "abc123xyz",
  "title": "10 Minimalist Living Room Ideas for Pakistani Homes",
  "slug": "minimalist-living-room-ideas-pakistani-homes",
  "excerpt": "Transform your living space with these elegant minimalist design tips perfect for modern Pakistani homes. Discover how less can truly be more.",
  "content": "<h2>Introduction</h2><p>Minimalism has become...</p><h2>Key Design Elements</h2><ul><li>...</li></ul>",
  
  "imageUrl": "https://firebasestorage.googleapis.com/.../featured-image.jpg",
  "imagePath": "blogs/1734567890-featured.jpg",
  "altText": "Modern minimalist living room with neutral tones and clean lines",
  
  "category": "Interior Design",
  "tags": ["minimalism", "living room", "modern design", "Pakistani homes", "interior tips"],
  
  "publishedDate": Timestamp(2025, 0, 15), // January 15, 2025
  "status": "published",
  "readTime": 8,
  
  "metaTitle": "10 Minimalist Living Room Ideas - Ornella Blog",
  "metaDescription": "Transform your Pakistani home with expert minimalist living room ideas. Discover elegant designs, practical tips, and budget-friendly solutions for modern spaces.",
  "keywords": ["minimalist living room", "interior design Pakistan", "modern home decor", "living room ideas", "Pakistani interior", "home styling tips"],
  
  "createdAt": Timestamp(2025, 0, 10),
  "updatedAt": Timestamp(2025, 0, 15)
}
```

## Usage in Customer Website

### 1. Fetch All Published Blogs

```typescript
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';

async function getPublishedBlogs() {
  const blogsRef = collection(db, 'blogs');
  const q = query(
    blogsRef,
    where('status', '==', 'published'),
    orderBy('publishedDate', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Blog[];
}
```

### 2. Fetch Single Blog by Slug

```typescript
import { collection, query, where, getDocs } from 'firebase/firestore';

async function getBlogBySlug(slug: string) {
  const blogsRef = collection(db, 'blogs');
  const q = query(
    blogsRef,
    where('slug', '==', slug),
    where('status', '==', 'published')
  );
  
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data()
  } as Blog;
}
```

### 3. Filter Blogs by Category

```typescript
async function getBlogsByCategory(category: string) {
  const blogsRef = collection(db, 'blogs');
  const q = query(
    blogsRef,
    where('status', '==', 'published'),
    where('category', '==', category),
    orderBy('publishedDate', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Blog[];
}
```

### 4. Search Blogs by Tag

```typescript
async function getBlogsByTag(tag: string) {
  const blogsRef = collection(db, 'blogs');
  const q = query(
    blogsRef,
    where('status', '==', 'published'),
    where('tags', 'array-contains', tag),
    orderBy('publishedDate', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as Blog[];
}
```

### 5. Implement SEO Meta Tags (Next.js Example)

```typescript
import Head from 'next/head';

export default function BlogPost({ blog }: { blog: Blog }) {
  return (
    <>
      <Head>
        <title>{blog.metaTitle}</title>
        <meta name="description" content={blog.metaDescription} />
        <meta name="keywords" content={blog.keywords.join(', ')} />
        
        {/* Open Graph for Social Sharing */}
        <meta property="og:title" content={blog.metaTitle} />
        <meta property="og:description" content={blog.metaDescription} />
        <meta property="og:image" content={blog.imageUrl} />
        <meta property="og:type" content="article" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={blog.metaTitle} />
        <meta name="twitter:description" content={blog.metaDescription} />
        <meta name="twitter:image" content={blog.imageUrl} />
      </Head>

      <article>
        <header>
          <h1>{blog.title}</h1>
          <p className="excerpt">{blog.excerpt}</p>
          <div className="meta">
            <span>{blog.category}</span>
            <span>{blog.readTime} min read</span>
            <time>{blog.publishedDate.toDate().toLocaleDateString()}</time>
          </div>
        </header>

        <img 
          src={blog.imageUrl} 
          alt={blog.altText} 
          className="featured-image"
        />

        <div 
          className="content" 
          dangerouslySetInnerHTML={{ __html: blog.content }} 
        />

        <footer>
          <div className="tags">
            {blog.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </footer>
      </article>
    </>
  );
}
```

### 6. Blog Listing Page Component

```typescript
export default function BlogListing({ blogs }: { blogs: Blog[] }) {
  return (
    <div className="blog-grid">
      {blogs.map(blog => (
        <article key={blog.id} className="blog-card">
          <img src={blog.imageUrl} alt={blog.altText} />
          <div className="content">
            <span className="category">{blog.category}</span>
            <h2>{blog.title}</h2>
            <p>{blog.excerpt}</p>
            <div className="meta">
              <span>{blog.readTime} min read</span>
              <time>{blog.publishedDate.toDate().toLocaleDateString()}</time>
            </div>
            <a href={`/blog/${blog.slug}`}>Read More</a>
          </div>
        </article>
      ))}
    </div>
  );
}
```

## Available Blog Categories

- Interior Design
- Bedroom Design
- Sustainability
- Small Spaces
- Seasonal Decor
- Color Theory

## Notes

1. **Content Field**: Contains HTML from TinyMCE editor - use `dangerouslySetInnerHTML` or sanitization library
2. **Timestamps**: Firebase Timestamp objects - convert to Date using `.toDate()`
3. **Keywords**: Stored as array for flexible querying
4. **Status**: Only fetch 'published' blogs on customer site
5. **SEO**: Use metaTitle, metaDescription, and keywords for search engine optimization
6. **Images**: altText improves accessibility and SEO

## Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /blogs/{blogId} {
      // Allow public read for published blogs only
      allow read: if resource.data.status == 'published';
      
      // Only authenticated admins can write
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```
