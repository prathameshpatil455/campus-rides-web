export const getInitials = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) {
    return 'U';
  }

  const firstInitial = firstName?.charAt(0).toUpperCase() || '';
  const lastInitial = lastName?.charAt(0).toUpperCase() || '';

  if (firstInitial && lastInitial) {
    return firstInitial + lastInitial;
  }

  return firstInitial || lastInitial || 'U';
};

export const getFullName = (firstName?: string, lastName?: string): string => {
  if (!firstName && !lastName) {
    return 'User';
  }

  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ') || 'User';
};

export const getFirstName = (firstName?: string): string => {
  return firstName || 'User';
};
