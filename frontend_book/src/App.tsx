import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Link, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BookX } from 'lucide-react';

import AdminLayout from './components/admin/AdminLayout';
import Footer from './components/common/Footer';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { BackToTop, PageTransition, ScrollProgressBar } from './components/motion';
import { useAdminAuth } from './contexts/AdminAuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { useSettings } from './contexts/SettingsContext';

const Home = lazy(() => import('./pages/Home'));
const Books = lazy(() => import('./pages/Books'));
const BookDetail = lazy(() => import('./pages/BookDetail'));
const Categories = lazy(() => import('./pages/Categories'));
const CategoryDetail = lazy(() => import('./pages/CategoryDetail'));
const BestSellers = lazy(() => import('./pages/BestSellers'));
const NewArrivals = lazy(() => import('./pages/NewArrivals'));
const Checkout = lazy(() => import('./pages/Checkout'));
const PaymentStatus = lazy(() => import('./pages/PaymentStatus'));
const Download = lazy(() => import('./pages/Download'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Faq = lazy(() => import('./pages/Faq'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

const AdminBookForm = lazy(() => import('./pages/admin/AdminBookForm'));
const AdminBooks = lazy(() => import('./pages/admin/AdminBooks'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminComments = lazy(() => import('./pages/admin/AdminComments'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminRevenue = lazy(() => import('./pages/admin/AdminRevenue'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <BookX className="mx-auto mb-4 h-12 w-12 text-indigo-400" aria-hidden="true" />
        <h1 className="font-serif text-5xl font-bold text-gray-900 dark:text-white">404</h1>
        <p className="mt-3 text-gray-500 dark:text-gray-400">Page not found</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const initialize = useAdminAuth((state) => state.initialize);
  const language = useLanguage((state) => state.language);
  const loadSettings = useSettings((state) => state.load);

  useEffect(() => {
    void initialize();
    void loadSettings();
  }, [initialize, loadSettings]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <BrowserRouter>
      <ScrollProgressBar />
      <ScrollToTop />
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="books/new" element={<AdminBookForm />} />
            <Route path="books/:id/edit" element={<AdminBookForm />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="comments" element={<AdminComments />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="revenue" element={<AdminRevenue />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/books" element={<Books />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/:slug" element={<CategoryDetail />} />
            <Route path="/best-sellers" element={<BestSellers />} />
            <Route path="/new-arrivals" element={<NewArrivals />} />
            <Route path="/checkout/:bookId" element={<Checkout />} />
            <Route path="/payment-status/:paymentId" element={<PaymentStatus />} />
            <Route path="/download/:token" element={<Download />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}
