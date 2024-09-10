import { useForm } from 'react-hook-form'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog'
import { format } from 'date-fns'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form'
import { Input } from './ui/input'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { cn } from '@/lib/utils'
import { Calendar } from './ui/calendar'
import { CalendarIcon } from 'lucide-react'
import { TimePickerComp } from './TimePickerComp'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { HistoryId, PackageId } from '@/lib/consts'
import { useState } from 'react'
import { ReloadIcon } from '@radix-ui/react-icons'

const formSchema = z.object({
  title: z.string().min(6, {
    message: 'Title must be at least 6 characters.',
  }),
  desc: z.string().min(6, {
    message: 'Title must be at least 6 characters.',
  }),
  amount: z.number().min(0.01, {
    message: 'Amount must be at least 0.01 SUI.',
  }),
  date: z.date().min(new Date(), {
    message: 'Time must be in the future.',
  }),
  time: z.date(),
  mode: z.string(),
})

export default function NewDiff({ address }: { address: string | undefined }) {
  const [open, setOpen] = useState(false)
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const [loading, setLoading] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      desc: '',
      amount: 0.01,
      date: new Date(),
      time: new Date(),
      mode: '0',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(123)
    if (loading) return
    console.log(123)
    if (!address) return null
    console.log(123)
    const date = new Date(values.date)
    const time = new Date(values.time)
    date.setHours(time.getHours(), time.getMinutes(), time.getSeconds())
    if (date < new Date()) return null
    console.log(123)
    setLoading(true)

    console.log(123)
    const tx = new Transaction()
    tx.moveCall({
      target: `${PackageId}::diffend::create_diff`,
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

    console.log(values)
  }
  return (
    <div className='flex-1 m-2'>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>
          <Button className='text-xl p-6'>Create Divergence</Button>
        </DialogTrigger>
        <DialogContent className='max-h-[90vh] overflow-auto'>
          <DialogHeader>
            <DialogTitle>Create Divergence</DialogTitle>
          </DialogHeader>
          <div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                <FormField
                  control={form.control}
                  name='title'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder='Divergence title' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='desc'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder='What is wrong ?' {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='amount'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bet ( $SUI )</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='How much to bet ?'
                          {...field}
                          type='number'
                          onChange={(event) => field.onChange(+event.target.value)}
                        />
                      </FormControl>
                      <FormDescription>How much to bet ? </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='mode'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select a mode' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value='0'>Random</SelectItem>
                          <SelectItem value='1'>Vote</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Win by random or vote</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='date'
                  render={({ field }) => (
                    <FormItem className='flex flex-col'>
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'w-[240px] pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                              <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className='w-auto p-0' align='start'>
                          <Calendar
                            mode='single'
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>The Divergence end date.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='time'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <TimePickerComp date={field.value} setDate={(val) => field.onChange(val)} />
                      </FormControl>
                      <FormDescription>The Divergence end date.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type='submit' disabled={loading}>
                  {' '}
                  {loading ? <ReloadIcon className='mr-2 h-4 w-4 animate-spin' /> : null} Submit
                </Button>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
