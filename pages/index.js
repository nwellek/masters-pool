import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import Head from 'next/head'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const sb = SUPABASE_URL ? createClient(SUPABASE_URL, SUPABASE_KEY) : null
const ESPN_ID = '401811941'
const ESPN_API = 'https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event=' + ESPN_ID
const MC_SCORE = 100
const PAR = 72

// Field sorted by outright odds (favorites first) — updated Apr 8
const FIELD_ODDS = [
  ["Scottie Scheffler",490],["Jon Rahm",910],["Bryson DeChambeau",1075],["Rory McIlroy",1175],
  ["Ludvig Aberg",1700],["Xander Schauffele",1800],["Tommy Fleetwood",2300],["Cameron Young",2300],
  ["Matt Fitzpatrick",2350],["Hideki Matsuyama",2700],["Collin Morikawa",3100],["Robert MacIntyre",3400],
  ["Min Woo Lee",3500],["Justin Rose",3500],["Brooks Koepka",3700],["Jordan Spieth",4200],
  ["Chris Gotterup",4200],["Sungjae Im",4300],["Patrick Reed",4300],["Viktor Hovland",4500],["Russell Henley",4700],
  ["Si Woo Kim",4900],["Justin Thomas",5400],["Akshay Bhatia",5700],["Patrick Cantlay",5800],
  ["Adam Scott",6000],["Jason Day",6700],["Jake Knapp",6700],["Shane Lowry",6800],
  ["Sam Burns",7000],["J.J. Spaun",7200],["Sepp Straka",7400],["Tyrrell Hatton",7600],
  ["Corey Conners",7800],["Nicolai Hojgaard",7800],["Maverick McNealy",8400],["Jacob Bridgeman",8600],
  ["Kurt Kitayama",9800],["Harris English",10000],["Daniel Berger",10500],["Gary Woodland",10500],
  ["Ben Griffin",11000],["Cameron Smith",11000],["Max Homa",12000],["Rasmus Hojgaard",12500],
  ["Keegan Bradley",13500],["Marco Penge",14000],["Sam Stevens",15000],["Harry Hall",15500],["Alex Noren",16000],
  ["Ryan Gerard",16000],["Nick Taylor",19500],["Ryan Fox",21000],["Wyndham Clark",21000],
  ["Brian Harman",22500],["Michael Kim",22500],["Max Greyserman",22500],["Aaron Rai",23000],
  ["Kristoffer Reitan",23000],["Sergio Garcia",24000],["Casey Jarvis",24000],["Carlos Ortiz",25000],
  ["Tom McKibbin",26000],["Dustin Johnson",26000],["Matt McCarty",30000],["Haotong Li",30000],
  ["Andrew Novak",31000],["Nico Echavarria",34000],["Rasmus Neergaard-Petersen",34000],
  ["Sami Valimaki",39000],["Aldrich Potgieter",39000],["Johnny Keefer",40000],["Michael Brennan",40000],
  ["Zach Johnson",55000],["Bubba Watson",55000],["Charl Schwartzel",65000],["Davis Riley",85000],
  ["Brian Campbell",250000],["Danny Willett",250000],["Mason Howell",300000],["Ethan Fang",350000],
  ["Fifa Laopakdee",350000],["Naoyuki Kataoka",450000],["Brandon Holtz",500000],["Vijay Singh",500000],
  ["Fred Couples",500000],["Jackson Herrington",500000],["Mike Weir",500000],["Mateo Pulcini",500000],
  ["Jose Maria Olazabal",500000],["Angel Cabrera",999999]
]
const FIELD = FIELD_ODDS.map(function(x) { return x[0] })
const ODDS = {}; FIELD_ODDS.forEach(function(x) { ODDS[x[0]] = x[1] })
function fmtOdds(name) { var o = ODDS[name]; if (!o) return ''; if (o >= 999999) return '--'; if (o >= 100000) return '+' + Math.round(o/1000) + 'k'; return '+' + o.toLocaleString() }

