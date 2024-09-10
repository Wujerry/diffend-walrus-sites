/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSuiClientQuery } from '@mysten/dapp-kit'
import Diff from './Diff'
import { HistoryId } from '@/lib/consts'
import { DiffModel } from '@/model/model'

export default function DiffList() {
  const historyObj = useSuiClientQuery('getObject', {
    id: HistoryId,
    options: {
      showDisplay: true,
      showType: true,
      showContent: true,
    },
  })
  let listData: DiffModel[] = []
  if (historyObj.status === 'success') {
    const content = historyObj.data?.data?.content as any
    const list = content.fields?.record
    if (list && list.length) {
      listData = list.map((item: any) => item.fields)
    }
  }
  return (
    <>
      {listData.map((item) => (
        <Diff data={item} key={item.id.id}></Diff>
      ))}
    </>
  )
}
