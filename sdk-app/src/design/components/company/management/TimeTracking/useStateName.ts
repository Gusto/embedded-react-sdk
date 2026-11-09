import { useTranslation } from 'react-i18next'

export function useStateName() {
  const { t } = useTranslation('common')
  return (abbr: string) => t(`statesHash.${abbr}`, { defaultValue: abbr })
}
