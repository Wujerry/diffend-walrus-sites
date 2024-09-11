import Diff from '@/components/Diff'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import useDiffs from '@/lib/useDiffs'
import { DiffModel, VoteModel } from '@/model/model'
import { formatAddress } from '@mysten/sui/utils'
import { useParams } from 'react-router-dom'

export default function Detail() {
  const { id } = useParams()
  const { diffList } = useDiffs()
  if (!diffList.length) {
    return null
  }
  const vid = Number(id)
  const votes = diffList[vid].votes
  return (
    <div className='flex flex-col justify-center items-center mt-8'>
      <Diff data={diffList[vid]} diffIndex={vid}></Diff>
      <Card className='w-[800px] my-4'>
        <CardHeader>
          <CardTitle className='flex'>Voters</CardTitle>
        </CardHeader>
        <CardContent>
          {votes.length ? (
            votes.map((v) => (
              <VoteItem diff={diffList[vid]} vote={v} key={v.fields.id.id}></VoteItem>
            ))
          ) : (
            <div>No votes</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function VoteItem({ vote, diff }: { vote: VoteModel; diff: DiffModel }) {
  const isA = vote.fields.vote === diff.user_a
  return (
    <div>
      <div className='my-2 text-gray-500 flex items-center'>
        <Badge>{isA ? 'A' : 'B'}</Badge>
        <div className='w-[10px]'></div>
        {formatAddress(vote.fields.user)}
      </div>
      <div>{vote.fields.desc}</div>
      <Separator className='my-4' />
    </div>
  )
}
