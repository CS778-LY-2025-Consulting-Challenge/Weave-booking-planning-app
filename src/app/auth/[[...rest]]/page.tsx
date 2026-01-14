import { SignIn } from '@clerk/nextjs';

export default function Auth() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700',
            card: 'shadow-2xl',
            headerTitle: 'text-2xl font-bold',
            headerSubtitle: 'text-gray-400',
          },
        }}
        signUpUrl="/signup"
        forceRedirectUrl="/onboarding"
      />
    </div>
  );
}
