import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { BookOpen, Building2, DoorOpen, FlaskConical, Footprints, GraduationCap, Library, Presentation, User, Users, X } from 'lucide-react';
import { searchPlaces } from '../data/campus';

const ICONS = {
  classroom: GraduationCap,
  tutorial: BookOpen,
  lab: FlaskConical,
  theatre: Presentation,
  office: Building2,
  facility: Library,
  faculty: Users,
  person: User,
  stairs: Footprints,
  exit: DoorOpen,
  entrance: DoorOpen,
};

/**
 * Searchable place picker (rooms, labs, offices, faculty, and optionally
 * stairs / exits / entrances). `value` is a search item or null.
 */
export default function PlaceCombobox({
  label,
  value,
  onChange,
  placeholder,
  marker,
  includeWaypoints = false,
  error,
  compact = false,
  inputRef: externalRef,
}) {
  const id = useId();
  const localRef = useRef(null);
  const inputRef = externalRef || localRef;
  const wrapRef = useRef(null);
  const [text, setText] = useState(value?.title || '');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const typedClear = useRef(false);
  useEffect(() => {
    if (!value && typedClear.current) {
      typedClear.current = false;
      return;
    }
    setText(value?.title || '');
  }, [value]);

  const query = value && text === value.title ? '' : text;
  const results = useMemo(() => searchPlaces(query, { includeWaypoints, limit: 8 }), [query, includeWaypoints]);

  useEffect(() => {
    const close = (e) => wrapRef.current && !wrapRef.current.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);

  const choose = (item) => {
    onChange(item);
    setText(item.title);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && open && results[active]) {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const dot =
    marker === 'start' ? (
      <span className="h-3 w-3 flex-none rounded-full border-[3px] border-bark bg-paper" />
    ) : marker === 'end' ? (
      <span className="h-3 w-3 flex-none rounded-full bg-ink" />
    ) : null;

  return (
    <div ref={wrapRef} className="relative">
      <label htmlFor={id} className={`flex items-center gap-4 ${compact ? 'px-4 py-3' : 'px-4 py-4'}`}>
        {dot}
        <span className="min-w-0 flex-1">
          <span className="label block text-taupe max-sm:tracking-[0.2em]">{label}</span>
          <input
            ref={inputRef}
            id={id}
            role="combobox"
            aria-expanded={open}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            autoComplete="off"
            value={text}
            placeholder={placeholder}
            onChange={(e) => {
              setText(e.target.value);
              setOpen(true);
              setActive(0);
              if (value) {
                typedClear.current = true;
                onChange(null);
              }
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            className="mt-1 w-full truncate bg-transparent text-[17px] text-ink placeholder:text-taupe focus:outline-none"
          />
        </span>
        {text && (
          <button
            type="button"
            aria-label={`Clear ${label}`}
            onClick={() => {
              setText('');
              onChange(null);
              inputRef.current?.focus();
            }}
            className="rounded-full p-1 text-taupe hover:bg-cream hover:text-ink"
          >
            <X size={16} strokeWidth={1.6} />
          </button>
        )}
      </label>
      {error && <p className="-mt-2 px-4 pb-3 pl-11 text-xs text-bark">{error}</p>}

      {open && (
        <ul
          id={`${id}-list`}
          role="listbox"
          className="absolute left-2 right-2 top-full z-30 mt-1 max-h-80 overflow-auto rounded-2xl border border-sand bg-paper p-1.5 shadow-[0_18px_40px_-18px_rgba(41,28,14,0.35)]"
        >
          {results.length === 0 && <li className="px-4 py-3 text-sm text-taupe">No place matches “{text}”. Try a room code like CR 9.</li>}
          {results.map((item, i) => {
            const Icon = ICONS[item.kind] || Building2;
            return (
              <li
                key={item.id}
                role="option"
                aria-selected={i === active}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => choose(item)}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 ${i === active ? 'bg-cream' : ''}`}
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg border border-sand bg-paper text-bark">
                  <Icon size={15} strokeWidth={1.6} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[15px] text-ink">{item.title}</span>
                  <span className="block truncate text-xs text-taupe">{item.subtitle}</span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
