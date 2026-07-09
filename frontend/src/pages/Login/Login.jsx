import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      const user = await login(email, password);
      if (user?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      const user = await register(name, email, password);
      navigate("/");
    } catch (err) {
      // Check if user already exists
      if (err.message.includes("already exists")) {
        setError("You are already a member. Please login instead.");
        setIsLogin(true);
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-100 to-slate-200 px-3 py-8 font-sans sm:px-6 sm:py-12 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-white/50 shadow-2xl animate-fade-in sm:space-y-8 sm:p-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand-650 flex items-center justify-center font-bold text-white text-xl">
              K
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-800">
              Kirana<span className="text-brand-600">Mart</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-gray-900 mt-4">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-xs text-gray-500">
            {isLogin
              ? "Sign in to order fresh groceries in minutes"
              : "Sign up to buy fresh items at wholesale prices"}
          </p>
        </div>

        {/* Toggle Buttons */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setIsLogin(true);
              setError("");
              setName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition ${
              isLogin
                ? "bg-white text-brand-600 shadow-md"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError("");
              setName("");
              setEmail("");
              setPassword("");
              setConfirmPassword("");
            }}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-bold transition ${
              !isLogin
                ? "bg-white text-brand-600 shadow-md"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={isLogin ? handleLoginSubmit : handleSignupSubmit}
          className="mt-8 space-y-4"
        >
          <div className="space-y-3">
            {/* Name field - only for signup */}
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Amit Kumar"
                  className="w-full bg-slate-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@example.com"
                className="w-full bg-slate-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isLogin ? "Enter password" : "Create password"}
                className="w-full bg-slate-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>

            {/* Confirm Password - only for signup */}
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-slate-50 border border-gray-150 rounded-xl px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white rounded-xl font-bold text-sm shadow-md active:scale-98 transition cursor-pointer"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Redirect */}
        <p className="text-center text-xs text-gray-500">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-brand-600 font-bold hover:underline"
          >
            {isLogin ? "Register now" : "Sign In"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
