
import React, { useState, useMemo } from 'react';
import { User, VendaRecord, ResultadoComparativo } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart } from 'recharts';
import { Target, CalendarDays, Zap, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

interface ModuleResultadosProps {
  user: User;
  users: User[];
  salesData: VendaRecord[];
}

const ModuleResultados: React.FC<ModuleResultadosProps> = ({ user, users, salesData }) => {
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [targetEmployeeEmail, setTargetEmployeeEmail] = useState(user.email);

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const currentYear = now.getFullYear();

  const getWorkingDays = (year: number, month: number, upToDay?: number) => {
    let count = 0;
    const lastDay = upToDay || new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= lastDay; day++) {
      const date = new Date(year, month, day);
      if (date.getDay() !== 0) count++;
    }
    return count;
  };

  const isSelectedMonthCurrent = selectedMonth === now.getMonth();
  
  const workingDaysInfo = useMemo(() => {
    const total = getWorkingDays(currentYear, selectedMonth);
    const elapsed = isSelectedMonthCurrent 
      ? getWorkingDays(currentYear, selectedMonth, now.getDate()) 
      : total;
    const remaining = total - elapsed;
    return { total, elapsed, remaining };
  }, [selectedMonth, currentYear, isSelectedMonthCurrent]);

  const biData = useMemo(() => {
    const monthStr = (selectedMonth + 1).toString().padStart(2, '0');
    
    const getDataForYear = (year: number, email: string) => {
      const records = salesData.filter(s => s.anoMes === `${year}-${monthStr}`);
      if (user.role === 'GESTOR' && email === 'GERAL') {
        return records.reduce((acc, curr) => ({
          vendasLiquidas: acc.vendasLiquidas + curr.vendasLiquidas,
          cmv: acc.cmv + curr.cmv,
          cupons: acc.cupons + curr.cupons,
          itensVendidos: acc.itensVendidos + curr.itensVendidos,
          parceirosUnidades: acc.parceirosUnidades + curr.parceirosUnidades,
        }), { vendasLiquidas: 0, cmv: 0, cupons: 0, itensVendidos: 0, parceirosUnidades: 0 });
      }
      return records.find(s => s.colaboradorEmail === email) || { 
        vendasLiquidas: 0, cmv: 0, cupons: 0, itensVendidos: 0, parceirosUnidades: 0 
      };
    };

    const targetEmail = user.role === 'GESTOR' ? targetEmployeeEmail : user.email;
    const vAtual = getDataForYear(currentYear, targetEmail);
    const vAno1 = getDataForYear(currentYear - 1, targetEmail);

    const applyProjection = (val: number) => {
      if (!isSelectedMonthCurrent || workingDaysInfo.elapsed === 0) return val;
      return (val / workingDaysInfo.elapsed) * workingDaysInfo.total;
    };

    const calcTM = (v: any) => v.cupons > 0 ? v.vendasLiquidas / v.cupons : 0;

    return [
      { label: 'Vendas Líquidas', atual: vAtual.vendasLiquidas, projetado: applyProjection(vAtual.vendasLiquidas), anoAnterior: vAno1.vendasLiquidas, unidade: 'R$', isPositiveBetter: true },
      { label: 'Ticket Médio', atual: calcTM(vAtual), projetado: calcTM(vAtual), anoAnterior: calcTM(vAno1), unidade: 'R$', isPositiveBetter: true },
      { label: 'Cupons (Atendimentos)', atual: vAtual.cupons, projetado: applyProjection(vAtual.cupons), anoAnterior: vAno1.cupons, unidade: 'qtd', isPositiveBetter: true },
      { label: 'CMV %', atual: vAtual.vendasLiquidas > 0 ? (vAtual.cmv / vAtual.vendasLiquidas) * 100 : 0, projetado: 0, anoAnterior: vAno1.vendasLiquidas > 0 ? (vAno1.cmv / vAno1.vendasLiquidas) * 100 : 0, unidade: '%', isPositiveBetter: false }
    ];
  }, [selectedMonth, targetEmployeeEmail, user, workingDaysInfo, isSelectedMonthCurrent, salesData]);

  const chartData = [
    { name: 'Atual', valor: biData[0].atual },
    { name: 'Ano Ant.', valor: biData[0].anoAnterior },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Cockpit de Resultados</h2>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            <CalendarDays size={14} />
            Mês de {months[selectedMonth]} • {workingDaysInfo.total} dias úteis
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {user.role === 'GESTOR' && (
            <select 
              value={targetEmployeeEmail}
              onChange={e => setTargetEmployeeEmail(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="GERAL">Visão Geral (Loja)</option>
              {users.filter(u => u.role === 'COLABORADOR').map(u => (
                <option key={u.id} value={u.email}>{u.nome}</option>
              ))}
            </select>
          )}
          <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        </div>
      </div>

      {isSelectedMonthCurrent && (
        <div className="bg-emerald-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap size={20} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-300">Projeção Final</span>
            </div>
            <h3 className="text-4xl font-black">R$ {biData[0].projetado.toLocaleString('pt-BR')}</h3>
            <p className="text-emerald-200 text-xs mt-2 font-medium">Faltam {workingDaysInfo.remaining} dias úteis.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 p-4 rounded-2xl text-center min-w-[120px]">
              <p className="text-[10px] uppercase font-bold text-emerald-300">Ritmo Diário</p>
              <p className="text-lg font-bold">R$ {(biData[0].atual / (workingDaysInfo.elapsed || 1)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {biData.map((kpi, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative">
            <span className="text-xs font-bold text-slate-400 uppercase">{kpi.label}</span>
            <p className="text-2xl font-black text-slate-800 mt-2">
              {kpi.unidade === 'R$' && 'R$ '}{kpi.atual.toLocaleString('pt-BR')}
              {kpi.unidade === '%' && '%'}
            </p>
            {isSelectedMonthCurrent && kpi.projetado > kpi.atual && (
              <p className="text-sm font-bold text-emerald-600 mt-1">➔ {kpi.unidade === 'R$' ? 'R$ ' : ''}{kpi.projetado.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Target size={18} className="text-emerald-600" /> Comparativo vs Ano Anterior
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip />
              <Bar dataKey="valor" radius={[10, 10, 0, 0]} barSize={60}>
                <Cell fill="#10b981" />
                <Cell fill="#cbd5e1" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ModuleResultados;
