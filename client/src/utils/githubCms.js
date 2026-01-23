const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_PAT;
const REPO_OWNER = 'AgilistTim';
const REPO_NAME = 'Agilist_website';
const BRANCH = 'main';

export const savePostToGithub = async (filename, content, commitMessage) => {
  const path = `client/public/content/blog/${filename}`;
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`;

  try {
    // 1. Check if file exists to get its SHA
    let sha;
    const getRes = await fetch(url, {
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (getRes.ok) {
      const data = await getRes.json();
      sha = data.sha;
    }

    // 2. Create or update the file
    const body = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(content))),
      branch: BRANCH,
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!putRes.ok) {
      const errorData = await putRes.json();
      throw new Error(errorData.message || 'Failed to save to GitHub');
    }

    return await putRes.json();
  } catch (error) {
    console.error('GitHub CMS Error:', error);
    throw error;
  }
};
