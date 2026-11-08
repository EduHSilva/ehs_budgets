import dashboardService from '~/services/dashboardService'
import { apiOrigin, resolveApiUrl } from '~/utils/apiUrl'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const service = dashboardService({
    apiUrl: resolveApiUrl(`${config.public.apiUrl || apiOrigin()}/budgets/`)
  })

  return {
    provide: {
      dashboardService: service
    }
  }
})
