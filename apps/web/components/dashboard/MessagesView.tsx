'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { messagesApi, ContactDto, ConversationDto, MessageDto, ApiError } from '../../lib/api';

export function MessagesView() {
  const { token, user } = useAuth();
  const [contacts, setContacts] = useState<ContactDto[]>([]);
  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [thread, setThread] = useState<MessageDto[] | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const loadLists = () => {
    if (!token) return;
    messagesApi.contacts(token).then(setContacts).catch(() => setContacts([]));
    messagesApi.conversations(token).then(setConversations).catch(() => setConversations([]));
  };

  useEffect(loadLists, [token]);

  const loadThread = (partnerId: string) => {
    if (!token) return;
    setActiveId(partnerId);
    messagesApi
      .thread(token, partnerId)
      .then((msgs) => {
        setThread(msgs);
        setTimeout(() => bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight }), 50);
        loadLists();
      })
      .catch(() => setThread([]));
  };

  const handleSend = async () => {
    if (!token || !activeId || !draft.trim()) return;
    setSending(true);
    setError(null);
    try {
      await messagesApi.send(token, activeId, draft.trim());
      setDraft('');
      loadThread(activeId);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Envoi impossible.');
    } finally {
      setSending(false);
    }
  };

  // Fusionne les contacts autorisés avec les conversations déjà entamées
  const people = new Map<string, { id: string; name: string; preview?: string; unread: number }>();
  contacts.forEach((c) => people.set(c.id, { id: c.id, name: `${c.firstName} ${c.lastName}`, unread: 0 }));
  conversations.forEach((c) =>
    people.set(c.partner.id, {
      id: c.partner.id,
      name: `${c.partner.firstName} ${c.partner.lastName}`,
      preview: c.lastBody,
      unread: c.unread,
    }),
  );
  const peopleList = Array.from(people.values());

  return (
    <div>
      <div className="course-header">
        <h1>Messagerie</h1>
        <p>Échangez directement avec vos {user?.role === 'TEACHER' ? 'étudiants' : 'enseignants'}.</p>
      </div>

      <div className="msg-grid">
        <div className="msg-list">
          {peopleList.length === 0 ? (
            <div className="msg-empty">Aucun contact disponible.</div>
          ) : (
            peopleList.map((p) => (
              <div
                key={p.id}
                className={`msg-contact${activeId === p.id ? ' active' : ''}`}
                onClick={() => loadThread(p.id)}
              >
                <span
                  className="avatar"
                  style={{ width: 32, height: 32, fontSize: 12 }}
                >
                  {p.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                </span>
                <div>
                  <div className="name">{p.name}</div>
                  {p.preview && <div className="preview">{p.preview}</div>}
                </div>
                {p.unread > 0 && <span className="unread-dot" />}
              </div>
            ))
          )}
        </div>

        <div className="msg-thread">
          {!activeId ? (
            <div className="msg-empty">Sélectionnez une personne pour démarrer la conversation.</div>
          ) : (
            <>
              <div className="msg-thread-body" ref={bodyRef}>
                {thread === null ? (
                  <div className="msg-empty">Chargement…</div>
                ) : thread.length === 0 ? (
                  <div className="msg-empty">Aucun message. Écrivez le premier !</div>
                ) : (
                  thread.map((m) => (
                    <div key={m.id} className={`msg-bubble ${m.senderId === activeId ? 'theirs' : 'mine'}`}>
                      {m.body}
                      <span className="time">
                        {new Date(m.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <div className="msg-composer">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Écrire un message…"
                />
                <button className="btn btn-primary btn-sm" disabled={sending} onClick={handleSend}>
                  Envoyer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 10 }}>{error}</p>}
    </div>
  );
}
