'use client';

import { UserProfile } from '@clerk/nextjs';

export default function UserProfilePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
          <p className="mt-2 text-gray-600">Manage your account information and preferences</p>
        </div>
        <div className="rounded-lg bg-white shadow-lg">
          <UserProfile
            path="/user-profile"
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none border-0',
                profileSectionTitle: 'text-lg font-semibold text-gray-900',
                profileSectionContent: 'text-gray-600',
                formButtonPrimary: 'bg-red-600 hover:bg-red-700 text-white',
                formButtonReset: 'text-gray-600 hover:text-gray-900',
                dividerLine: 'bg-gray-200',
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
