import React, { useState } from 'react';
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { savePostToGithub } from '@/utils/githubCms';



const ADMIN_PASSWORD = import.meta.env.PUBLIC_ADMIN_PASSWORD;



const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handlePublish = async () => {
    if (!title || !content) {
      alert('Please provide both title and content');
      return;
    }

    setStatus('Publishing...');
    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    const filename = `${slug}.md`;
    const date = new Date().toISOString().split('T')[0];
    
    const fileContent = `---
title: ${title}
date: ${date}
author: Tim Robinson
---

${content}`;

    try {
      await savePostToGithub(filename, fileContent, `Add blog post: ${title}`);
    posthog.capture('blog_post_published', { title, slug });  setStatus('Published successfully! Site will rebuild in a few minutes.');
      setTitle('');
      setContent('');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <Card className="w-full max-w-md bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-2xl text-cyan-400">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none"
              />
              <Button type="submit" className="w-full bg-cyan-400 hover:bg-cyan-500 text-slate-900">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-cyan-400">Blog Admin</h1>
          <Button onClick={() => setIsLoggedIn(false)} variant="outline" className="border-slate-700">
            Logout
          </Button>
        </div>

        <Card className="bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              type="text"
              placeholder="Post Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none text-lg"
            />
            <textarea
              placeholder="Write your post in Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full p-3 rounded bg-slate-800 border border-slate-700 focus:border-cyan-400 outline-none font-mono"
            />
            <div className="flex items-center justify-between">
              <Button onClick={handlePublish} className="bg-cyan-400 hover:bg-cyan-500 text-slate-900 px-8">
                Publish to GitHub
              </Button>
              {status && <span className="text-cyan-400 italic">{status}</span>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