// Hardcoded R1/R2 tee times (ET) from Augusta National
var TEE_R1 = {"Johnny Keefer":"7:40","Haotong Li":"7:40","Naoyuki Kataoka":"7:50","Max Homa":"7:50","Carlos Ortiz":"7:50","Jose Maria Olazabal":"8:02","Rasmus Neergaard-Petersen":"8:02","Aldrich Potgieter":"8:02","Angel Cabrera":"8:14","Sami Valimaki":"8:14","Jackson Herrington":"8:14","Charl Schwartzel":"8:26","Max Greyserman":"8:26","Ryan Fox":"8:26","Vijay Singh":"8:38","Matt McCarty":"8:38","Rasmus Hojgaard":"8:38","Kurt Kitayama":"8:50","Kristoffer Reitan":"8:50","Casey Jarvis":"8:50","Bubba Watson":"9:02","Nico Echavarria":"9:02","Brandon Holtz":"9:02","Cameron Smith":"9:19","Sam Burns":"9:19","Jake Knapp":"9:19","Keegan Bradley":"9:31","Ryan Gerard":"9:31","Nick Taylor":"9:31","Dustin Johnson":"9:43","Shane Lowry":"9:43","Jason Day":"9:43","Patrick Reed":"9:55","Tommy Fleetwood":"9:55","Akshay Bhatia":"9:55","Bryson DeChambeau":"10:07","Matt Fitzpatrick":"10:07","Xander Schauffele":"10:07","Hideki Matsuyama":"10:19","Collin Morikawa":"10:19","Russell Henley":"10:19","Rory McIlroy":"10:31","Cameron Young":"10:31","Mason Howell":"10:31","Viktor Hovland":"10:43","Patrick Cantlay":"10:43","Alex Noren":"10:43","Sam Stevens":"11:03","Sungjae Im":"11:03","Andrew Novak":"11:15","Tom McKibbin":"11:15","Brian Campbell":"11:15","Mike Weir":"11:27","Wyndham Clark":"11:27","Mateo Pulcini":"11:27","Zach Johnson":"11:39","Michael Kim":"11:39","Nicolai Hojgaard":"11:39","Danny Willett":"11:51","Davis Riley":"11:51","Ethan Fang":"11:51","Adam Scott":"12:03","Daniel Berger":"12:03","Brian Harman":"12:03","Fred Couples":"12:15","Min Woo Lee":"12:15","Fifa Laopakdee":"12:15","Sergio Garcia":"12:27","Aaron Rai":"12:27","Jacob Bridgeman":"12:27","Harry Hall":"12:44","Corey Conners":"12:44","Michael Brennan":"12:44","J.J. Spaun":"12:56","Maverick McNealy":"12:56","Tyrrell Hatton":"12:56","Jon Rahm":"1:08","Chris Gotterup":"1:08","Ludvig Aberg":"1:08","Jordan Spieth":"1:20","Justin Rose":"1:20","Brooks Koepka":"1:20","Sepp Straka":"1:32","Ben Griffin":"1:32","Justin Thomas":"1:32","Scottie Scheffler":"1:44","Robert MacIntyre":"1:44","Gary Woodland":"1:44","Harris English":"1:56","Marco Penge":"1:56","Si Woo Kim":"1:56"}
var TEE_R2 = {"Sam Stevens":"7:40","Sungjae Im":"7:40","Andrew Novak":"7:50","Tom McKibbin":"7:50","Brian Campbell":"7:50","Mike Weir":"8:02","Wyndham Clark":"8:02","Mateo Pulcini":"8:02","Zach Johnson":"8:14","Michael Kim":"8:14","Nicolai Hojgaard":"8:14","Danny Willett":"8:26","Davis Riley":"8:26","Ethan Fang":"8:26","Adam Scott":"8:38","Daniel Berger":"8:38","Brian Harman":"8:38","Fred Couples":"8:50","Min Woo Lee":"8:50","Fifa Laopakdee":"8:50","Sergio Garcia":"9:02","Aaron Rai":"9:02","Jacob Bridgeman":"9:02","Harry Hall":"9:19","Corey Conners":"9:19","Michael Brennan":"9:19","J.J. Spaun":"9:31","Maverick McNealy":"9:31","Tyrrell Hatton":"9:31","Jon Rahm":"9:43","Chris Gotterup":"9:43","Ludvig Aberg":"9:43","Jordan Spieth":"9:55","Justin Rose":"9:55","Brooks Koepka":"9:55","Sepp Straka":"10:07","Ben Griffin":"10:07","Justin Thomas":"10:07","Scottie Scheffler":"10:19","Robert MacIntyre":"10:19","Gary Woodland":"10:19","Harris English":"10:31","Marco Penge":"10:31","Si Woo Kim":"10:31","Johnny Keefer":"10:51","Haotong Li":"10:51","Naoyuki Kataoka":"11:03","Max Homa":"11:03","Carlos Ortiz":"11:03","Jose Maria Olazabal":"11:15","Rasmus Neergaard-Petersen":"11:15","Aldrich Potgieter":"11:15","Angel Cabrera":"11:27","Sami Valimaki":"11:27","Jackson Herrington":"11:27","Charl Schwartzel":"11:39","Max Greyserman":"11:39","Ryan Fox":"11:39","Vijay Singh":"11:51","Matt McCarty":"11:51","Rasmus Hojgaard":"11:51","Kurt Kitayama":"12:03","Kristoffer Reitan":"12:03","Casey Jarvis":"12:03","Bubba Watson":"12:15","Nico Echavarria":"12:15","Brandon Holtz":"12:15","Cameron Smith":"12:32","Sam Burns":"12:32","Jake Knapp":"12:32","Keegan Bradley":"12:44","Ryan Gerard":"12:44","Nick Taylor":"12:44","Dustin Johnson":"12:56","Shane Lowry":"12:56","Jason Day":"12:56","Patrick Reed":"1:08","Tommy Fleetwood":"1:08","Akshay Bhatia":"1:08","Bryson DeChambeau":"1:20","Matt Fitzpatrick":"1:20","Xander Schauffele":"1:20","Hideki Matsuyama":"1:32","Collin Morikawa":"1:32","Russell Henley":"1:32","Rory McIlroy":"1:44","Cameron Young":"1:44","Mason Howell":"1:44","Viktor Hovland":"1:56","Patrick Cantlay":"1:56","Alex Noren":"1:56"}
function getTeeTime(name) {
  if (TEE_R1[name]) return TEE_R1[name]
  var n = norm(name)
  var keys = Object.keys(TEE_R1)
  for (var i = 0; i < keys.length; i++) {
    if (norm(keys[i]) === n) return TEE_R1[keys[i]]
  }
  return null
}

const POOLS = {
  hp: {
    name: 'HP Pool',
    teams: ['Sutker','Levin','Shane','Tuna','Noah/Jack','Tino','Nate','Ziggy','Jonah','Liebs'],
    buyIns: [300,300,300,300,300,300,300,300,300,300],
    minPicks: 3,
    maxPicks: 91,
    rules: [
      { label: '1st place wins the pot (minus 2nd place money back)', pct: 0, type: 'winner' },
      { label: '2nd place gets base buy-in back ($300)', pct: 0, type: 'moneyback' },
    ],
    mcPenalty: 0.10,
  },
  mich: {
    name: 'Mich Pool',
    teams: ['Silv/Shein','Klein','Berris/AK','Wellek','Walker/Gropp','Sloane/Lee','Migdal/Mitch','Lurz/Berg','Deitch/Lefty','Eli'],
    buyIns: [250,250,250,250,250,250,250,250,250,250],
    minPicks: 3,
    maxPicks: 8,
    rules: [
      { label: 'Lowest 3-player combine (must all make cut)', pct: 75, type: 'team' },
      { label: 'Winning player', pct: 15, type: 'player' },
      { label: '2nd lowest team', pct: 10, type: 'second' },
    ],
    mcPenalty: 0.10,
  },
  meit: {
    name: 'Meit Pool',
    teams: ['Spain','Cov','Turtle','CC','Pluto','Fletch','TY','RT','Big Papi'],
    buyIns: [2500,2500,2500,2500,2500,2500,2500,2500,2500],
    minPicks: 6,
    maxPicks: 6,
    rules: [
      { label: '1st place wins the pot (minus 2nd place money back)', pct: 0, type: 'winner' },
      { label: '2nd place gets base buy-in back ($2,500)', pct: 0, type: 'moneyback' },
    ],
    mcPenalty: 0.10,
    password: 'BigMoney',
  },
}

function norm(n) { return n.toLowerCase().replace(/ø/g, 'o').replace(/å/g, 'a').replace(/æ/g, 'ae').replace(/ñ/g, 'n').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z\s]/g, '').replace(/\s+/g, ' ').trim() }

function findScore(name, lb) {
  var n = norm(name), p = n.split(' '), last = p[p.length - 1]
  for (var i = 0; i < lb.length; i++) {
    var en = norm(lb[i].name), ep = en.split(' ')
    if (en === n) return lb[i]
    if (ep[ep.length - 1] === last && ep[0].substring(0, 3) === p[0].substring(0, 3)) return lb[i]
  }
  return null
}

function fmt(v) {
  if (v == null) return '--'
  if (v >= MC_SCORE) return 'MC'
  return v > 0 ? '+' + v : v === 0 ? 'E' : '' + v
}

function snakeOrder(numTeams, numRounds) {
  var o = []
  for (var r = 0; r < numRounds; r++) {
    var fwd = []
    for (var i = 0; i < numTeams; i++) fwd.push(i)
    if (r % 2 === 0) { o = o.concat(fwd) } else { o = o.concat(fwd.reverse()) }
  }
  return o
}

async function loadPicks(k) {
  if (!sb) return []
  var res = await sb.from('masters_picks').select('*').eq('pool', k).order('pick_num', { ascending: true })
  return (res.data || []).map(function(r) { return { team: r.team_idx, player: r.player, pick: r.pick_num } })
}

