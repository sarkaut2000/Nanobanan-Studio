import { useState } from "react";

const STYLES = ["Photorealistisch","Cinematic","Digital Art","Oil Painting","Watercolor","Cyberpunk","Fantasy","Anime","Noir","Surrealist","Minimalist","Comic Book"];
const MOODS  = ["Episch","Dramatisch","Mystisch","Romantisch","Dunkel","Verspielt","Spannend","Melancholisch","Triumphierend","Bedrohlich","Friedlich","Chaotisch"];
const LIGHTING = ["Golden Hour","Neon Lights","Mondlicht","Studio","Natürliches Tageslicht","Dramatische Schatten","Blaue Stunde","Kerzenlicht","Gegenlicht"];
const CAMERA = [
  // Einstellungsgrößen
  "Extreme Close-Up","Close-Up","Medium Close-Up","Medium Shot","Amerikanische Einstellung","Medium Long Shot","Long Shot","Extreme Long Shot","Establishing Shot",
  // Kameraperspektiven
  "Augenhöhe","Vogelperspektive","Froschperspektive","Draufsicht (Top Down)","Low Angle","High Angle","Dutch Angle","Over-the-Shoulder","POV","Schulterperspektive",
  // Objektive & Brennweiten
  "8mm Fisheye","14mm Ultra-Weitwinkel","24mm Weitwinkel","35mm Normal","50mm Standard","85mm Portrait","135mm Tele","200mm Tele","400mm Super-Tele","Makro","Tilt-Shift",
  // Bildformat & Komposition
  "Weitwinkel","Nahaufnahme","Panorama","Widescreen 2.39:1","16:9","4:3","Quadratisch 1:1","Vertikal 9:16",
  // Tiefenschärfe & Fokus
  "Geringe Tiefenschärfe","Große Tiefenschärfe","Bokeh","Selektiver Fokus","Schärfenverlauf","Rack Focus",
  // Kamerabewegungen
  "Statisch","Tracking Shot","Dolly Zoom","Handkamera","Steadicam","Aerial Drohne","Kranshot","Zoom In","Zoom Out",
  // Belichtungstechniken
  "Langzeitbelichtung","Slow Motion","High Speed","Doppelbelichtung",
  // Stilistische Effekte
  "Silhouette","Spiegelbild","Gegenlicht (Backlight)","Lens Flare","Vignette","Unschärfe"
];
const COLOR_GRADES = ["Warm & Satt","Kalt & Blau","Entsättigt","High Contrast","Pastell","Monochrom","Vintage","Teal & Orange"];

const TABS = { SINGLE: "single", STORY: "story" };

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || "";

