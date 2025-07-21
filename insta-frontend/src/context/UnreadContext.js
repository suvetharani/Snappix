import { createContext, useState } from 'react';

export const UnreadContext = createContext();

export function UnreadProvider({ children }) {
  const [unreadUserCount, setUnreadUserCount] = useState(0);
  return (
    <UnreadContext.Provider value={{ unreadUserCount, setUnreadUserCount }}>
      {children}
    </UnreadContext.Provider>
  );
} 