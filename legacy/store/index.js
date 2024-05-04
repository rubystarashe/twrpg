export const usersetting = {
  persist: true,
  version: '6',
  state: () => {
    return {
      preset: ref('default'),
      presets: reactive({
        default: {}
      }),
      targets: reactive({}),
      targetsaves: ref({})
    }
  }
}
