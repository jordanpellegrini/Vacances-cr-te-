import { useState, useRef, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://mlebhkmmqgareljzrwxr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sZWJoa21tcWdhcmVsanpyd3hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNjI3ODQsImV4cCI6MjA4NzczODc4NH0.cGhVjw_ETpoTCDv40lJMvGIp0jI1qxQ63rJVo65eDdE";
const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" };

const api = {
  async get(t, q = "") { const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`, { headers }); return r.ok ? r.json() : []; },
  async post(t, b) { const r = await fetch(`${SUPABASE_URL}/rest/v1/${t}`, { method: "POST", headers, body: JSON.stringify(b) }); return r.ok ? r.json() : null; },
  async patch(t, id, b) { await fetch(`${SUPABASE_URL}/rest/v1/${t}?id=eq.${id}`, { method: "PATCH", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify(b) }); },
  async del(t, id) { await fetch(`${SUPABASE_URL}/rest/v1/${t}?id=eq.${id}`, { method: "DELETE", headers }); },
  async delWhere(t, q) { await fetch(`${SUPABASE_URL}/rest/v1/${t}?${q}`, { method: "DELETE", headers }); },
  async upsertNote(d, txt) { await fetch(`${SUPABASE_URL}/rest/v1/notes?day_number=eq.${d}`, { method: "PATCH", headers: { ...headers, Prefer: "return=representation" }, body: JSON.stringify({ text: txt, updated_at: new Date().toISOString() }) }); },
};

const DAYS_INFO = [
  { num: 1, label: "Ven 3", full: "Vendredi 3 avril" },
  { num: 2, label: "Sam 4", full: "Samedi 4 avril" },
  { num: 3, label: "Dim 5", full: "Dimanche 5 avril" },
  { num: 4, label: "Lun 6", full: "Lundi 6 avril" },
  { num: 5, label: "Mar 7", full: "Mardi 7 avril" },
  { num: 6, label: "Mer 8", full: "Mercredi 8 avril" },
  { num: 7, label: "Jeu 9", full: "Jeudi 9 avril" },
  { num: 8, label: "Ven 10", full: "Vendredi 10 avril" },
  { num: 9, label: "Sam 11", full: "Samedi 11 avril" },
];
const MEAL_TYPES = [{ key: "petit-dej", label: "Petit-déjeuner" }, { key: "midi", label: "Midi" }, { key: "soir", label: "Soir" }];
const ACT_SLOTS = [{ key: "matin", label: "Matin" }, { key: "apres-midi", label: "Après-midi" }, { key: "soir", label: "Soir" }];
const INFO_CATS = [
  { key: "hotel", label: "🏨 Hébergement", icon: "🏨", placeholder: "Nom hôtel, adresse, n° réservation..." },
  { key: "transport", label: "✈️ Transport", icon: "✈️", placeholder: "Vol, location voiture, horaires..." },
  { key: "contacts", label: "📞 Contacts", icon: "📞", placeholder: "Nom, téléphone, email..." },
  { key: "liens", label: "🔗 Liens utiles", icon: "🔗", placeholder: "URL, site, app..." },
  { key: "general", label: "📌 Général", icon: "📌", placeholder: "Autre info importante..." },
];
const TRICOUNT_URL = "https://tricount.com/tGLrvlEgWVULWwRMMc";
const DAYS = 9;
const COVER_IMG = "data:image/jpeg;base64,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";

export default function App() {
  const [screen, setScreen] = useState("cover"); // cover | app | infos
  const [cur, setCur] = useState(0);
  const [meals, setMeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [notes, setNotes] = useState({});
  const [photos, setPhotos] = useState([]);
  const [infos, setInfos] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [toast, setToast] = useState("");
  const [popup, setPopup] = useState(null);
  const [newIdea, setNewIdea] = useState("");
  const [loading, setLoading] = useState(true);
  const tabsRef = useRef(null);
  const fileRef = useRef(null);
  const noteTimer = useRef(null);
  const infoTimer = useRef({});

  const showToast = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };

  const loadAll = useCallback(async () => {
    try {
      const [m, a, i, n, p, inf] = await Promise.all([
        api.get("meals", "order=created_at.asc"),
        api.get("activities", "order=created_at.asc"),
        api.get("ideas", "order=created_at.desc"),
        api.get("notes", "order=day_number.asc"),
        api.get("photos", "order=created_at.asc"),
        api.get("infos", "order=created_at.asc"),
      ]);
      setMeals(m || []); setActivities(a || []); setIdeas(i || []); setPhotos(p || []); setInfos(inf || []);
      const nm = {}; (n || []).forEach(x => { nm[x.day_number] = x.text || ""; }); setNotes(nm);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { const iv = setInterval(loadAll, 5000); return () => clearInterval(iv); }, [loadAll]);

  const goDay = (d) => {
    if (d < 0 || d >= DAYS) return; setCur(d);
    setTimeout(() => { tabsRef.current?.children[d]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" }); }, 50);
  };

  const touchRef2 = useRef({ x: 0, y: 0 });
  const onTS = (e) => { touchRef2.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTE = (e) => {
    const dx = e.changedTouches[0].clientX - touchRef2.current.x;
    const dy = e.changedTouches[0].clientY - touchRef2.current.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) { dx < 0 ? goDay(cur + 1) : goDay(cur - 1); }
  };

  const dn = cur + 1;
  const dayMeals = meals.filter(m => m.day_number === dn);
  const dayActs = activities.filter(a => a.day_number === dn);
  const dayPhotos = photos.filter(p => p.day_number === dn);
  const dayNote = notes[dn] || "";

  // Meals
  const addMeal = async () => { const r = await api.post("meals", { day_number: dn, meal_type: "petit-dej", text: "" }); if (r) setMeals(p => [...p, ...r]); };
  const updMeal = async (id, f, v) => { setMeals(p => p.map(m => m.id === id ? { ...m, [f === "type" ? "meal_type" : f]: v } : m)); await api.patch("meals", id, { [f === "type" ? "meal_type" : f]: v }); };
  const delMeal = async (id) => { setMeals(p => p.filter(m => m.id !== id)); await api.del("meals", id); };

  // Activities
  const addAct = async () => { const r = await api.post("activities", { day_number: dn, slot: "matin", text: "" }); if (r) setActivities(p => [...p, ...r]); };
  const updAct = async (id, f, v) => { setActivities(p => p.map(a => a.id === id ? { ...a, [f]: v } : a)); await api.patch("activities", id, { [f]: v }); };
  const delAct = async (id) => { setActivities(p => p.filter(a => a.id !== id)); await api.del("activities", id); };

  // Ideas
  const submitIdea = async () => {
    const t = newIdea.trim(); if (!t) return;
    const r = await api.post("ideas", { text: t }); setNewIdea("");
    if (r) { setIdeas(p => [...r, ...p]); setPopup(r[0]); setTimeout(() => setPopup(null), 4000); }
  };
  const delIdea = async (id) => { setIdeas(p => p.filter(i => i.id !== id)); await api.del("ideas", id); };

  // Notes
  const updNote = (v) => { setNotes(p => ({ ...p, [dn]: v })); clearTimeout(noteTimer.current); noteTimer.current = setTimeout(() => api.upsertNote(dn, v), 800); };

  // Photos
  const handlePhoto = (e) => {
    if (!e.target.files) return;
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = async (ev) => { const r = await api.post("photos", { day_number: dn, url: ev.target.result, caption: "" }); if (r) setPhotos(p => [...p, ...r]); };
      reader.readAsDataURL(file);
    }); e.target.value = "";
  };
  const updCaption = async (id, v) => { setPhotos(p => p.map(x => x.id === id ? { ...x, caption: v } : x)); await api.patch("photos", id, { caption: v }); };
  const delPhoto = async (id) => { setPhotos(p => p.filter(x => x.id !== id)); await api.del("photos", id); };

  // Infos
  const addInfo = async (cat) => {
    const r = await api.post("infos", { category: cat, title: "", content: "" });
    if (r) setInfos(p => [...p, ...r]);
  };
  const updInfo = (id, f, v) => {
    setInfos(p => p.map(i => i.id === id ? { ...i, [f]: v } : i));
    clearTimeout(infoTimer.current[id]);
    infoTimer.current[id] = setTimeout(() => api.patch("infos", id, { [f]: v }), 800);
  };
  const delInfo = async (id) => { setInfos(p => p.filter(i => i.id !== id)); await api.del("infos", id); };

  const hasContent = (d) => { const n = d + 1; return meals.some(m => m.day_number === n) || activities.some(a => a.day_number === n) || photos.some(p => p.day_number === n) || (notes[n] || "").trim().length > 0; };

  const clearDay = async () => {
    if (!confirm(`Vider ${DAYS_INFO[cur].full} ?`)) return;
    await Promise.all([api.delWhere("meals", `day_number=eq.${dn}`), api.delWhere("activities", `day_number=eq.${dn}`), api.delWhere("photos", `day_number=eq.${dn}`), api.upsertNote(dn, "")]);
    setMeals(p => p.filter(m => m.day_number !== dn)); setActivities(p => p.filter(a => a.day_number !== dn)); setPhotos(p => p.filter(x => x.day_number !== dn)); setNotes(p => ({ ...p, [dn]: "" }));
    showToast(`${DAYS_INFO[cur].full} vidé`);
  };

  // ═══════ COVER ═══════
  if (screen === "cover") {
    return (
      <div style={{ position: "relative", width: "100%", minHeight: "100dvh", background: "#1a3530", overflow: "auto" }}>
        <img src={COVER_IMG} alt="Elafonissi" style={{ position: "fixed", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4) saturate(1.2)", zIndex: 0 }} />
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", minHeight: "100dvh", padding: "50px 18px 32px" }}>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "inline-block", padding: "5px 16px", border: "1.5px solid rgba(255,255,255,0.28)", borderRadius: 30, fontSize: "0.66rem", fontWeight: 600, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Planning Vacances</div>
            <h1 style={{ fontFamily: "Georgia, serif", fontSize: "clamp(2rem, 9vw, 4.5rem)", color: "#fff", fontWeight: 700, lineHeight: 1.1, textShadow: "0 4px 30px rgba(0,0,0,0.3)" }}>
              Vacances <em style={{ fontStyle: "italic", fontWeight: 400, color: "rgba(255,255,255,0.85)" }}>Crète</em>
            </h1>
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "rgba(255,255,255,0.4)", marginTop: 10, letterSpacing: 5 }}>— 2 0 2 6 —</div>
            <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.35)", marginTop: 8 }}>3 avril → 11 avril · 9 jours</div>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap", justifyContent: "center" }}>
            <CoverBtn onClick={() => setScreen("app")}>📅 Planning</CoverBtn>
            <CoverBtn onClick={() => setScreen("infos")}>ℹ️ Informations</CoverBtn>
            <CoverBtn onClick={() => window.open(TRICOUNT_URL, "_blank")}>💰 Compte</CoverBtn>
          </div>

          {/* Idea Box */}
          <div style={{ width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.1)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16, padding: 16 }}>
            <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#f0c96e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>💡 Boîte à idées</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <input type="text" placeholder="Ajouter une idée..." value={newIdea} onChange={e => setNewIdea(e.target.value)} onKeyDown={e => e.key === "Enter" && submitIdea()} style={{ flex: 1, padding: "11px 14px", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: 10, background: "rgba(255,255,255,0.08)", fontSize: "0.88rem", color: "#fff", outline: "none" }} />
              <button onClick={submitIdea} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "#f0c96e", color: "#1a3530", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer", flexShrink: 0 }}>+</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 260, overflowY: "auto" }}>
              {loading && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.82rem", textAlign: "center", padding: 16 }}>Chargement...</div>}
              {!loading && ideas.length === 0 && <div style={{ color: "rgba(255,255,255,0.25)", fontSize: "0.82rem", fontStyle: "italic", textAlign: "center", padding: 16 }}>Aucune idée pour l'instant...</div>}
              {ideas.map(idea => (
                <div key={idea.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "rgba(255,255,255,0.07)", borderRadius: 10 }}>
                  <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#f0c96e", opacity: 0.55, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#fff", fontSize: "0.86rem" }}>{idea.text}</div>
                    <div style={{ color: "rgba(255,255,255,0.28)", fontSize: "0.66rem", marginTop: 2 }}>{idea.created_at ? new Date(idea.created_at).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : ""}</div>
                  </div>
                  <XSmall onClick={() => delIdea(idea.id)} />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16, fontSize: "0.7rem", color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: loading ? "#f0c96e" : "#5a9e5c" }} />
            {loading ? "Synchronisation..." : "Connecté · Sync auto"}
          </div>
        </div>

        {popup && (
          <div onClick={() => setPopup(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, display: "flex", justifyContent: "center", padding: "20px 16px" }}>
            <div style={{ background: "linear-gradient(135deg, #f7e8b0, #f0c96e)", borderRadius: 14, padding: "16px 20px", maxWidth: 400, width: "100%", boxShadow: "0 8px 32px rgba(0,0,0,0.3)", display: "flex", alignItems: "flex-start", gap: 12, animation: "slideDown 0.4s ease" }}>
              <div style={{ fontSize: "1.5rem" }}>💡</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "#8a6a10", textTransform: "uppercase", letterSpacing: 0.8 }}>Nouvelle idée ajoutée !</div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600, color: "#2a2010", marginTop: 4 }}>{popup.text}</div>
              </div>
              <span style={{ color: "#8a6a10", fontSize: "1.2rem", cursor: "pointer", fontWeight: 700 }}>×</span>
            </div>
          </div>
        )}
        <style>{`@keyframes slideDown { from { transform: translateY(-100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }`}</style>
      </div>
    );
  }

  // ═══════ INFOS PAGE ═══════
  if (screen === "infos") {
    return (
      <div style={{ background: "#f0ece6", minHeight: "100dvh" }}>
        <div style={{ background: "linear-gradient(140deg, #163a36, #1e6058)", padding: "18px 16px 12px", textAlign: "center", position: "relative" }}>
          <button onClick={() => setScreen("cover")} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.7)", width: 34, height: 34, borderRadius: 10, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", color: "#fff", fontWeight: 700 }}>ℹ️ Informations</h2>
          <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.72rem", marginTop: 2 }}>Adresses · Contacts · Liens · Infos pratiques</p>
        </div>

        <div style={{ maxWidth: 720, margin: "0 auto", padding: "16px 14px 32px" }}>
          {INFO_CATS.map(cat => {
            const catInfos = infos.filter(i => i.category === cat.key);
            return (
              <div key={cat.key} style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Georgia, serif", fontSize: "1.05rem", fontWeight: 700 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", background: "rgba(26,122,109,0.1)" }}>{cat.icon}</div>
                    {cat.label}
                  </div>
                  <button onClick={() => addInfo(cat.key)} style={{ padding: "8px 14px", border: "1.5px dashed #ddd8d0", borderRadius: 9, background: "none", fontSize: "0.78rem", fontWeight: 600, color: "#6b7a78", cursor: "pointer" }}>+ Ajouter</button>
                </div>

                {catInfos.length === 0 && (
                  <div style={{ padding: "16px", background: "#fff", borderRadius: 11, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", color: "#bbb", fontSize: "0.84rem", fontStyle: "italic", textAlign: "center" }}>
                    Aucune info ajoutée
                  </div>
                )}

                {catInfos.map(info => (
                  <div key={info.id} style={{ background: "#fff", borderRadius: 11, padding: "12px 14px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <input
                        type="text"
                        placeholder="Titre (ex: Hôtel, Vol aller...)"
                        value={info.title || ""}
                        onChange={e => updInfo(info.id, "title", e.target.value)}
                        style={{ flex: 1, border: "none", background: "transparent", fontSize: "0.92rem", fontWeight: 600, color: "#1a7a6d", outline: "none" }}
                      />
                      <Del onClick={() => delInfo(info.id)} />
                    </div>
                    <textarea
                      placeholder={cat.placeholder}
                      value={info.content || ""}
                      onChange={e => updInfo(info.id, "content", e.target.value)}
                      style={{ width: "100%", minHeight: 50, border: "1px solid #eee8e0", borderRadius: 8, padding: "8px 10px", fontSize: "0.84rem", color: "#1e2a2a", background: "#faf8f5", resize: "vertical", outline: "none", lineHeight: 1.5 }}
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ═══════ APP (Planning) ═══════
  return (
    <div style={{ background: "#f0ece6", minHeight: "100dvh" }} onTouchStart={onTS} onTouchEnd={onTE}>
      <div style={{ background: "linear-gradient(140deg, #163a36, #1e6058)", padding: "18px 16px 12px", textAlign: "center", position: "relative" }}>
        <button onClick={() => setScreen("cover")} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "rgba(255,255,255,0.7)", width: 34, height: 34, borderRadius: 10, cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.2rem", color: "#fff", fontWeight: 700 }}>Vacances Crète 2026</h2>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: "0.72rem", marginTop: 2 }}>3 → 11 avril · Repas · Activités · Photos</p>
      </div>

      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "#f0ece6", borderBottom: "1.5px solid #ddd8d0" }}>
        <div ref={tabsRef} style={{ display: "flex", overflowX: "auto", scrollBehavior: "smooth", WebkitOverflowScrolling: "touch" }}>
          {DAYS_INFO.map((d, i) => (
            <button key={i} onClick={() => goDay(i)} style={{ flexShrink: 0, padding: "10px 14px", border: "none", background: "none", fontSize: "0.78rem", fontWeight: 600, color: cur === i ? "#1a7a6d" : "#6b7a78", cursor: "pointer", borderBottom: cur === i ? "3px solid #1a7a6d" : "3px solid transparent", whiteSpace: "nowrap", minWidth: 60, textAlign: "center", lineHeight: 1.3 }}>
              <div style={{ fontSize: "0.66rem", opacity: 0.7 }}>{d.label.split(" ")[0]}</div>
              <div>{d.label.split(" ")[1]} avr</div>
              {hasContent(i) && <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#1a7a6d", marginTop: 3 }} />}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "14px 14px 90px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0 12px" }}>
          <NavBtn disabled={cur === 0} onClick={() => goDay(cur - 1)}>← {cur > 0 ? DAYS_INFO[cur - 1].label : ""}</NavBtn>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: "1.05rem", fontWeight: 700, color: "#1a7a6d" }}>{DAYS_INFO[cur].full}</div>
            <div style={{ fontSize: "0.68rem", color: "#6b7a78", marginTop: 2 }}>Jour {cur + 1}/9</div>
          </div>
          <NavBtn disabled={cur === DAYS - 1} onClick={() => goDay(cur + 1)}>{cur < DAYS - 1 ? DAYS_INFO[cur + 1].label : ""} →</NavBtn>
        </div>

        <Sec icon="🍽️" title="Repas" bg="rgba(212,122,46,0.1)" onAdd={addMeal}>
          {dayMeals.map(m => (<Card key={m.id}><Sel value={m.meal_type} onChange={v => updMeal(m.id, "type", v)} options={MEAL_TYPES} color="#d47a2e" /><Inp placeholder="Qu'est-ce qu'on mange ?" value={m.text || ""} onChange={v => updMeal(m.id, "text", v)} /><Del onClick={() => delMeal(m.id)} /></Card>))}
        </Sec>

        <Sec icon="📋" title="Activités" bg="rgba(46,120,181,0.1)" onAdd={addAct}>
          {dayActs.map(a => (<Card key={a.id}><Sel value={a.slot} onChange={v => updAct(a.id, "slot", v)} options={ACT_SLOTS} color="#2e78b5" /><Inp placeholder="Activité, visite, RDV..." value={a.text || ""} onChange={v => updAct(a.id, "text", v)} /><Del onClick={() => delAct(a.id)} /></Card>))}
        </Sec>

        <div style={{ marginBottom: 20 }}>
          <SecH icon="📷" title="Photos" bg="rgba(139,106,173,0.1)" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {dayPhotos.map(p => (
              <div key={p.id} style={{ position: "relative", aspectRatio: "1", borderRadius: 11, overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" }}>
                <img src={p.url} alt="" onClick={() => setLightbox(p.url)} style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }} />
                <button onClick={() => delPhoto(p.id)} style={{ position: "absolute", top: 5, right: 5, width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.5)", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.55))", padding: "16px 6px 5px" }}>
                  <input type="text" placeholder="Légende..." value={p.caption || ""} onChange={e => updCaption(p.id, e.target.value)} style={{ width: "100%", border: "none", background: "transparent", fontSize: "0.68rem", color: "#fff", outline: "none" }} />
                </div>
              </div>
            ))}
            <div onClick={() => fileRef.current?.click()} style={{ aspectRatio: "1", border: "2px dashed #ddd8d0", borderRadius: 11, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4, cursor: "pointer", background: "rgba(255,255,255,0.4)" }}>
              <span style={{ fontSize: "1.4rem", opacity: 0.35 }}>📸</span>
              <span style={{ fontSize: "0.68rem", color: "#6b7a78", fontWeight: 500 }}>Ajouter</span>
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handlePhoto} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <SecH icon="📝" title="Notes" bg="rgba(90,158,92,0.1)" />
          <textarea placeholder="Notes, rappels..." value={dayNote} onChange={e => updNote(e.target.value)} style={{ width: "100%", minHeight: 80, border: "1.5px solid #ddd8d0", borderRadius: 11, padding: 12, fontSize: "0.86rem", color: "#1e2a2a", background: "#fff", resize: "vertical", outline: "none" }} />
        </div>
      </div>

      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "rgba(255,255,255,0.92)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderTop: "1px solid #ddd8d0", padding: "10px 12px", display: "flex", justifyContent: "center", gap: 6, zIndex: 80 }}>
        <BBtn primary onClick={() => showToast("✅ Sauvegarde automatique !")}>💾 Auto-save</BBtn>
        <BBtn danger onClick={clearDay}>🗑️ Vider</BBtn>
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <button onClick={() => setLightbox(null)} style={{ position: "absolute", top: 16, right: 16, width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", fontSize: "1.4rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
          <img src={lightbox} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: "95%", maxHeight: "88%", borderRadius: 6 }} />
        </div>
      )}
      {toast && <div style={{ position: "fixed", bottom: 72, left: "50%", transform: "translateX(-50%)", background: "#1e2a2a", color: "#fff", padding: "10px 22px", borderRadius: 10, fontSize: "0.82rem", fontWeight: 500, zIndex: 200, whiteSpace: "nowrap" }}>{toast}</div>}
    </div>
  );
}

// ─── Components ───
function CoverBtn({ children, onClick }) { return <button onClick={onClick} style={{ padding: "13px 24px", background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 50, color: "#fff", fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}>{children}</button>; }
function SecH({ icon, title, bg, onAdd }) {
  return (<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "Georgia, serif", fontSize: "1.08rem", fontWeight: 700 }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.95rem", background: bg }}>{icon}</div>{title}
    </div>
    {onAdd && <button onClick={onAdd} style={{ padding: "8px 14px", border: "1.5px dashed #ddd8d0", borderRadius: 9, background: "none", fontSize: "0.78rem", fontWeight: 600, color: "#6b7a78", cursor: "pointer" }}>+ Ajouter</button>}
  </div>);
}
function Sec({ icon, title, bg, onAdd, children }) { return <div style={{ marginBottom: 20 }}><SecH icon={icon} title={title} bg={bg} onAdd={onAdd} /><div>{children}</div></div>; }
function Card({ children }) { return <div style={{ background: "#fff", borderRadius: 11, padding: "10px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>{children}</div>; }
function Sel({ value, onChange, options, color }) { return <select value={value} onChange={e => onChange(e.target.value)} style={{ padding: "6px 22px 6px 8px", border: "1.5px solid #ddd8d0", borderRadius: 7, fontSize: "0.72rem", fontWeight: 700, textTransform: "uppercase", background: "#fff", color, minWidth: 78, flexShrink: 0, outline: "none", cursor: "pointer", WebkitAppearance: "none", appearance: "none", backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6' fill='%23999'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center" }}>{options.map(o => <option key={o.key} value={o.key}>{o.label}</option>)}</select>; }
function Inp({ placeholder, value, onChange }) { return <input type="text" placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent", fontSize: "0.88rem", color: "#1e2a2a", outline: "none", padding: "4px 0" }} />; }
function Del({ onClick }) { return <button onClick={onClick} style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: "transparent", color: "#ccc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", flexShrink: 0 }}>×</button>; }
function XSmall({ onClick }) { return <button onClick={onClick} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "transparent", color: "rgba(255,255,255,0.25)", cursor: "pointer", fontSize: "1.1rem", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>; }
function NavBtn({ children, disabled, onClick }) { return <button disabled={disabled} onClick={onClick} style={{ padding: "8px 12px", border: "none", borderRadius: 8, background: "#fff", fontSize: "0.74rem", fontWeight: 600, color: "#1a7a6d", cursor: "pointer", opacity: disabled ? 0.25 : 1, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>{children}</button>; }
function BBtn({ children, onClick, primary, danger }) { return <button onClick={onClick} style={{ padding: "11px 14px", borderRadius: 10, border: primary ? "none" : "1.5px solid #ddd8d0", background: primary ? "#1a7a6d" : "#fff", color: danger ? "#c0392b" : primary ? "#fff" : "#1e2a2a", fontSize: "0.78rem", fontWeight: 600, cursor: "pointer", flex: 1, maxWidth: 130, textAlign: "center" }}>{children}</button>; }
