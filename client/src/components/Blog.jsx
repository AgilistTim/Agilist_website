import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import matter from 'gray-matter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Badge } from '@/components/ui/badge.jsx';
import { ArrowLeft, Calendar, User } from 'lucide-react';






import posthog from 'posthog-js';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // In a real production environment, you might fetch a list of files from GitHub API
        // or have a manifest.json. For this MVP, we'll try to fetch the welcome post.
        const response = await fetch('/content/blog/welcome.md');
        if (response.ok) {
          const text = await response.text();
          const { data, content } = matter(text);
          setPosts([{ ...data, content, slug: 'welcome' }]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handlePostClick = (post) => {
    setSelectedPost(post);
    posthog.capture('blog_post_viewed', {
      post_title: post.title,
      post_slug: post.slug
    });
    window.scrollTo(0, 0);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#A78BFA]">Loading insights...</div>;
  }

  if (selectedPost) {
    return (
      <div className="min-h-screen bg-[#0D0D0F] text-[#F4F4F5] pt-24 pb-16 px-4">
        <article className="max-w-3xl mx-auto">
          <Button 
            onClick={() => setSelectedPost(null)} 
            variant="ghost" 
            className="mb-8 text-[#A1A1AA] hover:text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Button>
          
          <header className="mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white leading-tight">
              {selectedPost.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-[#A1A1AA] text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#A78BFA]" />
                {selectedPost.date}
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[#A78BFA]" />
                {selectedPost.author}
              </div>
            </div>
          </header>

          <div className="prose prose-invert max-w-none">
            <ReactMarkdown>{selectedPost.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F4F4F5] pt-24 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-16">
          <Badge className="bg-[#7C3AED]/20 text-[#A78BFA] border-[#7C3AED]/40 mb-4">Blog</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Latest Insights</h1>
          <p className="text-xl text-[#A1A1AA] max-w-2xl mx-auto">
            Thinking on organisational transformation, operating model design, and applied AI.
          </p>
        </header>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Card 
              key={post.slug} 
              className="bg-[#16161A] border-[#2A2A35] hover:border-[#7C3AED]/50 transition-all cursor-pointer group"
              onClick={() => handlePostClick(post)}
            >
              <CardHeader>
                <div className="text-xs text-[#A78BFA] mb-2 uppercase tracking-widest font-semibold">
                  {post.date}
                </div>
                <CardTitle className="text-2xl group-hover:text-[#A78BFA] transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#A1A1AA] line-clamp-3 mb-6">
                  {post.content.substring(0, 150)}...
                </p>
                <Button variant="link" className="p-0 text-[#A78BFA] hover:text-white">
                  Read More <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