async function callClaude(system, user, maxTokens = 1500) {
  if (!API_KEY) throw new Error("Kein API-Key konfiguriert. Bitte VITE_ANTHROPIC_API_KEY in .env setzen.");
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API Fehler ${res.status}`);
  }
  const data = await res.json();
  return data.content?.map(b => b.text || "").join("") || "";
}

function Tag({ label, selected, onClick, color = "purple" }) {
  const palettes = {
    purple: ["rgba(124,58,237,0.18)","linear-gradient(135deg,#7c3aed,#a855f7)","rgba(192,132,252,0.25)","#a855f7","#c084fc","#fff"],
    pink:   ["rgba(190,24,93,0.15)","linear-gradient(135deg,#be185d,#db2777)","rgba(236,72,153,0.25)","#db2777","#f9a8d4","#fff"],
    cyan:   ["rgba(6,182,212,0.12)","linear-gradient(135deg,#0891b2,#06b6d4)","rgba(6,182,212,0.25)","#06b6d4","#67e8f9","#fff"],
    amber:  ["rgba(180,83,9,0.15)","linear-gradient(135deg,#b45309,#d97706)","rgba(251,191,36,0.25)","#d97706","#fcd34d","#fff"],
    green:  ["rgba(5,150,105,0.15)","linear-gradient(135deg,#065f46,#059669)","rgba(52,211,153,0.25)","#059669","#6ee7b7","#fff"],
  };
  const [bg,bgSel,bdr,bdrSel,text,textSel] = palettes[color] || palettes.purple;
  return (
    <span onClick={onClick} style={{
      padding:"5px 13px",borderRadius:"20px",fontSize:"12px",cursor:"pointer",
      userSelect:"none",transition:"all 0.2s",
      background:selected?bgSel:bg, border:`1px solid ${selected?bdrSel:bdr}`,
      color:selected?textSel:text, boxShadow:selected?`0 2px 12px ${bdrSel}55`:"none"
    }}>{label}</span>
  );
}

function Spinner() {
  return <div style={{width:"18px",height:"18px",border:"2px solid rgba(255,255,255,0.25)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}} />;
}

function ProgressBar({ value, color="#a855f7" }) {
  return (
    <div style={{background:"rgba(0,0,0,0.35)",borderRadius:"6px",height:"5px",overflow:"hidden"}}>
      <div style={{width:`${value}%`,height:"100%",background:color,borderRadius:"6px",transition:"width 0.35s ease",boxShadow:`0 0 8px ${color}88`}} />
    </div>
  );
}

function Card({ children, accent="purple" }) {
  const borders = {purple:"rgba(192,132,252,0.25)",cyan:"rgba(6,182,212,0.22)",pink:"rgba(236,72,153,0.28)"};
  const glows   = {purple:"rgba(124,58,237,0.14)",cyan:"rgba(6,182,212,0.1)",pink:"rgba(190,24,93,0.18)"};
  return (
    <div style={{
      background:"linear-gradient(135deg,rgba(10,0,28,0.85),rgba(5,0,15,0.9))",
      border:`1px solid ${borders[accent]||borders.purple}`,
      borderRadius:"20px",padding:"34px",
      boxShadow:`0 20px 60px ${glows[accent]||glows.purple}`
    }}>{children}</div>
  );
}

// ── SCENE CARD ──────────────────────────────────────────────────────────────
function SceneCard({ scene, idx, onGeneratePrompt, onEditPrompt }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handlePrompt() {
    setLoading(true);
    setOpen(true);
    await onGeneratePrompt(idx);
    setLoading(false);
  }

  return (
    <div style={{
      background:"rgba(8,0,22,0.8)",
      border:`1px solid ${scene.prompt?"rgba(236,72,153,0.38)":"rgba(124,58,237,0.22)"}`,
      borderRadius:"16px",overflow:"hidden",transition:"border 0.3s",
      boxShadow:scene.prompt?"0 4px 24px rgba(236,72,153,0.1)":"none"
    }}>
      <div onClick={()=>setOpen(o=>!o)} style={{padding:"18px 22px",cursor:"pointer",display:"flex",alignItems:"flex-start",gap:"14px"}}>
        <div style={{
          flexShrink:0,width:"34px",height:"34px",borderRadius:"50%",
          background:scene.prompt?"linear-gradient(135deg,#be185d,#db2777)":"linear-gradient(135deg,#7c3aed,#a855f7)",
          display:"flex",alignItems:"center",justifyContent:"center",
          fontSize:"13px",fontWeight:"800",color:"#fff",boxShadow:`0 2px 10px ${scene.prompt?"rgba(219,39,119,0.4)":"rgba(168,85,247,0.4)"}`
        }}>{idx+1}</div>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <p style={{color:scene.prompt?"#f9a8d4":"#e879f9",fontWeight:"700",fontSize:"14px",margin:0}}>{scene.title}</p>
            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
              {scene.prompt && <span style={{fontSize:"11px",color:"#6ee7b7",background:"rgba(5,150,105,0.2)",padding:"2px 8px",borderRadius:"10px",border:"1px solid rgba(52,211,153,0.3)"}}>✓ Prompt bereit</span>}
              <span style={{color:"#6b7280",fontSize:"16px"}}>{open?"▲":"▼"}</span>
            </div>
          </div>
          <p style={{color:"#9ca3af",fontSize:"12px",marginTop:"4px",lineHeight:"1.5",margin:"4px 0 0"}}>
            {scene.description.slice(0,100)}{scene.description.length>100?"…":""}
          </p>
        </div>
      </div>

      {open && (
        <div style={{padding:"0 22px 22px",borderTop:"1px solid rgba(124,58,237,0.12)"}}>
          <p style={{color:"#d1d5db",fontSize:"14px",lineHeight:"1.8",marginTop:"16px"}}>{scene.description}</p>

          {scene.prompt ? (
            <div style={{marginTop:"16px"}}>
              <p style={{color:"#6b7280",fontSize:"11px",letterSpacing:"2px",marginBottom:"8px"}}>NANOBANANA PROMPT</p>
              <textarea
                value={scene.prompt}
                onChange={e=>onEditPrompt(idx,e.target.value)}
                style={{
                  width:"100%",minHeight:"90px",background:"rgba(0,0,0,0.45)",
                  border:"1px solid rgba(236,72,153,0.3)",borderRadius:"10px",
                  color:"#fce7f3",fontSize:"12px",padding:"12px 14px",
                  fontFamily:"monospace",resize:"vertical",lineHeight:"1.7",boxSizing:"border-box"
                }}
              />
              <div style={{display:"flex",gap:"8px",marginTop:"10px"}}>
                <button onClick={handlePrompt} style={{padding:"7px 16px",fontSize:"12px",background:"rgba(190,24,93,0.18)",border:"1px solid rgba(219,39,119,0.35)",borderRadius:"8px",color:"#f9a8d4",cursor:"pointer"}}>🔄 Neu generieren</button>
                <button onClick={()=>{navigator.clipboard.writeText(scene.prompt)}} style={{padding:"7px 16px",fontSize:"12px",background:"rgba(5,150,105,0.15)",border:"1px solid rgba(52,211,153,0.3)",borderRadius:"8px",color:"#6ee7b7",cursor:"pointer"}}>📋 Kopieren</button>
              </div>
            </div>
          ) : (
            <button onClick={handlePrompt} disabled={loading} style={{
              marginTop:"16px",padding:"11px 22px",
              background:loading?"rgba(80,80,80,0.2)":"linear-gradient(135deg,#7c3aed,#a855f7)",
              border:"none",borderRadius:"10px",color:"#fff",fontSize:"13px",fontWeight:"700",
              cursor:loading?"not-allowed":"pointer",
              display:"flex",alignItems:"center",gap:"8px",
              boxShadow:loading?"none":"0 4px 18px rgba(168,85,247,0.35)"
            }}>
              {loading?<><Spinner/>Generiere…</>:"✨ Prompt für diese Szene generieren"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── STORY MODE ───────────────────────────────────────────────────────────────
function StoryMode() {
  const [storyPhase, setStoryPhase] = useState("input");
  const [script, setScript] = useState("");
  const [style, setStyle] = useState("");
  const [mood, setMood] = useState("");
  const [lighting, setLighting] = useState("");
  const [camera, setCamera] = useState("");
  const [colorGrade, setColorGrade] = useState("");
  const [sceneCount, setSceneCount] = useState(5);
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [allLoading, setAllLoading] = useState(false);
  const [error, setError] = useState("");

  async function analyzeScript() {
    if (!script.trim()) return;
    setLoading(true); setError(""); setProgress(10);
    setStatusMsg("Drehbuch wird analysiert…");
    try {
      setProgress(35); setStatusMsg("Szenen werden identifiziert…");
      const sys = `Du bist ein Experte für visuelle Storyboards. Analysiere das Drehbuch und erstelle exakt ${sceneCount} visuelle Szenen.
Antworte NUR mit validem JSON ohne Markdown-Backticks:
{"scenes":[{"title":"Kurzer Titel","description":"Detaillierte visuelle Beschreibung (2-3 Sätze): was ist zu sehen, Charaktere, Umgebung, Lichtstimmung, Aktion"}]}`;
      const raw = await callClaude(sys,
        `Drehbuch:\n${script}\nGlobaler Stil: ${style||"Cinematic"}, Stimmung: ${mood||"Dramatisch"}`, 2500);
      setProgress(80); setStatusMsg("Szenen werden aufgebaut…");
      const clean = raw.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      setScenes(parsed.scenes.map(s=>({...s,prompt:""})));
      setProgress(100);
      setTimeout(()=>{setStoryPhase("scenes");setLoading(false);},400);
    } catch(e) {
      setError("Fehler beim Analysieren. JSON-Parsing fehlgeschlagen – bitte erneut versuchen.");
      setLoading(false);
    }
  }

  async function generateScenePrompt(idx) {
    const scene = scenes[idx];
    const sys = `Du bist ein NanoBanana-Prompt-Experte. Erstelle einen detaillierten englischen Bild-Prompt. Antworte NUR mit dem Prompt-Text.`;
    const user = `Szene ${idx+1}: ${scene.title}\n${scene.description}\nStil:${style||"Cinematic"}, Mood:${mood||"Dramatisch"}, Light:${lighting||"Golden Hour"}, Cam:${camera||"Weitwinkel"}, Color:${colorGrade||"High Contrast"}`;
    const p = await callClaude(sys, user, 600);
    setScenes(prev=>prev.map((s,i)=>i===idx?{...s,prompt:p.trim()}:s));
  }

  function editPrompt(idx,val) {
    setScenes(prev=>prev.map((s,i)=>i===idx?{...s,prompt:val}:s));
  }

  async function generateAllPrompts() {
    setAllLoading(true);
    for(let i=0;i<scenes.length;i++) { await generateScenePrompt(i); }
    setAllLoading(false);
  }

  const promptCount = scenes.filter(s=>s.prompt).length;

  if (storyPhase === "input") return (
    <Card accent="cyan">
      <h2 style={{color:"#67e8f9",fontSize:"22px",fontWeight:"800",margin:"0 0 6px"}}>🎬 Drehbuch eingeben</h2>
      <p style={{color:"#9ca3af",fontSize:"13px",marginBottom:"26px",lineHeight:"1.7"}}>
        Füge dein komplettes Drehbuch ein. Die KI analysiert es, extrahiert die Schlüsselszenen und erstellt für jede Szene eine visuelle Beschreibung.
      </p>

      <textarea value={script} onChange={e=>setScript(e.target.value)}
        placeholder={"INT. KAFFEHAUS – TAG\n\nMARIA (30) sitzt allein an einem Tisch am Fenster. Draußen regnet es.\n\nEXT. STRASSE – NACHT\n\nDer Regen prasselt auf das Kopfsteinpflaster. LEON (35) läuft hastig durch die leere Gasse..."}
        style={{
          width:"100%",minHeight:"200px",background:"rgba(0,5,22,0.85)",
          border:"1px solid rgba(6,182,212,0.28)",borderRadius:"14px",
          color:"#e0f7fa",fontSize:"14px",padding:"18px",resize:"vertical",
          lineHeight:"1.8",boxSizing:"border-box",fontFamily:"monospace"
        }}
      />

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"22px",marginTop:"26px"}}>
        {[
          {label:"VISUELLER STIL",items:STYLES,val:style,set:setStyle,color:"cyan"},
          {label:"STIMMUNG",items:MOODS,val:mood,set:setMood,color:"pink"},
          {label:"BELEUCHTUNG",items:LIGHTING,val:lighting,set:setLighting,color:"amber"},
          {label:"KAMERA",items:CAMERA,val:camera,set:setCamera,color:"purple"},
        ].map(({label,items,val,set,color})=>(
          <div key={label}>
            <p style={{color:"#a78bfa",fontSize:"11px",letterSpacing:"2px",marginBottom:"9px"}}>{label}</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
              {items.map(it=><Tag key={it} label={it} selected={val===it} onClick={()=>set(val===it?"":it)} color={color} />)}
            </div>
          </div>
        ))}
      </div>

      <div style={{marginTop:"18px"}}>
        <p style={{color:"#86efac",fontSize:"11px",letterSpacing:"2px",marginBottom:"9px"}}>FARBGEBUNG</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
          {COLOR_GRADES.map(c=><Tag key={c} label={c} selected={colorGrade===c} onClick={()=>setColorGrade(colorGrade===c?"":c)} color="green" />)}
        </div>
      </div>

      <div style={{marginTop:"22px",display:"flex",alignItems:"center",gap:"14px"}}>
        <p style={{color:"#9ca3af",fontSize:"13px",margin:0,whiteSpace:"nowrap"}}>Anzahl Szenen:</p>
        <input
          type="number"
          min="1"
          value={sceneCount}
          onChange={e => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v >= 1) setSceneCount(v);
            else if (e.target.value === "") setSceneCount("");
          }}
          onBlur={e => { if (!e.target.value || parseInt(e.target.value) < 1) setSceneCount(1); }}
          style={{
            width:"90px", padding:"9px 14px", borderRadius:"12px",
            background:"rgba(6,182,212,0.1)", border:"1px solid rgba(6,182,212,0.35)",
            color:"#67e8f9", fontSize:"16px", fontWeight:"700", textAlign:"center",
            outline:"none", fontFamily:"inherit"
          }}
        />
        <p style={{color:"#4b6a72",fontSize:"12px",margin:0}}>beliebige Anzahl möglich</p>
      </div>

      {error && <p style={{color:"#fca5a5",fontSize:"13px",marginTop:"14px"}}>⚠️ {error}</p>}

      {loading && (
        <div style={{marginTop:"18px"}}>
          <ProgressBar value={progress} color="#06b6d4" />
          <p style={{color:"#67e8f9",fontSize:"12px",marginTop:"8px",textAlign:"center"}}>{statusMsg}</p>
        </div>
      )}

      <button onClick={analyzeScript} disabled={!script.trim()||loading} style={{
        width:"100%",marginTop:"26px",padding:"16px",
        background:script.trim()&&!loading?"linear-gradient(135deg,#0891b2,#06b6d4,#22d3ee)":"rgba(80,80,80,0.2)",
        border:"none",borderRadius:"13px",color:"#fff",fontSize:"16px",fontWeight:"800",
        cursor:script.trim()&&!loading?"pointer":"not-allowed",
        boxShadow:script.trim()&&!loading?"0 8px 28px rgba(6,182,212,0.35)":"none",
        display:"flex",alignItems:"center",justifyContent:"center",gap:"10px",transition:"all 0.3s"
      }}>
        {loading?<><Spinner/>Analysiere Drehbuch…</>:"🎬 Drehbuch analysieren & Szenen erstellen"}
      </button>
    </Card>
  );

  // Scenes view
  return (
    <div>
      <div style={{
        background:"linear-gradient(135deg,rgba(6,182,212,0.09),rgba(124,58,237,0.07))",
        border:"1px solid rgba(6,182,212,0.2)",borderRadius:"16px",
        padding:"20px 24px",marginBottom:"24px",
        display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"
      }}>
        <div>
          <h2 style={{color:"#67e8f9",fontSize:"20px",fontWeight:"800",margin:0}}>📽️ {scenes.length} Szenen erkannt</h2>
          <p style={{color:"#9ca3af",fontSize:"13px",margin:"4px 0 0"}}>
            {promptCount} von {scenes.length} Prompts generiert
            {promptCount>0&&<span style={{color:"#6ee7b7",marginLeft:"8px"}}>({Math.round(promptCount/scenes.length*100)}%)</span>}
          </p>
        </div>
        <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
          <button onClick={()=>{setStoryPhase("input");setScenes([]);}} style={{padding:"10px 16px",background:"transparent",border:"1px solid rgba(6,182,212,0.3)",borderRadius:"10px",color:"#67e8f9",fontSize:"13px",cursor:"pointer"}}>← Zurück</button>
          <button onClick={generateAllPrompts} disabled={allLoading} style={{
            padding:"10px 18px",
            background:allLoading?"rgba(80,80,80,0.2)":"linear-gradient(135deg,#7c3aed,#a855f7)",
            border:"none",borderRadius:"10px",color:"#fff",fontSize:"13px",fontWeight:"700",
            cursor:allLoading?"not-allowed":"pointer",
            display:"flex",alignItems:"center",gap:"7px",
            boxShadow:allLoading?"none":"0 4px 18px rgba(168,85,247,0.35)"
          }}>
            {allLoading?<><Spinner/>Generiere alle…</>:"✨ Alle Prompts auf einmal"}
          </button>
        </div>
      </div>

      {promptCount>0 && (
        <div style={{marginBottom:"20px"}}>
          <ProgressBar value={promptCount/scenes.length*100} color="#a855f7" />
          <p style={{color:"#a78bfa",fontSize:"11px",marginTop:"5px",textAlign:"right"}}>{promptCount}/{scenes.length} Prompts fertig</p>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
        {scenes.map((scene,idx)=>(
          <SceneCard key={idx} scene={scene} idx={idx} onGeneratePrompt={generateScenePrompt} onEditPrompt={editPrompt} />
        ))}
      </div>

      {promptCount===scenes.length && (
        <div style={{marginTop:"28px",padding:"24px",background:"linear-gradient(135deg,rgba(5,150,105,0.12),rgba(6,182,212,0.06))",border:"1px solid rgba(52,211,153,0.3)",borderRadius:"16px",textAlign:"center"}}>
          <div style={{fontSize:"38px",marginBottom:"10px"}}>🎉</div>
          <p style={{color:"#6ee7b7",fontSize:"17px",fontWeight:"700",margin:"0 0 6px"}}>Alle Prompts sind bereit!</p>
          <p style={{color:"#9ca3af",fontSize:"13px",margin:0}}>Kopiere die Prompts für jede Szene und starte die Bildgenerierung in NanoBanana.</p>
        </div>
      )}
    </div>
  );
}

// ── SINGLE MODE ──────────────────────────────────────────────────────────────
function SingleMode() {
  const [phase, setPhase] = useState("idea");
  const [idea, setIdea] = useState("");
  const [style, setStyle] = useState("");
  const [mood, setMood] = useState("");
  const [lighting, setLighting] = useState("");
  const [camera, setCamera] = useState("");
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const SINGLE_STEPS = [
    {id:"idea",icon:"💡",label:"Idee"},
    {id:"prompt",icon:"✨",label:"Prompt"},
    {id:"image",icon:"🖼️",label:"Bild"},
    {id:"video",icon:"🎬",label:"Video"},
  ];
  const stepIdx = SINGLE_STEPS.findIndex(s=>s.id===phase);

  async function doGeneratePrompt() {
    setLoading(true); setError("");
    try {
      const sys = `Du bist ein NanoBanana-Prompt-Experte. Erstelle einen detaillierten englischen Bild-Prompt. Antworte NUR mit dem Prompt-Text.`;
      const user = `Idee: ${idea}${style?`, Stil: ${style}`:""}${mood?`, Stimmung: ${mood}`:""}${lighting?`, Licht: ${lighting}`:""}${camera?`, Kamera: ${camera}`:""}`;
      const p = await callClaude(sys, user, 800);
      setPrompt(p.trim()); setPhase("prompt");
    } catch { setError("Fehler beim Generieren."); }
    setLoading(false);
  }

  async function doGenerateImage() {
    setLoading(true);
    setImageUrl(`https://picsum.photos/seed/${Date.now()}/768/512`);
    await new Promise(r=>setTimeout(r,900));
    setPhase("image"); setLoading(false);
  }

  async function doGenerateVideo() {
    setLoading(true); setVideoProgress(0);
    const iv = setInterval(()=>setVideoProgress(p=>p>=92?(clearInterval(iv),92):p+Math.random()*8),400);
    await new Promise(r=>setTimeout(r,5000));
    clearInterval(iv); setVideoProgress(100);
    setPhase("video"); setLoading(false);
  }

  return (
    <div>
      {/* Stepper */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",marginBottom:"30px"}}>
        {SINGLE_STEPS.map((s,i)=>{
          const done=stepIdx>i, active=stepIdx===i;
          return (
            <div key={s.id} style={{display:"flex",alignItems:"center"}}>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"5px",opacity:done||active?1:0.28}}>
                <div style={{
                  width:"38px",height:"38px",borderRadius:"50%",
                  background:done?"linear-gradient(135deg,#7c3aed,#a855f7)":active?"linear-gradient(135deg,#9333ea,#c084fc)":"#150025",
                  border:`2px solid ${active?"#c084fc":done?"#7c3aed":"#3b0764"}`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:"16px",boxShadow:active?"0 0 18px #c084fc44":"none",transition:"all 0.3s"
                }}>{done?"✓":s.icon}</div>
                <span style={{fontSize:"10px",color:active?"#e879f9":"#6b7280",letterSpacing:"1px"}}>{s.label}</span>
              </div>
              {i<3&&<div style={{width:"48px",height:"2px",margin:"0 3px 20px",background:done?"linear-gradient(90deg,#7c3aed,#a855f7)":"#150025",transition:"all 0.3s"}} />}
            </div>
          );
        })}
      </div>

      {/* IDEA */}
      {phase==="idea" && (
        <Card accent="purple">
          <h2 style={{color:"#e879f9",fontSize:"21px",fontWeight:"700",margin:"0 0 6px"}}>💡 Deine Bildidee</h2>
          <p style={{color:"#9ca3af",fontSize:"13px",marginBottom:"22px"}}>Beschreibe deine Vorstellung — die KI optimiert sie für NanoBanana.</p>
          <textarea value={idea} onChange={e=>setIdea(e.target.value)}
            placeholder="z.B. Ein Drache sitzt auf einem Bergkamm bei Sonnenuntergang, episch und majestätisch…"
            style={{width:"100%",minHeight:"110px",background:"rgba(0,0,0,0.5)",border:"1px solid rgba(192,132,252,0.3)",borderRadius:"12px",color:"#e8d5ff",fontSize:"14px",padding:"14px",resize:"vertical",lineHeight:"1.7",boxSizing:"border-box",fontFamily:"inherit"}}
          />
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px",marginTop:"20px"}}>
            {[
              {label:"STIL",items:STYLES,val:style,set:setStyle,color:"purple"},
              {label:"STIMMUNG",items:MOODS,val:mood,set:setMood,color:"pink"},
              {label:"BELEUCHTUNG",items:LIGHTING,val:lighting,set:setLighting,color:"amber"},
              {label:"KAMERA",items:CAMERA,val:camera,set:setCamera,color:"cyan"},
            ].map(({label,items,val,set,color})=>(
              <div key={label}>
                <p style={{color:"#a78bfa",fontSize:"11px",letterSpacing:"2px",marginBottom:"8px"}}>{label}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
                  {items.map(it=><Tag key={it} label={it} selected={val===it} onClick={()=>set(val===it?"":it)} color={color} />)}
                </div>
              </div>
            ))}
          </div>
          {error&&<p style={{color:"#fca5a5",fontSize:"13px",marginTop:"12px"}}>⚠️ {error}</p>}
          <button onClick={doGeneratePrompt} disabled={!idea.trim()||loading} style={{
            width:"100%",marginTop:"26px",padding:"15px",
            background:idea.trim()&&!loading?"linear-gradient(135deg,#7c3aed,#a855f7,#c084fc)":"rgba(80,80,80,0.2)",
            border:"none",borderRadius:"12px",color:"#fff",fontSize:"15px",fontWeight:"700",
            cursor:idea.trim()&&!loading?"pointer":"not-allowed",
            boxShadow:idea.trim()&&!loading?"0 8px 26px rgba(168,85,247,0.38)":"none",
            display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",transition:"all 0.3s"
          }}>
            {loading?<><Spinner/>Generiere…</>:"✨ Prompt generieren"}
          </button>
        </Card>
      )}

      {/* PROMPT */}
      {phase==="prompt" && (
        <Card accent="purple">
          <h2 style={{color:"#e879f9",fontSize:"21px",fontWeight:"700",margin:"0 0 6px"}}>✨ NanoBanana Prompt</h2>
          <p style={{color:"#9ca3af",fontSize:"13px",marginBottom:"22px"}}>Bearbeite den Prompt nach Belieben, dann generiere dein Bild.</p>
          <div style={{position:"relative"}}>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
              style={{width:"100%",minHeight:"160px",background:"rgba(0,0,0,0.55)",border:"1px solid rgba(192,132,252,0.38)",borderRadius:"12px",color:"#f0e6ff",fontSize:"13px",padding:"16px 14px",resize:"vertical",lineHeight:"1.8",boxSizing:"border-box",fontFamily:"monospace"}}
            />
            <button onClick={()=>{navigator.clipboard.writeText(prompt);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{position:"absolute",top:"10px",right:"10px",padding:"5px 12px",background:copied?"rgba(34,197,94,0.3)":"rgba(124,58,237,0.4)",border:`1px solid ${copied?"#22c55e":"#7c3aed"}`,borderRadius:"7px",color:copied?"#86efac":"#c084fc",fontSize:"11px",cursor:"pointer"}}>
              {copied?"✓ Kopiert!":"📋 Kopieren"}
            </button>
          </div>
          <div style={{display:"flex",gap:"9px",marginTop:"16px"}}>
            <button onClick={()=>{setPhase("idea");setPrompt("");}} style={{flex:1,padding:"12px",background:"transparent",border:"1px solid rgba(192,132,252,0.28)",borderRadius:"11px",color:"#a78bfa",fontSize:"13px",cursor:"pointer"}}>← Zurück</button>
            <button onClick={doGeneratePrompt} style={{flex:1,padding:"12px",background:"rgba(124,58,237,0.18)",border:"1px solid rgba(168,85,247,0.32)",borderRadius:"11px",color:"#c084fc",fontSize:"13px",cursor:"pointer"}}>🔄 Neu</button>
            <button onClick={doGenerateImage} disabled={loading} style={{flex:2,padding:"12px",background:loading?"rgba(80,80,80,0.2)":"linear-gradient(135deg,#7c3aed,#a855f7)",border:"none",borderRadius:"11px",color:"#fff",fontSize:"14px",fontWeight:"700",cursor:"pointer",boxShadow:"0 6px 20px rgba(168,85,247,0.38)",display:"flex",alignItems:"center",justifyContent:"center",gap:"7px"}}>
              {loading?<><Spinner/>Generiere…</>:"🖼️ Bild generieren"}
            </button>
          </div>
        </Card>
      )}

      {/* IMAGE */}
      {phase==="image" && (
        <Card accent={loading?"pink":"purple"}>
          <h2 style={{color:"#e879f9",fontSize:"21px",fontWeight:"700",margin:"0 0 6px"}}>🖼️ Dein Bild</h2>
          <p style={{color:"#9ca3af",fontSize:"13px",marginBottom:"20px"}}>Zufrieden? Wandle es in ein Video um!</p>
          {imageUrl&&<div style={{borderRadius:"14px",overflow:"hidden",marginBottom:"20px",boxShadow:"0 16px 50px rgba(168,85,247,0.25)",border:"1px solid rgba(192,132,252,0.22)"}}>
            <img src={imageUrl} alt="Generated" style={{width:"100%",display:"block",maxHeight:"400px",objectFit:"cover"}} />
          </div>}
          <div style={{display:"flex",gap:"9px"}}>
            <button onClick={()=>setPhase("prompt")} style={{flex:1,padding:"12px",background:"transparent",border:"1px solid rgba(192,132,252,0.28)",borderRadius:"11px",color:"#a78bfa",fontSize:"13px",cursor:"pointer"}}>← Prompt</button>
            <button onClick={doGenerateImage} style={{flex:1,padding:"12px",background:"rgba(124,58,237,0.18)",border:"1px solid rgba(168,85,247,0.32)",borderRadius:"11px",color:"#c084fc",fontSize:"13px",cursor:"pointer"}}>🔄 Neu</button>
            <button onClick={doGenerateVideo} disabled={loading} style={{flex:2,padding:"12px",background:loading?"rgba(80,80,80,0.2)":"linear-gradient(135deg,#be185d,#db2777)",border:"none",borderRadius:"11px",color:"#fff",fontSize:"14px",fontWeight:"700",cursor:"pointer",boxShadow:"0 6px 20px rgba(190,24,93,0.35)",display:"flex",alignItems:"center",justifyContent:"center",gap:"7px"}}>
              {loading?<><Spinner/>{Math.round(videoProgress)}%</>:"🎬 Video generieren"}
            </button>
          </div>
          {loading&&<div style={{marginTop:"14px"}}><ProgressBar value={videoProgress} color="#db2777" /></div>}
        </Card>
      )}

      {/* VIDEO */}
      {phase==="video" && (
        <Card accent="pink">
          <div style={{textAlign:"center",marginBottom:"22px"}}>
            <div style={{fontSize:"44px",marginBottom:"10px"}}>🎉</div>
            <h2 style={{color:"#f9a8d4",fontSize:"24px",fontWeight:"800",margin:"0 0 5px"}}>Video fertig!</h2>
            <p style={{color:"#9ca3af",fontSize:"13px",margin:0}}>Von der Idee zum Video in wenigen Schritten.</p>
          </div>
          <div style={{borderRadius:"14px",overflow:"hidden",position:"relative",background:"#000",aspectRatio:"16/9",marginBottom:"20px",boxShadow:"0 16px 50px rgba(190,24,93,0.28)",border:"1px solid rgba(236,72,153,0.28)"}}>
            <img src={imageUrl} style={{width:"100%",height:"100%",objectFit:"cover",opacity:0.65}} alt="" />
            <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:"64px",height:"64px",background:"rgba(219,39,119,0.88)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",paddingLeft:"4px",boxShadow:"0 0 28px rgba(219,39,119,0.6)",cursor:"pointer"}}>▶</div>
            </div>
          </div>
          <div style={{display:"flex",gap:"9px"}}>
            <button style={{flex:1,padding:"14px",background:"linear-gradient(135deg,#be185d,#db2777)",border:"none",borderRadius:"12px",color:"#fff",fontSize:"14px",fontWeight:"700",cursor:"pointer",boxShadow:"0 6px 20px rgba(190,24,93,0.38)"}}>⬇️ Herunterladen</button>
            <button onClick={()=>{setPhase("idea");setIdea("");setPrompt("");setImageUrl("");setVideoProgress(0);setStyle("");setMood("");setLighting("");setCamera("");}} style={{flex:1,padding:"14px",background:"transparent",border:"1px solid rgba(192,132,252,0.28)",borderRadius:"12px",color:"#a78bfa",fontSize:"14px",cursor:"pointer"}}>🆕 Neues Projekt</button>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── APP SHELL ────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState(TABS.SINGLE);

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg,#04000e 0%,#09001a 45%,#030010 100%)",
      fontFamily:"'Georgia','Times New Roman',serif",
      color:"#e8d5ff",position:"relative",overflow:"hidden"
    }}>
      <div style={{position:"fixed",width:"700px",height:"700px",borderRadius:"50%",background:"radial-gradient(circle,rgba(124,58,237,0.055),transparent 70%)",top:"-250px",left:"-180px",pointerEvents:"none"}} />
      <div style={{position:"fixed",width:"500px",height:"500px",borderRadius:"50%",background:"radial-gradient(circle,rgba(6,182,212,0.045),transparent 70%)",bottom:"-80px",right:"-80px",pointerEvents:"none"}} />

      <style>{`
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        *{box-sizing:border-box}
        textarea,button{font-family:inherit}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-thumb{background:#7c3aed44;border-radius:2px}
      `}</style>

      <div style={{position:"relative",zIndex:1,maxWidth:"900px",margin:"0 auto",padding:"38px 20px 70px"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:"38px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",marginBottom:"10px"}}>
            <span style={{fontSize:"30px"}}>🍌</span>
            <h1 style={{fontSize:"clamp(24px,5vw,40px)",fontWeight:"900",margin:0,background:"linear-gradient(90deg,#c084fc,#f0abfc,#e879f9,#a855f7)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-1px"}}>
              NanoBanana Studio
            </h1>
            <span style={{fontSize:"30px"}}>🍌</span>
          </div>
          <p style={{color:"#4c1d95",fontSize:"11px",letterSpacing:"4px",textTransform:"uppercase",margin:0}}>KI-Powered Creative Suite</p>
        </div>

        {/* Tab Bar */}
        <div style={{
          display:"flex",background:"rgba(0,0,0,0.45)",borderRadius:"16px",padding:"6px",
          border:"1px solid rgba(124,58,237,0.18)",marginBottom:"30px",gap:"6px"
        }}>
          <button onClick={()=>setTab(TABS.SINGLE)} style={{
            flex:1,padding:"15px 20px",borderRadius:"12px",border:"none",cursor:"pointer",
            background:tab===TABS.SINGLE?"linear-gradient(135deg,#7c3aed,#a855f7)":"transparent",
            color:tab===TABS.SINGLE?"#fff":"#9ca3af",fontSize:"15px",
            fontWeight:tab===TABS.SINGLE?"700":"400",
            boxShadow:tab===TABS.SINGLE?"0 4px 20px rgba(124,58,237,0.38)":"none",
            transition:"all 0.3s",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"
          }}>
            <span>🖼️</span>
            <span>Einzelbild</span>
            <span style={{fontSize:"11px",opacity:0.65,fontWeight:"400"}}>Idee → Bild → Video</span>
          </button>
          <button onClick={()=>setTab(TABS.STORY)} style={{
            flex:1,padding:"15px 20px",borderRadius:"12px",border:"none",cursor:"pointer",
            background:tab===TABS.STORY?"linear-gradient(135deg,#0891b2,#06b6d4)":"transparent",
            color:tab===TABS.STORY?"#fff":"#9ca3af",fontSize:"15px",
            fontWeight:tab===TABS.STORY?"700":"400",
            boxShadow:tab===TABS.STORY?"0 4px 20px rgba(6,182,212,0.38)":"none",
            transition:"all 0.3s",display:"flex",alignItems:"center",justifyContent:"center",gap:"10px"
          }}>
            <span>🎬</span>
            <span>Drehbuch</span>
            <span style={{fontSize:"11px",opacity:0.65,fontWeight:"400"}}>Story → Szenen → Prompts</span>
          </button>
        </div>

        {/* Content */}
        <div style={{animation:"fadeIn 0.3s ease"}} key={tab}>
          {tab===TABS.SINGLE?<SingleMode/>:<StoryMode/>}
        </div>

        <p style={{textAlign:"center",color:"#1a0035",fontSize:"11px",marginTop:"50px",letterSpacing:"2px"}}>
          POWERED BY CLAUDE AI × NANOBANANA 🍌
        </p>
      </div>
    </div>
  );
}
