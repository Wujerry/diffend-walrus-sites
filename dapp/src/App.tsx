import './App.css'
import Web3Provider from './components/Web3Provider'
import { ThemeProvider } from '@/components/theme-provider'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Home from './pages/Home'
import Detail from './pages/Detail'
import Header from './components/Header'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Home></Home>,
  },
  {
    path: '/detail',
    element: <Detail></Detail>,
  },
])

function App() {
  return (
    <ThemeProvider defaultTheme='dark' storageKey='vite-ui-theme'>
      <Web3Provider>
        <Header></Header>
        <RouterProvider router={router} />
      </Web3Provider>
    </ThemeProvider>
  )
}

export default App
