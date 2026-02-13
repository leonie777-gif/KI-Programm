"use client";

import React, { useState } from "react";
import { Home, Users, FileText, FileCheck, Settings, Plus, User, Menu } from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user] = useState({
    full_name: "Demo User",
    email: "demo@example.com",
    einrichtungsart: "kindertagesstaette" 
  });

  const isKindertagesstaette = user?.einrichtungsart === 'kindertagesstaette';

  const navigationItems = [
    {
      title: "Home",
      url: "/home",
      icon: Home,
    },
    {
      title: "Kinder",
      url: "/patients",
      icon: Users,
    },
    {
      title: "Dokumentation",
      url: "/documentation",
      icon: FileText,
    },
    ...(!isKindertagesstaette ? [{
      title: "Berichte",
      url: "/reports",
      icon: FileCheck,
    }] : []),
    {
      title: "Einstellungen",
      url: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    console.log("Logout clicked");
  };

  return (
    <html lang="de">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="m-0 p-0">
        <div className="min-h-screen flex w-full bg-slate-50">
          {/* Sidebar */}
          <aside 
            className={`${
              sidebarOpen ? 'w-64' : 'w-20'
            } bg-white border-r border-slate-200 transition-all duration-300 flex flex-col shadow-sm`}
          >
            {/* Sidebar Header */}
            <div className="border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                {sidebarOpen && (
                  <div className="overflow-hidden">
                    <h2 className="font-semibold text-slate-900 text-lg whitespace-nowrap">MVP</h2>
                    <p className="text-xs text-slate-500 whitespace-nowrap">
                      {isKindertagesstaette ? 'Kindertagesstätte' : 'Therapiezentrum'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 overflow-y-auto">
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.title}>
                      <a
                        href={item.url}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 cursor-pointer"
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span className="whitespace-nowrap">{item.title}</span>}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Top Bar */}
            <header className="bg-white border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200"
                  >
                    <Menu className="w-5 h-5 text-slate-700" />
                  </button>
                  <h1 className="text-xl font-semibold text-slate-900 hidden md:block">
                    {currentPageName || "Dashboard"}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                  <a href="/create-documentation">
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors">
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Neue Dokumentation</span>
                      <span className="sm:hidden">Doku</span>
                    </button>
                  </a>

                  {!isKindertagesstaette && (
                    <a href="/create-report">
                      <button className="flex items-center gap-2 px-4 py-2 border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-lg transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Neuer Bericht</span>
                        <span className="sm:hidden">Bericht</span>
                      </button>
                    </a>
                  )}

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                    >
                      <User className="w-5 h-5 text-slate-700" />
                    </button>

                    {userMenuOpen && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setUserMenuOpen(false)}
                        ></div>
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                          <div className="px-4 py-2 text-slate-900 font-medium border-b border-slate-100">
                            {user?.full_name || user?.email}
                          </div>
                          <div className="px-4 py-1 text-xs text-slate-500">
                            {isKindertagesstaette ? 'Kindertagesstätte' : 'Therapiezentrum'}
                          </div>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            Abmelden
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </header>

            {/* Main content area */}
            <div className="flex-1 overflow-auto p-6">
              {children || (
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                    Willkommen bei x
                  </h2>
                  <p className="text-slate-600">
                    Dies ist ein Pilotprojekt. Die Software befindet sich in der Entwicklung. Alle Daten werden vertraulich behandelt und entsprechend 
                  den geltenden Datenschutzbestimmungen verarbeitet.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}