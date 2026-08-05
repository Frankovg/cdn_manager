<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { XIcon } from "lucide-vue-next"
import { reactiveOmit } from "@vueuse/core"
import {
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from "reka-ui"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type SheetSide = "top" | "right" | "bottom" | "left"

const props = withDefaults(
  defineProps<
    DialogContentProps & {
      class?: HTMLAttributes["class"]
      side?: SheetSide
      showCloseButton?: boolean
    }
  >(),
  {
    side: "right",
    showCloseButton: true,
  },
)
const emits = defineEmits<DialogContentEmits>()
const delegatedProps = reactiveOmit(props, "class", "side", "showCloseButton")
const forwarded = useForwardPropsEmits(delegatedProps, emits)

const sideClasses: Record<SheetSide, string> = {
  top: "inset-x-0 top-0 border-b data-open:slide-in-from-top data-closed:slide-out-to-top",
  right: "inset-y-0 right-0 h-full border-l data-open:slide-in-from-right data-closed:slide-out-to-right",
  bottom: "inset-x-0 bottom-0 border-t data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
  left: "inset-y-0 left-0 h-full border-r data-open:slide-in-from-left data-closed:slide-out-to-left",
}
</script>

<template>
  <DialogPortal>
    <DialogOverlay class="data-open:fade-in-0 data-closed:fade-out-0" />
    <DialogContent
      data-slot="sheet-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="cn('bg-background text-foreground data-open:animate-in data-closed:animate-out fixed z-50 flex w-3/4 flex-col gap-4 shadow-lg duration-300 data-closed:duration-300 outline-none', sideClasses[props.side], props.class)"
    >
      <slot />

      <DialogClose
        v-if="showCloseButton"
        data-slot="sheet-close"
        as-child
      >
        <Button variant="ghost" class="absolute top-3 right-3" size="icon">
          <XIcon :size="16" :stroke-width="1.8" />
          <span class="sr-only">Cerrar</span>
        </Button>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
