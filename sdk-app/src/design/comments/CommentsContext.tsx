import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import {
  createComment,
  createReply,
  deleteComment,
  ensurePrototype,
  fetchMe,
  getSubscription,
  listComments,
  resolveComment,
  subscribe,
  unsubscribe,
  unresolveComment,
} from './api'
import { buildTarget } from './anchor'
import { participantsFrom } from './mentions'
import type { Participant } from './mentions'
import type { CommentCategory, SandboxComment, SandboxUser } from './types'

const READ_STORAGE_KEY = 'sdk-app-design-comments-read'
const NOTIFY_STORAGE_KEY = 'sdk-app-design-comments-notify'
const POLL_INTERVAL_MS = 30_000

export interface CommentToast {
  key: number
  authorName: string
  routePath: string
  body: string
}

interface DraftState {
  x: number
  y: number
  target: ReturnType<typeof buildTarget>
}

interface CommentsContextValue {
  ready: boolean
  me: SandboxUser | null
  authorized: boolean
  canWrite: boolean
  prototypeId: number | null
  routePath: string
  comments: SandboxComment[]
  loading: boolean
  error: string | null

  active: boolean
  setActive: (value: boolean) => void
  placing: boolean
  startPlacing: () => void
  cancelPlacing: () => void
  draft: DraftState | null
  setDraftAt: (clientX: number, clientY: number, container: HTMLElement) => void
  clearDraft: () => void
  selectedId: number | null
  select: (id: number | null) => void
  trayOpen: boolean
  setTrayOpen: (value: boolean) => void

  refresh: () => Promise<void>
  submitComment: (body: string, category: CommentCategory | null) => Promise<void>
  submitReply: (parentId: number, body: string) => Promise<void>
  toggleResolve: (comment: SandboxComment) => Promise<void>
  removeComment: (comment: SandboxComment) => Promise<void>

  isUnread: (comment: SandboxComment) => boolean
  threadHasUnread: (comment: SandboxComment) => boolean
  unreadCount: number
  markRead: (comment: SandboxComment) => void
  markAllRead: () => void

  participants: Participant[]
  subscribed: boolean
  toggleSubscription: () => Promise<void>
  toasts: CommentToast[]
  dismissToast: (key: number) => void
  notificationsEnabled: boolean
  toggleNotifications: () => void
}

const CommentsContext = createContext<CommentsContextValue | null>(null)

function readSeenMap(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(READ_STORAGE_KEY) ?? '{}') as Record<number, string>
  } catch {
    return {}
  }
}

function flatten(comments: SandboxComment[]): SandboxComment[] {
  return comments.flatMap(comment => [comment, ...(comment.replies ?? [])])
}