async function savePick(k, ti, player, num) {
  if (!sb) return
  await sb.from('masters_picks').insert({ pool: k, team_idx: ti, player: player, pick_num: num })
}

async function deletePick(k, num) {
  if (!sb) return
  await sb.from('masters_picks').delete().eq('pool', k).eq('pick_num', num)
}

var G = '#006747', GD = '#004d35', Y = '#F2C75C', RED = '#c0392b', TXT = '#1a2e1a', T2 = '#3d5c3d', T3 = '#6b8a6b', BD = 'rgba(0,103,71,0.12)'

function DraftBoard({ poolKey, picks, setPicks, refresh, savingRef }) {
  var [search, setSearch] = useState('')
  var cfg = POOLS[poolKey]
  var n = cfg.teams.length
  var order = snakeOrder(n, cfg.maxPicks)
  var cur = picks.length
  var allPicked = picks.filter(function(p) { return p.player !== '__PASS__' && p.player !== '__DRAFT_COMPLETE__' }).map(function(p) { return p.player })
  var avail = FIELD.filter(function(p) { return allPicked.indexOf(p) === -1 })
  var totalField = FIELD.length
  var totalPicked = allPicked.length
  var filtered = search ? avail.filter(function(p) { return norm(p).indexOf(norm(search)) !== -1 }) : avail

  var tp = {}
  cfg.teams.forEach(function(_, i) { tp[i] = [] })
  picks.forEach(function(p) { if (tp[p.team]) tp[p.team].push(p) })
  var draftMarker = picks.some(function(p) { return p.player === '__DRAFT_COMPLETE__' })

  // Persist doneTeams in localStorage so auto-refresh doesn't reset them
  var storageKey = 'masters_done_' + poolKey
  var [allDoneTeams, setAllDoneTeams] = useState(function() {
    try { var s = localStorage.getItem('masters_done_all'); return s ? JSON.parse(s) : {} } catch(e) { return {} }
  })
  var doneTeams = allDoneTeams[poolKey] || {}

  var ti = cur < order.length ? order[cur] : null
  var team = ti != null ? cfg.teams[ti] : null
  var rd = Math.floor(cur / n) + 1
  var pir = (cur % n) + 1
  var isCurrentTeamDone = ti != null && doneTeams[ti]

  var done = cur >= order.length || draftMarker
  var allTeamsHaveMin = cfg.teams.every(function(_, i) {
    return (tp[i] || []).filter(function(p) { return p.player !== '__PASS__' && p.player !== '__DRAFT_COMPLETE__' }).length >= cfg.minPicks
  })
  var [confirmEnd, setConfirmEnd] = useState(false)
  var [showReset, setShowReset] = useState(false)
  var [resetPw, setResetPw] = useState('')
  var [resetError, setResetError] = useState(false)

  async function handlePick(player) {
    savingRef.current = true
    var next = picks.concat([{ team: ti, player: player, pick: cur + 1 }])
    setPicks(next)
    await savePick(poolKey, ti, player, cur + 1)
    setSearch('')
    savingRef.current = false
  }

  async function handlePass() {
    savingRef.current = true
    var next = picks.concat([{ team: ti, player: '__PASS__', pick: cur + 1 }])
    setPicks(next)
    await savePick(poolKey, ti, '__PASS__', cur + 1)
    savingRef.current = false
  }

  function handleToggleDone(teamIdx) {
    var poolDone = Object.assign({}, doneTeams)
    if (poolDone[teamIdx]) {
      delete poolDone[teamIdx]
    } else {
      poolDone[teamIdx] = true
    }
    var next = Object.assign({}, allDoneTeams)
    next[poolKey] = poolDone
    setAllDoneTeams(next)
    try { localStorage.setItem('masters_done_all', JSON.stringify(next)) } catch(e) {}
  }

  async function handleUndo() {
    savingRef.current = true
    var last = picks[picks.length - 1]
    await deletePick(poolKey, last.pick)
    setPicks(picks.slice(0, -1))
    setConfirmEnd(false)
    savingRef.current = false
  }

  async function handleEndDraft() {
    savingRef.current = true
    var next = picks.concat([{ team: 0, player: '__DRAFT_COMPLETE__', pick: cur + 1 }])
    setPicks(next)
    await savePick(poolKey, 0, '__DRAFT_COMPLETE__', cur + 1)
    setConfirmEnd(false)
    savingRef.current = false
  }

  async function handleReopenDraft() {
    var markerPick = picks.find(function(p) { return p.player === '__DRAFT_COMPLETE__' })
    if (markerPick) {
      await deletePick(poolKey, markerPick.pick)
      setPicks(picks.filter(function(p) { return p.player !== '__DRAFT_COMPLETE__' }))
    }
  }

  async function handleResetDraft() {
    if (resetPw !== 'Nate') {
      setResetError(true)
      return
    }
    if (!sb) return
    await sb.from('masters_picks').delete().eq('pool', poolKey)
    setPicks([])
    setShowReset(false)
    setResetPw('')
    setResetError(false)
  }

  var realPickCount = ti != null && tp[ti] ? tp[ti].filter(function(p) { return p.player !== '__PASS__' && p.player !== '__DRAFT_COMPLETE__' }).length : 0
  var canPass = ti != null && realPickCount >= cfg.minPicks

  return (
    <div>
      {!done ? (
        <div>
          {/* On the clock banner */}
          <div style={{ background: isCurrentTeamDone ? '#888' : Y, borderRadius: 10, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div style={{ fontSize: 11, color: isCurrentTeamDone ? '#fff' : GD, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Round {rd} · Pick {pir}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: isCurrentTeamDone ? '#fff' : GD, fontFamily: 'Georgia,serif' }}>{team} {isCurrentTeamDone ? '— done, skip their turn' : 'is on the clock'}</div>
                {!isCurrentTeamDone && <div style={{ fontSize: 12, color: T2 }}>Pick #{cur + 1} · Min {cfg.minPicks} · {avail.length} of {totalField} players available</div>}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {isCurrentTeamDone && <button onClick={handlePass} style={{ padding: '10px 24px', borderRadius: 6, border: 'none', background: '#fff', color: '#888', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Skip →</button>}
                {!isCurrentTeamDone && canPass && <button onClick={handlePass} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid ' + GD, background: 'transparent', color: GD, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Skip</button>}
                {picks.length > 0 && <button onClick={handleUndo} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid ' + GD, background: 'transparent', color: GD, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Undo</button>}
                <button onClick={refresh} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid ' + GD, background: 'transparent', color: GD, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Sync</button>
                {allTeamsHaveMin && !confirmEnd && <button onClick={function() { setConfirmEnd(true) }} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid #c0392b', background: 'transparent', color: '#c0392b', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>End Draft</button>}
                {confirmEnd && (
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: GD, fontWeight: 600 }}>Sure?</span>
                    <button onClick={handleEndDraft} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#c0392b', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Yes, end it</button>
                    <button onClick={function() { setConfirmEnd(false) }} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid ' + GD, background: 'transparent', color: GD, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: two columns. Mobile: stacked */}
          <div className="draft-layout" style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 14, marginBottom: 14 }}>
            {/* LEFT: Player picker */}
            <div>
              {isCurrentTeamDone ? (
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 20, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{team} is done drafting</div>
                  <div style={{ fontSize: 12 }}>Click "Skip →" above to advance</div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Georgia,serif', marginBottom: 6 }}>Available Players ({avail.length})</div>
                  <input type="text" placeholder="Search players..." value={search} onChange={function(e) { setSearch(e.target.value) }} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid ' + BD, fontSize: 14, background: '#fff', color: TXT, outline: 'none', boxSizing: 'border-box', fontFamily: 'Georgia,serif', marginBottom: 6 }} />
                  <div className="player-list" style={{ maxHeight: 500, overflow: 'auto', borderRadius: 8, border: '1px solid ' + BD, background: '#fff' }}>
                    {filtered.length === 0 && <div style={{ padding: 12, color: T3, fontSize: 13, textAlign: 'center' }}>No players found</div>}
                    {filtered.map(function(p) {
                      return <button key={p} onClick={function() { handlePick(p) }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '9px 14px', border: 'none', borderBottom: '1px solid ' + BD, background: 'transparent', textAlign: 'left', fontSize: 13, color: TXT, cursor: 'pointer', fontFamily: 'Georgia,serif' }}><span>{p}</span><span style={{ color: T3, fontSize: 11 }}>{fmtOdds(p)}</span></button>
                    })}
                  </div>
                </>
              )}
            </div>

            {/* RIGHT: Rosters */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Georgia,serif', marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Rosters</span>
                {!showReset && <button onClick={function() { setShowReset(true); setResetPw(''); setResetError(false) }} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 10, cursor: 'pointer' }}>Reset Draft</button>}
              </div>
              {showReset && (
                <div style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, padding: 12, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginBottom: 8 }}>Enter password to reset entire draft</div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                    <input type="password" placeholder="Password" value={resetPw} onChange={function(e) { setResetPw(e.target.value); setResetError(false) }} style={{ padding: '8px 12px', borderRadius: 6, border: resetError ? '1px solid #c0392b' : '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', width: 140, fontFamily: 'Georgia,serif' }} />
                    <button onClick={handleResetDraft} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#c0392b', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Reset All Picks</button>
                    <button onClick={function() { setShowReset(false); setResetPw(''); setResetError(false) }} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
                  </div>
                  {resetError && <div style={{ color: '#c0392b', fontSize: 12, marginTop: 6 }}>Wrong password</div>}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 8 }}>
                {cfg.teams.map(function(name, i) {
                  var realPicks = (tp[i] || []).filter(function(p) { return p.player !== '__PASS__' && p.player !== '__DRAFT_COMPLETE__' })
                  var isDone = doneTeams[i]
                  return (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 8, overflow: 'hidden', border: ti === i ? '2px solid ' + Y : isDone ? '1px solid rgba(0,0,0,0.1)' : '1px solid ' + BD, opacity: isDone ? 0.55 : 1 }}>
                      <div style={{ background: isDone ? '#888' : ti === i ? Y : G, color: ti === i && !isDone ? GD : '#fff', padding: '6px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'Georgia,serif', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{name} {isDone ? '✓' : ''}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ opacity: 0.6 }}>{realPicks.length}</span>
                          {realPicks.length >= cfg.minPicks && <button onClick={function() { handleToggleDone(i) }} style={{ padding: '2px 8px', borderRadius: 4, border: 'none', background: isDone ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)', color: '#fff', fontSize: 9, cursor: 'pointer', fontWeight: 600 }}>{isDone ? 'Undo' : 'Done'}</button>}
                        </div>
                      </div>
                      {realPicks.map(function(p, j) {
                        return <div key={j} style={{ padding: '4px 10px', fontSize: 11.5, borderBottom: '1px solid ' + BD, color: TXT, display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player}</span>
                          <span style={{ color: T3, fontSize: 9, flexShrink: 0 }}>#{p.pick}</span>
                        </div>
                      })}
                      {realPicks.length === 0 && <div style={{ padding: '8px 10px', fontSize: 11, color: T3, textAlign: 'center' }}>--</div>}
                    </div>
                  )
                })}
              </div>
              {/* Draft Order - always expanded */}
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Georgia,serif', marginBottom: 6 }}>Draft Order</div>
                <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 8, padding: 10, maxHeight: 400, overflow: 'auto' }}>
                  {order.map(function(idx, i) {
                    var pd = i < picks.length ? picks[i] : null
                    var isPass = pd && pd.player === '__PASS__'
                    var isCurrent = i === picks.length && !done
                    return (
                      <div key={i} style={{ fontSize: 11, padding: isCurrent ? '3px 4px' : '2px 0', color: i < picks.length ? T3 : isCurrent ? GD : TXT, fontWeight: isCurrent ? 700 : 400, display: 'flex', gap: 6, background: isCurrent ? 'rgba(242,199,92,0.15)' : 'transparent', borderRadius: isCurrent ? 4 : 0 }}>
                        <span style={{ width: 28, textAlign: 'right', color: T3 }}>#{i + 1}</span>
                        <span style={{ width: 18, textAlign: 'center', color: T3, fontSize: 10 }}>R{Math.floor(i / n) + 1}</span>
                        <span>{cfg.teams[idx]}</span>
                        {isPass && <span style={{ color: T3, marginLeft: 'auto', fontStyle: 'italic' }}>skipped</span>}
                        {pd && !isPass && pd.player !== '__DRAFT_COMPLETE__' && <span style={{ color: T3, marginLeft: 'auto' }}>{pd.player}</span>}
                        {isCurrent && <span style={{ color: Y, marginLeft: 'auto' }}>◀ ON CLOCK</span>}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ background: G, borderRadius: 10, padding: 16, marginBottom: 14, textAlign: 'center', color: '#fff' }}>
            <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Georgia,serif' }}>Draft complete!</div>
            <div style={{ fontSize: 13, opacity: 0.7, marginTop: 4 }}>Scores update live during the tournament.</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'Georgia,serif', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Rosters</span>
            {!showReset && <button onClick={function() { setShowReset(true); setResetPw(''); setResetError(false) }} style={{ padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'rgba(255,255,255,0.4)', fontSize: 10, cursor: 'pointer' }}>Reset Draft</button>}
          </div>
          {showReset && (
            <div style={{ background: 'rgba(192,57,43,0.15)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 600, marginBottom: 8 }}>Enter password to reset entire draft</div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <input type="password" placeholder="Password" value={resetPw} onChange={function(e) { setResetPw(e.target.value); setResetError(false) }} style={{ padding: '8px 12px', borderRadius: 6, border: resetError ? '1px solid #c0392b' : '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', width: 140, fontFamily: 'Georgia,serif' }} />
                <button onClick={handleResetDraft} style={{ padding: '8px 14px', borderRadius: 6, border: 'none', background: '#c0392b', color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Reset All Picks</button>
                <button onClick={function() { setShowReset(false); setResetPw(''); setResetError(false) }} style={{ padding: '8px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
              </div>
              {resetError && <div style={{ color: '#c0392b', fontSize: 12, marginTop: 6 }}>Wrong password</div>}
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 8 }}>
            {cfg.teams.map(function(name, i) {
              var realPicks = (tp[i] || []).filter(function(p) { return p.player !== '__PASS__' && p.player !== '__DRAFT_COMPLETE__' })
              return (
                <div key={i} style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 8, overflow: 'hidden', border: '1px solid ' + BD }}>
                  <div style={{ background: G, color: '#fff', padding: '6px 10px', fontSize: 12, fontWeight: 700, fontFamily: 'Georgia,serif', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{name}</span><span style={{ opacity: 0.6 }}>{realPicks.length}</span>
                  </div>
                  {realPicks.map(function(p, j) {
                    return <div key={j} style={{ padding: '4px 10px', fontSize: 11.5, borderBottom: '1px solid ' + BD, color: TXT, display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.player}</span>
                      <span style={{ color: T3, fontSize: 9, flexShrink: 0 }}>#{p.pick}</span>
                    </div>
                  })}
                  {realPicks.length === 0 && <div style={{ padding: '8px 10px', fontSize: 11, color: T3, textAlign: 'center' }}>--</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function PoolView({ poolKey, picks, lb }) {
  var cfg = POOLS[poolKey]
  var pot = cfg.buyIns.reduce(function(a, b) { return a + b }, 0)
  var has = lb.length > 0
  var tp = {}
  cfg.teams.forEach(function(_, i) { tp[i] = [] })
  picks.filter(function(p) { return p.player !== '__PASS__' && p.player !== '__DRAFT_COMPLETE__' }).forEach(function(p) { if (tp[p.team]) tp[p.team].push(p.player) })

  var scores = cfg.teams.map(function(name, ti) {
    var gs = (tp[ti] || []).map(function(g) { var m = findScore(g, lb); return { name: g, data: m, mc: m ? !m.madeCut : false } })
    var valid = gs.filter(function(s) { return s.data && !s.mc && s.data.toPar != null }).map(function(s) { return s.data.toPar }).sort(function(a, b) { return a - b })
    var b3 = valid.slice(0, 3)
    var total = b3.length >= 3 ? b3.reduce(function(a, b) { return a + b }, 0) : null
    return { name: name, ti: ti, total: total, gs: gs, cc: valid.length }
  }).sort(function(a, b) {
    if (a.total == null && b.total == null) return 0
    if (a.total == null) return 1
    if (b.total == null) return -1
    return a.total - b.total
  })

  var bp = null
  var bestNames = []
  Object.keys(tp).forEach(function(ti) {
    tp[ti].forEach(function(g) {
      var m = findScore(g, lb)
      if (m && m.madeCut && m.toPar != null) {
        if (!bp || m.toPar < bp.toPar) {
          bp = { name: g, toPar: m.toPar, team: cfg.teams[ti] }
          bestNames = [g]
        } else if (bp && m.toPar === bp.toPar) {
          bestNames.push(g)
        }
      }
    })
  })

  // Calculate MC penalties per team
  var teamCosts = cfg.teams.map(function(name, ti) {
    var baseBuyIn = cfg.buyIns[ti]
    var mcCount = scores.find(function(s) { return s.ti === ti })
    var gs = mcCount ? mcCount.gs : []
    var mcs = gs.filter(function(g) { return g.mc }).length
    var penalty = Math.round(baseBuyIn * cfg.mcPenalty) * mcs
    return { name: name, ti: ti, base: baseBuyIn, mcs: mcs, penalty: penalty, total: baseBuyIn + penalty }
  })
  var totalMcPenalties = teamCosts.reduce(function(sum, t) { return sum + t.penalty }, 0)
  var adjustedPot = pot + totalMcPenalties

  if (picks.filter(function(p) { return p.player !== '__PASS__' && p.player !== '__DRAFT_COMPLETE__' }).length === 0)
    return <div style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)', fontFamily: 'Georgia,serif' }}>No picks yet — use Draft tab first.</div>

  var medals = ['#D4AF37', '#A8A8A8', '#B87333']

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 12, marginBottom: 16 }}>
        <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 8, padding: '12px 14px', border: '1px solid ' + BD }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G, marginBottom: 6, fontFamily: 'Georgia,serif' }}>Standings</div>
          {scores.map(function(t, i) {
            var tc = teamCosts.find(function(c) { return c.ti === t.ti })
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: i < scores.length - 1 ? '1px solid ' + BD : 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                  <span style={{ width: 18, height: 18, borderRadius: '50%', background: i < 3 && has && t.total != null ? medals[i] : 'rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: i < 3 && has && t.total != null ? '#fff' : T3, flexShrink: 0 }}>{i + 1}</span>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: i === 0 && has ? 700 : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{t.name}</span>
                    {has && tc && tc.mcs > 0 && false}
                  </div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.total != null ? (t.total < 0 ? RED : TXT) : T3, flexShrink: 0 }}>{t.total != null ? fmt(t.total) : has && t.cc < 3 ? 'N/Q' : '--'}</span>
              </div>
            )
          })}
        </div>
        <div style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 8, padding: '12px 14px', border: '1px solid ' + BD }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: G, marginBottom: 2, fontFamily: 'Georgia,serif' }}>Pot</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: G, fontFamily: 'Georgia,serif', textAlign: 'center', margin: '4px 0 4px' }}>${adjustedPot.toLocaleString()}</div>
          {has && totalMcPenalties > 0 && (
            <div style={{ textAlign: 'center', fontSize: 10, color: T3, marginBottom: 8 }}>
              Base ${pot.toLocaleString()} + ${totalMcPenalties.toLocaleString()} MC penalties
            </div>
          )}
          {(!has || totalMcPenalties === 0) && <div style={{ marginBottom: 8 }} />}
          {cfg.rules.map(function(r, i) {
            var payoutAmt = 0
            if (r.type === 'winner') {
              payoutAmt = adjustedPot - cfg.buyIns[0]
            } else if (r.type === 'moneyback') {
              payoutAmt = cfg.buyIns[0]
            } else {
              payoutAmt = Math.round(adjustedPot * r.pct / 100)
            }
            return (
              <div key={i} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <span style={{ fontWeight: 600 }}>{r.type === 'winner' ? '1st Place' : r.type === 'moneyback' ? '2nd Place' : r.type === 'team' ? 'Team' : r.type === 'player' ? 'Player' : '2nd'}{r.pct > 0 ? ' (' + r.pct + '%)' : ''}</span>
                  <span style={{ fontWeight: 700 }}>${payoutAmt.toLocaleString()}</span>
                </div>
                <div style={{ fontSize: 10, color: T3 }}>{r.label}</div>
                {has && (r.type === 'team' || r.type === 'winner') && scores[0] && scores[0].total != null && <div style={{ fontSize: 10, color: G, fontWeight: 600 }}>▸ {scores[0].name} ({fmt(scores[0].total)})</div>}
                {has && r.type === 'player' && bp && <div style={{ fontSize: 10, color: G, fontWeight: 600 }}>▸ {bp.name} ({fmt(bp.toPar)})</div>}
                {has && (r.type === 'second' || r.type === 'moneyback') && scores[1] && scores[1].total != null && <div style={{ fontSize: 10, color: G, fontWeight: 600 }}>▸ {scores[1].name} ({fmt(scores[1].total)})</div>}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
        {scores.map(function(t, rank) {
          var tc = teamCosts.find(function(c) { return c.ti === t.ti })
          return (
            <div key={t.ti} style={{ background: 'rgba(255,255,255,0.96)', borderRadius: 8, overflow: 'hidden', border: rank === 0 && has && t.total != null ? '2px solid ' + Y : '1px solid ' + BD }}>
              <div style={{ background: rank === 0 && has && t.total != null ? Y : G, color: rank === 0 && has && t.total != null ? GD : '#fff', padding: '7px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'Georgia,serif' }}>{t.name}</span>
                  <span style={{ fontSize: 10, opacity: 0.6 }}>{t.gs.length} golfers</span>
                  {has && tc && tc.mcs > 0 && <span style={{ fontSize: 9, opacity: 0.7 }}>${tc.total} ({tc.mcs}MC)</span>}
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, fontFamily: 'Georgia,serif' }}>{has ? (t.total != null ? fmt(t.total) : t.cc < 3 ? 'N/Q' : '--') : '--'}</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 30px 30px 30px 30px 40px', padding: '2px 10px', fontSize: 9, color: T3, fontWeight: 600, textTransform: 'uppercase', borderBottom: '1px solid ' + BD }}>
                <div>Golfer</div><div style={{ textAlign: 'center' }}>R1</div><div style={{ textAlign: 'center' }}>R2</div><div style={{ textAlign: 'center' }}>R3</div><div style={{ textAlign: 'center' }}>R4</div><div style={{ textAlign: 'center' }}>Tot</div>
              </div>
              {t.gs.sort(function(a, b) {
                var as2 = a.data ? (a.mc ? MC_SCORE : (a.data.toPar != null ? a.data.toPar : 999)) : 998
                var bs2 = b.data ? (b.mc ? MC_SCORE : (b.data.toPar != null ? b.data.toPar : 999)) : 998
                return as2 - bs2
              }).map(function(g, i) {
                var d = g.data, star = bestNames.indexOf(g.name) !== -1
                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 30px 30px 30px 30px 40px', alignItems: 'center', padding: '4px 10px', borderBottom: i < t.gs.length - 1 ? '1px solid ' + BD : 'none', opacity: g.mc ? 0.4 : 1, fontSize: 12, background: star ? 'rgba(242,199,92,0.08)' : 'transparent' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: star ? 700 : 500, color: star ? GD : TXT }}>
                      {star && <span style={{ color: Y, marginRight: 2 }}>★</span>}{g.name}
                    </div>
                    {d ? (
                      <>
                        <div style={{ textAlign: 'center', color: d.r1 && d.r1 < PAR ? RED : d.r1 ? T2 : T3, fontWeight: d.r1 && d.r1 < PAR ? 700 : 400 }}>{d.r1 || '--'}</div>
                        <div style={{ textAlign: 'center', color: d.r2 && d.r2 < PAR ? RED : d.r2 ? T2 : T3, fontWeight: d.r2 && d.r2 < PAR ? 700 : 400, fontSize: d.r2 ? 12 : 9 }}>{d.r2 ? d.r2 : (d.r1 && !d.r2 && d.thru ? d.thru : (d.r1 && !d.r2 ? (d.teeTime || '--') : '--'))}</div>
                        <div style={{ textAlign: 'center', color: d.r3 && d.r3 < PAR ? RED : d.r3 ? T2 : T3, fontWeight: d.r3 && d.r3 < PAR ? 700 : 400, fontSize: d.r3 ? 12 : 9 }}>{g.mc ? '--' : (d.r3 ? d.r3 : (d.r2 && !d.r3 && d.thru ? d.thru : (d.r2 && !d.r3 ? '--' : '--')))}</div>
                        <div style={{ textAlign: 'center', color: d.r4 && d.r4 < PAR ? RED : d.r4 ? T2 : T3, fontWeight: d.r4 && d.r4 < PAR ? 700 : 400, fontSize: d.r4 ? 12 : 9 }}>{g.mc ? '--' : (d.r4 ? d.r4 : (d.r3 && !d.r4 && d.thru ? d.thru : '--'))}</div>
                        <div style={{ textAlign: 'center', fontWeight: 700, color: g.mc ? T3 : (d.toPar < 0 ? RED : d.toPar === 0 ? TXT : T2) }}>{g.mc ? 'MC' : fmt(d.toPar)}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ textAlign: 'center', color: T3, fontSize: 9 }}>{getTeeTime(g.name) || '--'}</div>
                        <div style={{ textAlign: 'center', color: T3 }}>--</div>
                        <div style={{ textAlign: 'center', color: T3 }}>--</div>
                        <div style={{ textAlign: 'center', color: T3 }}>--</div>
                        <div style={{ textAlign: 'center', color: T3 }}>--</div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Leaderboard({ lb, status }) {
  var [search, setSearch] = useState('')
  var showPreview = lb.length === 0 || status === 'pre'
  var displayData = showPreview ? FIELD_ODDS.map(function(x, i) {
    return { name: x[0], position: String(i + 1), toPar: null, r1: null, r2: null, r3: null, r4: null, total: null, madeCut: true, teeTime: getTeeTime(x[0]), odds: x[1] }
  }) : lb
  var f = search ? displayData.filter(function(g) { return norm(g.name).indexOf(norm(search)) !== -1 }) : displayData
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, fontFamily: 'Georgia,serif', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'in' ? '#4CAF50' : Y, animation: status === 'in' ? 'pulse 2s infinite' : 'none' }} />
          {showPreview ? 'Field (' + FIELD.length + ' players)' : 'Leaderboard'} {status === 'in' ? '(Live)' : status === 'post' ? '(Final)' : showPreview ? '· Starts Apr 9' : ''}
        </div>
        <input type="text" placeholder="Search..." value={search} onChange={function(e) { setSearch(e.target.value) }} style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', flex: '1 1 140px', maxWidth: 200, fontFamily: 'Georgia,serif' }} />
      </div>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', background: 'rgba(255,255,255,0.96)', borderRadius: 8, overflow: 'hidden', borderCollapse: 'collapse', border: '1px solid ' + BD, minWidth: 400 }}>
          <thead><tr>
            <th style={{ background: G, color: '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, padding: '7px 8px', textAlign: 'left', fontFamily: 'Georgia,serif' }}>#</th>
            <th style={{ background: G, color: '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, padding: '7px 8px', textAlign: 'left', fontFamily: 'Georgia,serif' }}>Player</th>
            {showPreview && <th style={{ background: G, color: '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, padding: '7px 8px', textAlign: 'center', fontFamily: 'Georgia,serif' }}>Odds</th>}
            <th style={{ background: G, color: '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, padding: '7px 8px', textAlign: 'center', fontFamily: 'Georgia,serif' }}>{showPreview ? 'Tee' : 'Score'}</th>
            <th style={{ background: G, color: '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, padding: '7px 8px', textAlign: 'center', fontFamily: 'Georgia,serif' }}>R1</th>
            <th style={{ background: G, color: '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, padding: '7px 8px', textAlign: 'center', fontFamily: 'Georgia,serif' }}>R2</th>
            <th style={{ background: G, color: '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, padding: '7px 8px', textAlign: 'center', fontFamily: 'Georgia,serif' }}>R3</th>
            <th style={{ background: G, color: '#fff', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.7, padding: '7px 8px', textAlign: 'center', fontFamily: 'Georgia,serif' }}>R4</th>
          </tr></thead>
          <tbody>
            {f.map(function(g, i) {
              return (
                <tr key={i} style={{ borderBottom: '1px solid ' + BD, background: i % 2 === 0 ? 'transparent' : 'rgba(0,103,71,0.02)' }}>
                  <td style={{ padding: '5px 8px', fontSize: 12, fontWeight: 600, color: T2 }}>{g.position || (i + 1)}</td>
                  <td style={{ padding: '5px 8px', fontSize: 12, fontWeight: 500, color: TXT, whiteSpace: 'nowrap' }}>{g.name}</td>
                  {showPreview && <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: 11, color: T3 }}>{fmtOdds(g.name)}</td>}
                  <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: !g.madeCut ? T3 : g.toPar != null && g.toPar < 0 ? RED : g.toPar === 0 ? TXT : T2 }}>{showPreview ? (g.teeTime || 'TBD') : (!g.madeCut ? 'MC' : fmt(g.toPar))}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: 12, color: g.r1 && g.r1 < PAR ? RED : T2, fontWeight: g.r1 && g.r1 < PAR ? 700 : 400 }}>{g.r1 || '--'}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: 12, color: g.r2 && g.r2 < PAR ? RED : T2, fontWeight: g.r2 && g.r2 < PAR ? 700 : 400 }}>{g.r2 || '--'}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: 12, color: T2 }}>{g.r3 || '--'}</td>
                  <td style={{ padding: '5px 8px', textAlign: 'center', fontSize: 12, color: T2 }}>{g.r4 || '--'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function App() {
  var [pool, setPool] = useState('hp')
  var [view, setView] = useState('pool')
  var viewRef = useRef('pool')
  function setViewAndRef(v) { setView(v); viewRef.current = v }
  var [hpPicks, setHpPicks] = useState([])
  var [michPicks, setMichPicks] = useState([])
  var [meitPicks, setMeitPicks] = useState([])
  var [lb, setLb] = useState([])
  var [status, setStatus] = useState('pre')
  var [updated, setUpdated] = useState(null)
  var [ready, setReady] = useState(false)
  var [meitUnlocked, setMeitUnlocked] = useState(false)
  var [meitPwInput, setMeitPwInput] = useState('')
  var [meitPwError, setMeitPwError] = useState(false)
  var savingRef = useRef(false)

  var refreshPicks = useCallback(async function() {
    if (savingRef.current) return
    if (viewRef.current === 'draft') return  // Don't auto-refresh during draft
    var hp = await loadPicks('hp'); setHpPicks(hp)
    var mi = await loadPicks('mich'); setMichPicks(mi)
    var me = await loadPicks('meit'); setMeitPicks(me)
  }, [])

  var forceRefreshPicks = useCallback(async function() {
    var hp = await loadPicks('hp'); setHpPicks(hp)
    var mi = await loadPicks('mich'); setMichPicks(mi)
    var me = await loadPicks('meit'); setMeitPicks(me)
  }, [])

  useEffect(function() { forceRefreshPicks().then(function() { setReady(true) }) }, [forceRefreshPicks])
  useEffect(function() { var iv = setInterval(refreshPicks, 8000); return function() { clearInterval(iv) } }, [refreshPicks])

  var fetchLb = useCallback(async function() {
    try {
      var r = await fetch(ESPN_API); if (!r.ok) return
      var d = await r.json(); var ev = d && d.events && d.events[0]; if (!ev) { setLb([]); return }
      var comp = ev.competitions && ev.competitions[0]
      var st = comp && comp.status && comp.status.type && comp.status.type.state || 'pre'
      setStatus(st)
      var parsed = (comp && comp.competitors || []).map(function(c) {
        var a = c.athlete || {}, ls = c.linescores || []
        var scoreStr = (c.score || 'E').toString()

        // Parse the score string to get toPar
        var toPar = null
        if (scoreStr === 'E') toPar = 0
        else if (scoreStr === 'MC' || scoreStr === 'CUT') toPar = MC_SCORE
        else {
          // Could be "+3", "-4", or raw strokes like "68"
          var num = parseInt(scoreStr)
          if (!isNaN(num)) {
            if (scoreStr.indexOf('+') === 0 || scoreStr.indexOf('-') === 0) {
              // Explicit +/- means it's already to-par
              toPar = num
            } else {
              // Raw number — check if it looks like total strokes (>50) or to-par
              toPar = num > 50 ? num - PAR : num
            }
          }
        }

        var madeCut = scoreStr !== 'MC' && scoreStr !== 'CUT'
        // Also check status for cut
        if (c.status && c.status.type && (c.status.type.name === 'cut' || c.status.type.description === 'Cut')) madeCut = false

        var r1 = null, r2 = null, r3 = null, r4 = null
        var thru = null

        // linescores[N].value = holes through (during round) or some aggregate
        // linescores[N].displayValue = round to-par like "+1", "E", or stroke total "68" when complete
        // Only treat displayValue as a round score if it's a number > 50 (stroke total)
        for (var ri = 0; ri < 4; ri++) {
          if (ls[ri]) {
            var dv = ls[ri].displayValue
            var rv = ls[ri].value
            var roundScore = null

            // Each linescores entry = one round
            // nested linescores = hole-by-hole scores for that round
            // displayValue = round to-par ("-5", "E", "+3")
            // Determine: is this round complete? Count nested hole scores.
            var nestedLs = ls[ri] ? ls[ri].linescores : null
            var holesPlayed = 0
            if (nestedLs && nestedLs.length > 0) {
              for (var h = 0; h < nestedLs.length; h++) {
                if (nestedLs[h].value != null && nestedLs[h].value > 0) holesPlayed++
              }
            }

            if (holesPlayed === 18) {
              // Round complete — calculate stroke total from displayValue to-par
              var rdToPar = 0
              if (dv === 'E') rdToPar = 0
              else if (dv) { var pn = parseInt(dv); if (!isNaN(pn)) rdToPar = pn }
              roundScore = PAR + rdToPar
            } else if (holesPlayed > 0) {
              // Mid-round — store holes through
              if (thru == null) thru = holesPlayed
            }
            // If no nested data but period exists, check if value looks like stroke total
            if (roundScore == null && holesPlayed === 0 && rv != null && rv > 59 && rv < 100) {
              roundScore = rv
            }

            if (ri === 0) r1 = roundScore
            if (ri === 1) r2 = roundScore
            if (ri === 2) r3 = roundScore
            if (ri === 3) r4 = roundScore
          }
        }

        // Tee time
        var teeTime = c.status && c.status.teeTime ? new Date(c.status.teeTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : getTeeTime(a.displayName || '')

        // Thru from status overrides
        if (c.status && c.status.thru != null) thru = c.status.thru

        var pos = c.status && c.status.position && c.status.position.displayName ? c.status.position.displayName : (c.order ? String(c.order) : '')

        return { name: a.displayName || '?', position: pos, toPar: toPar, r1: r1, r2: r2, r3: !madeCut ? null : r3, r4: !madeCut ? null : r4, total: null, madeCut: madeCut, teeTime: teeTime, thru: thru }
      })
      // Post-parse cut detection: if ANY player has R3 score or is mid-R3 (has R1+R2+thru), 
      // then players with R1+R2 but no R3 activity missed the cut
      var anyR3 = parsed.some(function(p) { return p.r3 != null })
      var anyMidR3 = parsed.some(function(p) { return p.r1 != null && p.r2 != null && p.thru != null })
      if (anyR3 || anyMidR3) {
        parsed = parsed.map(function(p) {
          if (p.madeCut && p.r1 != null && p.r2 != null && p.r3 == null && p.thru == null) {
            return Object.assign({}, p, { madeCut: false, toPar: MC_SCORE })
          }
          return p
        })
      }
      parsed.sort(function(a, b) {
        if (a.madeCut && !b.madeCut) return -1
        if (!a.madeCut && b.madeCut) return 1
        if (a.toPar == null && b.toPar == null) return 0
        if (a.toPar == null) return 1
        if (b.toPar == null) return -1
        return a.toPar - b.toPar
      })
      setLb(parsed); setUpdated(new Date())
    } catch (e) { console.error(e) }
  }, [])

  useEffect(function() { fetchLb(); var iv = setInterval(fetchLb, 60000); return function() { clearInterval(iv) } }, [fetchLb])

  var picks = pool === 'hp' ? hpPicks : pool === 'mich' ? michPicks : meitPicks
  var setPicks = pool === 'hp' ? setHpPicks : pool === 'mich' ? setMichPicks : setMeitPicks

  // Password gate for meit pool
  var needsPassword = pool === 'meit' && !meitUnlocked

  function handleMeitUnlock() {
    if (meitPwInput === POOLS.meit.password) {
      setMeitUnlocked(true)
      setMeitPwError(false)
    } else {
      setMeitPwError(true)
    }
  }

  return (
    <>
      <Head>
        <title>Masters Pool 2026</title>
        <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⛳</text></svg>" />
      </Head>
      <div style={{ minHeight: '100vh', background: 'linear-gradient(155deg,' + G + ' 0%,' + GD + ' 35%,#003328 100%)', fontFamily: "Georgia,'Times New Roman',serif", color: TXT }}>
        <style dangerouslySetInnerHTML={{ __html: '@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}*{box-sizing:border-box;margin:0}input::placeholder{color:rgba(0,0,0,.3)}button{font-family:Georgia,serif}button:active{transform:scale(.97)}@media(max-width:768px){.draft-layout{grid-template-columns:1fr!important}.player-list{max-height:180px!important}}' }} />
        <div style={{ background: GD, borderBottom: '3px solid ' + Y, padding: '12px 14px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, maxWidth: 1440, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, background: Y, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: GD, flexShrink: 0 }}>M</div>
              <div>
                <h1 style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Masters Pool 2026</h1>
                <p style={{ color: Y, fontSize: 9, letterSpacing: 1.2, textTransform: 'uppercase' }}>Augusta National · April 9–12</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 2, background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: 2 }}>
                {['hp', 'mich', 'meit'].map(function(k) {
                  return <button key={k} onClick={function() { setPool(k) }} style={{ padding: '5px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: pool === k ? 700 : 500, background: pool === k ? '#fff' : 'transparent', color: pool === k ? GD : 'rgba(255,255,255,.5)', transition: 'all .15s' }}>{POOLS[k].name}</button>
                })}
              </div>
              <div style={{ display: 'flex', gap: 2, background: 'rgba(0,0,0,0.25)', borderRadius: 6, padding: 2 }}>
                {[{ id: 'draft', l: 'Draft' }, { id: 'pool', l: 'Scores' }, { id: 'lb', l: 'Board' }].map(function(t) {
                  return <button key={t.id} onClick={function() { setViewAndRef(t.id) }} style={{ padding: '5px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: view === t.id ? 700 : 500, background: view === t.id ? Y : 'transparent', color: view === t.id ? GD : 'rgba(255,255,255,.5)', transition: 'all .15s' }}>{t.l}</button>
                })}
              </div>
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 12px 40px', maxWidth: 1440, margin: '0 auto' }}>
          {!ready ? <div style={{ textAlign: 'center', padding: 50, color: 'rgba(255,255,255,.35)' }}>Loading...</div> : needsPassword ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', fontFamily: 'Georgia,serif', marginBottom: 16 }}>This pool is private</div>
              <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <input type="password" placeholder="Enter password" value={meitPwInput} onChange={function(e) { setMeitPwInput(e.target.value); setMeitPwError(false) }} onKeyDown={function(e) { if (e.key === 'Enter') handleMeitUnlock() }} style={{ padding: '10px 14px', borderRadius: 8, border: meitPwError ? '2px solid #c0392b' : '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', width: 200, fontFamily: 'Georgia,serif' }} />
                <button onClick={handleMeitUnlock} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: Y, color: GD, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia,serif' }}>Enter</button>
              </div>
              {meitPwError && <div style={{ color: '#c0392b', fontSize: 13, marginTop: 10 }}>Wrong password</div>}
            </div>
          ) : (
            <>
              {view === 'draft' && <DraftBoard poolKey={pool} picks={picks} setPicks={setPicks} refresh={forceRefreshPicks} savingRef={savingRef} />}
              {view === 'pool' && <PoolView poolKey={pool} picks={picks} lb={lb} />}
              {view === 'lb' && <Leaderboard lb={lb} status={status} />}
            </>
          )}
          <div style={{ textAlign: 'center', marginTop: 28, color: 'rgba(255,255,255,.15)', fontSize: 10, borderTop: '1px solid rgba(255,255,255,.05)', paddingTop: 14 }}>
            ESPN scores · Picks sync across all devices{updated ? ' · ' + updated.toLocaleTimeString() : ''}
          </div>
        </div>
      </div>
    </>
  )
}
