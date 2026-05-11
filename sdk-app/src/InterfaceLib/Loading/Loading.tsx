import { Loading as SDKLoading } from '@/components/Common/Loading/Loading'

export interface LoadingProps {
  children?: React.ReactNode
}

export function Loading({ children }: LoadingProps) {
  return <SDKLoading>{children}</SDKLoading>
}
