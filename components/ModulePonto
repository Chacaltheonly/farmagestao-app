
import React, { useState, useEffect, useRef } from 'react';
import { User, PontoRecord, AppConfig } from '../types';
import { MapPin, Clock, CheckCircle2, AlertCircle, Navigation, Coffee, Bell, BellRing, Volume2, BellPlus, AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';

interface ModulePontoProps {
  user: User;
  records: PontoRecord[];
  config: AppConfig;
  onAdd: (record: PontoRecord) => void;
}

const ModulePonto: React.FC<ModulePontoProps> = ({ user, records, config, onAdd }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modals for Compliance
  const [modalType, setModalType] = useState<'WAIT' | 'WARNING' | 'SHIFT_SWAP' | 'OVERTIME' | null>(null);
  const [pendingPonto, setPendingPonto] = useState<PontoRecord['tipo'] | null>(null);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const timerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const userRecords = records.filter(r => r.userId === user.id);
  const lastRecord = userRecords.length > 0 ? userRecords[0] : null;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;
    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getPosition = () => {
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lng: longitude });
        setDistance(calculateDistance(latitude, longitude, config.pharmacyLat, config.pharmacyLng));
        setLoading(false);
      },
      (err) => { setError(err.message); setLoading(false); }
    );
  };

  useEffect(() => { getPosition(); }, [config]);

  const savePonto = (tipo: PontoRecord['tipo'], isTrocaPlantao: boolean = false) => {
    if (!location || distance === null) return;
    if (distance > config.allowedRadiusMeters) {
      alert(`Fora do raio permitido (${Math.round(distance)}m).`);
      return;
    }
    const newRecord: PontoRecord = {
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
      userName: user.nome,
      tipo,
      data: new Date().toLocaleDateString('pt-BR'),
      hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      lat: location.lat,
      lng: location.lng,
      status: 'Válido',
      isTrocaPlantao
    };
    onAdd(newRecord);
    setModalType(null);
    setPendingPonto(null);
  };

  const checkPontoTiming = (tipo: PontoRecord['tipo']) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Get target time based on type
    let targetTimeStr = '';
    if (tipo === 'Entrada') targetTimeStr = user.inicioJornada;
    else if (tipo === 'Saída Almoço') targetTimeStr = user.inicioAlmoco;
    else if (tipo === 'Retorno Almoço') targetTimeStr = user.retornoAlmoco;
    else if (tipo === 'Saída Final') targetTimeStr = user.fimJornada;
    else {
      // 15m intervals don't have a fixed schedule in user profile, just save.
      savePonto(tipo);
      return;
    }

    const [tH, tM] = targetTimeStr.split(':').map(Number);
    const targetMinutes = tH * 60 + tM;
    const diff = currentMinutes - targetMinutes;

    setPendingPonto(tipo);

    // Logic:
    // 1. If diff < -5: Too early -> WAIT
    // 2. If diff > 30 or diff < -30: Too far off -> SHIFT SWAP?
    // 3. If diff > 5: Too late -> WARNING
    // 4. Else: OK -> SAVE

    if (diff < -5 && diff >= -30) {
      setModalType('WAIT');
    } else if (Math.abs(diff) > 30) {
      setModalType('SHIFT_SWAP');
    } else if (diff > 5) {
      setModalType('WARNING');
    } else {
      savePonto(tipo);
    }
  };

  const isActionEnabled = (tipo: PontoRecord['tipo']): boolean => {
    if (!lastRecord || lastRecord.tipo === 'Saída Final') return tipo === 'Entrada';
    switch (lastRecord.tipo) {
      case 'Entrada':
      case 'Retorno Almoço':
      case 'Retorno Int. 15m':
        return ['Saída Almoço', 'Início Int. 15m', 'Saída Final'].includes(tipo);
      case 'Saída Almoço': return tipo === 'Retorno Almoço';
      case 'Início Int. 15m': return tipo === 'Retorno Int. 15m';
      default: return false;
    }
  };

  const canClockIn = location && distance !== null && distance <= config.allowedRadiusMeters;

  return (
    <div className="space-y-6">
      {/* Compliance Modals */}
      {modalType && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 animate-in zoom-in-95">
            {modalType === 'WAIT' && (
              <div className="text-center">
                <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Clock size={32} /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Muito Cedo!</h3>
                <p className="text-sm text-slate-600 mb-6">Você está tentando registrar o ponto antes do horário permitido. Por favor, <b>aguarde sua hora</b> oficial de entrada/retorno.</p>
                <button onClick={() => setModalType(null)} className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl">Entendi</button>
              </div>
            )}

            {modalType === 'WARNING' && (
              <div className="text-center">
                <div className="bg-amber-100 text-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><ShieldAlert size={32} /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Atenção ao Horário</h3>
                <p className="text-sm text-slate-600 mb-6">Este registro está sendo realizado com atraso superior a 5 minutos. <b>Este tempo poderá ser descontado</b> do seu banco de horas ou folha de pagamento.</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => pendingPonto && savePonto(pendingPonto)} className="w-full bg-amber-600 text-white font-bold py-3 rounded-xl">Confirmar Registro</button>
                  <button onClick={() => setModalType(null)} className="w-full bg-slate-100 text-slate-600 font-bold py-3 rounded-xl">Cancelar</button>
                </div>
              </div>
            )}

            {modalType === 'SHIFT_SWAP' && (
              <div className="text-center">
                <div className="bg-purple-100 text-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><RefreshCcw className="w-8 h-8" /></div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Fora da Escala?</h3>
                <p className="text-sm text-slate-600 mb-6">O horário atual está muito distante da sua jornada padrão. Trata-se de uma <b>Troca de Plantão</b> ou autorização especial?</p>
                <div className="flex flex-col gap-2">
                  <button onClick={() => pendingPonto && savePonto(pendingPonto, true)} className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl">Sim, é Troca de Plantão</button>
                  <button onClick={() => pendingPonto && savePonto(pendingPonto, false)} className="w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-xl">Não, registro comum</button>
                  <button onClick={() => setModalType(null)} className="w-full text-slate-400 font-bold py-2">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Ponto Digital</h2>
            <p className="text-slate-500 text-xs flex items-center gap-1 mt-1">
              <Clock size={12} /> Sua Jornada: {user.inicioJornada} às {user.fimJornada}
            </p>
          </div>
          <button onClick={getPosition} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
            <Navigation size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${canClockIn ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
            {canClockIn ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <p className="font-bold text-slate-800 text-sm">{canClockIn ? 'Dentro do Raio (50m)' : 'Fora do Estabelecimento'}</p>
          <p className="text-slate-500 text-[10px] mt-1">Distância: {distance !== null ? `${Math.round(distance)}m` : '---'}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {(['Entrada', 'Saída Almoço', 'Retorno Almoço', 'Início Int. 15m', 'Retorno Int. 15m', 'Saída Final'] as const).map(tipo => {
            const enabled = canClockIn && !loading && isActionEnabled(tipo);
            return (
              <button
                key={tipo}
                onClick={() => checkPontoTiming(tipo)}
                disabled={!enabled}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all text-xs ${
                  enabled ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-100 active:scale-95' : 'bg-slate-100 text-slate-300'
                }`}
              >
                <Clock size={16} /> {tipo}
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">Registros de Hoje</h3>
          <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold uppercase tracking-tight">Escala: {user.inicioJornada}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase font-bold">
              <tr>
                <th className="px-6 py-4">Horário</th>
                <th className="px-6 py-4">Tipo</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {userRecords.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">Nenhum registro hoje.</td></tr>
              ) : (
                userRecords.map(rec => (
                  <tr key={rec.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-700">{rec.hora}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-slate-600 font-medium">{rec.tipo}</span>
                        {rec.isTrocaPlantao && <span className="text-[9px] text-purple-600 font-bold uppercase">Troca de Plantão</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-700">Válido</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ModulePonto;

// Icons missing helper
const RefreshCcw = ({className}: {className?: string}) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
);
