import React, { useState } from 'react';
import { Search, Users, Calendar, Clock, Mic, Star, Zap, Home, TrendingUp, UserPlus } from 'lucide-react';

// Django APIのベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/';

// SSR用のgetServerSideProps
export async function getServerSideProps(context) {
  try {
  //   // Django APIからパーティ一覧を取得
  //   const res = await fetch(`${API_BASE_URL}/parties/`, {
  //     headers: {
  //       'Cookie': context.req.headers.cookie || '',
  //     },
  //   });
    
    // const parties = res.ok ? await res.json() : [];

    // 統計データの取得
    // const statsRes = await fetch(`${API_BASE_URL}/stats/`);
    // const stats = statsRes.ok ? await statsRes.json() : {
    //   activeParties: 0,
    //   onlinePlayers: 0,
    //   supportedGames: 0,
    //   todayPosts: 0
    // };

    // 認証状態の確認
    const authRes = await fetch(`${API_BASE_URL}/auth/me/`, {
      headers: {
        'Cookie': context.req.headers.cookie || '',
      },
    });
    const user = authRes.ok ? await authRes.json() : null;

    return {
      props: {
        // parties,
        // stats,
        user,
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return {
      props: {
        parties: [],
        stats: {
          activeParties: 0,
          onlinePlayers: 0,
          supportedGames: 0,
          todayPosts: 0
        },
        user: null,
      },
    };
  }
}

export default function PartyHub({ parties, stats, user }) {
  const [activeModal, setActiveModal] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [createForm, setCreateForm] = useState({
    title: '',
    game: '',
    platform: '',
    maxPlayers: 2,
    startTime: 'now',
    description: ''
  });

  // ログイン処理
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginForm),
      });

      if (res.ok) {
        window.location.reload();
      } else {
        const error = await res.json();
        alert(error.message || 'ログインに失敗しました');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('ログインに失敗しました');
    }
  };

  // 新規登録処理
  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('パスワードが一致しません');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: registerForm.username,
          email: registerForm.email,
          password: registerForm.password,
        }),
      });

      if (res.ok) {
        alert('登録が完了しました');
        window.location.reload();
      } else {
        const error = await res.json();
        alert(error.message || '登録に失敗しました');
      }
    } catch (error) {
      console.error('Register error:', error);
      alert('登録に失敗しました');
    }
  };

  // パーティ作成処理
  const handleCreateParty = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/parties/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(createForm),
      });

      if (res.ok) {
        alert('パーティを作成しました');
        window.location.reload();
      } else {
        const error = await res.json();
        alert(error.message || 'パーティの作成に失敗しました');
      }
    } catch (error) {
      console.error('Create party error:', error);
      alert('パーティの作成に失敗しました');
    }
  };

  // パーティ参加処理
  const handleJoinParty = async (partyId) => {
    if (!user) {
      alert('ログインが必要です');
      setActiveModal('/login');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/parties/${partyId}/join/`, {
        method: 'POST',
        credentials: 'include',
      });

      if (res.ok) {
        alert('パーティに参加しました');
        window.location.reload();
      } else {
        const error = await res.json();
        alert(error.message || '参加に失敗しました');
      }
    } catch (error) {
      console.error('Join party error:', error);
      alert('参加に失敗しました');
    }
  };

  const Modal = ({ id, title, children }) => {
    if (activeModal !== id) return null;
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setActiveModal(null)}>
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 rounded-2xl p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{title}</h2>
            <button onClick={() => setActiveModal(null)} className="w-9 h-9 flex items-center justify-center bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/20 hover:border-red-500 transition-all">
              <span className="text-xl">×</span>
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-72 h-screen bg-gradient-to-b from-slate-900 to-slate-950 border-r border-emerald-500/10 p-6 overflow-y-auto">
        <div className="mb-8">
          <div className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-2">
            <span>⚡</span>
            PARTY HUB
          </div>
        </div>

        <div className="mb-8">
          <div className="text-xs uppercase text-gray-500 mb-4 tracking-wider">メニュー</div>
          <div className="space-y-2">
            {[
              { icon: <Home size={20} />, label: 'ホーム', active: true },
              { icon: <TrendingUp size={20} />, label: '人気のパーティ' },
              { icon: <Calendar size={20} />, label: 'マイパーティ' },
              { icon: <Star size={20} />, label: 'お気に入り' },
              { icon: <Users size={20} />, label: 'フレンド' }
            ].map((item, i) => (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${item.active ? 'bg-emerald-500/15 text-emerald-400 border-l-2 border-emerald-400' : 'text-gray-400 hover:bg-white/5 hover:text-emerald-400'}`}>
                {item.icon}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs uppercase text-gray-500 mb-4 tracking-wider">プラットフォーム</div>
          <div className="space-y-2">
            {[
              { icon: '🎮', label: 'PlayStation' },
              { icon: '🟢', label: 'Xbox' },
              { icon: '🔴', label: 'Nintendo Switch' },
              { icon: '💻', label: 'PC' },
              { icon: '📱', label: 'Mobile' }
            ].map((platform, i) => (
              <button key={i} className="w-full flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-emerald-500/10 hover:border-emerald-500 hover:text-emerald-400 transition-all text-left">
                <span>{platform.icon}</span>
                <span>{platform.label}</span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-72 flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-8 pb-6 border-b border-white/10">
          <div className="flex-1 max-w-lg relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text"
              placeholder="ゲーム、プレイヤー、パーティを検索..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
            />
          </div>
          <div className="flex gap-3 items-center">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">ようこそ、{user.username}さん</span>
                <button onClick={() => {
                  fetch(`${API_BASE_URL}/auth/logout/`, { method: 'POST', credentials: 'include' })
                    .then(() => window.location.reload());
                }} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 hover:border-emerald-500 transition-all">
                  ログアウト
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => setActiveModal('login')} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 hover:border-emerald-500 transition-all">
                  ログイン
                </button>
                <button onClick={() => setActiveModal('register')} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-semibold text-slate-950 hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all">
                  新規登録
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {[
            { value: stats.activeParties, label: 'アクティブパーティ' },
            { value: stats.onlinePlayers, label: 'オンラインプレイヤー' },
            { value: stats.supportedGames, label: '対応ゲーム' },
            { value: stats.todayPosts, label: '今日の募集' }
          ].map((stat, i) => (
            <div key={i} className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20 rounded-xl p-6">
              <div className="text-3xl font-bold text-emerald-400 mb-1">{stat.value.toLocaleString()}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            🔥 募集中のパーティ
          </h2>
          <div className="flex gap-3">
            {['all', 'now', 'tonight', 'weekend'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg font-medium transition-all ${activeTab === tab ? 'bg-emerald-500/15 border border-emerald-500 text-emerald-400' : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'}`}
              >
                {tab === 'all' ? 'すべて' : tab === 'now' ? '今すぐ' : tab === 'tonight' ? '今夜' : '週末'}
              </button>
            ))}
          </div>
        </div>

        {/* Party Grid */}
        <div className="grid grid-cols-2 gap-6">
          {parties.length > 0 ? parties.map((party) => (
            <div key={party.id} className="bg-gradient-to-br from-slate-900/80 to-slate-950/60 border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/20 transition-all relative overflow-hidden group">
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-400 to-cyan-400 ${party.isLive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`} />
              
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center text-2xl">
                  {party.icon || '🎮'}
                </div>
                <div className="flex gap-2">
                  {party.isLive && (
                    <span className="px-3 py-1 bg-red-500/20 border border-red-500 text-red-400 rounded-md text-xs font-bold uppercase animate-pulse">
                      LIVE
                    </span>
                  )}
                  <span className="px-3 py-1 bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 rounded-md text-xs font-bold uppercase">
                    {party.platform}
                  </span>
                </div>
              </div>

              <div className="text-sm text-emerald-400 mb-2">{party.game}</div>
              <h3 className="text-xl font-bold text-white mb-4">{party.title}</h3>

              <div className="flex gap-6 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-2">
                  <Users size={16} />
                  <span>{party.currentPlayers}/{party.maxPlayers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{party.startTime}</span>
                </div>
                {party.tags && party.tags.map((tag, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {tag === 'VC必須' ? <Mic size={16} /> : tag === '経験者優遇' ? <Zap size={16} /> : <Star size={16} />}
                    <span>{tag}</span>
                  </div>
                ))}
              </div>

              <p className="text-gray-400 text-sm leading-relaxed mb-6">{party.description}</p>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-slate-950">
                    {party.host?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{party.host?.username || 'ユーザー'}</div>
                    <div className="text-xs text-gray-500">{party.postedAt || '最近'}</div>
                  </div>
                </div>
                <button 
                  onClick={() => handleJoinParty(party.id)}
                  className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg font-semibold text-slate-950 hover:shadow-lg hover:shadow-emerald-500/40 hover:scale-105 transition-all"
                >
                  参加する
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-2 text-center py-12 text-gray-500">
              現在募集中のパーティはありません
            </div>
          )}
        </div>
      </main>

      {/* FAB */}
      {user && (
        <button onClick={() => setActiveModal('create')} className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full text-3xl text-slate-950 shadow-xl shadow-emerald-500/40 hover:scale-110 hover:rotate-90 transition-all z-40">
          +
        </button>
      )}

      {/* Login Modal */}
      <Modal id="login" title="ログイン">
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">メールアドレス</label>
            <input 
              type="email" 
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              placeholder="example@email.com" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">パスワード</label>
            <input 
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              placeholder="パスワードを入力" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all" 
              required
            />
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg text-slate-950 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all mt-6">
            ログイン
          </button>
        </form>
      </Modal>

      {/* Register Modal */}
      <Modal id="register" title="アカウント作成">
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">ユーザー名</label>
            <input 
              type="text"
              value={registerForm.username}
              onChange={(e) => setRegisterForm({...registerForm, username: e.target.value})}
              placeholder="ユーザー名を入力" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">メールアドレス</label>
            <input 
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
              placeholder="example@email.com" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">パスワード</label>
            <input 
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
              placeholder="パスワードを入力" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">パスワード確認</label>
            <input 
              type="password"
              value={registerForm.confirmPassword}
              onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
              placeholder="パスワードを再入力" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all" 
              required
            />
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg text-slate-950 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all mt-6">
            アカウント作成
          </button>
        </form>
      </Modal>

      {/* Create Party Modal */}
      <Modal id="create" title="新規パーティ作成">
        <form onSubmit={handleCreateParty} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">パーティタイトル</label>
            <input 
              type="text"
              value={createForm.title}
              onChange={(e) => setCreateForm({...createForm, title: e.target.value})}
              placeholder="例：ランクマッチで一緒に登ろう！" 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">ゲームタイトル</label>
            <select 
              value={createForm.game}
              onChange={(e) => setCreateForm({...createForm, game: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
              required
            >
              <option value="">選択してください</option>
              <option value="apex">Apex Legends</option>
              <option value="valorant">Valorant</option>
              <option value="fortnite">Fortnite</option>
              <option value="cod">Call of Duty</option>
              <option value="other">その他</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">プラットフォーム</label>
            <select 
              value={createForm.platform}
              onChange={(e) => setCreateForm({...createForm, platform: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
              required
            >
              <option value="">選択してください</option>
              <option value="ps5">PlayStation 5</option>
              <option value="xbox">Xbox Series X/S</option>
              <option value="switch">Nintendo Switch</option>
              <option value="pc">PC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">募集人数</label>
            <input 
              type="number" 
              min="1" 
              max="20"
              value={createForm.maxPlayers}
              onChange={(e) => setCreateForm({...createForm, maxPlayers: parseInt(e.target.value)})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all" 
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">開始時刻</label>
            <select 
              value={createForm.startTime}
              onChange={(e) => setCreateForm({...createForm, startTime: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all"
              required
            >
              <option value="now">今から</option>
              <option value="30min">30分後</option>
              <option value="1hour">1時間後</option>
              <option value="20:00">今夜20:00</option>
              <option value="21:00">今夜21:00</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">詳細説明</label>
            <textarea 
              value={createForm.description}
              onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
              placeholder="パーティの詳細、条件、プレイスタイルなどを記入..." 
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white/10 transition-all resize-none h-32" 
              required
            />
          </div>
          <button type="submit" className="w-full py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-xl font-bold text-lg text-slate-950 hover:shadow-lg hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all mt-6">
            パーティを作成
          </button>
        </form>
      </Modal>
    </div>
  );
}