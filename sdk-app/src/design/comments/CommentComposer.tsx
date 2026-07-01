import { useRef, useState } from 'react'
import styles from './comments.module.scss'
import { useComments } from './CommentsContext'
import { COMMENT_CATEGORIES } from './types'
import type { CommentCategory } from './types'
import type { Participant } from './mentions'

interface CommentComposerProps {
  onSubmit: (body: string, category: CommentCategory | null) => Promise<void>
  onCancel: () => void
  withCategory?: boolean
  submitLabel?: string
  autoFocus?: boolean
  placeholder?: string
}

interface MentionState {
  query: string
  start: number
}

function findMention(value: string, caret: number): MentionState | null {
  const upToCaret = value.slice(0, caret)
  const match = /@([\w.-]*)$/.exec(upToCaret)
  if (!match) return null
  return { query: match[1] ?? '', start: caret - (match[1]?.length ?? 0) - 1 }
}

export function CommentComposer({
  onSubmit,
  onCancel,
  withCategory = false,
  submitLabel = 'Comment',
  autoFocus = true,
  placeholder = 'Add a comment… use @ to mention',
}: CommentComposerProps) {
  const { participants } = useComments()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<CommentCategory | ''>('')
  const [busy, setBusy] = useState(false)
  const [mention, setMention] = useState<MentionState | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  const suggestions: Participant[] = mention
    ? participants
        .filter(participant => {
          const query = mention.query.toLowerCase()
          return (
            participant.handle.toLowerCase().includes(query) ||
            participant.name.toLowerCase().includes(query)
          )
        })
        .slice(0, 6)
    : []

  const showSuggestions = mention !== null && suggestions.length > 0

  const syncMention = (value: string, caret: number) => {
    setMention(findMention(value, caret))
    setActiveIndex(0)
  }

  const insertMention = (participant: Participant) => {
    if (!mention) return
    const textarea = textareaRef.current
    const caret = textarea?.selectionStart ?? body.length
    const before = body.slice(0, mention.start)
    const after = body.slice(caret)
    const insertion = `@${participant.handle} `
    const next = before + insertion + after
    setBody(next)
    setMention(null)
    requestAnimationFrame(() => {
      if (!textarea) return
      const position = before.length + insertion.length
      textarea.focus()
      textarea.setSelectionRange(position, position)
    })
  }

  const submit = async () => {
    const trimmed = body.trim()
    if (!trimmed || busy) return
    setBusy(true)
    try {
      await onSubmit(trimmed, category || null)
      setBody('')
      setCategory('')
    } finally {
      setBusy(false)
    }
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions) {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setActiveIndex(index => (index + 1) % suggestions.length)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex(index => (index - 1 + suggestions.length) % suggestions.length)
        return
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        event.preventDefault()
        insertMention(suggestions[activeIndex]!)
        return
      }
      if (event.key === 'Escape') {
        event.preventDefault()
        setMention(null)
        return
      }
    }

    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') void submit()
    if (event.key === 'Escape') onCancel()
  }

  return (
    <div className={styles.composer}>
      <div className={styles.mentionAnchor}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={body}
          autoFocus={autoFocus}
          placeholder={placeholder}
          onChange={event => {
            setBody(event.target.value)
            syncMention(
              event.target.value,
              event.target.selectionStart ?? event.target.value.length,
            )
          }}
          onKeyUp={event =>
            syncMention(event.currentTarget.value, event.currentTarget.selectionStart ?? 0)
          }
          onClick={event =>
            syncMention(event.currentTarget.value, event.currentTarget.selectionStart ?? 0)
          }
          onKeyDown={onKeyDown}
        />
        {showSuggestions ? (
          <ul className={styles.mentionMenu}>
            {suggestions.map((participant, index) => (
              <li key={participant.id}>
                <button
                  type="button"
                  className={`${styles.mentionItem} ${index === activeIndex ? styles.mentionItemActive : ''}`}
                  onMouseDown={event => {
                    event.preventDefault()
                    insertMention(participant)
                  }}
                >
                  {participant.avatar_url ? (
                    <img className={styles.mentionAvatar} src={participant.avatar_url} alt="" />
                  ) : (
                    <span className={styles.mentionAvatar} />
                  )}
                  <span className={styles.mentionHandle}>@{participant.handle}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={styles.formRow}>
        {withCategory ? (
          <select
            className={styles.select}
            value={category}
            onChange={event => setCategory(event.target.value as CommentCategory | '')}
          >
            <option value="">No category</option>
            {COMMENT_CATEGORIES.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        ) : (
          <span className={styles.spacer} />
        )}
        <button
          type="button"
          className={`${styles.button} ${styles.buttonGhost}`}
          onClick={onCancel}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`${styles.button} ${styles.buttonPrimary}`}
          disabled={!body.trim() || busy}
          onClick={() => void submit()}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
