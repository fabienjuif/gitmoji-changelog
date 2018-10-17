import yargs from 'yargs'
import { logger } from '@gitmoji-changelog/core'

import { version } from '../package.json'
import { main } from './cli'

logger.start(`gitmoji-changelog v${version}`)

const args = yargs
  .option('format', {
    alias: 'f',
    default: 'markdown',
    description: 'changelog output format',
    choices: ['json', 'markdown'],
  })
  .parse()

main(args)
