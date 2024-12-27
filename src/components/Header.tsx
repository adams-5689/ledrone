import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContexts";

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  return (
    <header className="bg-orange-400 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          LeDrone
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/news"
                className="hover:text-orange-200 transition-colors"
              >
                News
              </Link>
            </li>
            <li>
              <Link
                to="/marketplace"
                className="hover:text-orange-200 transition-colors"
              >
                Marketplace
              </Link>
            </li>
            {user ? (
              <>
                <li>
                  <Link
                    to="/profile"
                    className="hover:text-orange-200 transition-colors"
                  >
                    profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => logout()}
                    className="hover:text-orange-200 transition-colors"
                  >
                    logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/login"
                    className="hover:text-orange-200 transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    to="/registration"
                    className="hover:text-orange-200 transition-colors"
                  >
                    Enregistrement
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};
export default Header;
