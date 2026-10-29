import { render } from '@testing-library/react';
import React from 'react';
import App from '../App';
import { MOCK_USERS } from '../mockData';

export const renderAsStudent = (userId = 'usr-1') => {
  const student = MOCK_USERS.find((u) => u.id === userId) || MOCK_USERS[0];
  localStorage.setItem('spinsync_db_user_v6', JSON.stringify(student));
  return render(<App />);
};

export const renderAsAdmin = () => {
  const admin = MOCK_USERS.find((u) => u.role === 'admin') || MOCK_USERS[3];
  localStorage.setItem('spinsync_db_user_v6', JSON.stringify(admin));
  return render(<App />);
};
