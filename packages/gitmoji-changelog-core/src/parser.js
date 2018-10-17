import splitLines from 'split-lines'
import groupMapping from './groupMapping'
import emojiMapping from './emojiMapping'

function parseSubject(subject) {
  if (!subject) return {}
  const matches = subject.match(/:(\w*):(.*)/)
  if (!matches) return {}
  const [, emojiCode, message] = matches

  return {
    emojiCode,
    emoji: emojiMapping[emojiCode] || '¿',
    message: message.trim(),
  }
}

export function getCommitGroup(emojiCode) {
  const group = groupMapping.find(({ emojis }) => emojis.includes(emojiCode))
  if (!group) return 'misc'
  return group.group
}

export function parseCommit(commit) {
  const lines = splitLines(commit)
  const [hash, date, subject, ...body] = lines.splice(1, lines.length - 2)
  const { emoji, emojiCode, message } = parseSubject(subject)
  const group = getCommitGroup(emojiCode)

  return {
    hash,
    date,
    subject,
    emojiCode,
    emoji,
    message,
    group,
    body: body.join('\n'),
  }
}
