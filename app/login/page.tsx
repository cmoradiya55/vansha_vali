'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [gamname, setGamname] = useState('');
  const [taluka, setTaluka] = useState('');
  const [district, setDistrict] = useState('');
  const [errors, setErrors] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    gamname: '',
    taluka: '',
    district: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, signup, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/hayati');
    }
  }, [isAuthenticated, loading, router]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ 
      email: '', 
      password: '', 
      confirmPassword: '',
      gamname: '',
      taluka: '',
      district: ''
    });

    // Validate email
    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: 'Email is required' }));
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: 'Please enter a valid email address' }));
      setIsLoading(false);
      return;
    }

    // Validate password
    if (!password.trim()) {
      setErrors((prev) => ({ ...prev, password: 'Password is required' }));
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters' }));
      setIsLoading(false);
      return;
    }

    if (isSignup) {
      // Validate signup fields
      if (!confirmPassword.trim()) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' }));
        setIsLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
        setIsLoading(false);
        return;
      }

      if (!gamname.trim()) {
        setErrors((prev) => ({ ...prev, gamname: 'Gam name is required' }));
        setIsLoading(false);
        return;
      }

      if (!taluka.trim()) {
        setErrors((prev) => ({ ...prev, taluka: 'Taluka is required' }));
        setIsLoading(false);
        return;
      }

      if (!district.trim()) {
        setErrors((prev) => ({ ...prev, district: 'District is required' }));
        setIsLoading(false);
        return;
      }

      // Attempt signup
      const result = await signup(email, password, {
        gamname: gamname.trim(),
        taluka: taluka.trim(),
        district: district.trim(),
      });

      if (result.success) {
        toast.success('Account created successfully!', {
          position: 'top-right',
          autoClose: 2000,
        });
        setTimeout(() => {
          router.push('/hayati');
        }, 500);
      } else {
        toast.error(result.error || 'Signup failed. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    } else {
      // Attempt login
      const result = await login(email, password);

      if (result.success) {
        toast.success('Login successful!', {
          position: 'top-right',
          autoClose: 2000,
        });
        setTimeout(() => {
          router.push('/hayati');
        }, 500);
      } else {
        toast.error(result.error || 'Login failed. Please try again.', {
          position: 'top-right',
          autoClose: 3000,
        });
      }
    }

    setIsLoading(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-yellow-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-yellow-100 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-2xl">
          {/* Logo/Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-8 w-8 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Vanshavali</h1>
            <p className="mt-2 text-gray-600">Pedhinamu Certificate System</p>
          </div>

          {/* Toggle between Login and Signup */}
          <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setIsSignup(false)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                !isSignup
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsSignup(true)}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                isSignup
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }
                }}
                className={`w-full rounded-lg border px-4 py-3 text-black focus:border-yellow-500 focus:outline-none ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) {
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }
                }}
                className={`w-full rounded-lg border px-4 py-3 text-black focus:border-yellow-500 focus:outline-none ${
                  errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="Enter your password"
                autoComplete={isSignup ? 'new-password' : 'current-password'}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field (Signup only) */}
            {isSignup && (
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                    }
                  }}
                  className={`w-full rounded-lg border px-4 py-3 text-black focus:border-yellow-500 focus:outline-none ${
                    errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                  }`}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {/* Additional Fields (Signup only) */}
            {isSignup && (
              <>
                <div>
                  <label htmlFor="gamname" className="mb-2 block text-sm font-medium text-gray-700">
                    Gam Name (Village Name)
                  </label>
                  <input
                    id="gamname"
                    type="text"
                    value={gamname}
                    onChange={(e) => {
                      setGamname(e.target.value);
                      if (errors.gamname) {
                        setErrors((prev) => ({ ...prev, gamname: '' }));
                      }
                    }}
                    className={`w-full rounded-lg border px-4 py-3 text-black focus:border-yellow-500 focus:outline-none ${
                      errors.gamname ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter gam/village name"
                  />
                  {errors.gamname && (
                    <p className="mt-1 text-sm text-red-600">{errors.gamname}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="taluka" className="mb-2 block text-sm font-medium text-gray-700">
                    Taluka
                  </label>
                  <input
                    id="taluka"
                    type="text"
                    value={taluka}
                    onChange={(e) => {
                      setTaluka(e.target.value);
                      if (errors.taluka) {
                        setErrors((prev) => ({ ...prev, taluka: '' }));
                      }
                    }}
                    className={`w-full rounded-lg border px-4 py-3 text-black focus:border-yellow-500 focus:outline-none ${
                      errors.taluka ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter taluka"
                  />
                  {errors.taluka && (
                    <p className="mt-1 text-sm text-red-600">{errors.taluka}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="district" className="mb-2 block text-sm font-medium text-gray-700">
                    District
                  </label>
                  <input
                    id="district"
                    type="text"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      if (errors.district) {
                        setErrors((prev) => ({ ...prev, district: '' }));
                      }
                    }}
                    className={`w-full rounded-lg border px-4 py-3 text-black focus:border-yellow-500 focus:outline-none ${
                      errors.district ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                    }`}
                    placeholder="Enter district"
                  />
                  {errors.district && (
                    <p className="mt-1 text-sm text-red-600">{errors.district}</p>
                  )}
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg bg-yellow-600 px-4 py-3 font-semibold text-white transition-colors ${
                isLoading
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2'
              }`}
            >
              {isLoading 
                ? (isSignup ? 'Creating account...' : 'Logging in...') 
                : (isSignup ? 'Sign Up' : 'Login')
              }
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 rounded-lg bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> {isSignup 
                ? 'Create a new account to access the system. All fields are required for registration.'
                : 'Login with your registered email and password. Password must be at least 6 characters.'
              }
            </p>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
}

