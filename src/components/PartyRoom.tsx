import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HOST_ID, type Participant } from "@/lib/party";
import { Character } from "@/components/Character";
import { useCalm } from "@/components/Shell";

/* Fixed, hand-placed spots (percent of room). Order = fill order. Never overlap. */
const SLOTS: { x: number; y: number; zone: string }[] = [
  { x: 23, y: 44, zone: "무대" }, { x: 37, y: 42, zone: "무대" }, { x: 9, y: 47, zone: "무대 옆" },
  { x: 62, y: 60, zone: "커피 바" }, { x: 76, y: 60, zone: "커피 바" }, { x: 90, y: 62, zone: "커피 바" },
  { x: 14, y: 84, zone: "라운지" }, { x: 29, y: 86, zone: "라운지" }, { x: 46, y: 80, zone: "플로어" },
  { x: 61, y: 88, zone: "플로어" }, { x: 77, y: 86, zone: "창가" }, { x: 91, y: 88, zone: "창가" },
];
export const ROOM_CAPACITY = SLOTS.length;

type Props = {
  members: Participant[];
  exampleIds?: Set<string>;
  localIds?: Set<string>;
  sourceLabel: string;
  onSelect: (p: Participant) => void;
  big?: boolean;
  testid?: string;
  idPrefix?: string;
};

export function PartyRoom({ members, exampleIds, localIds, sourceLabel, onSelect, big, testid = "panel-party-room", idPrefix = "room-member" }: Props) {
  const calm = useCalm();
  const pages = Math.max(1, Math.ceil(members.length / ROOM_CAPACITY));
  const [page, setPage] = useState(0);
  useEffect(() => { if (page >= pages) setPage(pages - 1); }, [page, pages]);
  // stable order: locals last so they "walk in" after repository members
  const shown = useMemo(() => members.slice(page * ROOM_CAPACITY, (page + 1) * ROOM_CAPACITY), [members, page]);

  return (
    <div data-testid={testid}>
      <div className="overflow-x-auto rounded-[22px] border-2 border-foreground" style={{ boxShadow: "5px 5px 0 hsl(var(--foreground))" }}>
        <div className="relative isolate min-w-[680px]" style={{ aspectRatio: big ? "16/9" : "16/10" }} role="group" aria-label={`파티 룸 · ${sourceLabel}`}>
          <RoomScenery calm={calm} />
          {shown.map((p, i) => {
            const s = SLOTS[i];
            const isEx = exampleIds?.has(p.id);
            const isLocal = localIds?.has(p.id);
            const isHost = p.id === HOST_ID;
            return (
              <button key={p.id} onClick={() => onSelect(p)} data-testid={`${idPrefix}-${p.id}`}
                aria-label={`${p.name} · ${p.role}${isHost ? " · 주인장" : isEx ? " · 예시" : ""}${isLocal ? " · 이 브라우저 전용" : ""} · 자세히 보기`}
                className="attendee absolute group flex flex-col items-center focus:outline-none"
                style={{ left: `${s.x}%`, top: `${s.y}%`, width: "11%", zIndex: Math.round(s.y), ["--d" as string]: `${i * 110}ms` }}>
                <span className="w-full [&_svg]:w-full [&_svg]:h-auto transition-transform group-hover:-translate-y-1 group-focus-visible:-translate-y-1">
                  <Character look={p} size={100} animate={!calm} title={p.name} />
                </span>
                <span className="mt-0.5 max-w-[140%] truncate rounded-full border-2 border-foreground bg-card px-2 text-[11px] md:text-xs font-bold group-focus-visible:bg-primary group-focus-visible:text-primary-foreground group-hover:bg-accent">
                  {p.name}
                </span>
                {(isEx || isLocal) && (
                  <span className={`mt-0.5 rounded-full px-1.5 text-[10px] font-bold border border-foreground ${isLocal ? "bg-[#1B2036] text-[#F7F1E6]" : isHost ? "bg-[#EDE5FF]" : "bg-muted"}`}>
                    {isLocal ? "LOCAL" : isHost ? "주인장" : "예시"}
                  </span>
                )}
              </button>
            );
          })}
          <span className="absolute left-3 bottom-3 z-[200] rounded-full bg-[#1B2036] text-[#F7F1E6] px-3 py-1 text-xs font-bold" data-testid="text-room-source">{sourceLabel}</span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
        <span className="font-mono" data-testid="text-room-count">{members.length}명 입장 · {page + 1}/{pages}번 방</span>
        {pages > 1 && (
          <span className="ml-auto flex gap-2">
            <button className="chip flex items-center gap-1" disabled={page === 0} onClick={() => setPage(page - 1)} data-testid="button-room-prev"><ChevronLeft size={14} />이전 방</button>
            <button className="chip flex items-center gap-1" disabled={page >= pages - 1} onClick={() => setPage(page + 1)} data-testid="button-room-next">다음 방<ChevronRight size={14} /></button>
          </span>
        )}
      </div>
    </div>
  );
}

