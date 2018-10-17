import gitRawCommits from 'git-raw-commits'
import gitSemverTags from 'git-semver-tags'
import through from 'through2'
import concat from 'concat-stream'
import { promisify } from 'util'

import { parseCommit } from './parser'
import { getPackageInfo, getRepoInfo } from './metaInfo'
import groupMapping from './groupMapping'
import logger from './logger'

export { logger }

const gitSemverTagsAsync = promisify(gitSemverTags)

const COMMIT_FORMAT = '%n%H%n%cI%n%s%n%b'

function getCommits(from, to) {
  return new Promise((resolve) => {
    gitRawCommits({
      format: COMMIT_FORMAT,
      from,
      to,
    }).pipe(through.obj((data, enc, next) => {
      next(null, parseCommit(data.toString()))
    })).pipe(concat(data => {
      resolve(data)
    }))
  })
}

function makeGroups(commits) {
  return groupMapping
    .map(({ group, label }) => ({
      group,
      label,
      commits: commits
        .filter(commit => commit.group === group)
        .sort((first, second) => {
          if (!first.emojiCode) return -1

          const emojiCriteria = first.emojiCode.localeCompare(second.emojiCode)
          if (emojiCriteria !== 0) return emojiCriteria
          return first.date.localeCompare(second.date)
        }),
    }))
    .filter(group => group.commits.length)
}

export async function generateChangelog() {
  const packageInfo = await getPackageInfo()
  const repository = await getRepoInfo(packageInfo)

  const meta = {
    package: packageInfo,
    repository,
  }

  let previousTag = ''
  const tags = await gitSemverTagsAsync()

  const changes = await Promise.all(tags.map(async tag => {
    const commits = await getCommits(previousTag, tag)
    const lastCommitDate = getLastCommitDate(commits)

    previousTag = tag
    return {
      version: tag,
      date: lastCommitDate,
      groups: makeGroups(commits),
    }
  }))

  const commits = await getCommits(previousTag)
  changes.push({
    version: 'next',
    groups: makeGroups(commits),
  })

  return {
    meta,
    changes,
  }
}

function getLastCommitDate(commits) {
  return commits
    .map((commit) => new Date(commit.date))
    .reduce((lastCommitDate, currentCommitDate) => {
      if (currentCommitDate > lastCommitDate) {
        return currentCommitDate
      }
      return lastCommitDate
    })
    .toISOString().split('T')[0]
}
