
import React, { useState, useEffect } from 'react';
import { User, Role, PontoRecord, FeriasRequest, AppConfig, VendaRecord } from './types';
import { MOCK_USERS, CONFIG, MOCK_SALES } from './constants';
import Layout from './components/Layout';
import ModulePonto from './components/ModulePonto';
import ModuleFerias from './components/ModuleFerias';
import Module13 from './components/Module13';
import ModuleGestor from './components/ModuleGestor';
import ModuleResultados from './components/ModuleResultados';
import Dashboard from './components/Dashboard';
import Documentation from './components/Documentation';

const App: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [pontoRecords, setPontoRecords] = useState<PontoRecord[]>([]);
  const [feriasRequests, setFeriasRequests] = useState<FeriasRequest[]>([]);
  const [salesRecords, setSalesRecords] = useState<VendaRecord[]>([]);
  const [appConfig, setAppConfig] = useState<AppConfig>(CONFIG);

  useEffect(() => {
    const savedUsers = localStorage.getItem('farma_users');
    const savedPonto = localStorage.getItem('farma_ponto');
    const savedFerias = localStorage.getItem('farma_ferias');
    const savedSales = localStorage.getItem('farma_sales');
    const savedConfig = localStorage.getItem('farma_config');
    
    const initialUsers = savedUsers ? JSON.parse(savedUsers) : MOCK_USERS;
    setUsers(initialUsers);
    
    if (savedConfig) setAppConfig(JSON.parse(savedConfig));
    if (!currentUser) setCurrentUser(initialUsers[0]);
    
    if (savedPonto) setPontoRecords(JSON.parse(savedPonto));
    if (savedFerias) setFeriasRequests(JSON.parse(savedFerias));
    setSalesRecords(savedSales ? JSON.parse(savedSales) : MOCK_SALES);
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem('farma_users', JSON.stringify(users));
    }
    localStorage.setItem('farma_ponto', JSON.stringify(pontoRecords));
    localStorage.setItem('farma_ferias', JSON.stringify(feriasRequests));
    localStorage.setItem('farma_sales', JSON.stringify(salesRecords));
    localStorage.setItem('farma_config', JSON.stringify(appConfig));
  }, [users, pontoRecords, feriasRequests, salesRecords, appConfig]);

  const toggleUser = () => {
    if (!currentUser) return;
    const nextUser = users.find(u => u.id !== currentUser.id) || users[0];
    setCurrentUser(nextUser);
    setActiveTab('dashboard');
  };

  const handleAddUser = (newUser: User) => setUsers(prev => [...prev, newUser]);
  const handleDeleteUser = (userId: string) => {
    if (currentUser?.id === userId) {
      alert("Você não pode excluir seu próprio perfil.");
      return;
    }
    if (window.confirm("Deseja excluir este colaborador?")) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  if (!currentUser) return <div className="p-8 text-center">Carregando...</div>;

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard user={currentUser} setTab={setActiveTab} />;
      case 'ponto': return <ModulePonto user={currentUser} records={pontoRecords} config={appConfig} onAdd={rec => setPontoRecords([rec, ...pontoRecords])} />;
      case 'ferias': return <ModuleFerias user={currentUser} requests={feriasRequests} onAdd={req => setFeriasRequests([req, ...feriasRequests])} />;
      case 'resultados': return <ModuleResultados user={currentUser} users={users} salesData={salesRecords} />;
      case '13o': return <Module13 user={currentUser} />;
      case 'gestor':
        return currentUser.role === 'GESTOR' ? (
          <ModuleGestor 
            currentUser={currentUser}
            users={users} 
            pontoRecords={pontoRecords} 
            feriasRequests={feriasRequests}
            setFeriasRequests={setFeriasRequests}
            onAddUser={handleAddUser}
            onDeleteUser={handleDeleteUser}
            appConfig={appConfig}
            onUpdateConfig={setAppConfig}
            onUploadSales={setSalesRecords}
          />
        ) : null;
      case 'docs': return <Documentation />;
      default: return <Dashboard user={currentUser} setTab={setActiveTab} />;
    }
  };

  return (
    <Layout user={currentUser} activeTab={activeTab} setActiveTab={setActiveTab} onToggleUser={toggleUser}>
      {renderContent()}
    </Layout>
  );
};

export default App;
