import style from './Grid.module.scss'

export interface GridProps {
  children: React.ReactNode
}
export function Grid({ children }: GridProps) {
  return <div className={style.grid}>{children}</div>
}
