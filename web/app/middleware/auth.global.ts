import { useUser } from '~/plugins/userService'
import { getTokenCookie } from '~/utils/util'

export default defineNuxtRouteMiddleware(async (to) => {
  const URLS_NO_LOGIN = ['/auth/login', '/auth/register', '/']

  // Link público de aprovação: o cliente abre sem conta, autenticado pelo token.
  if (URLS_NO_LOGIN.includes(to.path) || to.path.startsWith('/approval/')) {
    return
  }

  const user = useUser()
  const { $userService } = useNuxtApp()
  const token = getTokenCookie()

  if (user.value) return
  try {
    const response = await $userService.getUser()
    user.value = response.data
    if (response.data?.token) {
      token.value = { token: response.data.token }
    }
  } catch (e) {
    console.error(e)
    token.value = { token: null }
    return navigateTo('/auth/login')
  }
})
