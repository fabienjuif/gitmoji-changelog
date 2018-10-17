import { Signale } from 'signale'

const options = {
  disabled: false,
  interactive: false,
  stream: process.stdout,
}

export default new Signale(options)
