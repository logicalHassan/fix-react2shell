#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { scanDirectory } from '../lib/scanner.js';
import { auditProjects, checkVulnerability } from '../lib/auditor.js';
import { fetchGitHubRepos, fetchPackageJson } from '../lib/github.js';
import { promptFixes } from '../lib/patcher.js';
import path from 'path';
import ora from 'ora';

const program = new Command();

program.name('audit-react2shell').version('1.0.0');

// --- LOCAL COMMAND ---
program
  .command('scan', { isDefault: true })
  .argument('[directory]', 'Directory to scan', '.')
  .option('--fix', 'Interactive fix mode')
  .action(async (directory, options) => {
    const targetDir = path.resolve(directory);
    console.log(chalk.bold.blue(`\n🛡️ react2shell: Local Audit`));

    const projectFiles = await scanDirectory(targetDir);
    const { vulnerable } = await auditProjects(projectFiles, targetDir);

    if (vulnerable.length === 0) {
      console.log(chalk.green.bold('\n✅ All local projects are safe.'));
      return;
    }

    console.log(chalk.red.bold(`\n🚨 Found ${vulnerable.length} vulnerable projects:`));

    if (options.fix) {
      await promptFixes(vulnerable);
    } else {
      console.log(chalk.yellow('\nTip: Run with --fix to automatically patch these projects.'));
    }
  });

// --- CLOUD COMMAND ---
program
  .command('github')
  .description('Audit repositories directly on GitHub')
  .option('--org <name>', 'Specific Organization to scan')
  .action(async (options) => {
    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Enter GitHub PAT:',
        mask: '*',
      },
    ]);

    const spinner = ora('Fetching repository list...').start();
    const repos = await fetchGitHubRepos(token, options.org);

    if (repos.length === 0) {
      spinner.fail('No repositories found or access denied.');
      return;
    }

    spinner.succeed(`Found ${repos.length} repositories.`);
    const vulnerable = [];

    const auditSpinner = ora('Auditing cloud projects...').start();

    for (const repo of repos) {
      auditSpinner.text = `Checking ${repo.full_name}...`;

      const pkg = await fetchPackageJson(token, repo.owner.login, repo.name);

      if (pkg) {
        const result = checkVulnerability(pkg);
        if (result) {
          vulnerable.push({
            name: repo.full_name,
            current: result.current,
            safe: result.safe,
          });
        }
      }
    }

    auditSpinner.stop();

    if (vulnerable.length === 0) {
      console.log(chalk.green.bold('\n✅ All GitHub repositories are safe!'));
    } else {
      console.log(chalk.red.bold(`\n🚨 Found ${vulnerable.length} vulnerable cloud projects:`));
      console.log(chalk.gray(`\nNote: Auto-patching is currently only available for local projects.`));
    }
  });
program.parse();
