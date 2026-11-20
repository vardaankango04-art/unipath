import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Plus, Minus, LocateFixed } from 'lucide-react';
import { FLOORS, PLACES, PLACE_BY_KEY, floorLabel } from '../data/campus';

const PAD = 34;
const FILL = {
  classroom: '#FFFBF5',
  tutorial: '#FFFBF5',
  theatre: '#FBF1E4',
  lab: '#F8EDDF',
  office: '#F5EADB',
  facility: '#F5EADB',
  faculty: '#F2E5D3',
  exit: '#F4E6D2',
};

function baseView(floorId) {
  const o = FLOORS[floorId].outline;
  return { x: o.x - PAD, y: o.y - PAD, w: o.w + PAD * 2, h: o.h + PAD * 2 + 26 };
}

function textWidth(text, size) {
  return text.length * size * 0.56;
}

function RoomLabel({ room }) {
  const cx = room.x + room.w / 2;
  const cy = room.y + room.h / 2;
  const primary = room.label || room.code || room.name;
  const secondary = room.code && !room.label ? room.name : null;
  const max = room.w - 16;
  const size = textWidth(primary, 13) > max ? 11 : 13;
  const showSecondary = secondary && room.h >= 48 && textWidth(secondary, 10) <= max;
  return (
    <g pointerEvents="none" style={{ fontFamily: '"Work Sans", sans-serif' }}>
      <text x={cx} y={showSecondary ? cy - 3 : cy + size * 0.36} textAnchor="middle" fontSize={size} fontWeight={500} fill="#291C0E" letterSpacing="0.02em">
        {primary}
      </text>
      {showSecondary && (
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize={10} fill="#8C735F" letterSpacing="0.04em">
          {secondary}
        </text>
      )}
    </g>
  );
}

function Stairs({ room, active }) {
  const lines = [];
  const vertical = room.h > room.w * 0.7;
  const n = 6;
  for (let i = 1; i < n; i++) {
    if (vertical) {
      const y = room.y + (room.h * i) / n;
      lines.push(<line key={i} x1={room.x + 6} x2={room.x + room.w - 6} y1={y} y2={y} />);
    } else {
      const x = room.x + (room.w * i) / n;
      lines.push(<line key={i} x1={x} x2={x} y1={room.y + 5} y2={room.y + room.h - 5} />);
    }
  }
  return (
    <g>
      <rect x={room.x} y={room.y} width={room.w} height={room.h} rx={6} fill="#EADCC8" stroke={active ? '#6E473B' : '#BEB5A9'} strokeWidth={active ? 2 : 1} />
      <g stroke="#CDBBA6" strokeWidth={1}>{lines}</g>
      <rect x={room.x + room.w / 2 - 26} y={room.y + room.h / 2 - 9} width={52} height={18} rx={9} fill="#FBF4EA" stroke="#BEB5A9" strokeWidth={0.8} />
      <text x={room.x + room.w / 2} y={room.y + room.h / 2 + 3.5} textAnchor="middle" fontSize={9.5} fill="#6E473B" letterSpacing="0.14em" style={{ fontFamily: '"Work Sans", sans-serif' }} pointerEvents="none">
        STAIRS
      </text>
    </g>
  );
}

function Pin({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <ellipse cx={0} cy={0} rx={7} ry={2.5} fill="#291C0E" opacity={0.18} />
      <path d="M0 0 C-6 -9 -13 -15 -13 -24 A13 13 0 1 1 13 -24 C13 -15 6 -9 0 0Z" fill="#291C0E" />
      <circle cx={0} cy={-24} r={4.8} fill="#F4E6D2" />
    </g>
  );
}

function StartDot({ x, y }) {
  return (
    <g pointerEvents="none">
      <circle cx={x} cy={y} r={8} fill="#6E473B" className="pulse-ring" />
      <circle cx={x} cy={y} r={9} fill="#FBF4EA" stroke="#6E473B" strokeWidth={4} />
    </g>
  );
}

function TransferChip({ x, y, text }) {
  const w = textWidth(text, 10) + 22;
  return (
    <g pointerEvents="none" transform={`translate(${x + 40} ${y - 11})`}>
      <rect width={w} height={22} rx={11} fill="#291C0E" />
      <text x={w / 2} y={14.5} textAnchor="middle" fontSize={10} fill="#F4E6D2" letterSpacing="0.06em" style={{ fontFamily: '"Work Sans", sans-serif' }}>
        {text}
      </text>
    </g>
  );
}

