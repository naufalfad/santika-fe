import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900">
      <Sidebar />
      <Header />
      <main className="pl-64 pt-16">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;