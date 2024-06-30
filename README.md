# Enput

dotenv file generator from schema and user input.

Do you copy and rewrite the `.env` file when you prepare the environment for your project? Enput generates an `.env` file by answering a minimum of questions.

- You can create an environment simply by answering questions.
- You can define the schemes of the environment variables.
- You can set environment variables without omissions.

## Usage

Enput runs on Node.js. Installation is not required.

First prepare an `.env.example` file; Enput will generate an `.env` file from it.

Then type the following command.

```bash
npx enput
```

All that remains is to enter the environment variables according to what appears on the console screen.

Congratulations👏 An `.env` file has been generated.

If `.env.example` is updated in the future and new environment variables are added, type the same command again. Add the missing environment variables to the `.env` file.

## Schemas

 Add a comment in front of each environment variable in the `.env.example` file. The number of `#` is not important, although `##` is used here to improve readability.

 ```bash
##
# Node execution environment
# @type select
# @options local,development,staging,production
##
NODE_ENV=production
 ```

`@type` followed by the type of the environment variable. In this case, NODE_ENV will be the item from which to choose.

### Types

All types are here.

- `string`
- `secret`
- `email`
- `url`
- `date`
- `datetime`
- `ip`
- `number`
- `int`
- `boolean`
- `select`
- `list`

### Tags

All tags are here.

| Tag | |
| --- | --- |
| `@type` | Type of the environment variable. Default is string. |
| `@copy` | Skip user input and copy the default value verbatim. |
| `@min` | Minimum value (minimum number of characters for strings). |
| `@max` | Maximum value (maximum number of characters for strings). | |
| `@length` | Fixed number of characters in the value |
| `@pattern` | Regular expression pattern for the value |
| `@multiple` | Allows multiple selections when of type `select`. |
| `@options` | Options for type `select`. |

## Command

It can also be installed.

```bash
npm install -g enput
```

See help for command usage.

```
> enput -h
Usage: enput [options] [vars...]

Generate or update a .env file from .env.example and user input.

Arguments:
  vars                       filtering and setting environment variables

  Examples:
    filter                     enput NODE_ENV PORT
    set value                  enput NODE_ENV=production
    set empty value            enput NODE_ENV=
    set value with space       enput MESSAGE='Hello world'

Options:
  -v, --version              output the version number
  -m, --mode <mode>          if given, adds a suffix to the .env filename
  -e, --env <envFile>        .env file name (default: ".env")
  -s, --schema <schemaFile>  schema file name (default: ".env.example")
  -f, --force                disable verification
  -u, --update               check each schema for updates
  -q, --quiet                hide information
  -h, --help                 display help for command
```