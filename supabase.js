/**
 * LevelUp — Supabase Integration
 * ═══════════════════════════════════════════════════════════════
 * 
 * HOW TO USE:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Run the SQL from supabase/migrations/001_initial_schema.sql in your SQL editor
 * 3. Replace SUPABASE_URL and SUPABASE_ANON_KEY below with your project values
 *    (found in: Supabase Dashboard → Project Settings → API)
 * 4. Add this script to index.html BEFORE the main <script> block:
 *    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 *    <script src="supabase.js"></script>
 * 
 * The app works fully offline with localStorage.
 * When Supabase is configured, data auto-syncs to the cloud.
 * ═══════════════════════════════════════════════════════════════
 */

// ─── CONFIGURE THESE ──────────────────────────────────────────
const SUPABASE_URL = 'YOUR_SUPABASE_URL';           // e.g. https://xyzabc.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // Long JWT key from Supabase dashboard
// ──────────────────────────────────────────────────────────────

let supabase = null;
let currentUser = null;

// Initialize Supabase (only if configured)
function initSupabase() {
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    console.log('ℹ️ LevelUp: Supabase not configured — running in local mode (all data saved to localStorage)');
    return false;
  }
  try {
    if (typeof window.supabase !== 'undefined') {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      console.log('✅ LevelUp: Supabase connected');
      return true;
    }
  } catch (e) {
    console.warn('⚠️ LevelUp: Supabase init failed, running in local mode', e);
  }
  return false;
}

// ─── AUTH ──────────────────────────────────────────────────────

async function signUp(email, password, username) {
  if (!supabase) return { error: 'Supabase not configured' };
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { username } }
  });
  if (data?.user) currentUser = data.user;
  return { data, error };
}

async function signIn(email, password) {
  if (!supabase) return { error: 'Supabase not configured' };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (data?.user) currentUser = data.user;
  return { data, error };
}

async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
  currentUser = null;
}

async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  currentUser = data?.session?.user || null;
  return data?.session;
}

// ─── PROFILE SYNC ──────────────────────────────────────────────

async function syncProfileToCloud(profile) {
  if (!supabase || !currentUser) return;
  const { error } = await supabase.from('profiles').upsert({
    id: currentUser.id,
    username: profile.userName,
    avatar: profile.userAvatar,
    xp: profile.xp,
    coins: profile.coins,
    level: profile.level,
    streak: profile.streak,
    language: profile.currentLang,
    theme: profile.currentTheme,
    cat_order: profile.catOrder,
    last_active_date: new Date().toISOString().split('T')[0]
  });
  if (error) console.warn('Profile sync error:', error);
}

async function loadProfileFromCloud() {
  if (!supabase || !currentUser) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
  if (error) return null;
  return data;
}

// ─── GOALS SYNC ────────────────────────────────────────────────

async function syncGoalsToCloud(goals) {
  if (!supabase || !currentUser) return;
  // Upsert all goals
  const rows = goals.map((g, i) => ({
    id: g.cloudId || undefined,
    user_id: currentUser.id,
    name: g.name,
    category: g.cat,
    subcategory: g.sub,
    xp_reward: g.xp,
    difficulty: g.diff,
    importance: g.imp || 'medium',
    frequency: g.freq,
    goal_type: g.type,
    sort_order: i,
  }));
  const { error } = await supabase.from('goals').upsert(rows, { onConflict: 'id' });
  if (error) console.warn('Goals sync error:', error);
}

async function loadGoalsFromCloud() {
  if (!supabase || !currentUser) return null;
  const { data, error } = await supabase.from('goals')
    .select('*')
    .eq('user_id', currentUser.id)
    .eq('is_active', true)
    .order('sort_order');
  if (error) return null;
  return data?.map(g => ({
    id: g.sort_order + 1,
    cloudId: g.id,
    name: g.name,
    cat: g.category,
    sub: g.subcategory,
    xp: g.xp_reward,
    diff: g.difficulty,
    imp: g.importance,
    freq: g.frequency,
    type: g.goal_type,
  }));
}

