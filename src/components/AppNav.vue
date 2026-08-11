<template>
  <nav class="sticky top-0 z-10 flex min-h-9 items-center justify-between bg-paper p-4" aria-label="Navegación de usuario">
    <div class="mr-auto flex items-center gap-3 md:hidden">
      <Button variant="outline" size="icon" aria-label="Abrir navegación" @click="emit('open-sidebar')">
        <MenuIcon :size="17" :stroke-width="1.8" />
      </Button>
      <span class="truncate font-display text-sm font-semibold">
        {{ selectedProject?.name || 'CDN Assets' }}
      </span>
    </div>
    <p class="text-sm font-semibold">Altipla Consulting</p>
    <UserButton v-if="authState.isSignedIn" />
  </nav>
</template>

<script setup lang="ts">
import { UserButton } from '@clerk/vue'
import { MenuIcon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { useProjectsContext } from '@/composables/useProjectsContext'
import { authState } from '@/services/auth-state'

const emit = defineEmits<{
  'open-sidebar': []
}>()

const { selectedProject } = useProjectsContext()
</script>
