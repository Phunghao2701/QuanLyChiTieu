import { useState, useEffect, useMemo } from 'react'
import logoPig from './assets/logo_pig.png'

function App() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [itemName, setItemName] = useState('');
  const [amountDisplay, setAmountDisplay] = useState(''); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setAmountDisplay('');
      return;
    }
    const formatted = new Intl.NumberFormat('en-US').format(value);
    setAmountDisplay(formatted);
  };

  const addExpense = (e) => {
    e.preventDefault();
    const rawAmount = amountDisplay.replace(/,/g, '');
    if (!itemName || !rawAmount) return;

    const newExpense = {
      id: Date.now(),
      name: itemName,
      amount: Math.abs(parseFloat(rawAmount)), 
      date: new Date().toISOString()
    };

    setExpenses([newExpense, ...expenses]);
    setItemName('');
    setAmountDisplay('');
  };

  const totals = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(new Date().setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return expenses.reduce((acc, exp) => {
      const expDate = new Date(exp.date);
      if (expDate >= today) acc.today += exp.amount;
      if (expDate >= startOfWeek) acc.week += exp.amount;
      if (expDate >= startOfMonth) acc.month += exp.amount;
      return acc;
    }, { today: 0, week: 0, month: 0 });
  }, [expenses]);

  const formatCurrency = (val, unit = 'đ') => {
    const absVal = Math.abs(val);
    return new Intl.NumberFormat('vi-VN').format(absVal) + unit;
  };

  // Calendar Logic
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const daysInMonth = lastDay.getDate();
    let startDay = firstDay.getDay(); 
    if (startDay === 0) startDay = 7; 
    
    const days = [];
    for (let i = 1; i < startDay; i++) {
      days.push({ day: null });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const totalOnDay = expenses.reduce((acc, exp) => {
        const expDate = new Date(exp.date);
        if (expDate.getFullYear() === year && expDate.getMonth() === month && expDate.getDate() === i) {
          return acc + exp.amount;
        }
        return acc;
      }, 0);
      days.push({ day: i, total: totalOnDay, date });
    }
    
    return days;
  }, [currentDate, expenses]);

  // Details for selected date
  const selectedDetails = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return (
        expDate.getFullYear() === selectedDate.getFullYear() &&
        expDate.getMonth() === selectedDate.getMonth() &&
        expDate.getDate() === selectedDate.getDate()
      );
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [selectedDate, expenses]);

  const totalOnSelectedDate = useMemo(() => {
    return selectedDetails.reduce((acc, exp) => acc + exp.amount, 0);
  }, [selectedDetails]);

  const openDetails = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans selection:bg-orange-500/20 pb-20">
      {/* Header Banner - With Pig Logo */}
      <header className="bg-[#ff8c00] pt-12 pb-24 px-6 relative overflow-hidden shadow-2xl">
        <div className="max-w-6xl mx-auto relative z-10 text-center text-white">
          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="w-20 h-20 bg-white rounded-3xl p-3 shadow-2xl shadow-black/10 animate-bounce-slow">
              <img src={logoPig} alt="Piggy Bank" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-black tracking-tight drop-shadow-md">Dễ dàng quản lý</h1>
          </div>
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/30">
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}</span>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        <div className="absolute -bottom-1 left-0 right-0 h-16 bg-[#f8f9fa] rounded-t-[4rem]"></div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        {/* Summary Row */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center border-t-8 border-indigo-500">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Tổng hôm nay</p>
            <p className="text-indigo-600 font-black text-2xl tabular-nums">{formatCurrency(totals.today)}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center border-t-8 border-orange-500">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Tuần này</p>
            <p className="text-orange-600 font-black text-2xl tabular-nums">{formatCurrency(totals.week)}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] text-center border-t-8 border-emerald-500">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Tháng này</p>
            <p className="text-emerald-600 font-black text-2xl tabular-nums">{formatCurrency(totals.month)}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Calendar Section */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border border-slate-100">
              <div className="flex justify-between items-center mb-10 px-2">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                  <div className="w-3 h-10 bg-[#ff8c00] rounded-full shadow-lg shadow-orange-500/30"></div>
                  Lịch Chi Tiêu
                </h3>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl">
                  <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-[#ff8c00]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400 min-w-[80px] text-center">Tháng {currentDate.getMonth() + 1}</span>
                  <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-[#ff8c00]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 mb-6">
                {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-3">
                {calendarData.map((d, idx) => {
                  const isToday = d.date && d.date.toDateString() === new Date().toDateString();
                  
                  return (
                    <button 
                      key={idx} 
                      onClick={() => d.date && openDetails(d.date)}
                      disabled={!d.day}
                      className={`aspect-square p-2 rounded-2xl flex flex-col justify-between border transition-all duration-300 relative group ${
                        d.day ? 'bg-slate-50/50 border-slate-100 hover:border-orange-200 hover:bg-orange-50/30 hover:scale-105 active:scale-95' : 'bg-transparent border-transparent cursor-default'
                      } ${isToday ? 'ring-2 ring-orange-500/20 bg-orange-50/20 border-orange-200' : ''}`}
                    >
                      {d.day && (
                        <>
                          <span className={`text-xs font-black self-start ${isToday ? 'text-orange-600' : 'text-slate-300 group-hover:text-orange-400'}`}>
                            {d.day}
                          </span>
                          {d.total > 0 && (
                            <div className="text-center">
                              <p className="text-[10px] font-black text-slate-700 tabular-nums">
                                {d.total >= 1000000 ? `${(d.total / 1000000).toFixed(1)}M` : `${(d.total / 1000).toFixed(0)}K`}
                              </p>
                              <div className="w-2 h-2 bg-orange-500 rounded-full mx-auto mt-1 shadow-sm shadow-orange-500/40"></div>
                            </div>
                          )}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Right Column: Add Form */}
          <aside className="lg:col-span-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 sticky top-12">
              <h3 className="text-xl font-black mb-8 flex items-center gap-4">
                <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
                Ghi Chép
              </h3>
              <form onSubmit={addExpense} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tên món đồ</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="VD: Cà phê, Ăn trưa..."
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500 focus:bg-white transition-all placeholder:text-slate-300 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Số tiền (VND)</label>
                  <input
                    type="text"
                    value={amountDisplay}
                    onChange={handleAmountChange}
                    placeholder="VD: 50,000"
                    className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 focus:outline-none focus:border-orange-500 focus:bg-white transition-all placeholder:text-slate-300 text-sm font-black font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-500/30 transition-all active:scale-[0.98] text-xs uppercase tracking-[0.2em] mt-4"
                >
                  Ghi vào lịch
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>

      {/* MODAL POPUP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative z-10 w-full max-w-lg bg-white rounded-[4rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-10 text-white relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 p-3 hover:bg-white/20 rounded-2xl transition-all">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 mb-2">Chi tiết chi tiêu</p>
              <h3 className="text-4xl font-black mb-1">Ngày {selectedDate.getDate()}</h3>
              <p className="text-white/80 text-xs font-bold tabular-nums">Tổng cộng: {formatCurrency(totalOnSelectedDate, 'đ')}</p>
            </div>

            <div className="p-10 max-h-[45vh] overflow-y-auto custom-scrollbar">
              {selectedDetails.length === 0 ? (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
                   <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Không có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDetails.map(exp => (
                    <div key={exp.id} className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-all shadow-inner">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                        </div>
                        <div>
                          <p className="text-base font-black text-slate-800">{exp.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(exp.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <span className="text-lg font-black tabular-nums text-slate-800">{formatCurrency(exp.amount, 'đ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-10 py-4 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                Hoàn tất
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
