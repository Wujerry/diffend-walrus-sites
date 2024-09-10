import { ConnectButton } from '@mysten/dapp-kit'
// import {
//   NavigationMenu,
//   NavigationMenuItem,
//   NavigationMenuLink,
//   NavigationMenuList,
// } from './ui/navigation-menu'
import { ModeToggle } from './mode-toggle'

export default function Header() {
  return (
    <div className='flex p-4 items-center'>
      <div className='flex-1 font-bold text-2xl'>
        <span className='dark:text-white'>Diff</span>
        <span className='text-yellow-500'>end</span>
        <span className='text-gray-500  font-normal text-lg inline-block pl-4'>
          Divergence Terminator
        </span>
      </div>

      <ModeToggle></ModeToggle>
      <div className='w-4 inline-block'></div>
      <ConnectButton />
    </div>
  )
}
