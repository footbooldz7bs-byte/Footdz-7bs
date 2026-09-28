const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.API_FOOTBALL_KEY;

app.use(express.static(__dirname));

const leagues = {
  england: { id: 39, name: "الدوري الإنجليزي" },
  spain: { id: 140, name: "الدوري الإسباني" },
  italy: { id: 135, name: "الدوري الإيطالي" },
  germany: { id: 78, name: "الدوري الألماني" },
  france: { id: 61, name: "الدوري الفرنسي" }
};

async function api(pathname, params = {}) {
  if (!API_KEY) throw new Error("API_FOOTBALL_KEY غير موجود");
  const url = new URL("https://v3.football.api-sports.io" + pathname);
  Object.entries(params).forEach(([k,v]) => url.searchParams.set(k, v));
  const r = await fetch(url, { headers: { "x-apisports-key": API_KEY } });
  if (!r.ok) throw new Error(`API error ${r.status}`);
  return r.json();
}

app.get("/api/today", async (req,res) => {
  try {
    const data = await api("/fixtures", { date: new Date().toISOString().slice(0,10), timezone: "Africa/Algiers" });
    res.json(data);
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.get("/api/live", async (req,res) => {
  try { res.json(await api("/fixtures", { live:"all" })); }
  catch(e) { res.status(500).json({error:e.message}); }
});

app.get("/api/standings/:league", async (req,res) => {
  try {
    const l = leagues[req.params.league];
    if (!l) return res.status(404).json({error:"الدوري غير موجود"});
    res.json(await api("/standings", { league:l.id, season:new Date().getFullYear() }));
  } catch(e) { res.status(500).json({error:e.message}); }
});

app.get("/api/leagues", (req,res) => res.json(leagues));

app.listen(PORT, () => console.log(`Foot.DZ 7BS running on port ${PORT}`));
