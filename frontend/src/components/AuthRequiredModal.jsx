import React from "react";
import { useNavigate } from "react-router-dom";
import { X } from "./Icons";

function AuthRequiredModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 p-8 shadow-2xl animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-lg transition"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto">
            <span className="text-3xl">🔐</span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-gray-900">
              Authentication Required
            </h2>
            <p className="text-sm text-gray-600">
              You need to login or sign up to continue shopping
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => {
                navigate("/login");
                onClose();
              }}
              className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl transition"
            >
              Login
            </button>
            <button
              onClick={() => {
                navigate("/login");
                // The login page will show sign up by default if desired
                onClose();
              }}
              className="flex-1 py-3 border-2 border-brand-600 text-brand-600 hover:bg-brand-50 font-bold rounded-xl transition"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthRequiredModal;
