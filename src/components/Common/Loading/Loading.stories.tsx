import { Loading } from './Loading'

export default {
  title: 'Common/Loading',
}

export const Default = () => {
  return <Loading />
}

export const WithChildren = () => {
  return <Loading>Child content</Loading>
}
