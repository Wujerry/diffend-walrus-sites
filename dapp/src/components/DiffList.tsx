/* eslint-disable @typescript-eslint/no-explicit-any */
import Diff from './Diff'
import { DiffModel } from '@/model/model'

export default function DiffList({ listData }: { listData: DiffModel[] }) {
  return (
    <>
      {listData.map((item, index) => (
        <Diff data={item} key={item.id.id} diffIndex={listData.length - 1 - index}></Diff>
      ))}
    </>
  )
}
