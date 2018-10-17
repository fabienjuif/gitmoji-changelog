import { changelog, logger } from '@gitmoji-changelog/core'
import { main } from './cli'

describe('cli', () => {
  it('should throw an error if not a git project', async () => {
    changelog.mockImplementationOnce(() => {
      throw new Error()
    })

    await main()

    expect(logger.error).toHaveBeenCalledWith('Cannot find a git repository in current path.')
  })
})

jest.mock('@gitmoji-changelog/core', () => ({
  changelog: jest.fn(),
  logger: {
    error: jest.fn(),
  },
}))
