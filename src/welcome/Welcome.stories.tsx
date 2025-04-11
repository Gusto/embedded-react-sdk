import React from 'react'
import type { Story } from '@ladle/react'

export default {
  title: 'Welcome', // This will appear at the top of the sidebar
}

// Styling for the welcome page
const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    marginBottom: '2rem',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 600,
    color: '#333',
    margin: '0 0 0.5rem 0',
  },
  subtitle: {
    fontSize: '1.25rem',
    fontWeight: 400,
    color: '#666',
    margin: '0 0 1rem 0',
  },
  card: {
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: '#333',
    margin: '0 0 1rem 0',
  },
  paragraph: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#444',
    margin: '0 0 1rem 0',
  },
  list: {
    margin: '0 0 1rem 0',
    paddingLeft: '1.5rem',
  },
  listItem: {
    fontSize: '1rem',
    lineHeight: 1.6,
    color: '#444',
    margin: '0.5rem 0',
  },
  link: {
    color: '#0066cc',
    textDecoration: 'none',
    fontWeight: 500,
  },
  footer: {
    fontSize: '0.875rem',
    color: '#666',
    marginTop: '2rem',
    textAlign: 'center' as const,
  },
  logoContainer: {
    textAlign: 'center' as const,
    marginBottom: '1rem',
  },
  logo: {
    height: '120px',
    margin: '0 auto',
  },
  categorySection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '1rem',
    margin: '1.5rem 0',
  },
  categoryCard: {
    border: '1px solid #eaeaea',
    borderRadius: '8px',
    padding: '1rem',
    backgroundColor: '#f9f9f9',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  },
  categoryTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '0.5rem',
  },
  categoryDescription: {
    fontSize: '0.9rem',
    color: '#666',
  },
}

export const Introduction: Story = () => {
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoContainer}>
          <span style={{ fontSize: '4rem' }}>🥄</span>
        </div>
        <h1 style={styles.title}>Welcome to the Component Library</h1>
        <p style={styles.subtitle}>
          A comprehensive collection of React components for building consistent and efficient user
          interfaces
        </p>
      </header>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Getting Started</h2>
        <p style={styles.paragraph}>
          This component library contains all the UI building blocks needed to create a consistent
          user experience across our applications. Browse components using the sidebar navigation on
          the left.
        </p>
        <p style={styles.paragraph}>
          Each component includes examples, documentation, and interactive controls to help you
          understand how they work and how to use them in your projects.
        </p>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>Component Categories</h2>
        <p style={styles.paragraph}>
          Components are organized into logical categories to make them easy to find:
        </p>

        <div style={styles.categorySection}>
          <div style={styles.categoryCard}>
            <div style={styles.categoryTitle}>UI</div>
            <div style={styles.categoryDescription}>
              Core interface components like buttons, cards, and data displays
            </div>
          </div>

          <div style={styles.categoryCard}>
            <div style={styles.categoryTitle}>UI/Form</div>
            <div style={styles.categoryDescription}>
              Form controls, layouts, and complete examples
            </div>
          </div>

          <div style={styles.categoryCard}>
            <div style={styles.categoryTitle}>Utils</div>
            <div style={styles.categoryDescription}>Utility hooks and helper components</div>
          </div>

          <div style={styles.categoryCard}>
            <div style={styles.categoryTitle}>Domain</div>
            <div style={styles.categoryDescription}>
              Business domain-specific components and features
            </div>
          </div>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.sectionTitle}>How to Use This Library</h2>
        <ul style={styles.list}>
          <li style={styles.listItem}>
            <strong>Browse:</strong> Use the sidebar on the left to explore components by category.
          </li>
          <li style={styles.listItem}>
            <strong>Search:</strong> Use the search bar at the top of the sidebar to find specific
            components.
          </li>
          <li style={styles.listItem}>
            <strong>Interact:</strong> Each component page includes interactive examples that
            demonstrate its functionality.
          </li>
          <li style={styles.listItem}>
            <strong>View Code:</strong> Check the &quot;Show Code&quot; option to see the
            implementation details.
          </li>
        </ul>
      </section>

      <footer style={styles.footer}>
        <p>
          &copy; {new Date().getFullYear()} Component Library Documentation · Built with{' '}
          <a
            style={styles.link}
            href="https://www.ladle.dev/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ladle
          </a>
        </p>
      </footer>
    </div>
  )
}
