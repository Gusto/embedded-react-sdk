import React from 'react'
import { DEFAULT_PROPS_REGISTRY, type ComponentName } from './defaultPropsRegistry'
import { defaultComponents } from './adapters/defaultComponentAdapter'
import type { ComponentsContextType } from './useComponentContext'

/**
 * Higher-order component that automatically applies default props to a single custom component.
 * This ensures that custom component adapters receive the same default values that
 * the built-in UI components use, without requiring consumers to know about these defaults.
 *
 * @param componentName - The name of the component (must exist in DEFAULT_PROPS_REGISTRY)
 * @param customComponent - The custom component to wrap with defaults
 * @returns A wrapped component that receives default props automatically
 */
export function withAutoDefault(
  componentName: ComponentName,
  customComponent: React.ComponentType<any>,
) {
  const defaults = DEFAULT_PROPS_REGISTRY[componentName]

  const WrappedComponent = (props: any) => {
    // Merge defaults with provided props (provided props override defaults)
    const propsWithDefaults = { ...defaults, ...props }
    return React.createElement(customComponent, propsWithDefaults)
  }

  // Set display name for better debugging
  WrappedComponent.displayName = `withAutoDefault(${componentName})`

  return WrappedComponent
}

/**
 * Enhances a collection of custom components with automatic default props.
 * This is the batch processing version that handles entire component adapters.
 *
 * @param customComponents - Partial component adapter with custom components
 * @returns Complete component adapter with defaults applied to custom components
 */
export function withAutoDefaults(
  customComponents: Partial<ComponentsContextType>,
): ComponentsContextType {
  const enhanced: ComponentsContextType = { ...defaultComponents }

  // For each custom component provided, wrap it with auto-defaults
  Object.entries(customComponents).forEach(([componentName, component]) => {
    const name = componentName as keyof ComponentsContextType

    if (component && DEFAULT_PROPS_REGISTRY && name in DEFAULT_PROPS_REGISTRY) {
      // This is a custom component that has defaults - enhance it
      enhanced[name] = withAutoDefault(
        name as ComponentName,
        component as React.ComponentType<any>,
      ) as any
    } else if (component) {
      // This is a custom component with no defaults - use as-is
      enhanced[name] = component as any
    }
    // If no custom component provided, keep the default
  })

  return enhanced
}
