// 'use client'

// import apiAgent from '@/utils/apiAgent'
import getConfig from '@/utils/config'
import Link from 'next/link'

export default function Page() {
  const { HOST, IAM_API_HOST } = getConfig()
  const nextURI = encodeURI(`${HOST}/module1`)

  // React.useEffect(() => {
  //   apiAgent.get(`/openapi.json`, {
  //     onFail: (_status: any, data: any) => {
  //       console.log(data)
  //       // console.error(data)
  //     },
  //     onSuccess: async (data: any) => {
  //       try {
  //         console.log(data)
  //       } catch (e) {
  //         console.error(e)
  //       }
  //     },
  //   } as any)
  // })
  return (
    <Link href={`${IAM_API_HOST}/v1/auth/google/authorize?next_uri=${nextURI}`}>
      Login with Google
    </Link>
  )
}