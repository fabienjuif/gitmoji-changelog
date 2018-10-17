import readPkgUp from 'read-pkg-up'
import getPkgRepo from 'get-pkg-repo'
import gitRemoteOriginUrl from 'git-remote-origin-url'
import normalizePackageData from 'normalize-package-data'
import { isEmpty } from 'lodash'

// get the closest package.json file
export async function getPackageInfo() {
  try {
    const packageInfo = await readPkgUp()

    if (!packageInfo.pkg) return null

    return {
      name: packageInfo.pkg.name,
      version: packageInfo.pkg.version,
      description: packageInfo.pkg.description,
      repository: packageInfo.pkg.repository,
    }
  } catch (e) {
    return null
  }
}

// get git repository info
export async function getRepoInfo(packageJson = {}) {
  const pkg = {
    repository: packageJson.repository,
  }

  // if pkg not found or empty, get git remote origin
  if (!pkg.repository || !pkg.repository.url) {
    try {
      const url = await gitRemoteOriginUrl()
      pkg.repository = { url }
      normalizePackageData(pkg)
    } catch (e) {
      return null
    }
  }

  // extract repo info from package.json info
  try {
    const repo = getPkgRepo(pkg)

    if (isEmpty(repo)) return null

    return {
      type: repo.type,
      domain: repo.domain,
      user: repo.user,
      project: repo.project,
      url: repo.browse(),
      bugsUrl: repo.bugs(),
    }
  } catch (e) {
    return null
  }
}
