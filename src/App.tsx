import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { AuthProvider } from './context/AuthContext';
import { MainLayout } from './components/layout/MainLayout';
import { Toaster } from "@/components/ui/sonner";

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Main Pages
import Dashboard from './pages/Dashboard';
import CompanyPage from './pages/company/CompanyPage';
import StoresPage from './pages/stores/StoresPage';
import ProductsPage from './pages/products/ProductsPage';
import EmployeesPage from './pages/employes/EmployeesPage';

// Route Guard Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem('auth') !== null;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="store-management-theme">
      <Router>
        <AuthProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            <Route path="/company" element={
              <ProtectedRoute>
                <MainLayout>
                  <CompanyPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/stores" element={
              <ProtectedRoute>
                <MainLayout>
                  <StoresPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/products" element={
              <ProtectedRoute>
                <MainLayout>
                  <ProductsPage />
                </MainLayout>
              </ProtectedRoute>
            } />

            <Route path="/employees" element={
              <ProtectedRoute>
                <MainLayout>
                  <EmployeesPage />
                </MainLayout>
              </ProtectedRoute>
            } />
            
            {/* Placeholder routes */}
            {[
              '/schedule', 
              '/requests', 
              '/attendance', 
              '/files', 
              '/notifications',
              '/settings',
              '/profile'
            ].map((path) => (
              <Route 
                key={path} 
                path={path} 
                element={
                  <ProtectedRoute>
                    <MainLayout>
                      <div className="flex items-center justify-center h-96">
                        <div className="text-center">
                          <h2 className="text-2xl font-bold mb-2">{path.slice(1).charAt(0).toUpperCase() + path.slice(2)} Page</h2>
                          <p className="text-muted-foreground">This page is under construction</p>
                        </div>
                      </div>
                    </MainLayout>
                  </ProtectedRoute>
                } 
              />
            ))}
            
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/dashboard\" replace />} />
          </Routes>
          
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;