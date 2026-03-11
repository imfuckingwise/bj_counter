'use strict';

// ─── Constants ───────────────────────────────────────────────────────────────
const HI_LO = { '2':1,'3':1,'4':1,'5':1,'6':1,'7':0,'8':0,'9':0,'T':-1,'A':-1 };
const CARD_CLS = { '2':'','3':'c-red','4':'','5':'c-red','6':'','7':'','8':'c-red','9':'','T':'c-blue','A':'c-red' };

// Basic strategy: H=Hit S=Stand D=Double Ds=Double/Stand SP=Split SR=Surrender/Hit
const STRAT_PAIR = {
  1:  {2:'SP',3:'SP',4:'SP',5:'SP',6:'SP',7:'SP',8:'SP',9:'SP',T:'SP',A:'SP'},
  2:  {2:'SP',3:'SP',4:'SP',5:'SP',6:'SP',7:'SP',8:'H', 9:'H', T:'H', A:'H'},
  3:  {2:'SP',3:'SP',4:'SP',5:'SP',6:'SP',7:'SP',8:'H', 9:'H', T:'H', A:'H'},
  4:  {2:'H', 3:'H', 4:'H', 5:'SP',6:'SP',7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  5:  {2:'D', 3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', T:'H', A:'H'},
  6:  {2:'SP',3:'SP',4:'SP',5:'SP',6:'SP',7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  7:  {2:'SP',3:'SP',4:'SP',5:'SP',6:'SP',7:'SP',8:'H', 9:'H', T:'H', A:'H'},
  8:  {2:'SP',3:'SP',4:'SP',5:'SP',6:'SP',7:'SP',8:'SP',9:'SP',T:'SP',A:'SP'},
  9:  {2:'SP',3:'SP',4:'SP',5:'SP',6:'SP',7:'S', 8:'SP',9:'SP',T:'S', A:'S'},
  10: {2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', T:'S', A:'S'}
};
const STRAT_SOFT = {
  13:{2:'H', 3:'H', 4:'H', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  14:{2:'H', 3:'H', 4:'H', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  15:{2:'H', 3:'H', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  16:{2:'H', 3:'H', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  17:{2:'H', 3:'D', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  18:{2:'Ds',3:'Ds',4:'Ds',5:'Ds',6:'Ds',7:'S', 8:'S', 9:'H', T:'H', A:'H'},
  19:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', T:'S', A:'S'},
  20:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', T:'S', A:'S'}
};
const STRAT_HARD = {
  5: {2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  6: {2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  7: {2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  8: {2:'H', 3:'H', 4:'H', 5:'H', 6:'H', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  9: {2:'H', 3:'D', 4:'D', 5:'D', 6:'D', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  10:{2:'D', 3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', T:'H', A:'H'},
  11:{2:'D', 3:'D', 4:'D', 5:'D', 6:'D', 7:'D', 8:'D', 9:'D', T:'D', A:'H'},
  12:{2:'H', 3:'H', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  13:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  14:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', T:'H', A:'H'},
  15:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'H', T:'SR',A:'H'},
  16:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'H', 8:'H', 9:'SR',T:'SR',A:'SR'},
  17:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', T:'S', A:'S'},
  18:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', T:'S', A:'S'},
  19:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', T:'S', A:'S'},
  20:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', T:'S', A:'S'},
  21:{2:'S', 3:'S', 4:'S', 5:'S', 6:'S', 7:'S', 8:'S', 9:'S', T:'S', A:'S'}
};
const ACT_LABEL = {
  H:'HIT 要牌', S:'STAND 停牌', D:'DOUBLE 加倍',
  Ds:'DOUBLE or STAND', SP:'SPLIT 分牌', SR:'SURRENDER or HIT'
};
const RES_LABEL = { WIN:'勝', LOSE:'負', PUSH:'平', BJ:'BJ ★', '—':'—' };
const RES_CLASS  = { WIN:'r-win', LOSE:'r-lose', PUSH:'r-push', BJ:'r-bj', '—':'' };

// ─── State factory ───────────────────────────────────────────────────────────
function makeSeat() {
  return { hands: [[]], activeHand: 0, hasSplit: false, doubled: [false], locked: [false] };
}

const G = {
  decks: 8,
  rc: 0,
  dealt: 0,
  dealerCards: [],
  seats: Array.from({ length: 7 }, makeSeat),
  activeSeat: 'dealer',   // 'dealer' | 0-6
  mySeat: null,
  history: [],
  roundNo: 0,
  logs: []
};

// Load persisted logs
try { G.logs = JSON.parse(localStorage.getItem('bj_logs') || '[]'); } catch(e) { G.logs = []; }

// ─── Utility ─────────────────────────────────────────────────────────────────
function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), 2200);
}

function getTimestamp() {
  return new Date().toLocaleString('zh-TW', {
    year:'numeric', month:'2-digit', day:'2-digit',
    hour:'2-digit', minute:'2-digit', second:'2-digit', hour12: false
  });
}

function handTotal(cards) {
  let sum = 0, aces = 0;
  for (const c of cards) {
    if (c === 'A') { aces++; sum += 11; }
    else if (c === 'T') sum += 10;
    else sum += parseInt(c, 10);
  }
  while (sum > 21 && aces > 0) { sum -= 10; aces--; }
  return { total: sum, soft: aces > 0 };
}

function isNaturalBJ(cards) {
  return cards.length === 2 && cards.includes('A') && cards.includes('T');
}

function getTC() {
  const rem = Math.max(0.5, (G.decks * 52 - G.dealt) / 52);
  return G.rc / rem;
}

function betUnits(tc) {
  if (tc < 1) return 1;
  if (tc < 2) return 2;
  if (tc < 3) return 4;
  if (tc < 4) return 6;
  return 8;
}

function getAction(total, dealerCard, isPair, isSoft) {
  const d = (dealerCard === 'T') ? 'T' : dealerCard;
  if (isPair) {
    const key = total / 2;
    if (STRAT_PAIR[key] && STRAT_PAIR[key][d]) return STRAT_PAIR[key][d];
  }
  if (isSoft && STRAT_SOFT[total] && STRAT_SOFT[total][d]) return STRAT_SOFT[total][d];
  if (STRAT_HARD[total] && STRAT_HARD[total][d]) return STRAT_HARD[total][d];
  return total < 17 ? 'H' : 'S';
}

function calcResult(playerCards, dealerCards) {
  if (!dealerCards.length) return '—';
  const p = handTotal(playerCards);
  const d = handTotal(dealerCards);
  const pBJ = isNaturalBJ(playerCards);
  const dBJ = isNaturalBJ(dealerCards);
  if (p.total > 21) return 'LOSE';
  if (pBJ && dBJ) return 'PUSH';
  if (pBJ) return 'BJ';
  if (dBJ) return 'LOSE';
  if (d.total > 21) return 'WIN';
  if (p.total > d.total) return 'WIN';
  if (p.total < d.total) return 'LOSE';
  return 'PUSH';
}

// ─── Actions ─────────────────────────────────────────────────────────────────
function selectSeat(s) { G.activeSeat = s; render(); }

function toggleMySeat() {
  if (G.activeSeat === 'dealer') { showToast('⚠️ 請先選玩家席位'); return; }
  G.mySeat = (G.mySeat === G.activeSeat) ? null : G.activeSeat;
  showToast(G.mySeat !== null ? `★ 席位 ${G.mySeat + 1} 設為我的席位` : '❌ 取消我的席位');
  render();
}

function confirmDouble() {
  if (G.activeSeat === 'dealer') { showToast('⚠️ 僅限玩家席位'); return; }
  const s = G.seats[G.activeSeat], hi = s.activeHand;
  if (!s.hands[hi].length || s.doubled[hi] || s.locked[hi]) { showToast('⚠️ 無效操作'); return; }
  s.doubled[hi] = true;
  showToast('✅ Double 確認，補一張後自動鎖定');
  render();
}

function confirmSplit() {
  if (G.activeSeat === 'dealer') { showToast('⚠️ 僅限玩家席位'); return; }
  const s = G.seats[G.activeSeat];
  const hand = s.hands[0];
  if (hand.length !== 2 || s.hasSplit) { showToast('⚠️ 無效操作'); return; }
  const val = c => c === 'T' ? 10 : c === 'A' ? 11 : parseInt(c, 10);
  if (val(hand[0]) !== val(hand[1])) { showToast('⚠️ 兩張牌點數不同'); return; }
  s.hands[1] = [hand.pop()];
  s.hasSplit = true; s.activeHand = 0;
  s.doubled = [false, false]; s.locked = [false, false];
  showToast('✅ Split 完成，先補 Hand A');
  render();
}

function switchHand(seatIdx, handIdx) {
  G.activeSeat = seatIdx;
  G.seats[seatIdx].activeHand = handIdx;
  render();
}

function handleCard(c) {
  G.rc += HI_LO[c];
  G.dealt++;

  if (G.activeSeat === 'dealer') {
    G.dealerCards.push(c);
    G.history.push({ role: 'dealer', card: c });
    const { total } = handTotal(G.dealerCards);
    if (isNaturalBJ(G.dealerCards)) showToast('🃏 莊家 Blackjack！');
    else if (total > 21) showToast('💥 莊家爆牌！');
    render();
    return;
  }

  const s = G.seats[G.activeSeat];
  const hi = s.activeHand;
  if (s.locked[hi]) {
    // Revert count change and bail
    G.rc -= HI_LO[c]; G.dealt--;
    showToast('⚠️ 此手牌已鎖定');
    return;
  }

  // Snapshot for undo BEFORE mutation
  const prevLocked  = s.locked.slice();
  const prevDoubled = s.doubled.slice();

  s.hands[hi].push(c);
  G.history.push({ role:'player', seat: G.activeSeat, hand: hi, card: c, prevLocked, prevDoubled });

  const { total } = handTotal(s.hands[hi]);
  if (total > 21) {
    s.locked[hi] = true;
    showToast(`💥 席位 ${G.activeSeat + 1} 爆牌！`);
  } else if (isNaturalBJ(s.hands[hi])) {
    s.locked[hi] = true;
    showToast(`🃏 席位 ${G.activeSeat + 1} Blackjack！`);
  } else if (s.doubled[hi]) {
    s.locked[hi] = true;
    showToast('✅ Double 補牌完成，手牌鎖定');
  }

  render();
}

function undoCard() {
  if (G.activeSeat !== 'dealer') {
    const s = G.seats[G.activeSeat];
    const hi = s.activeHand;
    // P1: cancel Double flag (only if not yet locked by it)
    if (s.doubled[hi] && !s.locked[hi]) {
      s.doubled[hi] = false;
      showToast('✌️ 取消 Double 狀態');
      render(); return;
    }
    // P2: cancel Split
    if (s.hasSplit) {
      if (s.hands[1].length > 0) {
        s.hands[0].push(s.hands[1].pop());
        showToast('✂️ 取消 Split，牌合併回 Hand A');
      } else {
        s.hasSplit = false; s.activeHand = 0; s.hands[1] = [];
        s.doubled = [s.doubled[0]]; s.locked = [false];
        showToast('✂️ 取消 Split 狀態');
      }
      render(); return;
    }
  }
  // P3: pop last card from history
  if (!G.history.length) { showToast('無可撤銷'); return; }
  const last = G.history.pop();
  G.rc -= HI_LO[last.card];
  G.dealt--;
  if (last.role === 'dealer') {
    G.dealerCards.pop();
  } else {
    const s = G.seats[last.seat];
    s.hands[last.hand].pop();
    s.locked  = last.prevLocked.slice();
    s.doubled = last.prevDoubled.slice();
  }
  showToast(`⌫ 撤銷 ${last.card}`);
  render();
}

function resetHand() {
  saveRound();
  G.dealerCards = [];
  G.history = [];
  for (let i = 0; i < 7; i++) G.seats[i] = makeSeat();
  showToast('♻️ 下一局');
  render();
}

function newShoe() {
  saveRound();
  G.rc = 0; G.dealt = 0; G.dealerCards = [];
  G.history = [];
  for (let i = 0; i < 7; i++) G.seats[i] = makeSeat();
  showToast('🎲 新牌靴');
  render();
}

// ─── Session log ─────────────────────────────────────────────────────────────
function saveRound() {
  const anyCards = G.dealerCards.length > 0 || G.seats.some(s => s.hands[0].length > 0);
  if (!anyCards) return;
  G.roundNo++;
  const tc = getTC();
  const rem = Math.max(0.5, (G.decks * 52 - G.dealt) / 52);
  const dTot = handTotal(G.dealerCards);
  const dLabel = !G.dealerCards.length ? '—'
    : isNaturalBJ(G.dealerCards) ? 'BJ'
    : dTot.total > 21 ? '爆牌'
    : (dTot.soft ? 'Soft ' : '') + dTot.total;

  const seats = [];
  G.seats.forEach((s, i) => {
    s.hands.forEach((hand, hi) => {
      if (!s.hasSplit && hi > 0) return;
      if (!hand.length) return;
      const { total, soft } = handTotal(hand);
      seats.push({
        seatNo: i + 1,
        handLabel: s.hasSplit ? String.fromCharCode(65 + hi) : null,
        cards: hand.join(' '),
        total, soft,
        result: calcResult(hand, G.dealerCards),
        isMy: G.mySeat === i
      });
    });
  });

  const entry = {
    no: G.roundNo, ts: getTimestamp(),
    dealerCards: G.dealerCards.join(' '), dealerLabel: dLabel,
    seats, rc: G.rc, tc: tc.toFixed(2)
  };
  G.logs.unshift(entry);
  try { localStorage.setItem('bj_logs', JSON.stringify(G.logs.slice(0, 500))); } catch(e) {}
  renderLogs();
}

function renderLogs() {
  const list  = document.getElementById('log-list');
  const empty = document.getElementById('log-empty');
  if (!G.logs.length) {
    list.innerHTML = '';
    empty.style.display = 'block';
    return;
  }
  empty.style.display = 'none';
  list.innerHTML = '';
  G.logs.forEach(entry => {
    const div = document.createElement('div');
    div.className = 'log-round';
    const seatsHtml = entry.seats.map(s => {
      const tot = s.total > 21 ? '💥' : (s.soft ? `S${s.total}` : s.total);
      const lbl = `席位${s.seatNo}${s.handLabel ? ` (${s.handLabel})` : ''}${s.isMy ? ' ★' : ''}`;
      return `<div class="log-chip${s.isMy ? ' my' : ''}">
        ${lbl}: <b>${s.cards}</b> (${tot})
        <span class="${RES_CLASS[s.result]}">${RES_LABEL[s.result]}</span>
      </div>`;
    }).join('') || '<span style="font-size:.7rem;color:var(--dim)">無玩家手牌</span>';
    div.innerHTML = `
      <div class="log-meta">
        <span class="log-no">#${entry.no}</span>
        <span class="log-time">${entry.ts}</span>
        <span class="log-tc">RC ${entry.rc > 0 ? '+' : ''}${entry.rc} / TC ${entry.tc}</span>
      </div>
      <div class="log-dealer">🤖 莊家: ${entry.dealerCards || '—'} (${entry.dealerLabel})</div>
      <div class="log-seats">${seatsHtml}</div>`;
    list.appendChild(div);
  });
}

function clearLogs() {
  if (!G.logs.length) { showToast('紀錄已為空'); return; }
  if (!confirm('確定清空所有賽局紀錄？')) return;
  G.logs = [];
  G.roundNo = 0;
  try { localStorage.removeItem('bj_logs'); } catch(e) {}
  renderLogs();
  showToast('🗑 已清空紀錄');
}

function exportCSV() {
  if (!G.logs.length) { showToast('尚無紀錄'); return; }
  try {
    const rows = [['局次','時間','莊家牌','莊家結果','席位','手牌','點數','勝負','RC','TC']];
    [...G.logs].reverse().forEach(entry => {
      if (!entry.seats || !entry.seats.length) {
        rows.push([entry.no, entry.ts, entry.dealerCards || '', entry.dealerLabel || '',
          '','','','', entry.rc, entry.tc]);
      } else {
        entry.seats.forEach((s, si) => {
          const totStr = s.total > 21 ? '爆牌' : (s.soft ? 'Soft ' + s.total : String(s.total));
          const sLbl   = '席位' + s.seatNo + (s.handLabel ? ' Hand ' + s.handLabel : '') + (s.isMy ? ' ★' : '');
          const resLbl = RES_LABEL[s.result] || s.result;
          rows.push([
            si === 0 ? entry.no    : '',
            si === 0 ? entry.ts    : '',
            si === 0 ? (entry.dealerCards || '') : '',
            si === 0 ? (entry.dealerLabel || '') : '',
            sLbl, s.cards, totStr, resLbl,
            si === 0 ? entry.rc : '',
            si === 0 ? entry.tc : ''
          ]);
        });
      }
    });
    const csv = '\uFEFF' + rows.map(r =>
      r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(',')
    ).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = 'bj_session_' + new Date().toISOString().slice(0,16).replace(/[:T]/g,'-') + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('📊 已匯出 CSV（' + G.logs.length + ' 局）');
  } catch(err) {
    showToast('❌ 匯出失敗：' + err.message);
    console.error(err);
  }
}

// ─── Render ───────────────────────────────────────────────────────────────────
function makeCardEl(c, dimmed, isDbl) {
  const el = document.createElement('div');
  el.className = ['pc', CARD_CLS[c] || '', dimmed ? 'dimmed' : '', isDbl ? 'dbl' : '']
    .filter(Boolean).join(' ');
  el.textContent = c === 'T' ? '10' : c;
  return el;
}

function renderCountBar() {
  const rem = Math.max(0.5, (G.decks * 52 - G.dealt) / 52);
  const tc  = G.rc / rem;
  const adv = (tc * 0.5 - 0.5).toFixed(2);
  const cls = tc > 2 ? 'c-pos' : tc < 0 ? 'c-neg' : 'c-neu';
  document.getElementById('rc-val').textContent  = (G.rc > 0 ? '+' : '') + G.rc;
  document.getElementById('tc-val').textContent  = (tc > 0 ? '+' : '') + tc.toFixed(2);
  document.getElementById('adv-val').textContent = (adv > 0 ? '+' : '') + adv + '%';
  document.getElementById('rem-val').textContent = rem.toFixed(1);
  document.getElementById('tc-val').className    = 'stat-val ' + cls;
  document.getElementById('adv-val').className   = 'stat-val ' + cls;
}

function renderDealer() {
  const zone = document.getElementById('dealer-zone');
  zone.className = G.activeSeat === 'dealer' ? 'active' : '';
  const area = document.getElementById('dealer-area');
  area.innerHTML = '';
  if (!G.dealerCards.length) {
    const hint = document.createElement('div');
    hint.className = 'zone-hint';
    hint.textContent = '按 D 選取後輸牌';
    area.appendChild(hint);
    return;
  }
  const row = document.createElement('div'); row.className = 'cards-row';
  G.dealerCards.forEach(c => row.appendChild(makeCardEl(c, false, false)));
  area.appendChild(row);
  const { total, soft } = handTotal(G.dealerCards);
  const isBust = total > 21, isBJ = isNaturalBJ(G.dealerCards);
  const sc = document.createElement('div');
  sc.className = 'zone-score' + (isBust ? ' s-bust' : isBJ ? ' s-bj' : '');
  sc.textContent = isBust ? '💥 爆牌' : isBJ ? '🃏 Blackjack!' : (soft ? 'Soft ' : '') + total;
  area.appendChild(sc);
  if (isBust) row.querySelectorAll('.pc').forEach(p => p.classList.add('dimmed'));
}

function renderSeats() {
  const container = document.getElementById('seats');
  container.innerHTML = '';
  G.seats.forEach((seat, i) => {
    const sd = document.createElement('div');
    sd.className = 'seat' + (G.activeSeat === i ? ' active' : '') + (G.mySeat === i ? ' my' : '');
    sd.addEventListener('click', () => selectSeat(i));
    const tag = document.createElement('div'); tag.className = 'seat-tag'; tag.textContent = `S${i+1}`;
    sd.appendChild(tag);
    const hasCards = seat.hands.some(h => h.length > 0);
    if (!hasCards) {
      const empty = document.createElement('div'); empty.className = 'empty-slot'; empty.textContent = '空';
      sd.appendChild(empty);
    } else {
      const grp = document.createElement('div'); grp.className = 'hand-group';
      seat.hands.forEach((hand, hi) => {
        if (!seat.hasSplit && hi > 0) return;
        if (seat.hasSplit) {
          const hl = document.createElement('div'); hl.className = 'hand-label';
          hl.textContent = `Hand ${String.fromCharCode(65 + hi)}`; grp.appendChild(hl);
        }
        const row = document.createElement('div');
        row.className = 'cards-row' + (seat.hasSplit && seat.activeHand === hi ? ' split-active' : '');
        if (seat.hasSplit) {
          row.style.cursor = 'pointer';
          row.addEventListener('click', e => { e.stopPropagation(); switchHand(i, hi); });
        }
        hand.forEach((c, ci) => {
          const isBust = handTotal(hand).total > 21;
          const isBJ   = isNaturalBJ(hand);
          const dimmed = seat.locked[hi] && !isBust && !isBJ;
          const isDbl  = seat.doubled[hi] && ci === hand.length - 1 && !seat.locked[hi];
          row.appendChild(makeCardEl(c, dimmed, isDbl));
        });
        grp.appendChild(row);
        if (hand.length) {
          const { total, soft } = handTotal(hand);
          const isBust = total > 21, isBJ = isNaturalBJ(hand);
          const sc = document.createElement('div');
          sc.className = 'hand-score' + (isBust ? ' s-bust' : isBJ ? ' s-bj' : '');
          sc.textContent = isBust ? '💥 爆牌' : isBJ ? '🃏 BJ!' : (soft ? 'Soft ' : '') + total;
          grp.appendChild(sc);
          if (isBust) row.querySelectorAll('.pc').forEach(p => p.classList.add('dimmed'));
        }
      });
      sd.appendChild(grp);
    }
    container.appendChild(sd);
  });
}

function renderHint() {
  const panel = document.getElementById('hint-panel');
  const body  = document.getElementById('hint-body');

  // Show only when mySeat is set — always use mySeat data regardless of activeSeat
  if (G.mySeat === null) { panel.style.display = 'none'; return; }

  const s  = G.seats[G.mySeat];
  const hi = s.activeHand;
  const h  = s.hands[hi];
  const tc = getTC();
  panel.style.display = 'block';

  // ── No cards yet ─────────────────────────────────────────────────────
  if (!h.length) {
    body.innerHTML = `<div class="hint-waiting">⏳ 等待發牌</div>
      <div class="hint-bet">建議下注: ${betUnits(tc)} 單位（TC ${tc > 0 ? '+' : ''}${tc.toFixed(2)}）</div>`;
    return;
  }

  const { total, soft } = handTotal(h);

  // ── Hand locked (bust / BJ / double / surrender) ──────────────────────
  if (s.locked[hi]) {
    const isBust = total > 21;
    const isBJ   = isNaturalBJ(h);
    const isSurr = s.surrendered && s.surrendered[hi];
    let icon = '🔒', label = `STAND ${total}`, cls = '';
    if (isBust)  { icon = '💥'; label = '爆牌';       cls = 'color:var(--red)'; }
    if (isBJ)    { icon = '🃏'; label = 'Blackjack!'; cls = 'color:var(--yellow)'; }
    if (isSurr)  { icon = '🏳️'; label = 'Surrender';  cls = 'color:var(--dim)'; }
    if (s.doubled[hi] && !isBust && !isSurr) { icon = '✅'; label = `Double ${total}`; cls = 'color:var(--blue)'; }
    body.innerHTML = `<div class="hint-action" style="${cls}">${icon} ${label}</div>
      <div class="hint-bet">建議下注: ${betUnits(tc)} 單位</div>`;
    return;
  }

  // ── Have cards, no dealer card yet ────────────────────────────────────
  if (!G.dealerCards.length) {
    body.innerHTML = `<div class="hint-action" style="color:var(--dim)">⏳ 等待莊家明牌</div>
      <div class="hint-bet">手牌: ${soft ? 'Soft ' : ''}${total} | 建議下注: ${betUnits(tc)} 單位</div>`;
    return;
  }

  // ── Insurance (dealer shows A, 1 card only) ───────────────────────────
  const dealerShowsAce = G.dealerCards.length === 1 && G.dealerCards[0] === 'A';
  let insHtml = '';
  if (dealerShowsAce) {
    const takeIns  = tc >= 3;
    const insColor = takeIns ? 'var(--yellow)' : 'var(--red)';
    const insLabel = takeIns ? '✅ 建議買保險 (TC ≥ +3)' : '❌ 不買保險 (TC < +3)';
    const insSub   = `TC = ${tc > 0 ? '+' : ''}${tc.toFixed(2)}，${takeIns ? '保險 EV 為正' : '保險 EV 為負'}`;
    const btnCls   = G.insuranceTaken ? 'hint-btn primary' : 'hint-btn';
    const btnTxt   = G.insuranceTaken ? '🛡️ 已買保險（點擊取消）' : '🛡️ 確認買保險';
    insHtml = `<div style="border:1px solid ${insColor};border-radius:8px;padding:8px 12px;margin-bottom:10px;">
      <div style="font-size:.6rem;color:var(--dim);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">保險建議</div>
      <div style="font-size:.95rem;font-weight:700;color:${insColor}">${insLabel}</div>
      <div style="font-size:.75rem;color:var(--dim);margin-top:2px;">${insSub}</div>
      <div class="hint-btns" style="margin-top:6px;">
        <button class="${btnCls}" id="btn-ins">${btnTxt}</button>
      </div>
    </div>`;
  }

  // ── Normal strategy ───────────────────────────────────────────────────
  const isPair = h.length === 2 && (h[0] === h[1] || (h[0] === 'T' && h[1] === 'T'));
  const act    = getAction(total, G.dealerCards[0], isPair, soft);
  let btns = '';
  if (act === 'D' || act === 'Ds')
    btns += '<button class="hint-btn primary" id="btn-dbl">X — 確認 Double</button>';
  if (act === 'SP')
    btns += '<button class="hint-btn primary" id="btn-sp">V — 確認 Split</button>';
  if (act === 'SR')
    btns += '<button class="hint-btn primary" id="btn-sr" style="background:var(--red);border-color:var(--red);color:#fff;">C — 確認 Surrender</button>';

  body.innerHTML = `${insHtml}
    <div class="hint-action">▶ ${ACT_LABEL[act]}</div>
    <div class="hint-bet">建議下注: ${betUnits(tc)} 單位</div>
    ${btns ? '<div class="hint-btns">' + btns + '</div>' : ''}`;

  if (act === 'D' || act === 'Ds') document.getElementById('btn-dbl').addEventListener('click', confirmDouble);
  if (act === 'SP')  document.getElementById('btn-sp').addEventListener('click', confirmSplit);
  if (act === 'SR')  document.getElementById('btn-sr').addEventListener('click', confirmSurrender);
  if (dealerShowsAce) document.getElementById('btn-ins').addEventListener('click', confirmInsurance);
}


function render() {
  renderCountBar();
  renderDealer();
  renderSeats();
  renderHint();
}

// ─── Event listeners ─────────────────────────────────────────────────────────
document.getElementById('deck-sel').addEventListener('change', function() {
  G.decks = parseInt(this.value, 10);
  newShoe();
});
document.getElementById('dealer-zone').addEventListener('click', () => selectSeat('dealer'));
document.querySelectorAll('#card-grid .kk').forEach(btn => {
  btn.addEventListener('click', () => handleCard(btn.dataset.card));
});
document.getElementById('btn-m').addEventListener('click', toggleMySeat);
document.getElementById('btn-r').addEventListener('click', resetHand);
document.getElementById('btn-n').addEventListener('click', newShoe);
document.getElementById('btn-u').addEventListener('click', undoCard);
document.getElementById('btn-export').addEventListener('click', exportCSV);
document.getElementById('btn-clear').addEventListener('click', clearLogs);

document.addEventListener('keydown', e => {
  if (e.target.tagName === 'SELECT' || e.target.tagName === 'BUTTON') return;
  const k = e.key.toUpperCase();
  if ('23456789'.includes(k) && k.length === 1) { handleCard(k); return; }
  if (k === '0' || k === 'T') { handleCard('T'); return; }
  if (k === 'A') { handleCard('A'); return; }
  if (k === 'D') { selectSeat('dealer'); return; }
  if ('1234567'.includes(k) && k.length === 1) { selectSeat(parseInt(k, 10) - 1); return; }
  if (k === 'M') { toggleMySeat(); return; }
  if (k === 'R') { resetHand(); return; }
  if (k === 'N') { newShoe(); return; }
  if (k === 'BACKSPACE') { e.preventDefault(); undoCard(); return; }
  if (k === 'X') { confirmDouble(); return; }
  if (k === 'V') { confirmSplit(); return; }
  if (k === 'Z') {
    if (G.activeSeat !== 'dealer' && G.seats[G.activeSeat].hasSplit) {
      const s = G.seats[G.activeSeat];
      switchHand(G.activeSeat, s.activeHand === 0 ? 1 : 0);
    }
  }
});

// ─── Init ─────────────────────────────────────────────────────────────────────
render();
renderLogs();
