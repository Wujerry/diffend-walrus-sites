import { Badge } from './ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Swords } from 'lucide-react'
import { Separator } from './ui/separator'
import { DiffModel } from '@/model/model'
import { weiToCoin } from 'coin-format'
import { EmptyAddress } from '@/lib/consts'
import AddFighter from './AddFighter'
import Fighter from './Fighter'
import { format } from 'date-fns'
import ClaimBtn from './ClaimBtn'

export default function Diff({ data, diffIndex }: { data: DiffModel; diffIndex: number }) {
  const now = new Date()
  const isEnded = data.winner !== EmptyAddress || Number(data.end_timestamp_ms) < now.getTime()
  const dateStr = format(new Date(Number(data.end_timestamp_ms)), 'yyyy-MM-dd HH:mm')

  return (
    <Card className='w-[800px] my-8'>
      <CardHeader>
        <CardTitle className='flex'>
          <div className='flex-1'>
            <a href={`/${diffIndex}`}>{data.title}</a>
          </div>
          <div className='flex'>
            {data.is_random && <Badge>Random</Badge>}
            <div className='w-[10px]'></div>
            <Badge>{weiToCoin(data.bet_amount, 9)} SUI</Badge>
          </div>
        </CardTitle>
        {/* <CardDescription>Loser pays the bill</CardDescription> */}
      </CardHeader>
      <CardContent>{data.desc}</CardContent>
      <Separator className='my-4' />
      <CardFooter className='flex justify-evenly'>
        {data.user_a === EmptyAddress ? (
          <AddFighter diffIndex={diffIndex} text='Fighter A' diff={data} pos={0} />
        ) : (
          <Fighter pos={0} diff={data} diffIndex={diffIndex}></Fighter>
        )}
        <div className='px-6'>
          <Swords size={40}></Swords>
        </div>
        {data.user_b === EmptyAddress ? (
          <AddFighter diffIndex={diffIndex} text='Fighter B' diff={data} pos={1} />
        ) : (
          <Fighter pos={1} diff={data} diffIndex={diffIndex}></Fighter>
        )}
      </CardFooter>
      {!data.is_random && (
        <CardFooter className='justify-end text-gray-500'>
          Voters will share <span className='mx-2 text-yellow-600'>10%</span> of the loser's bet
          amount.
        </CardFooter>
      )}
      <CardFooter className='justify-end text-gray-500 items-center'>
        {isEnded && !data.is_random && <ClaimBtn diff={data} diffIndex={diffIndex}></ClaimBtn>}
        {isEnded ? (
          <Badge className='text-lg' variant='outline'>
            Ended
          </Badge>
        ) : (
          <Badge className='text-lg' variant='secondary'>
            {dateStr}
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}
