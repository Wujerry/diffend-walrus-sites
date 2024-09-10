import { formatAddress } from '@mysten/sui/utils'
import { Badge } from './ui/badge'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { Plus, Swords, ThumbsUp } from 'lucide-react'
import { Separator } from './ui/separator'
import { Button } from './ui/button'
import { DiffModel } from '@/model/model'
import { weiToCoin } from 'coin-format'
import { EmptyAddress, PackageId } from '@/lib/consts'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'

export default function Diff({ data }: { data: DiffModel }) {
  return (
    <Card className='w-[800px] my-8'>
      <CardHeader>
        <CardTitle className='flex'>
          <div className='flex-1'>
            <a href='/detail'>{data.title}</a>
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
        {data.user_a === EmptyAddress && <AddFighter text='Fighter A' diff={data} pos={0} />}
        <div className='px-8'>
          <Swords size={50}></Swords>
        </div>
        {data.user_b === EmptyAddress && <AddFighter text='Fighter B' diff={data} pos={1} />}
      </CardFooter>
      {!data.is_random && (
        <CardFooter className='justify-end text-gray-500'>
          Voters will share <span className='mx-2 text-yellow-600'>10%</span> of the loser's bet
          amount.
        </CardFooter>
      )}
    </Card>
  )
}

function AddFighter({ text, pos, diff }: { text: string; pos: number; diff: DiffModel }) {
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const handleClick = () => {
    console.log('Add fighter', text, pos, diff)
    const tx = new Transaction()
    tx.moveCall({
      target: `${PackageId}::diffend::join_diff_a`,
      arguments: [
        tx.object(HistoryId),
        tx.pure.string(values.title),
        tx.pure.string(values.desc),
        tx.pure.u64(values.amount * 10 ** 9),
        tx.pure.u64(date.getTime()),
        tx.pure.bool(values.mode === '0'),
      ],
    })
    signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess: (result: any) => {
          setOpen(false)
          setLoading(false)
          console.log('executed transaction', result)
        },
        onError: (error) => {
          setLoading(false)
          console.error('error', error)
        },
      }
    )
  }
  return (
    <div
      onClick={handleClick}
      className='flex-1 flex flex-col items-center border border-dashed border-gray-600 py-4 px-8 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 cursor-pointer dark:hover:bg-gray-700'
    >
      <div>{text}</div>
      <div className='p-2'>
        <Plus />
      </div>
    </div>
  )
}

function Vote() {
  return (
    <>
      <Separator className='my-4' />
      <div className='flex w-full items-center'>
        <div className='font-bold mx-2 mr-6 text-2xl'>9</div>
        <Button className='w-full' variant='outline'>
          <ThumbsUp className='mx-2 ml-4 h-4 w-4' />
          Vote
        </Button>
      </div>
    </>
  )
}

export function Bak({ data }: { data: DiffModel }) {
  return (
    <Card className='w-[800px] my-8'>
      <CardHeader>
        <CardTitle className='flex'>
          <div className='flex-1'>
            <a href='/detail'>What's for dinner ?</a>
          </div>
          <div className='flex'>
            <Badge>Random</Badge>
            <div className='w-[10px]'></div>
            <Badge>0.1 SUI</Badge>
          </div>
        </CardTitle>
        {/* <CardDescription>Loser pays the bill</CardDescription> */}
      </CardHeader>
      <CardContent>Loser pays the bill.</CardContent>
      <CardFooter className='flex justify-evenly'>
        <div className='flex-1 flex flex-col items-start border border-dashed border-gray-600 py-4 px-8 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 cursor-pointer dark:hover:bg-gray-700'>
          <div className='flex w-full'>
            Fighter A :{' '}
            <span className='underline'>
              {formatAddress('0x781979aa4c2ebc2d88be8c3f50dc2da7a69d9e9191f4ce3fd9bd7cf192203d6a')}
            </span>
            <div className='flex-1'></div>
            <Badge variant='destructive'>Winner</Badge>
          </div>
          <Separator className='my-4' />
          <div className=''>
            I want Sushi !!I want Sushi !!I want Sushi !!I want Sushi !!I want Sushi !!
          </div>
          {data.is_random ? <Vote></Vote> : null}
        </div>
        <div className='px-8'>
          <Swords size={50}></Swords>
        </div>
        <div className='flex-1 flex flex-col items-center border border-dashed border-gray-600 py-4 px-8 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 cursor-pointer dark:hover:bg-gray-700'>
          <div>Fighter B</div>
          <div className='p-2'>
            <Plus />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
