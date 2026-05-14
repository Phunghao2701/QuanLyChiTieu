import { useState, useEffect, useMemo } from 'react'
import logoPig from './assets/logo_pig.png'

const CATEGORIES = [
  { id: 'food', name: 'Ăn uống', icon: '🍔', color: 'bg-orange-100 text-orange-600' },
  { id: 'transport', name: 'Di chuyển', icon: '🚗', color: 'bg-blue-100 text-blue-600' },
  { id: 'shopping', name: 'Mua sắm', icon: '🛍️', color: 'bg-purple-100 text-purple-600' },
  { id: 'entertainment', name: 'Đi chơi', icon: '🛝', color: 'bg-pink-100 text-pink-600' },
  { id: 'home', name: 'Nhà cửa', icon: '🏠', color: 'bg-emerald-100 text-emerald-600' },
  { id: 'other', name: 'Khác', icon: '📦', color: 'bg-slate-100 text-slate-600' },
];

function App() {
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [itemName, setItemName] = useState('');
  const [amountDisplay, setAmountDisplay] = useState(''); 
  const [selectedCategory, setSelectedCategory] = useState('other');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // States for Editing
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editAmountDisplay, setEditAmountDisplay] = useState('');
  const [editCategory, setEditCategory] = useState('other');

  // State for expanded categories in Modal
  const [expandedCategories, setExpandedCategories] = useState({});

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  const handleAmountChange = (e, setter) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value === '') {
      setter('');
      return;
    }
    const formatted = new Intl.NumberFormat('en-US').format(value);
    setter(formatted);
  };

  const addExpense = (e) => {
    e.preventDefault();
    const rawAmount = amountDisplay.replace(/,/g, '');
    if (!itemName || !rawAmount) return;

    const newExpense = {
      id: Date.now(),
      name: itemName,
      amount: Math.abs(parseFloat(rawAmount)), 
      category: selectedCategory,
      date: new Date().toISOString()
    };

    setExpenses([newExpense, ...expenses]);
    setItemName('');
    setAmountDisplay('');
    setSelectedCategory('other');
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const startEdit = (exp) => {
    setEditingId(exp.id);
    setEditName(exp.name);
    setEditAmountDisplay(new Intl.NumberFormat('en-US').format(exp.amount));
    setEditCategory(exp.category || 'other');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
    setEditAmountDisplay('');
  };

  const saveEdit = (id) => {
    const rawAmount = editAmountDisplay.replace(/,/g, '');
    if (!editName || !rawAmount) return;

    setExpenses(expenses.map(exp => 
      exp.id === id 
        ? { ...exp, name: editName, amount: Math.abs(parseFloat(rawAmount)), category: editCategory }
        : exp
    ));
    setEditingId(null);
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

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startDay = firstDay.getDay(); 
    if (startDay === 0) startDay = 7; 
    const days = [];
    for (let i = 1; i < startDay; i++) days.push({ day: null });
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

  const groupedSelectedDetails = useMemo(() => {
    const dailyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return (
        expDate.getFullYear() === selectedDate.getFullYear() &&
        expDate.getMonth() === selectedDate.getMonth() &&
        expDate.getDate() === selectedDate.getDate()
      );
    });

    const groups = {};
    dailyExpenses.forEach(exp => {
      const cat = exp.category || 'other';
      if (!groups[cat]) groups[cat] = { total: 0, items: [] };
      groups[cat].total += exp.amount;
      groups[cat].items.push(exp);
    });

    return groups;
  }, [selectedDate, expenses]);

  const totalOnSelectedDate = useMemo(() => {
    return Object.values(groupedSelectedDetails).reduce((acc, g) => acc + g.total, 0);
  }, [groupedSelectedDetails]);

  const toggleCategory = (catId) => {
    setExpandedCategories(prev => ({ ...prev, [catId]: !prev[catId] }));
  };

  const openDetails = (date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
    setEditingId(null);
    setExpandedCategories({});
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-slate-800 font-sans selection:bg-orange-500/20 pb-20">
      <header className="bg-[#ff8c00] pt-12 pb-24 px-6 relative overflow-hidden shadow-2xl">
        <div className="max-w-6xl mx-auto relative z-10 text-center text-white">
          <div className="flex flex-col items-center justify-center gap-4 mb-2">
            <div className="w-20 h-20 bg-white rounded-[2rem] p-3 shadow-2xl shadow-black/10 animate-bounce-slow">
              <img src={logoPig} alt="Piggy Bank" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-4xl font-black tracking-tight drop-shadow-md">Dễ dàng quản lý</h1>
          </div>
          <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/30">
             <span className="text-xs font-black uppercase tracking-[0.2em]">Tháng {currentDate.getMonth() + 1} / {currentDate.getFullYear()}</span>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>
        <div className="absolute -bottom-1 left-0 right-0 h-16 bg-[#f8f9fa] rounded-t-[4rem]"></div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-12 relative z-20">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-8 rounded-[3rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] text-center border-t-[10px] border-indigo-500">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Tổng hôm nay</p>
            <p className="text-indigo-600 font-black text-3xl tabular-nums">{formatCurrency(totals.today)}</p>
          </div>
          <div className="bg-white p-8 rounded-[3rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] text-center border-t-[10px] border-orange-500">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Tuần này</p>
            <p className="text-orange-600 font-black text-3xl tabular-nums">{formatCurrency(totals.week)}</p>
          </div>
          <div className="bg-white p-8 rounded-[3rem] shadow-[0_15px_40px_rgba(0,0,0,0.04)] text-center border-t-[10px] border-emerald-500">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">Tháng này</p>
            <p className="text-emerald-600 font-black text-3xl tabular-nums">{formatCurrency(totals.month)}</p>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <section className="lg:col-span-8">
            <div className="bg-white rounded-[3rem] shadow-xl p-10 border border-slate-100">
              <div className="flex justify-between items-center mb-10 px-2">
                <h3 className="text-2xl font-black text-slate-800 flex items-center gap-4">
                  <div className="w-3 h-10 bg-[#ff8c00] rounded-full shadow-lg shadow-orange-500/30"></div>
                  Lịch Chi Tiêu
                </h3>
                <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-full border border-slate-100">
                  <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-[#ff8c00]">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <span className="text-xs font-black uppercase tracking-widest text-slate-500 min-w-[100px] text-center">Tháng {currentDate.getMonth() + 1}</span>
                  <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2 hover:bg-white hover:shadow-md rounded-full transition-all text-[#ff8c00]">
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
                              <p className="text-[10px] font-black text-slate-800 tabular-nums">
                                {d.total >= 1000000 ? `${(d.total / 1000000).toFixed(1)}M` : `${(d.total / 1000).toFixed(0)}K`}
                              </p>
                              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mx-auto mt-1 shadow-sm shadow-orange-500/40"></div>
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

          <aside className="lg:col-span-4">
            <div className="bg-white p-10 rounded-[3rem] shadow-xl border border-slate-100 sticky top-12">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-2 h-10 bg-indigo-500 rounded-full"></div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">Ghi Chép</h3>
              </div>
              <form onSubmit={addExpense} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Tên món đồ</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    placeholder="VD: Cà phê, Ăn trưa..."
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] px-8 py-5 focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-bold shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Số tiền (VND)</label>
                  <input
                    type="text"
                    value={amountDisplay}
                    onChange={(e) => handleAmountChange(e, setAmountDisplay)}
                    placeholder="VD: 50,000"
                    className="w-full bg-slate-50 border-2 border-transparent rounded-[2rem] px-8 py-5 focus:outline-none focus:border-orange-500 focus:bg-white transition-all text-sm font-black font-mono shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-2">Phân loại</label>
                  <div className="grid grid-cols-3 gap-3">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                          selectedCategory === cat.id 
                            ? 'border-orange-500 bg-orange-50 scale-105' 
                            : 'border-slate-100 bg-slate-50 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <span className="text-xl">{cat.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-tighter">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-black py-6 rounded-full shadow-2xl shadow-orange-500/40 transition-all active:scale-[0.96] text-xs uppercase tracking-[0.25em] mt-4"
                >
                  Ghi vào lịch
                </button>
              </form>
            </div>
          </aside>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-lg bg-white rounded-[4rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-12 text-white relative shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-12 right-12 p-3 hover:bg-white/20 rounded-full transition-all border border-white/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70 mb-3">Chi tiết chi tiêu</p>
              <h3 className="text-5xl font-black mb-2 tracking-tight">Ngày {selectedDate.getDate()}</h3>
              <p className="text-white/80 text-sm font-bold tabular-nums bg-black/10 inline-block px-4 py-1 rounded-full">Tổng cộng: {formatCurrency(totalOnSelectedDate, 'đ')}</p>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar bg-slate-50/50 flex-grow">
              {Object.keys(groupedSelectedDetails).length === 0 ? (
                <div className="py-24 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100 shadow-inner">
                   <p className="text-xs font-black text-slate-300 uppercase tracking-[0.3em]">Không có dữ liệu</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {CATEGORIES.map(cat => {
                    const group = groupedSelectedDetails[cat.id];
                    if (!group) return null;
                    const isExpanded = expandedCategories[cat.id];

                    return (
                      <div key={cat.id} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden transition-all">
                        <button 
                          onClick={() => toggleCategory(cat.id)}
                          className="w-full flex justify-between items-center p-6 hover:bg-slate-50/50 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${cat.color} shadow-inner`}>
                              {cat.icon}
                            </div>
                            <div className="text-left">
                              <p className="text-base font-black text-slate-800">{cat.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{group.items.length} món đồ</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-black text-slate-800 tabular-nums">{formatCurrency(group.total, 'đ')}</span>
                            <svg className={`w-5 h-5 text-slate-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path>
                            </svg>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-6 pb-6 pt-2 space-y-3 bg-slate-50/30">
                            {group.items.map(exp => (
                              <div key={exp.id} className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-50 shadow-sm group">
                                {editingId === exp.id ? (
                                  <div className="w-full space-y-4 py-2">
                                    <input
                                      type="text"
                                      value={editName}
                                      onChange={(e) => setEditName(e.target.value)}
                                      className="w-full bg-slate-50 border-2 border-orange-200 rounded-full px-5 py-2 focus:outline-none text-sm font-bold"
                                    />
                                    <input
                                      type="text"
                                      value={editAmountDisplay}
                                      onChange={(e) => handleAmountChange(e, setEditAmountDisplay)}
                                      className="w-full bg-slate-50 border-2 border-orange-200 rounded-full px-5 py-2 focus:outline-none text-sm font-black font-mono"
                                    />
                                    <div className="flex gap-3">
                                      <button onClick={() => saveEdit(exp.id)} className="flex-1 bg-orange-500 text-white py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Lưu</button>
                                      <button onClick={cancelEdit} className="flex-1 bg-slate-100 text-slate-400 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Hủy</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div>
                                      <p className="text-sm font-black text-slate-800">{exp.name}</p>
                                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                                        {new Date(exp.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <span className="text-base font-black tabular-nums text-slate-800">{formatCurrency(exp.amount, 'đ')}</span>
                                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => startEdit(exp)} className="p-1.5 bg-indigo-50 text-indigo-500 rounded-lg hover:bg-indigo-500 hover:text-white transition-all">
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                        </button>
                                        <button onClick={() => deleteExpense(exp.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all">
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        </button>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="p-12 bg-white border-t border-slate-100 shrink-0 flex justify-end">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-12 py-5 bg-slate-900 text-white text-xs font-black uppercase tracking-[0.2em] rounded-full shadow-2xl hover:bg-black hover:-translate-y-1 transition-all"
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
