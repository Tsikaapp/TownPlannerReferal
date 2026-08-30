import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Browsers keep the scroll offset across client-side navigations; reset it. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