// ─── TASK COMPLETIONS SYNC ─────────────────────────────────────

async function syncCompletionsToCloud(taskDone) {
  if (!supabase || !currentUser) return;
  const today = new Date().toISOString().split('T')[0];
  const rows = Object.entries(taskDone)
    .filter(([, done]) => done)
    .map(([goalId]) => ({
      user_id: currentUser.id,
      goal_id: goalId,
      completed_date: today,
    }));
  if (!rows.length) return;
  const { error } = await supabase.from('task_completions').upsert(rows, { onConflict: 'user_id,goal_id,completed_date', ignoreDuplicates: true });
  if (error) console.warn('Completions sync error:', error);
}

// ─── JOURNAL SYNC ──────────────────────────────────────────────

async function syncJournalToCloud(entries) {
  if (!supabase || !currentUser) return;
  const rows = entries.slice(0, 50).map(e => ({
    user_id: currentUser.id,
    entry_date: e.date || new Date().toISOString(),
    mood: e.mood || '😊',
    content: e.text,
    tags: e.tags || [],
    entry_type: e.tags?.includes('finance') ? 'finance' : 'journal',
  }));
  const { error } = await supabase.from('journal_entries').upsert(rows);
  if (error) console.warn('Journal sync error:', error);
}

// ─── FINANCE SYNC ──────────────────────────────────────────────

async function syncFinanceToCloud(finance) {
  if (!supabase || !currentUser) return;
  // Settings
  await supabase.from('finance_settings').upsert({
    user_id: currentUser.id,
    balance: finance.balance,
    salary: finance.salary,
    savings_goal: finance.savingsGoal,
    currency: finance.currency,
    budgets: finance.budgets,
  }, { onConflict: 'user_id' });
  // Transactions (only sync recent)
  const recentTx = (finance.transactions || []).slice(0, 100).map(t => ({
    user_id: currentUser.id,
    transaction_type: t.type,
    amount: t.amount,
    category: t.cat,
    description: t.desc,
    transaction_date: t.date || new Date().toISOString().split('T')[0],
  }));
  if (recentTx.length) {
    await supabase.from('transactions').upsert(recentTx);
  }
  // Wishlist
  const wishRows = (finance.wishlist || []).map(w => ({
    user_id: currentUser.id,
    name: w.name,
    price: w.price,
    icon: w.icon,
    saved_amount: w.saved || 0,
  }));
  if (wishRows.length) {
    await supabase.from('wishlist').upsert(wishRows);
  }
}

// ─── FULL SYNC ─────────────────────────────────────────────────

/**
 * Call this after any significant state change to sync everything to Supabase.
 * It's debounced so it won't spam the API.
 */
let syncTimer = null;
function scheduleSync(appState) {
  if (!supabase || !currentUser) return;
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    await syncProfileToCloud(appState);
    await syncGoalsToCloud(appState.goals || []);
    await syncCompletionsToCloud(appState.taskDone || {});
    if (appState.journal) await syncJournalToCloud(appState.journal);
    if (appState.finance) await syncFinanceToCloud(appState.finance);
  }, 2000); // 2 second debounce
}

/**
 * Load all data from Supabase on app startup (if user is logged in).
 * Falls back to localStorage if not available.
 */
async function loadFromCloud() {
  if (!supabase) return null;
  const session = await getSession();
  if (!session) return null;

  const [profile, goals] = await Promise.all([
    loadProfileFromCloud(),
    loadGoalsFromCloud(),
  ]);

  return { profile, goals };
}

// ─── INIT ──────────────────────────────────────────────────────
initSupabase();

// Export for use in main app
window.LevelUpCloud = {
  initSupabase, signUp, signIn, signOut, getSession,
  syncProfileToCloud, loadProfileFromCloud,
  syncGoalsToCloud, loadGoalsFromCloud,
  syncCompletionsToCloud, syncJournalToCloud, syncFinanceToCloud,
  scheduleSync, loadFromCloud,
  isConfigured: () => SUPABASE_URL !== 'YOUR_SUPABASE_URL',
  getUser: () => currentUser,
};
