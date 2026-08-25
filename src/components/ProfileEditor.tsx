import { useRef, useState } from 'react';
import { Camera, Save, Loader2, Heart, Lightbulb, BookOpen, Music } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const instrumentOptions = [
  'Piano / Keys',
  'Violin',
  'Viola',
  'Cello',
  'Flute',
  'Clarinet',
  'Voice',
  'Other',
];

const studentInstrumentOptions = [...instrumentOptions, 'Not sure yet'];

interface ProfileEditorProps {
  kind: 'volunteer' | 'student';
  initialBio?: string;
  initialImageUrl?: string;
  initialHobbies?: string;
  initialTeachingMethods?: string;
  initialLearningStyle?: string;
  initialInstruments?: string;
  onSaved?: () => void;
}

export function ProfileEditor({
  kind,
  initialBio = '',
  initialImageUrl = '',
  initialHobbies = '',
  initialTeachingMethods = '',
  initialLearningStyle = '',
  initialInstruments = '',
  onSaved,
}: ProfileEditorProps) {
  const [bio, setBio] = useState(initialBio);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [hobbies, setHobbies] = useState(initialHobbies);
  const [teachingMethods, setTeachingMethods] = useState(initialTeachingMethods);
  const [learningStyle, setLearningStyle] = useState(initialLearningStyle);
  const [instruments, setInstruments] = useState<string[]>(() => {
    const parsed = initialInstruments
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return parsed.length > 0 ? parsed : [];
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const bucket = kind === 'volunteer' ? 'volunteer-profiles' : 'student-profiles';
  const opts = kind === 'volunteer' ? instrumentOptions : studentInstrumentOptions;

  const toggleInstrument = (opt: string) => {
    setInstruments((prev) => {
      let next = prev.includes(opt)
        ? prev.filter((i) => i !== opt)
        : [...prev, opt];
      if (kind === 'student') {
        if (opt === 'Not sure yet' && next.includes(opt)) {
          next = [opt];
        } else if (opt !== 'Not sure yet' && next.includes(opt)) {
          next = next.filter((i) => i !== 'Not sure yet');
        }
      }
      return next;
    });
  };

  const handlePhoto = async (file: File) => {
    setUploading(true);
    setError('');
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not signed in');

      const ext = file.name.split('.').pop();
      const path = `${userId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { cacheControl: '3600', upsert: true });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
      setImageUrl(pub.publicUrl);
    } catch {
      setError('Could not upload photo. Please try a smaller image.');
    } finally {
      setUploading(false);
    }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    const instrumentsStr = instruments.join(', ');
    try {
      if (kind === 'volunteer') {
        const { data } = await supabase.rpc('update_volunteer_profile', {
          p_bio: bio,
          p_image_url: imageUrl,
          p_hobbies: hobbies,
          p_teaching_methods: teachingMethods,
          p_instrument_specialty: instrumentsStr,
        });
        if (!data) throw new Error('Save failed');
      } else {
        const { data } = await supabase.rpc('update_student_profile', {
          p_hobbies: hobbies,
          p_learning_style: learningStyle,
          p_image_url: imageUrl,
          p_instrument_interest: instrumentsStr,
        });
        if (!data) throw new Error('Save failed');
      }
      setSaved(true);
      onSaved?.();
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-6">
      {/* Profile photo */}
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border-2 border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center border-2 border-border">
              <Camera className="w-7 h-7 text-foreground/40" strokeWidth={1.5} />
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border rounded-sm hover:bg-muted transition-colors disabled:opacity-40"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {imageUrl ? 'Change photo' : 'Add a photo'}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePhoto(f);
            }}
          />
        </div>
      </div>

      {/* Instrument selection */}
      <div>
        <label className="text-sm font-medium text-foreground/70 flex items-center gap-1.5">
          <Music className="w-4 h-4" />
          {kind === 'volunteer' ? 'Instruments you teach' : 'Instruments your child wants to learn'}
        </label>
        <p className="mt-1 text-xs text-foreground/50">Choose all that apply.</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {opts.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleInstrument(opt)}
              className={`px-4 py-2.5 text-sm font-medium rounded-sm border transition-colors ${
                instruments.includes(opt)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:bg-muted'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {kind === 'volunteer' && (
        <ProfileField
          icon={<BookOpen className="w-4 h-4" />}
          label="About you"
          placeholder="Tell your students a bit about yourself and your musical journey."
          value={bio}
          onChange={setBio}
          rows={4}
        />
      )}

      <ProfileField
        icon={<Heart className="w-4 h-4" />}
        label={kind === 'volunteer' ? 'What you like to do' : 'What your child likes to do'}
        placeholder={
          kind === 'volunteer'
            ? 'Hobbies and interests outside of music...'
            : 'Hobbies, favorite activities, games, shows...'
        }
        value={hobbies}
        onChange={setHobbies}
        rows={3}
      />

      {kind === 'volunteer' ? (
        <ProfileField
          icon={<Lightbulb className="w-4 h-4" />}
          label="Your teaching methods"
          placeholder="How do you approach lessons? What helps kids learn best in your experience?"
          value={teachingMethods}
          onChange={setTeachingMethods}
          rows={3}
        />
      ) : (
        <ProfileField
          icon={<Lightbulb className="w-4 h-4" />}
          label="How your child learns best"
          placeholder="Does your child learn by watching, by doing, by listening? Any tips for their teacher?"
          value={learningStyle}
          onChange={setLearningStyle}
          rows={3}
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-40"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save profile'}
        </button>
        {saved && (
          <span className="text-sm text-green-700 font-medium">Profile saved!</span>
        )}
      </div>
    </form>
  );
}

function ProfileField({
  icon,
  label,
  placeholder,
  value,
  onChange,
  rows,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  rows: number;
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground/70 flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1.5 w-full px-4 py-2.5 border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring text-sm leading-relaxed"
      />
    </div>
  );
}
