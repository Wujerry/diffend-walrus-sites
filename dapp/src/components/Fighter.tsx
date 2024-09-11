import { formatAddress } from '@mysten/sui/utils'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { DiffModel } from '@/model/model'

import Vote from './Vote'
import { EmptyAddress } from '@/lib/consts'

const getWinner = (diff: DiffModel) => {
  if (diff.winner === EmptyAddress) {
    const votesForA = diff.votes.filter((v) => v.fields.vote === diff.user_a).length
    const votesForB = diff.votes.filter((v) => v.fields.vote === diff.user_b).length
    return votesForA > votesForB ? diff.user_a : diff.user_b
  }
  return diff.winner
}

export default function Fighter({
  pos,
  diff,
  diffIndex,
}: {
  pos: number
  diff: DiffModel
  diffIndex: number
}) {
  const isA = pos === 0
  const address = isA ? diff.user_a : diff.user_b
  return (
    <div className='flex-1 flex w-full flex-col items-start border border-dashed border-gray-600 py-4 px-8 rounded-md bg-gray-100  dark:bg-gray-900 cursor-pointer '>
      <div className='flex w-full'>
        Fighter {isA ? 'A' : 'B'} :
        <span className='underline ml-2'>{formatAddress(isA ? diff.user_a : diff.user_b)}</span>
        <div className='flex-1'></div>
        {getWinner(diff) === address && <Badge variant='destructive'>Winner</Badge>}
      </div>
      <Separator className='my-4' />
      <div className=''>{isA ? diff.desc_a : diff.desc_b}</div>
      {!diff.is_random ? (
        <Vote
          count={diff.votes.filter((v) => v.fields.vote === address).length}
          isA={isA}
          diffIndex={diffIndex}
          voteFor={isA ? diff.user_a : diff.user_b}
        ></Vote>
      ) : null}
    </div>
  )
}
