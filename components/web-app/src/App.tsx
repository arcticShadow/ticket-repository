import { RouterProvider, createBrowserRouter, Link, Outlet } from 'react-router-dom';
import { EventList } from './components/events/EventList';
import { EventDetail } from './components/events/EventDetail';
import { PaymentFlow } from './components/payment/PaymentFlow';
import { CreateEvent } from './components/events/CreateEvent';

function AppLayout() {
  return (
    <>
      <header>
        <nav>
          <Link to="/">Home</Link>
          &nbsp;|&nbsp;
          <Link to="/events/new">Create Event</Link>
          
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <EventList />,
      },
      {
        path: '/events/:id',
        element: <EventDetail />,
      },
      {
        path: '/events/:id/purchase',
        element: <PaymentFlow />,
      },
      {
        path: '/events/new',
        element: <CreateEvent />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
