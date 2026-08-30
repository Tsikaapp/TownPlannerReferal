import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AuthProvider from '@/auth/AuthProvider';
import ScrollToTop from '@/components/ScrollToTop';
import AppLayout from '@/components/layout/AppLayout';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import PublicLayout from '@/components/layout/PublicLayout';

import About from '@/pages/public/About';
import Directory from '@/pages/public/Directory';
import Home from '@/pages/public/Home';
import NotFound from '@/pages/public/NotFound';
import ProfessionalProfile from '@/pages/public/ProfessionalProfile';
import ReferClient from '@/pages/public/ReferClient';

import ForgotPassword from '@/pages/auth/ForgotPassword';
import Join from '@/pages/auth/Join';
import ResetPassword from '@/pages/auth/ResetPassword';
import SignIn from '@/pages/auth/SignIn';

import AdminMembers from '@/pages/app/AdminMembers';
import AdminReferrals from '@/pages/app/AdminReferrals';
import Dashboard from '@/pages/app/Dashboard';
import Enquiries from '@/pages/app/Enquiries';
import ProfileSettings from '@/pages/app/ProfileSettings';
import ReferralsReceived from '@/pages/app/ReferralsReceived';
import ReferralsSent from '@/pages/app/ReferralsSent';

// Vite injects the deploy base ('/' locally, '/<repo>/' on GitHub Pages).
// React Router wants it without the trailing slash.
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <AuthProvider>
        <ScrollToTop />
        <Routes>
          {/* Open to everyone. Referring does not need an account. */}
          <Route element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="directory" element={<Directory />} />
            <Route path="directory/:id" element={<ProfessionalProfile />} />
            <Route path="refer" element={<ReferClient />} />
            <Route path="about" element={<About />} />
            <Route path="*" element={<NotFound />} />
          </Route>

          {/* Credentials, on their own split layout. */}
          <Route path="sign-in" element={<SignIn />} />
          <Route path="join" element={<Join />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password" element={<ResetPassword />} />

          {/* Seeing referral detail requires a session. */}
          <Route element={<ProtectedRoute />}>
            <Route path="app" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="received" element={<ReferralsReceived />} />
              <Route path="sent" element={<ReferralsSent />} />
              <Route path="enquiries" element={<Enquiries />} />
              <Route path="profile" element={<ProfileSettings />} />

              <Route element={<ProtectedRoute adminOnly />}>
                <Route path="admin/referrals" element={<AdminReferrals />} />
                <Route path="admin/members" element={<AdminMembers />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
