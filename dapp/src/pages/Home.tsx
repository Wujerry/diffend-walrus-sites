import DiffList from '@/components/DiffList'
import NewDiff from '@/components/NewDiff'
import { useCurrentAccount } from '@mysten/dapp-kit'

export default function Home() {
  const account = useCurrentAccount()
  const address = account?.address
  return (
    <div className='flex flex-col justify-center items-center'>
      <NewDiff address={address}></NewDiff>
      <DiffList></DiffList>
    </div>
  )
}
