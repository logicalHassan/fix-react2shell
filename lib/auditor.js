import fs from 'fs';
import path from 'path';
import semver from 'semver';
import chalk from 'chalk';

// LATEST CVE MAP (Dec 13, 2025)
const NEXT_RULES = [
  { range: '>=13.3.0 <15.0.0', safe: '14.2.35' },
  { range: '15.0.x', safe: '15.0.7' },
  { range: '15.1.x', safe: '15.1.11' },
  { range: '15.2.x', safe: '15.2.8' },
  { range: '15.3.x', safe: '15.3.8' },
  { range: '15.4.x', safe: '15.4.10' },
  { range: '15.5.x', safe: '15.5.9' },
  { range: '16.0.x', safe: '16.0.10' },
];

export async function auditProjects(files, rootDir) {
  const vulnerable = [];
  const safe = [];

  files.forEach((file) => {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const pkg = JSON.parse(content);
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (!deps.next) return;

      const currentVer = deps.next;
      const cleanVer = semver.coerce(currentVer)?.version;
      let isVuln = false;
      let fixVer = null;

      // Check Rules
      for (const rule of NEXT_RULES) {
        if (semver.satisfies(cleanVer, rule.range) && semver.lt(cleanVer, rule.safe)) {
          isVuln = true;
          fixVer = rule.safe;
          break;
        }
      }

      // Check Canaries
      if (currentVer.includes('canary')) {
        if (semver.satisfies(cleanVer, '15.x') && semver.lt(currentVer, '15.6.0-canary.60')) {
          isVuln = true;
          fixVer = '15.6.0-canary.60';
        }
      }

      const relPath = path.relative(rootDir, path.dirname(file));

      if (isVuln) {
        console.log(`${chalk.red('✖')} ${chalk.bold(relPath)} (Next: ${currentVer}) -> Needs ${fixVer}`);
        vulnerable.push({
          name: pkg.name || relPath,
          path: path.dirname(file),
          current: currentVer,
          safe: fixVer,
          manager: fs.existsSync(path.join(path.dirname(file), 'yarn.lock')) ? 'yarn' : 'npm',
        });
      } else {
        safe.push(file);
      }
    } catch (e) {
      // Ignore invalid JSON
    }
  });

  return { vulnerable, safe };
}

export function checkVulnerability(pkg) {
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const currentVer = deps.next;

  if (!currentVer) return null;

  const cleanVer = semver.coerce(currentVer)?.version;
  let isVuln = false;
  let fixVer = null;

  for (const rule of NEXT_RULES) {
    if (semver.satisfies(cleanVer, rule.range) && semver.lt(cleanVer, rule.safe)) {
      isVuln = true;
      fixVer = rule.safe;
      break;
    }
  }

  if (currentVer.includes('canary')) {
    if (semver.satisfies(cleanVer, '15.x') && semver.lt(currentVer, '15.6.0-canary.60')) {
      isVuln = true;
      fixVer = '15.6.0-canary.60';
    }
  }

  return isVuln ? { current: currentVer, safe: fixVer } : null;
}
