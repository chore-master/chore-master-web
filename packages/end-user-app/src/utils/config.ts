import { EnvEnum } from '@module/utils/constants'

export default function getConfig() {
  const ENV_NAME = process.env.NEXT_PUBLIC_ENV_NAME || EnvEnum.PRODUCTION
  const CLOUDFLARE_TURNSTILE_SITE_KEY =
    process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || ''

  let HOST
  let CHORE_MASTER_API_HOST

  if (ENV_NAME === EnvEnum.LOCAL) {
    HOST = 'http://localhost:2000'
    CHORE_MASTER_API_HOST = 'http://localhost:10000'
  } else if (ENV_NAME === EnvEnum.DEVELOPING) {
    HOST = 'https://dev.chore-master.app'
    CHORE_MASTER_API_HOST = 'https://dev-api.chore-master.app'
  } else if (ENV_NAME === EnvEnum.PRODUCTION) {
    HOST = 'https://chore-master.app'
    CHORE_MASTER_API_HOST = 'https://api.chore-master.app'
  }

  if (process.env.NEXT_PUBLIC_CHORE_MASTER_API_HOST) {
    CHORE_MASTER_API_HOST = process.env.NEXT_PUBLIC_CHORE_MASTER_API_HOST
  }

  return {
    ENV_NAME,
    HOST,
    CHORE_MASTER_API_HOST,
    CLOUDFLARE_TURNSTILE_SITE_KEY,
  }
}
