#! /usr/bin/env node

const yargs = require('yargs')
const { logger } = require('@gitmoji-changelog/core')

const { version } = require('../package.json')
const { main } = require('./cli')

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
