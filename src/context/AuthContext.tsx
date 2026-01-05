'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserType = 'traveler' | 'guide';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  userType: UserType;
  setUserType: (type: UserType) => void;
  guideId?: string;
  guideEmail?: string;
  guideName?: string;
  setGuideInfo: (id: string, email: string, name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState<UserType>('traveler');
  const [guideId, setGuideId] = useState<string | undefined>();
  const [guideEmail, setGuideEmail] = useState<string | undefined>();
  const [guideName, setGuideName] = useState<string | undefined>();

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const savedUserType = localStorage.getItem('userType') as UserType | null;
    const savedGuideId = localStorage.getItem('guideId');
    const savedGuideEmail = localStorage.getItem('guideEmail');
    const savedGuideName = localStorage.getItem('guideName');

    setIsAuthenticated(authStatus === 'true');
    if (savedUserType) setUserType(savedUserType);
    if (savedGuideId) setGuideId(savedGuideId);
    if (savedGuideEmail) setGuideEmail(savedGuideEmail);
    if (savedGuideName) setGuideName(savedGuideName);
  }, []);

  useEffect(() => {
    localStorage.setItem('isAuthenticated', String(isAuthenticated));
    localStorage.setItem('userType', userType);
    
    if (guideId) localStorage.setItem('guideId', guideId);
    if (guideEmail) localStorage.setItem('guideEmail', guideEmail);
    if (guideName) localStorage.setItem('guideName', guideName);
  }, [isAuthenticated, userType, guideId, guideEmail, guideName]);

  const setGuideInfo = (id: string, email: string, name: string) => {
    setGuideId(id);
    setGuideEmail(email);
    setGuideName(name);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType('traveler');
    setGuideId(undefined);
    setGuideEmail(undefined);
    setGuideName(undefined);
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('guideId');
    localStorage.removeItem('guideEmail');
    localStorage.removeItem('guideName');
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        setIsAuthenticated,
        userType,
        setUserType,
        guideId,
        guideEmail,
        guideName,
        setGuideInfo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}