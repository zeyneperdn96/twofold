import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/pages/Home'
import { TripDetail } from '@/pages/TripDetail'
import { NotFound } from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/trip/:tripId',
        element: <TripDetail />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
