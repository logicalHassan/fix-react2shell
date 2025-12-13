import fs from 'fs';
import path from 'path';
import ora from 'ora';

export async function scanDirectory(rootDir) {
  const spinner = ora('Scanning for Next.js projects...').start();
  const fileList = [];

  function traverse(dir) {
    try {
      const files = fs.readdirSync(dir);

      // Check if this is a project root
      if (files.includes('package.json')) {
        fileList.push(path.join(dir, 'package.json'));
      }

      // Recurse into subdirectories
      for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
          // SKIP massive/irrelevant folders to speed things up
          if (!['node_modules', '.git', '.next', 'dist', 'build'].includes(file)) {
            traverse(filePath);
          }
        }
      }
    } catch (err) {
      // Ignore permission errors
    }
  }

  traverse(rootDir);
  spinner.succeed(`Found ${fileList.length} projects.`);
  return fileList;
}
