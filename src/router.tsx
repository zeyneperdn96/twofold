import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { Home } from '@/pages/Home'
import { TripDetail } from '@/pages/TripDetail'
import { TripStory } from '@/pages/TripStory'
import { Join } from '@/pages/Join'
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
        path: '/trip/:tripId/story',
        element: <TripStory />,
      },
      {
        path: '/join/:code',
        element: <Join />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
