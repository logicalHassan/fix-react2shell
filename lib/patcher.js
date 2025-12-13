import inquirer from 'inquirer';
import { spawnSync } from 'child_process';
import chalk from 'chalk';

export async function promptFixes(vulnerableProjects) {
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Which projects would you like to patch?',
      choices: vulnerableProjects.map((p) => ({
        name: `${p.name} (${p.current} -> ${p.safe})`,
        value: p,
      })),
    },
  ]);

  if (selected.length === 0) return;

  for (const proj of selected) {
    console.log(chalk.blue(`\n📦 Patching ${proj.name} at ${proj.path}...`));

    const cmd = proj.manager === 'yarn' ? 'yarn' : 'npm';
    const args =
      proj.manager === 'yarn'
        ? ['add', `next@${proj.safe}`, '--exact']
        : ['install', `next@${proj.safe}`, '--save-exact'];

    const result = spawnSync(cmd, args, {
      cwd: proj.path,
      stdio: 'inherit',
      shell: true,
    });

    if (result.status !== 0) {
      console.log(chalk.red(`❌ Failed to patch ${proj.name}. Check the errors above.`));
    } else {
      console.log(chalk.green(`✅ Successfully sent command to ${proj.name}`));
    }
  }

  console.log(chalk.bold.green('\n✨ Patching process complete. Run scan again to verify.'));
}
