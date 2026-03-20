'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';

// Icons
const PersonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
    />
  </svg>
);

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);

const EmailIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className={className}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
    />
  </svg>
);

export default function SettingsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const userData = {
    fullName: user?.username || '',
    status: 'Active',
    role: 'user',
    email: user?.email || '',
    district: user?.district || '',
    taluko: user?.taluko || '',
    villageName: user?.villageName || '',
    villages: user?.villages || [],
    expiryDate: user?.expiryDate || '',
  };

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ oldPassword: '', newPassword: '', confirmPassword: '' });

    // Validation
    if (!oldPassword.trim()) {
      setErrors((prev) => ({ ...prev, oldPassword: 'Old password is required' }));
      setIsLoading(false);
      return;
    }

    if (!newPassword.trim()) {
      setErrors((prev) => ({ ...prev, newPassword: 'New password is required' }));
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setErrors((prev) => ({ ...prev, newPassword: 'Password must be at least 6 characters' }));
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      setIsLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast.success('Password reset successfully!', {
        position: 'top-right',
        autoClose: 3000,
      });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
    }, 1000);
  };

  if (!user) {
    return null;
  }

  return (
      <div className="mx-auto max-w-4xl space-y-8 p-6">
        {/* ABOUT Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">ABOUT</h2>
          <div className="space-y-3 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <PersonIcon className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Username: </span>
                <span className="text-sm font-medium text-gray-700">{userData.fullName}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckIcon className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Status: </span>
                <span className="text-sm font-medium text-green-600">{userData.status}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StarIcon className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Expiry Date: </span>
                <span className="text-sm font-medium text-gray-700">
                  {userData.expiryDate
                    ? new Date(userData.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACTS Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">CONTACTS</h2>
          <div className="space-y-3 rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <EmailIcon className="h-5 w-5 text-gray-400" />
              <div>
                <span className="text-sm text-gray-500">Email: </span>
                <span className="text-sm font-medium text-gray-700">{userData.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* VILLAGES Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">ASSIGNED VILLAGES</h2>
          <div className="space-y-3 rounded-lg bg-white p-6 shadow-sm">
            {userData.villages.length > 0 ? (
              <div className="space-y-2">
                {userData.villages.map((v, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50 px-4 py-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white" style={{ backgroundColor: 'var(--primary)' }}>
                      {i + 1}
                    </span>
                    <div className="text-sm text-gray-700">
                      <span className="font-medium">{v.village}</span>
                      <span className="text-gray-400 mx-1">&bull;</span>
                      <span>{v.taluko}</span>
                      <span className="text-gray-400 mx-1">&bull;</span>
                      <span>{v.district}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No villages assigned</p>
            )}
          </div>
        </div>

        {/* RESET PASSWORD Section */}
        {/* <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-400">RESET PASSWORD</h2>
          <form onSubmit={handlePasswordReset} className="space-y-4 rounded-lg bg-white p-6 shadow-sm">
            <div>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  if (errors.oldPassword) {
                    setErrors((prev) => ({ ...prev, oldPassword: '' }));
                  }
                }}
                placeholder="Old Password"
                className={`w-full rounded-lg border px-4 py-3 text-black focus:border-yellow-500 focus:outline-none ${
                  errors.oldPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.oldPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.oldPassword}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) {
                    setErrors((prev) => ({ ...prev, newPassword: '' }));
                  }
                }}
                placeholder="New Password"
                className={`w-full rounded-lg border px-4 py-3 text-black focus:border-yellow-500 focus:outline-none ${
                  errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) {
                    setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }
                }}
                placeholder="Confirm Password"
                className={`w-full rounded-lg border px-4 py-3 text-black focus:border-yellow-500 focus:outline-none ${
                  errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'
                }`}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full rounded-lg bg-yellow-600 px-4 py-3 font-semibold uppercase text-white transition-colors ${
                isLoading
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2'
              }`}
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div> */}
      </div>
  );
}

