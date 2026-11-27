import taskService from '~/services/taskService'
import { apiOrigin, resolveApiUrl } from '~/utils/apiUrl'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const service = taskService({
    apiUrl: resolveApiUrl(`${config.public.apiUrl || apiOrigin()}/tasks/`)
  })

  return {
    provide: {
      taskService: service
    }
  }
})
