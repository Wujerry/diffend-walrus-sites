import { Plus } from 'lucide-react'
import { DiffModel } from '@/model/model'
import { HistoryId, PackageId, PoolId } from '@/lib/consts'
import { Transaction } from '@mysten/sui/transactions'
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { ReloadIcon } from '@radix-ui/react-icons'
import { weiToCoin } from 'coin-format'
import { useHistoryStore } from '@/store/store'
import { useToast } from '@/hooks/use-toast'

export default function AddFighter({
  text,
  pos,
  diff,
  diffIndex,
}: {
  text: string
  pos: number
  diff: DiffModel
  diffIndex: number
}) {
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
    const [coin] = tx.splitCoins(tx.gas, [diff.bet_amount])
    tx.setGasBudget(100_000_000)
    tx.moveCall({
      target: `${PackageId}::diffend::join_diff_${pos === 0 ? 'a' : 'b'}`,
      arguments: [
        tx.object(HistoryId),
        tx.object(PoolId),
        tx.pure.u64(diffIndex),
        tx.pure.string(textareaRef.current?.value || ''),
        coin,
        tx.object('0x6'),
        tx.object('0x8'),
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
      <DialogTrigger className='flex-1'>
        <div className='flex-1 flex flex-col items-center border border-dashed border-gray-600 py-4 px-8 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 cursor-pointer dark:hover:bg-gray-700'>
          <div>{text}</div>
          <div className='p-2'>
            <Plus />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join the divergence</DialogTitle>
        </DialogHeader>
        <div className='pt-4'>
          <span>Bet amount:</span>
          <span className='mx-2 font-bold'>{weiToCoin(diff.bet_amount, 9)}</span>
          <span>SUI</span>
        </div>
        <div className='py-4'>
          <Textarea ref={textareaRef} placeholder='Write your opinion here.' />
        </div>
        <Button onClick={handleClick} disabled={loading}>
          {' '}
          {loading ? <ReloadIcon className='mr-2 h-4 w-4 animate-spin' /> : null} Submit
        </Button>
      </DialogContent>
    </Dialog>
  )
}
