import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowUpDown, Flag, Footprints } from 'lucide-react';
import FloorMap from '../components/FloorMap';
import PlaceCombobox from '../components/PlaceCombobox';
import { BuildingSwitcher, Compass, FloorBadge, FloorSwitcher, MobileMapBar } from '../components/MapChrome';
import { PLACE_BY_KEY, SEARCH_ITEMS, floorLabel } from '../data/campus';
import { getRoute } from '../lib/route';

const itemFor = (key) => key && SEARCH_ITEMS.find((i) => i.id === key || i.place === key);
const chipLabel = (f) => (f === 'C' ? 'Civil' : f === 'G' ? 'G' : f === '-1' ? '−1' : f);

export default function NavigatePage() {
  const [params, setParams] = useSearchParams();
  const [from, setFrom] = useState(() => itemFor(params.get('from')) || null);
  const [to, setTo] = useState(() => itemFor(params.get('to')) || null);
  const [route, setRoute] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | ok | none
  const [floor, setFloor] = useState('G');
  const [activeStep, setActiveStep] = useState(0);
  const fromInput = useRef(null);

  // Keep the URL in sync so routes can be shared
  useEffect(() => {
    const next = new URLSearchParams();
    if (from) next.set('from', from.place);
    if (to) next.set('to', to.place);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  useEffect(() => {
    if (!from && to) fromInput.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let alive = true;
    if (!from || !to) {
      setRoute(null);
      setStatus('idle');
      const focus = PLACE_BY_KEY[(to || from)?.place];
      if (focus) setFloor(focus.floor);
      return undefined;
    }
    if (from.place === to.place) {
      setRoute(null);
      setStatus('same');
      setFloor(PLACE_BY_KEY[to.place].floor);
      return undefined;
    }
    setStatus('loading');
    getRoute(from.place, to.place).then((r) => {
      if (!alive) return;
      setRoute(r);
      setStatus(r ? 'ok' : 'none');
      setActiveStep(0);
      if (r) setFloor(r.segments[0].floor);
    });
    return () => {
      alive = false;
    };
  }, [from, to]);

  const building = floor === 'C' ? 'civil' : 'main';
  const end = to && PLACE_BY_KEY[to.place];

  const goToStep = (i) => {
    setActiveStep(i);
    const s = route.steps[i];
    setFloor(s.floor);
  };

  return (
    <div className="grid lg:h-[calc(100dvh-77px)] lg:grid-cols-[440px_minmax(0,1fr)] lg:grid-rows-[auto_minmax(0,1fr)]">
      <div className="relative z-20 border-b border-sand bg-cream p-3 sm:p-6 lg:col-start-1 lg:row-start-1 lg:border-r">
        <p className="label hidden text-bark sm:block">Navigate</p>
        <h1 className="mt-2 hidden font-display text-[28px] tracking-[0.06em] sm:block">PLAN YOUR ROUTE</h1>
        <div className="rounded-[18px] border border-sand bg-paper p-1 sm:mt-5 sm:p-1.5">
          <PlaceCombobox
            inputRef={fromInput}
            label="You are at"
            marker="start"
            includeWaypoints
            value={from}
            onChange={setFrom}
            placeholder="Room, stairs or entrance"
            compact
          />
          <div className="relative mx-4 border-t border-sand">
            <button
              type="button"
              aria-label="Swap start and destination"
              onClick={() => {
                setFrom(to);
                setTo(from);
              }}
              className="absolute -top-4 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-sand bg-paper text-bark transition hover:border-bark"
            >
              <ArrowUpDown size={14} strokeWidth={1.6} />
            </button>
          </div>
          <PlaceCombobox label="Where do you want to go?" marker="end" value={to} onChange={setTo} placeholder="Room, lab or teacher" compact />
        </div>
      </div>

      <div className="order-3 border-sand bg-cream p-4 sm:p-6 lg:order-none lg:col-start-1 lg:row-start-2 lg:min-h-0 lg:overflow-y-auto lg:border-r">
        {status === 'idle' && (
          <p className="text-sm leading-relaxed text-ink/70">
            {!from && !to
              ? 'Choose where you are and where you want to go. Your route will appear on the map.'
              : !from
                ? 'Now choose where you are right now.'
                : 'Now choose where you want to go.'}
          </p>
        )}
        {status === 'same' && <p className="text-sm text-ink/70">You're already there. Pick a different destination.</p>}
        {status === 'loading' && <p className="text-sm text-ink/70">Finding the best route…</p>}
        {status === 'none' && <p className="text-sm text-ink/70">We couldn't find a walking route between these two places. Try a nearby room or stairwell.</p>}
        {status === 'ok' && route && (
          <>
            {route.floors.length > 1 && (
              <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Floors on this route">
                {route.floors.map((f, i) => (
                  <span key={f} className="flex items-center gap-2">
                    {i > 0 && <span className="text-taupe">→</span>}
                    <button
                      type="button"
                      onClick={() => setFloor(f)}
                      className={`min-w-[36px] rounded-full border px-3 py-1 text-xs transition ${floor === f ? 'border-ink bg-ink text-cream' : 'border-stone text-ink hover:border-bark'}`}
                      aria-label={floorLabel(f)}
                    >
                      {chipLabel(f)}
                    </button>
                  </span>
                ))}
              </div>
            )}
            <ol className="relative">
              {route.steps.map((s, i) => {
                const on = i === activeStep;
                const Icon = s.arrive ? Flag : s.toFloor ? Footprints : null;
                return (
                  <li key={i} className="relative pl-9">
                    {i < route.steps.length - 1 && <span className="absolute left-[11px] top-7 h-[calc(100%-12px)] w-px bg-stone" aria-hidden="true" />}
                    <span
                      className={`absolute left-0 top-2.5 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${on ? 'border-ink bg-ink text-cream' : s.arrive ? 'border-ink bg-ink text-cream' : 'border-stone bg-paper text-bark'}`}
                    >
                      {Icon ? <Icon size={11} strokeWidth={1.8} /> : i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => goToStep(i)}
                      className={`mb-1.5 w-full rounded-xl px-3 py-2.5 text-left text-[15px] leading-snug transition ${on ? 'bg-paper text-ink' : 'text-ink/80 hover:bg-paper'}`}
                    >
                      {s.text}
                      <span className="mt-0.5 block text-xs text-taupe">{s.floor === 'C' ? 'Civil Dept. Building' : floorLabel(s.floor)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>

      <div className="order-2 flex flex-col lg:order-none lg:col-start-2 lg:row-span-2 lg:row-start-1">
        <MobileMapBar
          building={building}
          floor={floor}
          onBuilding={(b) => setFloor(b === 'civil' ? 'C' : route?.floors.find((f) => f !== 'C') || 'G')}
          onFloor={setFloor}
          highlight={route?.floors || []}
        />
        <div className="relative h-[56vh] min-h-[340px] lg:h-auto lg:flex-1">
          <FloorMap
            floor={floor}
            route={route}
            startKey={route ? from?.place : null}
            endKey={route ? to?.place : null}
            selectedKey={!route ? (to || from)?.place : null}
            focusKey={!route ? (to || from)?.place : null}
          />
          <div className="absolute left-5 top-5 hidden sm:block">
            <FloorBadge floor={floor} />
          </div>
          <div className="absolute right-5 top-5 hidden flex-col items-end gap-3 sm:flex">
            <BuildingSwitcher building={building} onChange={(b) => setFloor(b === 'civil' ? 'C' : route?.floors.find((f) => f !== 'C') || 'G')} />
            <FloorSwitcher building={building} floor={floor} onChange={setFloor} highlight={route?.floors || []} />
            <Compass />
          </div>
          {status === 'ok' && end && (
            <div className="pointer-events-none absolute bottom-4 left-4 right-20 hidden sm:block">
              <div className="inline-flex max-w-full items-center gap-3 rounded-2xl border border-sand bg-paper px-4 py-3">
                <span className="h-3 w-3 flex-none rounded-full bg-ink" />
                <span className="truncate text-sm">
                  <span className="text-taupe">To </span>
                  {end.name}
                  <span className="text-taupe"> · {end.building === 'civil' ? 'Civil Dept. Building' : floorLabel(end.floor)}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