export function CommentsProvider({ children }: { children: ReactNode }) {
  const routePath = useLocation().pathname

  const [me, setMe] = useState<SandboxUser | null>(null)
  const [prototypeId, setPrototypeId] = useState<number | null>(null)
  const [comments, setComments] = useState<SandboxComment[]>([])
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [active, setActive] = useState(false)
  const [placing, setPlacing] = useState(false)
  const [draft, setDraft] = useState<DraftState | null>(null)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [trayOpen, setTrayOpen] = useState(false)

  const [seen, setSeen] = useState<Record<number, string>>(() => readSeenMap())

  const [allComments, setAllComments] = useState<SandboxComment[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [subscribed, setSubscribed] = useState(false)
  const [toasts, setToasts] = useState<CommentToast[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    () => localStorage.getItem(NOTIFY_STORAGE_KEY) !== '0',
  )

  const canWrite = Boolean(me?.can_write)

  // The dev-server proxy only injects an internal WARP / Cloudflare Access
  // token, so `me` is populated only for an authenticated Gusto employee. Gate
  // the entire tool (UI + data) on that — without auth there's nothing to see.
  const authorized = ready && me !== null && me.email.toLowerCase().endsWith('@gusto.com')

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [user, prototype] = await Promise.all([fetchMe(), ensurePrototype()])
        if (cancelled) return
        setMe(user)
        setPrototypeId(prototype.id)
        if (user?.can_write) {
          void getSubscription(prototype.id).then(value => {
            if (!cancelled) setSubscribed(value)
          })
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setReady(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const loadComments = useCallback(async () => {
    if (prototypeId === null || !authorized) return
    setLoading(true)
    setError(null)
    try {
      const data = await listComments(prototypeId, routePath)
      setComments(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [prototypeId, routePath, authorized])

  useEffect(() => {
    void loadComments()
  }, [loadComments])

  // Prototype-wide directory drives the participant list (for @mentions), the
  // cross-design unread badge, and new-comment toast detection.
  const knownRef = useRef<Map<number, string> | null>(null)
  const meRef = useRef<SandboxUser | null>(null)
  meRef.current = me
  const notifyRef = useRef(notificationsEnabled)
  notifyRef.current = notificationsEnabled

  const loadDirectory = useCallback(async () => {
    if (prototypeId === null || !authorized) return
    let all: SandboxComment[]
    try {
      all = await listComments(prototypeId)
    } catch {
      return
    }
    setAllComments(all)
    setParticipants(participantsFrom(all))

    const flat = all.flatMap(comment => [comment, ...(comment.replies ?? [])])
    const previous = knownRef.current
    const next = new Map<number, string>()
    for (const item of flat) next.set(item.id, item.updated_at)

    if (previous && notifyRef.current) {
      const fresh = flat.filter(
        item => item.user.id !== meRef.current?.id && previous.get(item.id) !== item.updated_at,
      )
      if (fresh.length > 0) {
        setToasts(current => [
          ...current,
          ...fresh.slice(-3).map(item => ({
            key: Date.now() + item.id,
            authorName: item.user.name.split('@')[0] ?? item.user.name,
            routePath: item.route.path,
            body: item.body,
          })),
        ])
      }
    }
    knownRef.current = next
  }, [prototypeId, authorized])

  useEffect(() => {
    if (prototypeId === null) return
    void loadDirectory()
    const interval = setInterval(() => void loadDirectory(), POLL_INTERVAL_MS)
    const onFocus = () => void loadDirectory()
    window.addEventListener('focus', onFocus)
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', onFocus)
    }
  }, [prototypeId, loadDirectory])

  const dismissToast = useCallback((key: number) => {
    setToasts(current => current.filter(toast => toast.key !== key))
  }, [])

  const toggleNotifications = useCallback(() => {
    setNotificationsEnabled(current => {
      const next = !current
      try {
        localStorage.setItem(NOTIFY_STORAGE_KEY, next ? '1' : '0')
      } catch {
        /* ignore storage availability errors */
      }
      if (!next) setToasts([])
      return next
    })
  }, [])

  const toggleSubscription = useCallback(async () => {
    if (prototypeId === null) return
    if (subscribed) {
      await unsubscribe(prototypeId)
      setSubscribed(false)
    } else {
      await subscribe(prototypeId)
      setSubscribed(true)
    }
  }, [prototypeId, subscribed])

  // Reset transient interaction state when navigating between designs.
  useEffect(() => {
    setDraft(null)
    setPlacing(false)
    setSelectedId(null)
  }, [routePath])

  const refresh = useCallback(async () => {
    await Promise.all([loadComments(), loadDirectory()])
  }, [loadComments, loadDirectory])

  const startPlacing = useCallback(() => {
    setActive(true)
    setSelectedId(null)
    setDraft(null)
    setPlacing(true)
  }, [])

  const cancelPlacing = useCallback(() => setPlacing(false), [])
  const clearDraft = useCallback(() => setDraft(null), [])

  const setDraftAt = useCallback((clientX: number, clientY: number, container: HTMLElement) => {
    const target = buildTarget(clientX, clientY)
    const rect = container.getBoundingClientRect()
    setDraft({ x: clientX - rect.left, y: clientY - rect.top, target })
    setPlacing(false)
  }, [])

  const select = useCallback((id: number | null) => {
    setSelectedId(id)
    if (id !== null) setActive(true)
  }, [])

  const submitComment = useCallback(
    async (body: string, category: CommentCategory | null) => {
      if (prototypeId === null || !draft) return
      const created = await createComment(prototypeId, {
        routePath,
        body,
        category,
        xPosition: draft.x,
        yPosition: draft.y,
        target: draft.target,
      })
      setDraft(null)
      await Promise.all([loadComments(), loadDirectory()])
      setSelectedId(created.id)
    },
    [prototypeId, draft, routePath, loadComments, loadDirectory],
  )

  const submitReply = useCallback(
    async (parentId: number, body: string) => {
      if (prototypeId === null) return
      await createReply(prototypeId, parentId, body)
      await Promise.all([loadComments(), loadDirectory()])
    },
    [prototypeId, loadComments, loadDirectory],
  )

  const toggleResolve = useCallback(
    async (comment: SandboxComment) => {
      if (prototypeId === null) return
      if (comment.resolved) await unresolveComment(prototypeId, comment.id)
      else await resolveComment(prototypeId, comment.id)
      await loadComments()
    },
    [prototypeId, loadComments],
  )

  const removeComment = useCallback(
    async (comment: SandboxComment) => {
      if (prototypeId === null) return
      await deleteComment(prototypeId, comment.id)
      if (selectedId === comment.id) setSelectedId(null)
      await loadComments()
    },
    [prototypeId, loadComments, selectedId],
  )

  const isUnread = useCallback(
    (comment: SandboxComment) => {
      if (me && comment.user.id === me.id) return false
      return seen[comment.id] !== comment.updated_at
    },
    [seen, me],
  )

  // A thread counts as unread if the top-level comment or any of its replies is
  // unread, so a new reply lights up its pin/row (matching the badge count).
  const threadHasUnread = useCallback(
    (comment: SandboxComment) =>
      isUnread(comment) || (comment.replies ?? []).some(isUnread),
    [isUnread],
  )

  const persistSeen = useCallback((next: Record<number, string>) => {
    setSeen(next)
    try {
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(next))
    } catch {
      /* ignore quota/availability errors */
    }
  }, [])

  const markRead = useCallback(
    (comment: SandboxComment) => {
      const next = { ...seen }
      for (const item of [comment, ...(comment.replies ?? [])]) {
        next[item.id] = item.updated_at
      }
      persistSeen(next)
    },
    [seen, persistSeen],
  )

  const markAllRead = useCallback(() => {
    const next = { ...seen }
    for (const item of flatten(comments)) next[item.id] = item.updated_at
    persistSeen(next)
  }, [seen, comments, persistSeen])

  const unreadCount = useMemo(
    () => flatten(allComments).filter(isUnread).length,
    [allComments, isUnread],
  )

  // Mark a comment read once its thread is opened.
  const selectedRef = useRef<number | null>(null)
  useEffect(() => {
    if (selectedId === null || selectedId === selectedRef.current) return
    selectedRef.current = selectedId
    const found = comments.find(comment => comment.id === selectedId)
    if (found) markRead(found)
  }, [selectedId, comments, markRead])

  const value: CommentsContextValue = {
    ready,
    me,
    authorized,
    canWrite,
    prototypeId,
    routePath,
    comments,
    loading,
    error,
    active,
    setActive,
    placing,
    startPlacing,
    cancelPlacing,
    draft,
    setDraftAt,
    clearDraft,
    selectedId,
    select,
    trayOpen,
    setTrayOpen,
    refresh,
    submitComment,
    submitReply,
    toggleResolve,
    removeComment,
    isUnread,
    threadHasUnread,
    unreadCount,
    markRead,
    markAllRead,
    participants,
    subscribed,
    toggleSubscription,
    toasts,
    dismissToast,
    notificationsEnabled,
    toggleNotifications,
  }

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>
}

export function useComments(): CommentsContextValue {
  const context = useContext(CommentsContext)
  if (!context) throw new Error('useComments must be used within a CommentsProvider')
  return context
}
