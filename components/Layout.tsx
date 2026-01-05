
import React, { useState } from 'react';
import { User, Role } from '../types';
import { 
  LayoutDashboard, 
  Clock, 
  Palmtree, 
  BadgeDollarSign, 
  ShieldCheck, 
  BookOpen, 
  Menu, 
  X, 
  UserCircle2,
  BarChart3,
  RefreshCcw
} from 'lucide-react';

interface LayoutProps {
  user: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onToggleUser: () => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, activeTab, setActiveTab, onToggleUser, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard, role: ['COLABORADOR', 'GESTOR'] },
    { id: 'ponto', label: 'Ponto Eletrônico', icon: Clock, role: ['COLABORADOR', 'GESTOR'] },
    { id: 'resultados', label: 'Meus Resultados', icon: BarChart3, role: ['COLABORADOR', 'GESTOR'] },
    { id: 'ferias', label: 'Minhas Férias', icon: Palmtree, role: ['COLABORADOR', 'GESTOR'] },
    { id: '13o', label: 'Décimo Terceiro', icon: BadgeDollarSign, role: ['COLABORADOR', 'GESTOR'] },
    { id: 'gestor', label: 'Painel Gestor', icon: ShieldCheck, role: ['GESTOR'] },
    { id: 'docs', label: 'Manual de Dados', icon: BookOpen, role: ['COLABORADOR', 'GESTOR'] },
  ];

  const filteredNav = navItems.filter(item => item.role.includes(user.role));

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <header className="md:hidden bg-emerald-600 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <h1 className="font-bold text-lg flex items-center gap-2">FarmaGestão</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside className={`
        fixed inset-0 z-40 bg-white md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 border-r border-slate-200 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:block border-b border-slate-100">
          <h1 className="font-bold text-xl text-emerald-700">FarmaGestão</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Módulos Google Cloud</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredNav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                activeTab === item.id 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-emerald-700' : 'text-slate-400'} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
              <UserCircle2 size={24} />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-slate-800 truncate">{user.nome}</p>
              <p className="text-xs text-slate-500 truncate capitalize">{user.role.toLowerCase()}</p>
            </div>
          </div>
          <button 
            onClick={onToggleUser}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100"
          >
            <RefreshCcw size={14} />
            Alternar Perfil
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
