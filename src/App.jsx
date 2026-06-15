import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { SelectionProvider } from './context/SelectionContext';
import AppRoutes from './routes/AppRoutes';

// Initialize React Query Client for API state management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents aggressive automatic re-fetch on tab click
      retry: 1, // Number of retry attempts on network error
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SelectionProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </SelectionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