function RoomScenery({ calm }: { calm: boolean }) {
  const ink = "#1B2036";
  return (
    <svg viewBox="0 0 1600 1000" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" aria-hidden="true">
      {/* wall */}
      <rect width="1600" height="560" fill="#F3E3C6" />
      {Array.from({ length: 20 }).map((_, i) => <rect key={i} x={i * 80} y="0" width="40" height="560" fill="#EAD4AE" opacity=".5" />)}
      {/* floor */}
      <rect y="560" width="1600" height="440" fill="#E9B98A" />
      {Array.from({ length: 12 }).map((_, i) => <line key={i} x1={i * 150 - 200} y1="1000" x2={i * 130 + 60} y2="560" stroke={ink} strokeOpacity=".12" strokeWidth="3" />)}
      <line x1="0" y1="560" x2="1600" y2="560" stroke={ink} strokeWidth="5" />
      {/* bunting */}
      <path d="M0 30 Q400 120 800 40 Q1200 120 1600 30" fill="none" stroke={ink} strokeWidth="3" />
      {Array.from({ length: 16 }).map((_, i) => {
        const x = 50 + i * 100; const y = 30 + Math.sin((i / 15) * Math.PI * 2) * -40 + 45;
        const c = ["#FF5934", "#F2B93B", "#3483EB", "#21A675", "#EC6B9E", "#8B5CF6"][i % 6];
        return <path key={i} d={`M${x - 26} ${y - 8} L${x + 26} ${y - 8} L${x} ${y + 34} Z`} fill={c} stroke={ink} strokeWidth="3" strokeLinejoin="round" />;
      })}
      {/* stage */}
      <rect x="40" y="150" width="660" height="300" rx="10" fill={ink} />
      <rect x="70" y="175" width="600" height="250" fill="#2A3156" />
      <text x="370" y="270" textAnchor="middle" fontFamily="Black Han Sans" fontSize="58" fill="#F7F1E6">SEOUL BUILDERS</text>
      <text x="370" y="335" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="30" fill="#F2B93B">src/participants/*.json</text>
      <path d="M40 150 Q140 260 120 450 L40 450Z M700 150 Q600 260 620 450 L700 450Z" fill="#FF5934" stroke={ink} strokeWidth="4" />
      <rect x="20" y="450" width="700" height="70" fill="#C9874F" stroke={ink} strokeWidth="5" />
      <rect x="20" y="515" width="700" height="18" fill={ink} />
      {/* spotlights */}
      <g className={calm ? undefined : "sway"} style={{ transformOrigin: "260px 0px" }}><path d="M240 0 L280 0 L380 450 L140 450Z" fill="#FFF3C4" opacity=".22" /></g>
      <g className={calm ? undefined : "sway2"} style={{ transformOrigin: "520px 0px" }}><path d="M500 0 L540 0 L640 450 L400 450Z" fill="#FFF3C4" opacity=".18" /></g>
      {/* windows */}
      {[800, 1010].map((x) => (
        <g key={x}><rect x={x} y="120" width="170" height="240" rx="85" fill="#BFD7F5" stroke={ink} strokeWidth="5" />
          <line x1={x + 85} y1="120" x2={x + 85} y2="360" stroke={ink} strokeWidth="4" /><circle cx={x + 120} cy="200" r="18" fill="#F7F1E6" /></g>
      ))}
      {/* neon-ish sign as painted wood */}
      <rect x="1230" y="130" width="320" height="120" rx="60" fill="#F7F1E6" stroke={ink} strokeWidth="5" />
      <text x="1390" y="202" textAnchor="middle" fontFamily="Black Han Sans" fontSize="36" textLength="264" lengthAdjust="spacingAndGlyphs" fill="#FF5934">merge &amp; meet</text>
      {/* plant */}
      <rect x="1480" y="430" width="70" height="80" fill="#C9874F" stroke={ink} strokeWidth="4" />
      <path d="M1515 430 Q1460 340 1490 300 Q1515 360 1515 430 Q1530 330 1570 310 Q1560 380 1515 430" fill="#21A675" stroke={ink} strokeWidth="4" />
      {/* coffee bar */}
      <rect x="880" y="420" width="700" height="150" rx="12" fill="#3483EB" stroke={ink} strokeWidth="5" />
      <rect x="860" y="400" width="740" height="30" rx="8" fill="#F7F1E6" stroke={ink} strokeWidth="5" />
      {[960, 1100, 1240].map((x) => <g key={x}><rect x={x} y="360" width="34" height="40" rx="5" fill="#F7F1E6" stroke={ink} strokeWidth="4" /><path d={`M${x + 34} 370 q16 8 0 20`} fill="none" stroke={ink} strokeWidth="4" /></g>)}
      <text x="1230" y="515" textAnchor="middle" fontFamily="Black Han Sans" fontSize="44" fill="#F7F1E6">COFFEE BAR</text>
      {/* lounge rug + sofa */}
      <ellipse cx="380" cy="870" rx="360" ry="90" fill="#EC6B9E" opacity=".55" stroke={ink} strokeWidth="4" />
      <ellipse cx="380" cy="870" rx="280" ry="60" fill="none" stroke="#F7F1E6" strokeWidth="6" strokeDasharray="20 16" />
      <rect x="1100" y="780" width="420" height="40" rx="20" fill="#8B5CF6" stroke={ink} strokeWidth="5" />
      <rect x="760" y="760" width="160" height="22" rx="11" fill="#F2B93B" stroke={ink} strokeWidth="4" />
      <rect x="830" y="782" width="20" height="80" fill={ink} />
    </svg>
  );
}

export default PartyRoom;
