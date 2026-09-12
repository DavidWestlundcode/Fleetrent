'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Eye, EyeOff, X, Save } from 'lucide-react';

export type LandingEvent = {
  id: string;
  title: string;
  description: string;
  category: string | null;
  event_date: string;
  is_published: boolean;
  created_at: string;
};

const inputClass = 'w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

type FormState = {
  title: string;
  description: string;
  category: string;
  event_date: string;
  is_published: boolean;
};

const emptyForm: FormState = {
  title: '',
  description: '',
  category: '',
  event_date: new Date().toISOString().slice(0, 10),
  is_published: true,
};

function EventForm({
  initial,
  onCancel,
  onSaved,
}: {
  initial?: { id: string; form: FormState };
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(initial?.form ?? emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Titel och beskrivning krävs');
      return;
    }
    setSaving(true);
    setError('');
    const res = await fetch(
      initial ? `/api/admin/landing-events/${initial.id}` : '/api/admin/landing-events',
      {
        method: initial ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      }
    );
    setSaving(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Något gick fel');
      return;
    }
    onSaved();
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
      <div>
        <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Titel</label>
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="T.ex. Ny kund: Lindström AB"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Beskrivning</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          placeholder="Kort beskrivning av händelsen"
          className={inputClass}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Kategori (valfri)</label>
          <input
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="T.ex. Nyhet"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-[12px] font-medium text-slate-500 mb-1.5">Datum</label>
          <input
            type="date"
            value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-slate-700 pb-2">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
            />
            Publicerad
          </label>
        </div>
      </div>
      {error && <p className="text-[13px] text-red-600">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors disabled:opacity-60"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? 'Sparar...' : 'Spara'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 text-[13px] font-medium rounded-lg border border-slate-200 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
          Avbryt
        </button>
      </div>
    </div>
  );
}

export function LandingEventsManager({ events }: { events: LandingEvent[] }) {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleSaved = () => {
    setCreating(false);
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ta bort den här händelsen?')) return;
    setDeletingId(id);
    await fetch(`/api/admin/landing-events/${id}`, { method: 'DELETE' });
    setDeletingId(null);
    router.refresh();
  };

  const togglePublished = async (event: LandingEvent) => {
    await fetch(`/api/admin/landing-events/${event.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !event.is_published }),
    });
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {!creating && (
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-medium rounded-lg transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Ny händelse
        </button>
      )}

      {creating && (
        <EventForm onCancel={() => setCreating(false)} onSaved={handleSaved} />
      )}

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {events.map((event) =>
          editingId === event.id ? (
            <div key={event.id} className="p-4">
              <EventForm
                initial={{
                  id: event.id,
                  form: {
                    title: event.title,
                    description: event.description,
                    category: event.category ?? '',
                    event_date: event.event_date,
                    is_published: event.is_published,
                  },
                }}
                onCancel={() => setEditingId(null)}
                onSaved={handleSaved}
              />
            </div>
          ) : (
            <div key={event.id} className="flex items-start justify-between gap-4 p-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-slate-900 text-sm">{event.title}</p>
                  {event.category && (
                    <span className="text-[11px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">{event.category}</span>
                  )}
                  {!event.is_published && (
                    <span className="text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Utkast</span>
                  )}
                </div>
                <p className="text-[13px] text-slate-500 mt-1">{event.description}</p>
                <p className="text-[12px] text-slate-400 mt-1.5">
                  {new Date(event.event_date).toLocaleDateString('sv-SE')}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => togglePublished(event)}
                  title={event.is_published ? 'Avpublicera' : 'Publicera'}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {event.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setEditingId(event.id)}
                  title="Redigera"
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  disabled={deletingId === event.id}
                  title="Ta bort"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )
        )}
        {events.length === 0 && (
          <p className="p-10 text-center text-slate-400 text-sm">Inga händelser ännu</p>
        )}
      </div>
    </div>
  );
}
