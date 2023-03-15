import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from '@app/routes';
import '@app/index.css';
import { Toaster } from 'react-hot-toast';

const router = createBrowserRouter(routes);

ReactDOM.createRoot(document.getElementById('root') as HTMLDivElement).render(
  <>
    <Toaster />
    <RouterProvider router={router} />
  </>
);
