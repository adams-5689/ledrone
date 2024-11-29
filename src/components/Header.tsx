import React from "react";
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          LeDrone
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link
                to="/news"
                className="hover:text-blue-200 transition-colors"
              >
                News
              </Link>
            </li>
            <li>
              <Link
                to="/marketplace"
                className="hover:text-blue-200 transition-colors"
              >
                Marketplace
              </Link>
            </li>
            <li>
              <Link
                to="/login"
                className="hover:text-blue-200 transition-colors"
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/registration"
                className="hover:text-blue-200 transition-colors"
              >
                Registration
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};
export default Header;
