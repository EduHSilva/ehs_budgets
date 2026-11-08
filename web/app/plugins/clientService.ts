import clientService from '~/services/clientService'
import { apiOrigin, resolveApiUrl } from '~/utils/apiUrl'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const service = clientService({
    apiUrl: resolveApiUrl(`${config.public.apiUrl || apiOrigin()}/budgets/`)
  })

  return {
    provide: {
      clientService: service
    }
  }
})
