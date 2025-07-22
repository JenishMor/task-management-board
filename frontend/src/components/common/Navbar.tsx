import { Fragment } from "react";
import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Transition } from "@headlessui/react";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../utils/cn";

export const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-indigo-600">
                Task Manager
              </span>
            </Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none hover:border-none">
                    <span className="sr-only">Open user menu</span>
                    {user.profilePicture ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.profilePicture}
                        alt={user.name}
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-600">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg border border-gray-200 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <Link
                          to="/profile"
                          className={cn(
                            active ? "bg-gray-100" : "",
                            "flex items-center gap-2 px-4 py-2 text-sm text-gray-700 w-full"
                          )}
                          style={{
                            textDecoration: "none",
                            color: "inherit",
                            fontSize: "1em",
                          }}
                        >
                          <User size={18} className="text-gray-500" />
                          <span>Your Profile</span>
                        </Link>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={handleLogout}
                          className={cn(
                            active ? "bg-gray-100" : "",
                            "flex items-center gap-2 w-full px-4 py-2 text-left text-sm text-gray-700"
                          )}
                        >
                          <LogOut size={18} className="text-gray-500" />
                          <span>Sign out</span>
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
