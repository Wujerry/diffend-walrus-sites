import { Button } from './ui/button'
import { ThumbsUp } from 'lucide-react'
import { clsx } from 'clsx'
import { HistoryId, PackageId } from '@/lib/consts'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { ReloadIcon } from '@radix-ui/react-icons'
import { useHistoryStore } from '@/store/store'
import { useToast } from '@/hooks/use-toast'

export default function Vote({
  count,
  isA,
  diffIndex,
  voteFor,
}: {
  count: number
  isA: boolean
  diffIndex: number
  voteFor: string
}) {
  const style = clsx('flex w-full items-center mt-6', !isA && 'flex-row-reverse')
  const [open, setOpen] = useState(false)
  const client = useSuiClient()
  const { toast } = useToast()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const refetch = useHistoryStore((state) => state.refetch)
  const handleClick = () => {
    const desc = textareaRef.current?.value || ''
    if (desc === '') return
    setLoading(true)
    const tx = new Transaction()
    tx.setGasBudget(100_000_000)
    tx.moveCall({
      target: `${PackageId}::diffend::vote_diff`,
      arguments: [
        tx.object(HistoryId),
        tx.pure.u64(diffIndex),
        tx.pure.address(voteFor),
        tx.pure.string(textareaRef.current?.value || ''),
        tx.object('0x6'),
      ],
    })
    signAndExecuteTransaction(
      {
        transaction: tx,
      },
      {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        onSuccess: async (result: any) => {
          const res = await client.waitForTransaction({
            digest: result.digest,
            pollInterval: 500,
          })
          if (!res.errors) {
            setOpen(false)
            setLoading(false)
            console.log('executed transaction', result)
            setTimeout(() => {
              refetch()
            }, 100)
          } else {
            setLoading(false)
            toast({
              title: res.errors.join(','),
              variant: 'destructive',
            })
            console.error('error', res)
          }
        },
        onError: (error) => {
          setLoading(false)
          console.error('error', error)
        },
      }
    )
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className='flex-1 w-full'>
        <div className={style}>
          <div className='font-bold  text-2xl'>{count}</div>
          <Button variant='outline' className='mx-4' onClick={handleClick}>
            <ThumbsUp className='mx-2  h-4 w-4' />
            Vote
          </Button>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vote for {isA ? 'A' : 'B'}</DialogTitle>
        </DialogHeader>
        <div className='py-2'>
          Voters will share <span className='mx-2 text-yellow-600'>10%</span> of the loser's bet
          amount.
        </div>
        <div className='pb-2'>
          <Textarea ref={textareaRef} placeholder='Write your vote reason here.' />
        </div>

        <Button onClick={handleClick} disabled={loading}>
          {' '}
          {loading ? <ReloadIcon className='mr-2 h-4 w-4 animate-spin' /> : null} Submit
        </Button>
      </DialogContent>
    </Dialog>
  )
}
