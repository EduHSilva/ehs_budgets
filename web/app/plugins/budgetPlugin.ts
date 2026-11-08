import budgetService from '~/services/budgetService'
import { apiOrigin, resolveApiUrl } from '~/utils/apiUrl'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const service = budgetService({
    apiUrl: resolveApiUrl(`${config.public.apiUrl || apiOrigin()}/budgets/`)
  })

  return {
    provide: {
      budgetService: service
    }
  }
})
