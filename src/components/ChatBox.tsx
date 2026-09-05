import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export interface MatchMessage {
  id: string;
  match_id: string;
  sender_role: 'volunteer' | 'parent';
  sender_email: string;
  body: string;
  created_at: string;
}

const POLL_INTERVAL_MS = 6000;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ChatBox({
  matchId,
  currentRole,
  currentEmail,
  counterpartName,
  counterpartSubtitle,
}: {
  matchId: string;
  currentRole: 'volunteer' | 'parent';
  currentEmail: string;
  counterpartName: string;
  counterpartSubtitle?: string;
}) {
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const appendMessage = (msg: MatchMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('match_messages')
      .select('id, match_id, sender_role, sender_email, body, created_at')
      .eq('match_id', matchId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
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
        (payload) => appendMessage(payload.new as MatchMessage)
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
      .select('id, match_id, sender_role, sender_email, body, created_at')
      .single();
    setSending(false);
    if (insertError || !data) {
      setError('Your message could not be sent. Please try again.');
      return;
    }
    setDraft('');
    appendMessage(data);
  };

  return (
    <div className="flex flex-col border border-border rounded-sm bg-background h-[520px]">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4 shrink-0">
        <MessageCircle className="w-5 h-5 text-secondary" strokeWidth={1.5} />
        <div>
          <p className="font-display text-base tracking-tight">{counterpartName}</p>
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
                  <p className="leading-relaxed whitespace-pre-wrap break-words">{m.body}</p>
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
    </div>
  );
}
