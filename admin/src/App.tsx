import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignInPage from "./features/auth/SignInPage";
import AuthLayout from "./components/layouts/AuthLayout";
import Dashboard from "./components/pages/Dashboard";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClinet = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false
    }
  }
})

const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignInPage />
  },
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
        
      }
    ]
  }
])

const App = () => {
  return (
    <QueryClientProvider client={queryClinet}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
