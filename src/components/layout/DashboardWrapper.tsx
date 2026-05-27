import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserRole, User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboardWrapper from '../admin/AdminDashboardWrapper';

interface DashboardWrapperProps {
  currentRole: UserRole;
  currentUser: User | null;
  MentorDashboard: React.ElementType;
  UserDashboard: React.ElementType;
  AdminDashboard?: React.ElementType;
}

const DashboardWrapper: React.FC<DashboardWrapperProps> = ({ 
  currentRole, currentUser, ...props 
}) => {
  const { signOut } = useAuth();
  if (currentRole === 'visitor') return <Navigate to="/auth" />;
  
  if (currentRole === 'admin') {
    return (
      <AdminDashboardWrapper 
        currentUser={currentUser} 
        onLogout={signOut} 
      />
    );
  }

  const Component = currentRole === 'mentor' 
    ? props.MentorDashboard 
    : props.UserDashboard;

  return (
    <Component 
      currentUser={currentUser} 
      onLogout={signOut} 
    />
  );
};

export default DashboardWrapper;

