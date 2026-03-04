# Vector Store Workflow

This guide explains how to manage blog posts in the RAG vector store so the AI chatbot can reference them.

## Overview

The AI chatbot uses OpenAI's vector store to access blog content for answering questions. When you add a new blog post, you need to:
1. Add the markdown file to the website
2. Upload it to the vector store

## Initial Setup: Upload Existing Blogs

To upload all existing blog posts to the vector store:

```bash
cd server
npm run upload-blogs
```

This script will:
- Find all `.md` files in `client/src/content/blog/`
- Upload each one to OpenAI
- Add them to your vector store (ID: `vs_68d4fa1dc0c0819199f7e562ad781b84`)

## Adding New Blog Posts

### Method 1: Using the Admin Interface (Recommended)

1. **Access the admin page:**
   - Navigate to `/admin` on your website (hidden, not linked)
   - Enter the admin password (from `PUBLIC_ADMIN_PASSWORD` env var)

2. **Manually add the blog post to the website:**
   - Create a new `.md` file in `client/src/content/blog/`
   - Include proper frontmatter (title, date, summary, tags, etc.)
   - Follow the format of existing blog posts

3. **Upload to vector store:**
   - Go to `/admin` page
   - Click "Choose File" and select your `.md` file
   - Click "Upload to Vector Store"
   - You'll see a success message with the file ID

### Method 2: Using the Import Script

If you're importing from LinkedIn (as before):

```bash
cd client
node scripts/import-linkedin-article.js
```

Then upload to vector store:

```bash
cd ../server
npm run upload-blogs
```

### Method 3: Manual API Call

You can also upload directly via the API:

```bash
curl -X POST https://ai-consulting-api.onrender.com/api/upload-blog-to-vectorstore \
  -H "Content-Type: application/json" \
  -d '{
    "fileName": "my-post.md",
    "content": "# My Blog Post\n\nContent here..."
  }'
```

## Workflow Integration

### For New Posts Created Locally

1. Create `.md` file in `client/src/content/blog/`
2. Test locally: `npm run dev` (in client dir)
3. Upload to vector store via `/admin` page
4. Commit and push to deploy

### For LinkedIn Cross-Posts

1. Run `import-linkedin-article.js` script
2. Review/edit the generated markdown
3. Upload to vector store via `/admin` page
4. Commit and push

## Environment Variables Required

Make sure these are set in your server `.env`:

```bash
OPENAI_API_KEY=sk-proj-...
OPENAI_VECTOR_STORE_ID=vs_68d4fa1dc0c0819199f7e562ad781b84
```

And in your client `.env`:

```bash
PUBLIC_ADMIN_PASSWORD=your_password_here
PUBLIC_API_BASE_URL=https://ai-consulting-api.onrender.com
```

## Verifying Upload Success

After uploading, you can verify the files in your vector store:

1. Go to: https://platform.openai.com/storage/vector_stores
2. Find your vector store: `vs_68d4fa1dc0c0819199f7e562ad781b84`
3. Check the files list - your uploaded blogs should appear there

## Testing the Chatbot

After uploading blog content:

1. Open the chatbot on your website
2. Ask a question related to the blog content
3. The AI should reference insights from your uploaded articles

Example questions:
- "What does Tim say about rapid experimentation?"
- "What's in the blog about AI-powered decision making?"
- "Tell me about the discover phase insights"

## Troubleshooting

**Upload fails with 401 error:**
- Check `OPENAI_API_KEY` is set correctly in server `.env`
- Verify the API key has permissions for assistants and vector stores

**Files uploaded but chatbot doesn't reference them:**
- Allow a few minutes for OpenAI to process and index the files
- Verify `OPENAI_VECTOR_STORE_ID` matches in server config
- Check server logs for vector store search errors

**Admin page won't load:**
- Verify `PUBLIC_ADMIN_PASSWORD` is set in client `.env`
- Check `PUBLIC_API_BASE_URL` points to your deployed API

## File Structure

```
Agilist_website/
├── client/
│   ├── src/
│   │   ├── content/blog/          # Blog markdown files (published on website)
│   │   ├── components/
│   │   │   └── AdminBlogUpload.jsx  # Admin upload component
│   │   └── pages/
│   │       └── admin.astro         # Admin dashboard page
│   └── scripts/
│       └── import-linkedin-article.js  # LinkedIn import script
└── server/
    ├── scripts/
    │   └── upload-blogs-to-vectorstore.js  # Batch upload script
    └── src/
        └── index.js                 # API endpoint: /api/upload-blog-to-vectorstore
```

## Security Notes

- The `/admin` page is not linked anywhere (security through obscurity)
- Password protection is basic - consider IP allowlisting for production
- Never commit `PUBLIC_ADMIN_PASSWORD` to git
- The API endpoint has no authentication - add auth if exposing publicly
