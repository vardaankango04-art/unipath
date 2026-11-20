import { BUILDINGS, FLOOR_SHORT, floorLabel } from '../data/campus';

export function FloorSwitcher({ building = 'main', floor, onChange, highlight = [], horizontal = false }) {
  const b = BUILDINGS.find((x) => x.id === building);
  if (!b || b.floors.length < 2) return null;
  const floors = horizontal ? [...b.floors].reverse() : b.floors;
  return (
    <div className={`flex overflow-hidden rounded-xl border border-sand bg-paper ${horizontal ? 'flex-row' : 'flex-col'}`} role="radiogroup" aria-label="Floor">
      {floors.map((f, i) => {
        const on = f === floor;
        const marked = highlight.includes(f);
        return (
          <button
            key={f}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={floorLabel(f)}
            onClick={() => onChange(f)}
            className={`relative flex items-center justify-center text-[13px] transition ${horizontal ? 'h-9 w-9' : 'h-10 w-11'} ${i ? (horizontal ? 'border-l border-sand' : 'border-t border-sand') : ''} ${on ? 'bg-ink text-cream' : 'text-ink hover:bg-cream'}`}
          >
            {FLOOR_SHORT[f]}
            {marked && !on && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-bark" />}
          </button>
        );
      })}
    </div>
  );
}

export function BuildingSwitcher({ building, onChange }) {
  return (
    <div className="inline-flex flex-none rounded-full border border-sand bg-paper p-1" role="radiogroup" aria-label="Building">
      {BUILDINGS.map((b) => (
        <button
          key={b.id}
          type="button"
          role="radio"
          aria-checked={b.id === building}
          onClick={() => onChange(b.id)}
          className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] transition sm:px-4 sm:text-[11px] sm:tracking-[0.18em] ${b.id === building ? 'bg-ink text-cream' : 'text-ink hover:bg-cream'}`}
        >
          {b.id === 'main' ? 'Main' : <>Civil<span className="hidden sm:inline"> Dept.</span></>}
        </button>
      ))}
    </div>
  );
}

export function FloorBadge({ floor }) {
  const text = floor === 'C' ? 'Civil Dept. Building' : `Main Building · ${floorLabel(floor)}`;
  return <div className="rounded-full border border-sand bg-paper px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-ink">{text}</div>;
}

export function Compass() {
  return (
    <div className="flex h-11 w-11 flex-col items-center justify-center rounded-full border border-sand bg-paper" aria-hidden="true">
      <span className="text-[8px] tracking-[0.2em] text-taupe">N</span>
      <svg width="12" height="14" viewBox="-6 -7 12 14"><path d="M0 -7 L5 6 L0 3 L-5 6Z" fill="#291C0E" /></svg>
    </div>
  );
}

/** Phone-only toolbar above a map: building + floor pickers in one row. */
export function MobileMapBar({ building, floor, onBuilding, onFloor, highlight = [] }) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-sand bg-cream px-3 py-2 sm:hidden">
      <BuildingSwitcher building={building} onChange={onBuilding} />
      {building === 'main' ? (
        <FloorSwitcher horizontal building={building} floor={floor} onChange={onFloor} highlight={highlight} />
      ) : (
        <span className="text-[11px] uppercase tracking-[0.16em] text-taupe">Floor not recorded</span>
      )}
    </div>
  );
}
