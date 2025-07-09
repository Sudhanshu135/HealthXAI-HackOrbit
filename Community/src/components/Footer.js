import React from 'react';
import { FaInstagram, FaTwitter, FaFacebookF, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4">
        {/* Left Section with Logo and Info */}
        <div className="flex flex-col items-start w-full md:w-1/2 mb-6 md:mb-0">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} <strong>Health x AI</strong>. Empowering wellness through technology.
          </p>
        </div>

        {/* Right Section with Social Media Icons */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <div className="flex space-x-5">
            <a href="https://instagram.com" className="text-gray-400 hover:text-white" aria-label="Instagram">
              <FaInstagram size={24} />
            </a>
            <a href="https://twitter.com" className="text-gray-400 hover:text-white" aria-label="Twitter">
              <FaTwitter size={24} />
            </a>
            <a href="https://facebook.com" className="text-gray-400 hover:text-white" aria-label="Facebook">
              <FaFacebookF size={24} />
            </a>
            <a href="https://linkedin.com" className="text-gray-400 hover:text-white" aria-label="LinkedIn">
              <FaLinkedinIn size={24} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
