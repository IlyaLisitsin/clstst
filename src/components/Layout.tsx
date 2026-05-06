import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
