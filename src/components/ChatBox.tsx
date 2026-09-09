import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle, ScanLine, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { SheetMusicScanner } from '@/components/SheetMusicScanner';

const MESSAGE_COLUMNS = 'id, match_id, sender_role, sender_email, body, created_at, read, attachment_url, attachment_name';

export interface MatchMessage {
  id: string;
  match_id: string;
  sender_role: 'volunteer' | 'parent';
  sender_email: string;
  body: string;
  created_at: string;
  read: boolean;
  attachment_url?: string | null;
  attachment_name?: string | null;
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const POLL_INTERVAL_MS = 6000;
const UNREAD_POLL_INTERVAL_MS = 8000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// A small blue dot for "this conversation/tab has an unread message."
export function UnreadDot({ className = '' }: { className?: string }) {
  return <span className={`inline-block w-2 h-2 rounded-full bg-secondary ${className}`} aria-label="Unread" />;
}

// Tracks, for a set of matches, which ones have an unread message from the
// counterpart role - drives the dot on the Chat tab and on each conversation
// in the list. Polls rather than subscribing per-match, since this needs to
// stay accurate even for conversations that aren't currently open.
export function useUnreadMatches(matchIds: string[], counterpartRole: 'volunteer' | 'parent') {
  const [unread, setUnread] = useState<Set<string>>(new Set());
  const key = matchIds.join(',');

  const refresh = async () => {
    if (matchIds.length === 0) {
      setUnread(new Set());
      return;
    }
    const { data } = await supabase
      .from('match_messages')
      .select('match_id')
      .in('match_id', matchIds)
      .eq('sender_role', counterpartRole)
      .eq('read', false);
    setUnread(new Set((data || []).map((m) => m.match_id)));
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, UNREAD_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, counterpartRole]);

  const markRead = (matchId: string) => {
    setUnread((prev) => {
      if (!prev.has(matchId)) return prev;
      const next = new Set(prev);
      next.delete(matchId);
      return next;
    });
  };

  return { unread, markRead, refresh };
}

export function ChatBox({
  matchId,
  currentRole,
  currentEmail,
  counterpartName,
  counterpartSubtitle,
  unread = false,
  onRead,
}: {
  matchId: string;
  currentRole: 'volunteer' | 'parent';
  currentEmail: string;
  counterpartName: string;
  counterpartSubtitle?: string;
  unread?: boolean;
  onRead?: () => void;
}) {
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const counterpartRole: 'volunteer' | 'parent' = currentRole === 'volunteer' ? 'parent' : 'volunteer';

  const appendMessage = (msg: MatchMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  };

  const markAsRead = async () => {
    const { error: updateError } = await supabase
      .from('match_messages')
      .update({ read: true })
      .eq('match_id', matchId)
      .eq('sender_role', counterpartRole)
      .eq('read', false);
    if (!updateError) onRead?.();
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('match_messages')
      .select(MESSAGE_COLUMNS)
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
    markAsRead();
  };

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    loadMessages().then(() => setLoading(false));

    const channel = supabase
      .channel(`match_messages:${matchId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'match_messages', filter: `match_id=eq.${matchId}` },
        (payload) => {
          appendMessage(payload.new as MatchMessage);
          markAsRead();
        }
      )
      .subscribe();

    // Realtime is a nice-to-have; polling guarantees messages still show up
    // even if the project's realtime publication isn't picking this table up.
    const interval = setInterval(loadMessages, POLL_INTERVAL_MS);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    setError('');
    const { data, error: insertError } = await supabase
      .from('match_messages')
      .insert({ match_id: matchId, sender_role: currentRole, sender_email: currentEmail, body })
      .select(MESSAGE_COLUMNS)
      .single();
    setSending(false);
    if (insertError || !data) {
      setError('Your message could not be sent. Please try again.');
      return;
    }
    setDraft('');
    appendMessage(data);
  };

  const sendAttachment = async (blob: Blob) => {
    setShowScanner(false);
    setUploading(true);
    setError('');
    try {
      const path = `${matchId}/${randomId()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(path, blob, { contentType: 'image/jpeg', cacheControl: '3600' });
      if (uploadError) throw uploadError;

      const { data: pub } = supabase.storage.from('chat-attachments').getPublicUrl(path);

      const { data, error: insertError } = await supabase
        .from('match_messages')
        .insert({
          match_id: matchId,
          sender_role: currentRole,
          sender_email: currentEmail,
          body: '',
          attachment_url: pub.publicUrl,
          attachment_name: 'Sheet music scan',
        })
        .select(MESSAGE_COLUMNS)
        .single();
      if (insertError || !data) throw insertError;
      appendMessage(data);
    } catch {
      setError('Your scan could not be sent. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col border border-border rounded-sm bg-background h-[520px]">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4 shrink-0">
        <MessageCircle className="w-5 h-5 text-secondary" strokeWidth={1.5} />
        <div>
          <p className="font-display text-base tracking-tight flex items-center gap-1.5">
            {counterpartName}
            {unread && <UnreadDot />}
          </p>
          {counterpartSubtitle && <p className="text-xs text-foreground/50">{counterpartSubtitle}</p>}
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <p className="text-sm text-foreground/50 text-center mt-8">
            No messages yet. Say hello to {counterpartName}!
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_role === currentRole;
            return (
              <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-sm px-3.5 py-2.5 text-sm ${
                    isMine
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {m.attachment_url && (
                    <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="block -mx-1 -mt-0.5 mb-1.5">
                      <img
                        src={m.attachment_url}
                        alt={m.attachment_name || 'Attachment'}
                        className="rounded-sm max-h-64 w-auto border border-black/10"
                      />
                    </a>
                  )}
                  {m.body && <p className="leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>}
                  <p className={`mt-1 text-[11px] ${isMine ? 'text-primary-foreground/70' : 'text-foreground/50'}`}>
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-border px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          disabled={uploading}
          title="Scan sheet music"
          className="shrink-0 inline-flex items-center justify-center w-10 h-10 border border-input rounded-sm hover:bg-muted transition-colors disabled:opacity-40"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanLine className="w-4 h-4" />}
        </button>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={`Message ${counterpartName}...`}
          className="flex-1 px-3.5 py-2.5 text-sm border border-input rounded-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-cta text-cta-foreground text-sm font-semibold rounded-sm hover:bg-cta/90 transition-colors disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      {error && <p className="px-5 pb-3 text-xs text-destructive">{error}</p>}

      {showScanner && (
        <SheetMusicScanner onCapture={sendAttachment} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
