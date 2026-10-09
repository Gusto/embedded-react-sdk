import React from 'react'

export function DocCardList({ items }) {
  return (
    <ul className="doc-cards">
      {items.map(item => (
        <li key={item.href}>
          <a href={item.href}>{item.label}</a>
          {item.description && <p>{item.description}</p>}
          {item.customProps?.footer && <p className="doc-card-footer">{item.customProps.footer}</p>}
        </li>
      ))}
    </ul>
  )
}
