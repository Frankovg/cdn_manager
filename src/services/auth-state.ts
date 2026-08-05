import { reactive } from 'vue'

export const authState = reactive({
  isLoaded: false,
  isSignedIn: false,
  userId: null as string | null,
})

export function setAuthState(next: Partial<typeof authState>): void {
  Object.assign(authState, next)
}
