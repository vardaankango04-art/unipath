import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Navigation, X } from 'lucide-react';
import FloorMap from '../components/FloorMap';
import PlaceCombobox from '../components/PlaceCombobox';
import { BuildingSwitcher, Compass, FloorSwitcher, MobileMapBar } from '../components/MapChrome';
import { FACULTY, PLACE_BY_KEY, TYPE_LABELS, floorLabel } from '../data/campus';

function PlaceCard({ place, onClose }) {
  const faculty = FACULTY.filter((f) => f.room === place.key);
  const where = place.building === 'civil' ? 'Civil Dept. Building' : `Main Building · ${floorLabel(place.floor)}`;
  return (
    <div className="rounded-2xl border border-sand bg-paper p-5 shadow-[0_18px_40px_-24px_rgba(41,28,14,0.4)]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="label text-taupe">{TYPE_LABELS[place.type]}</p>
          <h2 className="mt-1.5 font-display text-2xl leading-tight tracking-[0.04em]">{place.name}</h2>
          <p className="mt-1 text-sm text-ink/70">
            {place.code ? `${place.code} · ` : ''}
            {where}
          </p>
        </div>
        <button type="button" onClick={onClose} aria-label="Close details" className="-mr-1 -mt-1 rounded-full p-1.5 text-taupe hover:bg-cream hover:text-ink">
          <X size={18} strokeWidth={1.6} />
        </button>
      </div>
      {place.position && <p className="mt-4 border-t border-sand pt-4 text-sm leading-relaxed text-ink/80">{place.position}</p>}
      {faculty.length > 0 && (
        <div className="mt-4 border-t border-sand pt-4">
          <p className="label text-taupe">Faculty on this floor</p>
          <ul className="mt-2 grid gap-1 text-sm text-ink/80">
            {faculty.map((f) => (
              <li key={f.name}>{f.name}</li>
            ))}
          </ul>
        </div>
      )}
      {!['stairs', 'exit', 'entrance'].includes(place.type) && (
        <Link to={`/navigate?to=${encodeURIComponent(place.key)}`} className="btn-primary mt-5 w-full py-3.5">
          <Navigation size={14} strokeWidth={1.6} /> Navigate here
        </Link>
      )}
    </div>
  );
}

export default function MapPage() {
  const [params, setParams] = useSearchParams();
  const initial = PLACE_BY_KEY[params.get('place')];
  const [building, setBuilding] = useState(initial?.building || 'main');
  const [floor, setFloor] = useState(initial?.floor || 'G');
  const [selected, setSelected] = useState(initial?.key || null);
  const [search, setSearch] = useState(null);

  useEffect(() => {
    const next = new URLSearchParams(params);
    if (selected) next.set('place', selected);
    else next.delete('place');
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const selectPlace = (key) => {
    const p = PLACE_BY_KEY[key];
    if (!p) return;
    setBuilding(p.building);
    setFloor(p.floor);
    setSelected(key);
  };

  const changeBuilding = (b) => {
    setBuilding(b);
    setFloor(b === 'civil' ? 'C' : 'G');
    setSelected(null);
  };

  const place = selected && PLACE_BY_KEY[selected];

  return (
    <div className="flex h-[calc(100dvh-77px)] min-h-[480px] flex-col sm:relative sm:block">
      {/* Search: its own strip on phones, floating over the map on larger screens */}
      <div className="relative z-20 flex flex-col gap-3 bg-cream px-3 pt-3 sm:pointer-events-none sm:absolute sm:left-5 sm:top-5 sm:w-[380px] sm:bg-transparent sm:p-0">
        <div className="pointer-events-auto rounded-2xl border border-sand bg-paper">
          <PlaceCombobox
            label="Search the campus"
            includeWaypoints
            compact
            value={search}
            onChange={(it) => {
              setSearch(it);
              if (it) selectPlace(it.place);
            }}
            placeholder="Room, lab, office or teacher"
          />
        </div>
        {place && (
          <div className="pointer-events-auto hidden sm:block">
            <PlaceCard
              place={place}
              onClose={() => {
                setSelected(null);
                setSearch(null);
              }}
            />
          </div>
        )}
      </div>

      <MobileMapBar building={building} floor={floor} onBuilding={changeBuilding} onFloor={setFloor} />

      <div className="relative min-h-0 flex-1 sm:absolute sm:inset-0">
        <FloorMap floor={floor} selectedKey={selected} focusKey={selected} onSelectPlace={selectPlace} />
        {place && (
          <div className="absolute inset-x-3 bottom-3 z-10 sm:hidden">
            <PlaceCard
              place={place}
              onClose={() => {
                setSelected(null);
                setSearch(null);
              }}
            />
          </div>
        )}
      </div>

      <div className="absolute right-5 top-5 z-20 hidden flex-col items-end gap-3 sm:flex">
        <BuildingSwitcher building={building} onChange={changeBuilding} />
        <FloorSwitcher building={building} floor={floor} onChange={setFloor} />
        <Compass />
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 z-20 hidden rounded-full border border-sand bg-paper px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-ink sm:block">
        {building === 'civil' ? 'Civil Dept. Building' : `Main Building · ${floorLabel(floor)}`}
      </div>
    </div>
  );
}
