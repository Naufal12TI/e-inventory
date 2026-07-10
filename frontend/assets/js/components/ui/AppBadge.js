/**
 * AppBadge.js — Badge/Chip Status Component
 * Digunakan untuk kondisi barang, jenis stok, dll.
 */
import { defineComponent, computed } from 'vue';

export default defineComponent({
  name: 'AppBadge',
  props: {
    value: { type: String, required: true },
    type:  { type: String, default: 'auto' }, // 'auto' | 'success' | 'warning' | 'danger' | 'info' | 'gray'
  },
  setup(props) {
    const styleMap = {
      // Kondisi barang
      'Baik':         'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      'Rusak Ringan': 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
      'Rusak Berat':  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
      // Jenis stok
      'Masuk':  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      'Keluar': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400',
    };
    const typeMap = {
      success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
      danger:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
      info:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
      gray:    'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    };

    const cls = computed(() => {
      if (props.type !== 'auto') return typeMap[props.type] || typeMap.gray;
      return styleMap[props.value] || typeMap.gray;
    });

    return { cls };
  },
  template: `
    <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', cls]">
      {{ value }}
    </span>
  `,
});
