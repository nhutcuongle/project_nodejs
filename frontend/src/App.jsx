import { useAuth } from "./context/AuthContext";
import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";
import Header from "./components/Header";

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mt-16 overflow-y-auto">
        <AppRouter />
      </main>
    </div>
  );
}

export default App;
