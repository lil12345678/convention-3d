import { createPinia } from 'pinia'
import { userStore } from './modules/app'
import chart from './modules/chart'

const pinia = createPinia()
pinia.use(({ store }) => {
  const initialState = JSON.parse(JSON.stringify(store.$state))
  store.$reset = () => {
    store.$patch(initialState)
  }
})

export default pinia

export { userStore }
