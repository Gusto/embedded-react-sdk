import { lazy, Suspense } from 'react'

const IndustrySelect = lazy(() => import('./IndustrySelect'))

export const Industry = () => {
  return (
    <Suspense fallback={<h1>loadin....</h1>}>
      <IndustrySelect />
    </Suspense>
  )
}
