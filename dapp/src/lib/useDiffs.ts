/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSuiClientQuery } from '@mysten/dapp-kit'
import { HistoryId } from './consts'
import { DiffModel } from '@/model/model'

export default function useDiffs() {
  const historyObj = useSuiClientQuery('getObject', {
    id: HistoryId,
    options: {
      showDisplay: true,
      showType: true,
      showContent: true,
    },
  })

  let listData: DiffModel[] = []
  const handleData = (obj: any) => {
    const content = obj.data?.data?.content as any
    const list = content?.fields?.record
    if (list && list.length) {
      return list.map((item: any) => item.fields)
    }
    return []
  }
  if (historyObj.status === 'success') {
    listData = handleData(historyObj)
  }
  const refetch = async () => {
    const res = await historyObj.refetch()
    if (res.status === 'success') {
      listData = handleData(res)
      console.log('historyObj refetch', listData)
    }
  }
  return { diffList: listData.reverse(), reload: refetch }
}
