import { BookOpen, Heart, Lightbulb, Music, Mail, Phone, Users, Calendar } from 'lucide-react';

export interface VolunteerProfileView {
  kind: 'volunteer';
  full_name: string;
  instrument_specialty: string;
  experience_years: number;
  email: string;
  phone?: string;
  bio?: string;
  profile_bio?: string;
  profile_image_url?: string;
  profile_hobbies?: string;
  profile_teaching_methods?: string;
}

export interface StudentProfileView {
  kind: 'student';
  child_name: string;
  child_age: number;
  instrument_interest?: string;
  parent_name: string;
  parent_email: string;
  notes?: string;
  profile_image_url?: string;
  profile_hobbies?: string;
  profile_learning_style?: string;
}

export function ProfileCard({
  profile,
}: {
  profile: VolunteerProfileView | StudentProfileView;
}) {
  const isVolunteer = profile.kind === 'volunteer';
  const v = profile as VolunteerProfileView;
  const s = profile as StudentProfileView;
  const image = isVolunteer ? v.profile_image_url : s.profile_image_url;
  const name = isVolunteer ? v.full_name : s.child_name;
  const subtitle = isVolunteer
    ? v.instrument_specialty
    : `Age ${s.child_age}`;
  const bio = isVolunteer ? (v.profile_bio || v.bio) : undefined;
  const hobbies = isVolunteer ? v.profile_hobbies : s.profile_hobbies;
  const extra = isVolunteer ? v.profile_teaching_methods : s.profile_learning_style;
  const extraLabel = isVolunteer ? 'Teaching methods' : 'How they learn best';

  return (
    <div className="space-y-5">
      {/* Header with photo */}
      <div className="flex items-center gap-4">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-16 h-16 rounded-full object-cover border-2 border-border shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-border shrink-0">
            <Users className="w-7 h-7 text-foreground/40" strokeWidth={1.5} />
          </div>
        )}
        <div>
          <h4 className="font-display text-2xl tracking-tight text-primary">{name}</h4>
          <p className="text-sm text-foreground/60 mt-0.5">{subtitle}</p>
        </div>
      </div>

      {/* Basic info rows */}
      <div className="space-y-3">
        {isVolunteer && (
          <>
            <InfoRow icon={<Music className="w-4 h-4" />} label="Specialty" value={v.instrument_specialty} />
            <InfoRow icon={<Calendar className="w-4 h-4" />} label="Experience" value={`${v.experience_years} years`} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Email" value={v.email} />
            {v.phone && <InfoRow icon={<Phone className="w-4 h-4" />} label="Phone" value={v.phone} />}
          </>
        )}
        {!isVolunteer && (
          <>
            <InfoRow icon={<Music className="w-4 h-4" />} label="Instrument interest" value={s.instrument_interest || 'Not specified'} />
            <InfoRow icon={<Users className="w-4 h-4" />} label="Parent / guardian" value={s.parent_name} />
            <InfoRow icon={<Mail className="w-4 h-4" />} label="Parent email" value={s.parent_email} />
          </>
        )}
      </div>

      {/* Bio (volunteer only) */}
      {bio && (
        <ProfileSection icon={<BookOpen className="w-3.5 h-3.5" />} label="About">
          {bio}
        </ProfileSection>
      )}

      {/* Hobbies */}
      {hobbies && (
        <ProfileSection icon={<Heart className="w-3.5 h-3.5" />} label="What they like to do">
          {hobbies}
        </ProfileSection>
      )}

      {/* Teaching methods / Learning style */}
      {extra && (
        <ProfileSection icon={<Lightbulb className="w-3.5 h-3.5" />} label={extraLabel}>
          {extra}
        </ProfileSection>
      )}

      {/* Notes from parent (student only) */}
      {!isVolunteer && s.notes && (
        <ProfileSection icon={<BookOpen className="w-3.5 h-3.5" />} label="Notes from parent">
          {s.notes}
        </ProfileSection>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-foreground/40 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-foreground/50">{label}</p>
        <p className="text-sm font-medium text-foreground/90">{value}</p>
      </div>
    </div>
  );
}

function ProfileSection({ icon, label, children }: { icon: React.ReactNode; label: string; children: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-1.5">
        {icon} {label}
      </p>
      <p className="text-sm text-foreground/70 leading-relaxed bg-muted/40 rounded-sm p-3">{children}</p>
    </div>
  );
}
