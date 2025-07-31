import type { Config } from 'jest'
import { createDefaultPreset } from 'ts-jest'

const config: Config = {
  ...createDefaultPreset(),
}

export default config
