export default {
  namespaced: true,
  state: () => ({
    chartData: null,
    loading: false,
  }),
  mutations: {
    SET_CHART_DATA(state, payload) {
      state.chartData = payload
    },
    SET_LOADING(state, status) {
      state.loading = status
    },
  },
  actions: {
    async fetchChartData({ commit }) {
      commit('SET_LOADING', true)
      try {
        const res = await fetch('/api/chart-data')
        const data = await res.json()
        commit('SET_CHART_DATA', data)
      } catch (error) {
        console.error(error)
      } finally {
        commit('SET_LOADING', false)
      }
    },
  },
}
