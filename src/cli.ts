import { Command } from 'commander';
import { extractSongs } from './run';

const program = new Command();

program
  .name('crawler-lyrics')
  .description('CLI to some crawler utilities')
  .version('0.8.0');

program.command('extract')
  .description('Downloads the lyrics from configured site.')
  .argument('<site>', 'Site where the pages will be downloaded')
  .action((site, options) => {
    extractSongs(site);
  });


program.parse();