function transferText(toFloor) {
  if (toFloor === 'C') return 'To Civil Dept. Building';
  return `To ${floorLabel(toFloor)}`;
}

/**
 * Interactive SVG floor plan.
 * - drag to pan, wheel / pinch / buttons to zoom, recenter button
 * - route: { segments: [{floor, points}] } (only this floor's parts are drawn)
 */
export default function FloorMap({
  floor,
  route,
  selectedKey,
  startKey,
  endKey,
  focusKey,
  onSelectPlace,
  interactive = true,
  showControls = true,
  fitRoute = true,
  className = '',
}) {
  const svgRef = useRef(null);
  const base = useMemo(() => baseView(floor), [floor]);
  const [view, setView] = useState(base);
  const drag = useRef(null);
  const pointers = useRef(new Map());
  const moved = useRef(false);
  const wrapRef = useRef(null);
  const [size, setSize] = useState(null);

  // Track the container so narrow (phone) screens get a readable zoom level
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) => (prev && Math.abs(prev.w - width) < 2 && Math.abs(prev.h - height) < 2 ? prev : { w: width, h: height }));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const narrow = Boolean(size && size.w < 640);
  const sizeRef = useRef(size);
  sizeRef.current = size;

  const floorData = FLOORS[floor];
  const rooms = useMemo(() => PLACES.filter((p) => p.floor === floor), [floor]);
  const segs = useMemo(() => (route?.segments || []).map((s, i) => ({ ...s, index: i })).filter((s) => s.floor === floor), [route, floor]);

  // Choose what to show whenever the floor, route or focus changes
  const targetView = useCallback(() => {
    if (narrow && interactive) {
      // Phone: fit the building's width to the screen and let people pan
      // up and down, instead of shrinking the whole floor into view.
      const o = floorData.outline;
      const sz = sizeRef.current;
      const w = Math.max(o.w - 30, 380);
      const h = w * (sz.h / sz.w);
      const x = o.x + o.w / 2 - w / 2;
      const top = o.y - 18;
      const bottom = o.y + o.h + 50;
      const clampY = (y) => (bottom - top <= h ? top - (h - (bottom - top)) / 2 : Math.min(Math.max(y, top), bottom - h));
      if (segs.length && fitRoute) {
        const ys = segs.flatMap((sg) => sg.points.map((p) => p[1]));
        const first = segs[0].points[0][1];
        const mid = (Math.max(...ys) + Math.min(...ys)) / 2;
        const span = Math.max(...ys) - Math.min(...ys) + 120;
        const cy = span <= h ? mid : Math.min(Math.max(mid, first - h / 2 + 90), first + h / 2 - 90);
        return { x, y: clampY(cy - h / 2), w, h };
      }
      const focus = focusKey && PLACE_BY_KEY[focusKey];
      if (focus && focus.floor === floor) return { x, y: clampY(focus.y + focus.h / 2 - h / 2), w, h };
      return { x, y: clampY(top), w, h };
    }
    if (segs.length && fitRoute) {
      const pts = segs.flatMap((s) => s.points);
      const xs = pts.map((p) => p[0]);
      const ys = pts.map((p) => p[1]);
      // never zoom in so far that a small floor fills the screen
      const minSide = 560;
      const w = Math.min(Math.max(Math.max(...xs) - Math.min(...xs) + 180, base.w * 0.7, minSide), Math.max(base.w, minSide));
      const h = Math.min(Math.max(Math.max(...ys) - Math.min(...ys) + 180, base.h * 0.5, minSide), Math.max(base.h, minSide));
      const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
      const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
      return { x: cx - w / 2, y: cy - h / 2, w, h };
    }
    const focus = focusKey && PLACE_BY_KEY[focusKey];
    if (focus && focus.floor === floor) {
      const w = Math.max(base.w * 0.75, 560);
      const h = Math.max(base.h * 0.75, 560);
      return { x: focus.x + focus.w / 2 - w / 2, y: focus.y + focus.h / 2 - h / 2, w, h };
    }
    return base;
  }, [segs, focusKey, floor, base, fitRoute, narrow, interactive, floorData]);

  useLayoutEffect(() => {
    setView(targetView());
  }, [targetView]);

  // On phones the height changes as the browser bar shows/hides: keep the
  // person's pan and zoom, only stretch the view to the new shape.
  useEffect(() => {
    if (!narrow || !size) return;
    setView((v) => {
      const h = v.w * (size.h / size.w);
      return Math.abs(h - v.h) < 1 ? v : { ...v, y: v.y + (v.h - h) / 2, h };
    });
  }, [size, narrow]);

  const toSvg = (clientX, clientY) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  };

  const zoomAt = useCallback((factor, cx, cy) => {
    setView((v) => {
      const w = Math.min(Math.max(v.w * factor, base.w / 4), base.w * 1.25);
      const f = w / v.w;
      const h = v.h * f;
      const px = cx ?? v.x + v.w / 2;
      const py = cy ?? v.y + v.h / 2;
      return { x: px - (px - v.x) * f, y: py - (py - v.y) * f, w, h };
    });
  }, [base.w]);

  // Wheel needs a non-passive listener so the page doesn't scroll
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !interactive) return undefined;
    const onWheel = (e) => {
      e.preventDefault();
      const p = toSvg(e.clientX, e.clientY);
      zoomAt(Math.exp(e.deltaY * 0.0016), p.x, p.y);
    };
    svg.addEventListener('wheel', onWheel, { passive: false });
    return () => svg.removeEventListener('wheel', onWheel);
  }, [interactive, zoomAt]);

  const onPointerDown = (e) => {
    if (!interactive) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved.current = false;
    const ctm = svgRef.current.getScreenCTM();
    drag.current = { x: e.clientX, y: e.clientY, view, scale: 1 / ctm.a, pinch: null };
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      drag.current.pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), view };
    }
  };

  const onPointerMove = (e) => {
    if (!drag.current || !pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const d = drag.current;
    if (pointers.current.size === 2 && d.pinch) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const mid = toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
      const v = d.pinch.view;
      const w = Math.min(Math.max(v.w * (d.pinch.d / dist), base.w / 4), base.w * 1.25);
      const f = w / v.w;
      setView({ x: mid.x - (mid.x - v.x) * f, y: mid.y - (mid.y - v.y) * f, w, h: v.h * f });
      moved.current = true;
      return;
    }
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!moved.current && Math.hypot(dx, dy) < 4) return;
    if (!moved.current) svgRef.current.setPointerCapture?.(e.pointerId);
    moved.current = true;
    setView({ ...d.view, x: d.view.x - dx * d.scale, y: d.view.y - dy * d.scale });
  };

  const onPointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) drag.current = null;
  };

  const select = (key) => {
    if (moved.current || !onSelectPlace) return;
    onSelectPlace(key);
  };

  const o = floorData.outline;
  const start = startKey && PLACE_BY_KEY[startKey];
  const end = endKey && PLACE_BY_KEY[endKey];
  const routeKeys = new Set([startKey, endKey]);
  const total = route?.segments?.length || 0;

  return (
    <div ref={wrapRef} className={`relative h-full w-full overflow-hidden bg-cream ${className}`}>
      <svg
        ref={svgRef}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        preserveAspectRatio="xMidYMid meet"
        className={`h-full w-full select-none ${interactive ? 'cursor-grab active:cursor-grabbing touch-none' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="img"
        aria-label={`${floorLabel(floor)} floor plan`}
      >
        <defs>
          <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#E6D7C2" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect x={view.x - view.w} y={view.y - view.h} width={view.w * 3} height={view.h * 3} fill="url(#grid)" />

        {/* building */}
        <rect x={o.x + 5} y={o.y + 7} width={o.w} height={o.h} rx={16} fill="#E1D4C2" opacity={0.6} />
        <rect x={o.x} y={o.y} width={o.w} height={o.h} rx={16} fill="#FBF4EA" stroke="#A78D78" strokeWidth={2} />
        {floorData.halls.map((h, i) => (
          <rect key={i} x={h.x} y={h.y} width={h.w} height={h.h} rx={h.rx ?? 4} fill="#EFE2CF" />
        ))}

        {/* rooms */}
        {rooms.map((r) => {
          if (r.type === 'entrance') return null;
          const isSel = r.key === selectedKey;
          const isRoute = routeKeys.has(r.key);
          const clickable = interactive && onSelectPlace;
          const props = clickable
            ? {
                role: 'button',
                tabIndex: 0,
                'aria-label': r.name,
                onClick: () => select(r.key),
                onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && onSelectPlace(r.key),
                style: { cursor: 'pointer', outline: 'none' },
              }
            : {};
          if (r.type === 'stairs') return <g key={r.key} {...props}><Stairs room={r} active={isSel || isRoute} /></g>;
          return (
            <g key={r.key} {...props} className={clickable ? 'group' : ''}>
              <rect
                x={r.x}
                y={r.y}
                width={r.w}
                height={r.h}
                rx={8}
                fill={FILL[r.type] || '#FFFBF5'}
                stroke={isSel ? '#291C0E' : isRoute ? '#6E473B' : '#BEB5A9'}
                strokeWidth={isSel ? 2.5 : isRoute ? 2 : 1}
                className={clickable ? 'transition-[stroke] group-hover:stroke-[#6E473B]' : ''}
              />
              <RoomLabel room={r} />
            </g>
          );
        })}

        {/* entrances */}
        {rooms.filter((r) => r.type === 'entrance').map((r) => (
          <g key={r.key} pointerEvents="none">
            <rect x={r.door[0] - 30} y={r.door[1] - 4} width={60} height={8} rx={4} fill="#FBF4EA" stroke="#A78D78" />
            <path d={`M${r.door[0]} ${r.door[1] + 10} l-6 9 h12z`} fill="#6E473B" />
            <text x={r.door[0]} y={r.door[1] + 38} textAnchor="middle" fontSize={10} fill="#6E473B" letterSpacing="0.2em" style={{ fontFamily: '"Work Sans", sans-serif' }}>
              {(r.label || r.name).toUpperCase()}
            </text>
          </g>
        ))}

        {/* route */}
        {segs.map((s) => {
          const d = s.points.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ');
          return (
            <g key={s.index} pointerEvents="none" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d={d} stroke="#6E473B" strokeOpacity={0.16} strokeWidth={16} />
              <path d={d} stroke="#6E473B" strokeWidth={5} />
              <path d={d} stroke="#F4E6D2" strokeWidth={1.6} strokeDasharray="2 14" className="route-flow" />
            </g>
          );
        })}
        {segs.map((s) => {
          const first = s.points[0];
          const last = s.points[s.points.length - 1];
          const next = route.segments[s.index + 1];
          const prev = route.segments[s.index - 1];
          return (
            <g key={`m${s.index}`}>
              {s.index === 0 && start && <StartDot x={first[0]} y={first[1]} />}
              {s.index > 0 && prev && <circle cx={first[0]} cy={first[1]} r={7} fill="#FBF4EA" stroke="#6E473B" strokeWidth={3} pointerEvents="none" />}
              {next && <TransferChip x={last[0]} y={last[1]} text={transferText(next.floor)} />}
              {s.index === total - 1 && end && <Pin x={last[0]} y={last[1]} />}
            </g>
          );
        })}
        {!segs.length && selectedKey && PLACE_BY_KEY[selectedKey]?.floor === floor && PLACE_BY_KEY[selectedKey].type !== 'stairs' && (
          <Pin x={PLACE_BY_KEY[selectedKey].door[0]} y={PLACE_BY_KEY[selectedKey].door[1]} />
        )}
      </svg>

      {showControls && interactive && (
        <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-xl border border-sand bg-paper sm:bottom-4 sm:right-4">
          <button type="button" className="map-btn hidden sm:flex" aria-label="Zoom in" onClick={() => zoomAt(0.75)}><Plus size={17} strokeWidth={1.6} /></button>
          <button type="button" className="map-btn hidden border-y border-sand sm:flex" aria-label="Zoom out" onClick={() => zoomAt(1.33)}><Minus size={17} strokeWidth={1.6} /></button>
          <button type="button" className="map-btn" aria-label="Recenter map" onClick={() => setView(targetView())}><LocateFixed size={16} strokeWidth={1.6} /></button>
        </div>
      )}
    </div>
  );
}
