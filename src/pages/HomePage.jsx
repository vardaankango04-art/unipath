import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpDown } from 'lucide-react';
import FloorMap from '../components/FloorMap';
import PlaceCombobox from '../components/PlaceCombobox';
import { Compass, FloorBadge, FloorSwitcher } from '../components/MapChrome';
import { SEARCH_ITEMS } from '../data/campus';
import { describeRoute, findPathLocal } from '../lib/graph';

const QUICK = ['LIBRARY', 'AUDITORIUM', 'PLACEMENT', 'REGISTRAR'];
const item = (key) => SEARCH_ITEMS.find((i) => i.id === key);

const PREVIEW_FROM = 'G_ENTRY';
const PREVIEW_TO = 'CR-4';

export default function HomePage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [errors, setErrors] = useState({});
  const [previewFloor, setPreviewFloor] = useState('G');

  const preview = useMemo(() => describeRoute(findPathLocal(PREVIEW_FROM, PREVIEW_TO)), []);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!from) next.from = 'Choose where you are right now';
    if (!to) next.to = 'Choose where you want to go';
    if (from && to && from.place === to.place) next.to = "You're already there. Pick a different destination";
    setErrors(next);
    if (Object.keys(next).length) return;
    navigate(`/navigate?from=${encodeURIComponent(from.place)}&to=${encodeURIComponent(to.place)}`);
  };

  return (
    <>
      <section className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 pb-14 pt-10 sm:px-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:px-[72px] lg:pb-20 lg:pt-16">
        <div className="min-w-0">
          <p className="label text-bark">Indoor campus navigation</p>
          <h1 className="mt-5 font-display text-[56px] leading-none tracking-[0.06em] sm:text-[80px] xl:text-[96px]">UNIPATH</h1>
          <p className="mt-4 font-accent text-[30px] italic leading-tight text-bark sm:text-[38px]">Every room, one clear path.</p>
          <p className="mt-5 max-w-[470px] text-base leading-[1.8] tracking-[0.03em] text-ink/80">
            Tell us where you're standing and where you need to be. UniPath draws the shortest route through corridors and stairwells, floor by floor.
          </p>

          <form onSubmit={submit} noValidate className="relative mt-9 max-w-[540px] rounded-[18px] border border-sand bg-paper p-2.5">
            <PlaceCombobox label="You are at" marker="start" includeWaypoints value={from} onChange={(v) => { setFrom(v); setErrors((x) => ({ ...x, from: undefined })); }} placeholder="Room, stairs or entrance" error={errors.from} />
            <div className="relative mx-4 border-t border-sand">
              <button
                type="button"
                aria-label="Swap start and destination"
                onClick={() => { setFrom(to); setTo(from); }}
                className="absolute -top-4 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-sand bg-paper text-bark transition hover:border-bark"
              >
                <ArrowUpDown size={14} strokeWidth={1.6} />
              </button>
            </div>
            <PlaceCombobox label="Where do you want to go?" marker="end" value={to} onChange={(v) => { setTo(v); setErrors((x) => ({ ...x, to: undefined })); }} placeholder="Room, lab or teacher" error={errors.to} />
            <button type="submit" className="btn-primary mt-1.5 w-full">
              Find my route <ArrowRight size={15} strokeWidth={1.6} />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {QUICK.map((k) => {
              const it = item(k);
              return (
                <button key={k} type="button" className="btn-ghost" onClick={() => { setTo(it); setErrors((x) => ({ ...x, to: undefined })); }}>
                  {it.title}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex h-[500px] min-w-0 flex-col overflow-hidden rounded-[24px] border border-sand bg-cream sm:h-[620px] lg:h-[680px]">
          <div className="relative min-h-0 flex-1">
          <FloorMap
            floor={previewFloor}
            route={previewFloor === 'G' ? preview : null}
            startKey={PREVIEW_FROM}
            endKey={PREVIEW_TO}
            interactive={false}
            fitRoute={false}
          />
          <div className="absolute left-4 top-4 hidden sm:block"><FloorBadge floor={previewFloor} /></div>
          <div className="absolute right-4 top-4 hidden flex-col items-end gap-3 sm:flex">
            <FloorSwitcher floor={previewFloor} onChange={setPreviewFloor} />
            <Compass />
          </div>
          </div>
          <Link
            to={previewFloor === 'G' ? `/navigate?from=${PREVIEW_FROM}&to=${PREVIEW_TO}` : '/map'}
            className="flex flex-none items-center gap-5 border-t border-sand bg-paper px-5 py-4 transition hover:bg-[#FFFBF5]"
          >
            {previewFloor === 'G' ? (
              <>
                <div className="flex-none">
                  <p className="label text-taupe">Example route</p>
                  <p className="mt-1 font-display text-lg tracking-[0.06em]">ENTRANCE → CR 4</p>
                </div>
                <ol className="hidden min-w-0 flex-1 border-l border-sand pl-5 text-[13px] leading-relaxed text-ink/80 sm:block">
                  {preview.steps.slice(0, 3).map((s, i) => <li key={i}>{s.text}</li>)}
                </ol>
              </>
            ) : (
              <p className="flex-1 text-[13px] text-ink/80">Open the campus map to explore {previewFloor === '-1' ? 'Floor −1' : `Floor ${previewFloor}`}</p>
            )}
            <ArrowRight size={16} strokeWidth={1.6} className="ml-auto flex-none text-bark" />
          </Link>
        </div>
      </section>

      <section className="bg-sand">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-14 sm:px-8 lg:grid-cols-[1fr_2fr] lg:gap-14 lg:px-[72px] lg:py-20">
          <div>
            <p className="label text-bark">About</p>
            <h2 className="mt-3 font-display text-[34px] leading-[1.2] tracking-[0.06em] sm:text-4xl">WHAT IS<br />UNIPATH?</h2>
            <p className="mt-3 font-accent text-[22px] italic text-bark">A wayfinder for the academic block.</p>
            <p className="mt-5 max-w-sm text-[15px] leading-[1.8] text-ink/80">
              It covers every floor of the Main Building, from Floor −1 to Floor 3, plus the Civil Dept. Building, so you can find any classroom, lab, office or faculty cabin.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {[
              ['01', 'Where you are', "Pick the room, stairwell or entrance you're standing next to."],
              ['02', "Where you're going", 'Search any classroom, lab, office or teacher by name or room code.'],
              ['03', 'Follow the line', 'See your route on the floor plan, with every stair change called out step by step.'],
            ].map(([n, t, d]) => (
              <div key={n} className="rounded-[18px] bg-cream p-6">
                <p className="font-display text-3xl text-taupe">{n}</p>
                <h3 className="label mt-3 text-ink">{t}</h3>
                <p className="mt-2 text-sm leading-[1.7] text-ink/80">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
