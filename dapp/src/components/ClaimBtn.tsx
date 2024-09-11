import { DiffModel } from '@/model/model'
import { Button } from './ui/button'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { ReloadIcon } from '@radix-ui/react-icons'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { HistoryId, PackageId, PoolId } from '@/lib/consts'

export default function ClaimBtn({ diff, diffIndex }: { diff: DiffModel; diffIndex: number }) {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const { toast } = useToast()
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const [loading, setLoading] = useState(false)
  const address = account?.address
  const voteIndex = diff.votes.findIndex((v) => v.fields.user === address)
  const isVoter = voteIndex > -1

  const canClaim =
    address &&
    (diff.winner === address ||
      diff.votes.filter((v) => v.fields.user === address && !v.fields.claim_reward).length > 0 ||
      diff.user_a === address ||
      diff.user_b === address)
  const handleClick = () => {
    setLoading(true)
    const tx = new Transaction()
    tx.setGasBudget(100_000_000)
    const target = !isVoter ? 'claim_reward' : 'claim_reward_voter'
    const args = !isVoter
      ? [
          tx.object(HistoryId),
          tx.object(PoolId),
          tx.pure.u64(diffIndex),
          tx.object('0x6'),
          tx.object('0x8'),
        ]
      : [
          tx.object(HistoryId),
          tx.object(PoolId),
          tx.pure.u64(diffIndex),
          tx.pure.u64(voteIndex),
          tx.object('0x6'),
          tx.object('0x8'),
        ]
    tx.moveCall({
      target: `${PackageId}::diffend::${target}`,
      arguments: args,
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
            setLoading(false)
            console.log('executed transaction', result)
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
          toast({
            title: error.message,
            variant: 'destructive',
          })
          console.error('error', error)
        },
      }
    )
  }
  return (
    <Button onClick={handleClick} disabled={!canClaim && loading} className='mr-6'>
      {loading ? <ReloadIcon className='mr-2 h-4 w-4 animate-spin' /> : null}Claim Reward
    </Button>
  )
}
