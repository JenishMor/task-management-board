import { Outlet } from "react-router-dom";
import { Navbar } from "./common/Navbar";

export const Layout = () => {
  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Navbar />
      <main className="w-full px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full mx-auto max-w-none">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
