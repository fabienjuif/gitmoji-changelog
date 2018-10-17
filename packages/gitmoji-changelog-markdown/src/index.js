import fs from 'fs'
import path from 'path'
import handlebars from 'handlebars'
import { update } from 'immutadot'
import { isEmpty } from 'lodash'

const MARKDOWN_TEMPLATE = path.join(__dirname, 'template.md')

export function convert({ meta, changes }) {
  const template = fs.readFileSync(MARKDOWN_TEMPLATE, 'utf-8')

  const generateMarkdown = handlebars.compile(template)

  const changelog = update(changes, '[:].groups[:].commits[:]', commit => ({
    ...commit,
    hash: getShortHash(commit.hash, meta.repository),
    subject: autolink(commit.subject, meta.repository),
    message: autolink(commit.message, meta.repository),
    body: autolink(commit.body, meta.repository),
  }))

  return generateMarkdown({ changelog })
}

export function getShortHash(hash, repository) {
  if (!hash) return null

  const shortHash = hash.slice(0, 7)

  if (isEmpty(repository) || !repository.url) return shortHash

  return `[${shortHash}](${repository.url}/commit/${hash})`
}

const ISSUE_REGEXP = /#{1}(\d+)/gm

export function autolink(message, repository) {
  if (!message) return null

  if (isEmpty(repository) || !repository.bugsUrl) return message

  const matches = message.match(ISSUE_REGEXP)
  if (!matches) return message

  return message.replace(ISSUE_REGEXP, `[#$1](${repository.bugsUrl}/$1)`)
}
