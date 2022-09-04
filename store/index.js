export const usersetting = {
  persist: true,
  state: () => {
    return { target: reactive({}), targetsave: ref({}) }
  }
}
