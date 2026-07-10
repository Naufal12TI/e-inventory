/**
 * ============================================================
 * AppModal.js — Reusable Modal Component
 * ============================================================
 * Modal dengan animasi slide-up, backdrop blur, dark mode.
 *
 * Props:
 * - show    {Boolean} — Tampilkan/sembunyikan modal
 * - title   {String}  — Judul modal
 * - size    {String}  — 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
 *
 * Emits:
 * - close  — Dipanggil saat user klik backdrop atau tombol X
 *
 * Slots:
 * - default — Konten modal
 * - footer  — Footer modal (tombol aksi)
 * ============================================================
 */
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'AppModal',

  props: {
    show:  { type: Boolean, default: false },
    title: { type: String,  default: '' },
    size:  { type: String,  default: 'md', validator: v => ['sm','md','lg','xl'].includes(v) },
  },

  emits: ['close'],

  setup(props, { emit }) {
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };

    const close = () => emit('close');

    return { sizeClasses, close };
  },

  template: `
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="show"
          class="fixed inset-0 z-[9000] flex items-center justify-center p-4"
          @click.self="close"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          <!-- Modal Box -->
          <div
            :class="['modal-box relative w-full rounded-2xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden', sizeClasses[size]]"
          >
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ title }}</h2>
              <button
                @click="close"
                class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <!-- Content (slot default) -->
            <div class="px-6 py-5">
              <slot />
            </div>

            <!-- Footer (slot footer) -->
            <div v-if="$slots.footer" class="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  `,
});
