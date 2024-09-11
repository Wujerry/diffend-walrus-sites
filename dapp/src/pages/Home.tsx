/* eslint-disable @typescript-eslint/no-explicit-any */
import DiffList from '@/components/DiffList'
import NewDiff from '@/components/NewDiff'
import useDiffs from '@/lib/useDiffs'
import { useHistoryStore } from '@/store/store'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useEffect } from 'react'

export default function Home() {
  const account = useCurrentAccount()
  console.log('Home', account)

  const address = account?.address
  const { diffList, reload } = useDiffs()
  const setRefetch = useHistoryStore((state) => state.setRefetch)
  useEffect(() => {
    setRefetch(reload)
  }, [])
  return (
    <div className='flex flex-col justify-center items-center mt-8'>
      <NewDiff address={address}></NewDiff>
      <DiffList listData={diffList}></DiffList>
    </div>
  )
}
