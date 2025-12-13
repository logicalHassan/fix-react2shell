import chalk from 'chalk';

const GITHUB_API = 'https://api.github.com';

export async function fetchGitHubRepos(token, org = null) {
  const endpoint = org ? `${GITHUB_API}/orgs/${org}/repos` : `${GITHUB_API}/user/repos`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'FlightCheck-Security-Tool',
  };

  try {
    const response = await fetch(`${endpoint}?per_page=100`, { headers });
    if (!response.ok) throw new Error(`GitHub API Error: ${response.statusText}`);
    return await response.json();
  } catch (err) {
    console.error(chalk.red(`Failed to fetch repos: ${err.message}`));
    return [];
  }
}

export async function fetchPackageJson(token, owner, repo) {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/package.json`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.raw',
    'User-Agent': 'FlightCheck-Security-Tool',
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) return null;
    return await response.json();
  } catch (e) {
    return null;
  }
}
