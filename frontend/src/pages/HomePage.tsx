import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ChatArea } from '../components/ChatArea';
import { InputArea } from '../components/InputArea';
import { useAuth } from '../hooks/useAuth';

export const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMobileMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar
        onMobileMenuToggle={handleMobileMenuToggle}
        isMobileMenuOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          className="hidden lg:block"
        />

        {/* Mobile Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleSidebarClose}
          className="lg:hidden"
        />

        {/* Chat Content */}
        <div className="flex-1 flex flex-col min-w-0">
          <ChatArea />
          <InputArea />
        </div>
      </div>
    </div>
  );
};