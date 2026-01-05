
import React, { useState, useRef } from 'react';
import { User, PontoRecord, FeriasRequest, Role, AppConfig, VendaRecord } from '../types';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldAlert, Check, X, Users, Briefcase, UserPlus, Calendar, Plus, Trash2, MapPin, Settings2, Crosshair, FileUp, Database, AlertCircle, FileSpreadsheet, Clock } from 'lucide-react';

interface ModuleGestorProps {
  currentUser: User;
  users: User[];
  pontoRecords: PontoRecord[];
  feriasRequests: FeriasRequest[];
  setFeriasRequests: React.Dispatch<React.SetStateAction<FeriasRequest[]>>;
  onAddUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  appConfig: AppConfig;
  onUpdateConfig: (config: AppConfig) => void;
  onUploadSales: (records: VendaRecord[]) => void;
}

const ModuleGestor: React.FC<ModuleGestorProps> = ({ 
  currentUser, 
  users, 
  pontoRecords, 
  feriasRequests, 
  setFeriasRequests, 
  onAddUser, 
  onDeleteUser,
  appConfig,
  onUpdateConfig,
  onUploadSales
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nome: '', email: '', cargo: '', salario: '', dataAdmissao: '', role: 'COLABORADOR' as Role,
    inicioJornada: '08:00', inicioAlmoco: '12:00', retornoAlmoco: '13:00', fimJornada: '17:00'
  });

  const [configFormData, setConfigFormData] = useState<AppConfig>(appConfig);
  const [locLoading, setLocLoading] = useState(false);

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      ...formData,
      salario: Number(formData.salario)
    };
    onAddUser(newUser);
    setIsRegistering(false);
    setFormData({ 
      nome: '', email: '', cargo: '', salario: '', dataAdmissao: '', role: 'COLABORADOR',
      inicioJornada: '08:00', inicioAlmoco: '12:00', retornoAlmoco: '13:00', fimJornada: '17:00'
    });
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateConfig(configFormData);
    setIsConfiguring(false);
  };

  const captureCurrentLocation = () => {
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setConfigFormData({ ...configFormData, pharmacyLat: pos.coords.latitude, pharmacyLng: pos.coords.longitude });
        setLocLoading(false);
      },
      () => setLocLoading(false)
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        const formattedRecords: VendaRecord[] = jsonData.map((row: any) => {
          const rawDate = row.Data || row.data;
          let dateObj: Date = typeof rawDate === 'number' ? new Date((rawDate - 25569) * 86400 * 1000) : new Date(rawDate);
          const year = dateObj.getFullYear();
          const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
          return {
            data: dateObj.toISOString().split('T')[0],
            anoMes: `${year}-${month}`,
            colaboradorEmail: row.Colaborador_Email || row.email || row.Email || '',
            vendasLiquidas: Number(row.Vendas_Liquidas || row.vendas || row.Venda || 0),
            cmv: Number(row.CMV || row.cmv || 0),
            cupons: Number(row.Cupons || row.atendimentos || 0),
            itensVendidos: Number(row.Itens_Vendidos || row.itens || 0),
            parceirosUnidades: Number(row.Parceiros_Unidades || row.parceiros || 0)
          };
        });

        if (window.confirm(`Deseja importar ${formattedRecords.length} registros?`)) {
          onUploadSales(formattedRecords);
          alert('Base de vendas atualizada!');
        }
      } catch (err) {
        alert('Erro ao processar arquivo.');
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const totalSalarios = users.reduce((acc, u) => acc + u.salario, 0);
  const provFeriasMensal = (totalSalarios / 12) * 1.33;
  const prov13Mensal = totalSalarios / 12;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel do Gestor</h2>
          <p className="text-slate-500">Gestão de pessoal e conformidade.</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button onClick={() => fileInputRef.current?.click()} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors">
            <FileUp size={16} /> Subir Vendas
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".xlsx, .xls, .csv" />
          <button onClick={() => { setIsConfiguring(!isConfiguring); setIsRegistering(false); }} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-colors ${isConfiguring ? 'bg-slate-200 text-slate-700' : 'bg-white border border-slate-200 text-slate-600'}`}>
            <Settings2 size={16} /> Configurações
          </button>
          <button onClick={() => { setIsRegistering(!isRegistering); setIsConfiguring(false); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-700 transition-colors">
            {isRegistering ? <X size={16} /> : <UserPlus size={16} />} Cadastrar
          </button>
        </div>
      </div>

      {isRegistering && (
        <div className="bg-white p-6 rounded-2xl border-2 border-emerald-100 shadow-xl animate-in zoom-in-95">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2"><UserPlus className="text-emerald-600" size={20} /> Novo Colaborador</h3>
          <form onSubmit={handleAddEmployee} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <input required type="text" placeholder="Nome Completo" value={formData.nome} onChange={e => setFormData({...formData, nome: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
            <input required type="email" placeholder="E-mail" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
            <input required type="text" placeholder="Cargo" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
            <input required type="number" placeholder="Salário" value={formData.salario} onChange={e => setFormData({...formData, salario: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
            <input required type="date" placeholder="Admissão" value={formData.dataAdmissao} onChange={e => setFormData({...formData, dataAdmissao: e.target.value})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" />
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as Role})} className="px-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="COLABORADOR">Colaborador</option>
              <option value="GESTOR">Gestor</option>
            </select>
            
            <div className="md:col-span-2 lg:col-span-3 border-t pt-4 mt-2">
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 flex items-center gap-2"><Clock size={16}/> Jornada de Trabalho</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400">INÍCIO</label>
                  <input type="time" value={formData.inicioJornada} onChange={e => setFormData({...formData, inicioJornada: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">SAÍDA ALMOÇO</label>
                  <input type="time" value={formData.inicioAlmoco} onChange={e => setFormData({...formData, inicioAlmoco: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">RETORNO ALMOÇO</label>
                  <input type="time" value={formData.retornoAlmoco} onChange={e => setFormData({...formData, retornoAlmoco: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400">FIM JORNADA</label>
                  <input type="time" value={formData.fimJornada} onChange={e => setFormData({...formData, fimJornada: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
            </div>

            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-2 mt-4">
              <button type="button" onClick={() => setIsRegistering(false)} className="px-6 py-2 text-slate-500 font-bold">Cancelar</button>
              <button type="submit" className="bg-emerald-600 text-white px-8 py-2 rounded-xl font-bold shadow-lg shadow-emerald-100">Salvar Colaborador</button>
            </div>
          </form>
        </div>
      )}

      {isConfiguring && (
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-100 shadow-xl animate-in zoom-in-95">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><MapPin className="text-blue-600" size={20} /> Localização Ponto</h3>
            <button onClick={captureCurrentLocation} disabled={locLoading} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg"><Crosshair size={14} className={locLoading ? 'animate-spin' : ''} /> {locLoading ? 'Capturando...' : 'Usar Atual'}</button>
          </div>
          <form onSubmit={handleSaveConfig} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <input required type="number" step="any" value={configFormData.pharmacyLat} onChange={e => setConfigFormData({...configFormData, pharmacyLat: Number(e.target.value)})} className="px-4 py-2 border rounded-lg outline-none" placeholder="Lat" />
            <input required type="number" step="any" value={configFormData.pharmacyLng} onChange={e => setConfigFormData({...configFormData, pharmacyLng: Number(e.target.value)})} className="px-4 py-2 border rounded-lg outline-none" placeholder="Lng" />
            <input required type="number" value={configFormData.allowedRadiusMeters} onChange={e => setConfigFormData({...configFormData, allowedRadiusMeters: Number(e.target.value)})} className="px-4 py-2 border rounded-lg outline-none" placeholder="Raio (m)" />
            <div className="md:col-span-3 flex justify-end"><button type="submit" className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold">Salvar Configurações</button></div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Equipe e Jornada</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Colaborador</th>
                <th className="px-6 py-4">Jornada Teórica</th>
                <th className="px-6 py-4">Salário</th>
                <th className="px-6 py-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-700">{u.nome}</p>
                    <p className="text-xs text-slate-400">{u.cargo}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Clock size={12} className="text-emerald-500" />
                      {u.inicioJornada} - {u.fimJornada}
                      <span className="text-[10px] text-slate-300">({u.inicioAlmoco}-{u.retornoAlmoco})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-600">R$ {u.salario.toLocaleString('pt-BR')}</td>
                  <td className="px-6 py-4 text-center">
                    <button disabled={currentUser.id === u.id} onClick={() => onDeleteUser(u.id)} className="text-red-400 hover:text-red-600 disabled:opacity-30"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModuleGestor;
