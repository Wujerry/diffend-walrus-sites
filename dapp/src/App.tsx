import './App.css'
import Web3Provider from './components/Web3Provider'
import { ThemeProvider } from '@/components/theme-provider'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Detail from './pages/Detail'
import Header from './components/Header'
import { Toaster } from './components/ui/toaster'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home></Home>,
  },
  {
    path: '/:id',
    element: <Detail></Detail>,
  },
])

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Web3Provider>
        <Header></Header>
        <RouterProvider router={router} />
        <Toaster />
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
