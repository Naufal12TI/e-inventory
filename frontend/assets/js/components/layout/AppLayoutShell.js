/**
 * ============================================================
 * AppLayoutShell.js — Layout Shell for Dashboard Routes
 * ============================================================
 * Komponen wrapper yang menampung AppLayout sekali saja,
 * lalu merender halaman aktif via <RouterView> di dalam slot.
 * Dengan ini, Sidebar & Navbar tidak di-mount ulang saat
 * pindah menu — hanya konten halaman yang berganti.
 *
 * Menggunakan <KeepAlive> agar komponen halaman di-cache
 * sehingga tidak blank saat navigasi balik ke menu sebelumnya.
 * ============================================================
 */
import { defineComponent } from 'vue';
import AppLayout from './AppLayout.js';

export default defineComponent({
  name: 'AppLayoutShell',
  components: { AppLayout },

  template: `
    <AppLayout>
      <!-- RouterView dengan KeepAlive: komponen di-cache, tidak blank saat balik -->
      <RouterView v-slot="{ Component }">
        <KeepAlive>
          <component :is="Component" />
        </KeepAlive>
      </RouterView>
    </AppLayout>
  `,
});
