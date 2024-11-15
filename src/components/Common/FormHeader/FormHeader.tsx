import style from './FormHeader.module.scss'

interface FormHeaderProps {
  heading: string
  subheading?: string
}

export function FormHeader({ heading, subheading }: FormHeaderProps) {
  return (
    <div>
      <h2 className={style.heading}>{heading}</h2>
      <p className={style.subheading}>{subheading}</p>
    </div>
  )
}
