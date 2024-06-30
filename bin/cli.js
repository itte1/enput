import { Command, Argument, Option } from 'commander'

import { enputAction } from './enput_action.js'

export let program = new Command()

program
  .name('enput')
  .description('Generate or update a .env file from .env.example and user input.')
  .version('0.1.0', '-v, --version')
  .addArgument(new Argument('[vars...]',
    'filtering and setting environment variables\n\n'
    + 'Examples:\n'
    + '  filter                     enput NODE_ENV PORT\n'
    + '  set value                  enput NODE_ENV=production\n'
    + '  set empty value            enput NODE_ENV=\n'
    + '  set value with space       enput MESSAGE=\'Hello world\''
  ))
  .addOption(new Option('-m, --mode <mode>', 'if given, adds a suffix to the .env filename'))
  .addOption(new Option('-e, --env <envFile>', '.env file name').default('.env').conflicts('mode'))
  .addOption(new Option('-s, --schema <schemaFile>', 'schema file name').default('.env.example').conflicts('mode'))
  .addOption(new Option('-f, --force', 'disable verification'))
  .addOption(new Option('-u, --update', 'check each schema for updates'))
  .addOption(new Option('-q, --quiet', 'hide information'))
  .action(enputAction)

// program
//   .command('check')
//   .description('Validate the .env files with the schema file.')
//   .addOption(new Option('-m, --mode <mode>', 'if given, adds a suffix to the .env filename'))
//   .addOption(new Option('-e, --env <envFile>', '.env file name').default('.env').conflicts('mode'))
//   .addOption(new Option('-s, --schema <schemaFile>', 'schema file name').default('.env.example').conflicts('mode'))
//   .action(checkAction)

// program
//   .command('copy')
//   .addOption(new Option('-m, --mode <mode>', 'if given, adds a suffix to the .env filename'))
//   .addOption(new Option('-e, --env <envFile>', '.env file name').default('.env').conflicts('mode'))
//   .addOption(new Option('-s, --schema <schemaFile>', 'schema file name').default('.env.example').conflicts('mode'))
//   .action(copyAction)

program.parse()