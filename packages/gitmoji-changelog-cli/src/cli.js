import { generateChangelog, logger } from '@gitmoji-changelog/core'
import { convert } from '@gitmoji-changelog/markdown'
import fs from 'fs'

export async function main({ format } = {}) {
  let changelog
  try {
    changelog = await generateChangelog()
  } catch (e) {
    logger.error('Cannot find a git repository in current path.')
    return
  }

  try {
    logger.info(changelog.meta.package.name)
    logger.info('v%s', changelog.meta.package.version)
    logger.info(changelog.meta.repository.url)

    let output
    switch (format) {
      case 'json':
        output = './CHANGELOG.json'
        fs.writeFileSync(output, JSON.stringify(changelog))
        break
      default:
        output = './CHANGELOG.md'
        fs.writeFileSync(output, convert(changelog))
    }
    logger.success(`changelog updated into ${output}`)
  } catch (e) {
    logger.error(e)
  }
}
