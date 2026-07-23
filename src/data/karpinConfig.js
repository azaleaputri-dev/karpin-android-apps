const roleContent = {
  admin: {
    badge: 'Admin Puskesmas',
    headline: 'Monitoring lintas posyandu dan perangkat IoT dalam satu panel.',
    description:
      'Pantau cakupan pengukuran, aktivitas perangkat, dan manajemen user seperti di dashboard Laravel Karpin.',
    welcome: 'Akses monitoring puskesmas',
    navItems: [
      {title: 'Dashboard', subtitle: 'Ringkasan pertumbuhan dan monitoring posyandu', icon: 'grid-outline', route: 'Dashboard'},
      {title: 'Posyandu', subtitle: 'Kelola lokasi, identitas, dan wilayah layanan', icon: 'business-outline', route: 'Posyandu'},
      {title: 'Profil Saya', subtitle: 'Ubah profil dan password akun aktif', icon: 'person-circle-outline', route: 'Profile'},
      {title: 'Data Anak', subtitle: 'Lihat detail anak, grafik, dan export PDF', icon: 'people-outline', route: 'DataAnak'},
      {title: 'Pengukuran', subtitle: 'Pantau input manual dan hasil dari perangkat IoT', icon: 'analytics-outline', route: 'Pengukuran'},
      {title: 'Manajemen User', subtitle: 'Kelola akun admin dan petugas posyandu', icon: 'shield-checkmark-outline', route: 'UserManagement'},
      {title: 'Perangkat IoT', subtitle: 'Kelola device token, status, dan koneksi alat', icon: 'hardware-chip-outline', route: 'IoTDevices'},
    ],
  },
  petugas: {
    badge: 'Petugas Posyandu',
    headline: 'Input data balita dan pengukuran untuk posyandu yang ditangani.',
    description:
      'Fokus petugas mengikuti pembatasan role Laravel: hanya data anak, pengukuran, profil, dan dashboard posyandu sendiri.',
    welcome: 'Petugas Posyandu Melati',
    navItems: [
      {title: 'Dashboard', subtitle: 'Lihat ringkasan pertumbuhan posyandu sendiri', icon: 'grid-outline', route: 'Dashboard'},
      {title: 'Profil Saya', subtitle: 'Perbarui identitas akun dan password', icon: 'person-circle-outline', route: 'Profile'},
      {title: 'Data Anak', subtitle: 'Tambah, edit, dan lihat grafik perkembangan', icon: 'people-outline', route: 'DataAnak'},
      {title: 'Pengukuran', subtitle: 'Catat tinggi, berat, suhu, dan catatan layanan', icon: 'analytics-outline', route: 'Pengukuran'},
    ],
  },
};

export {roleContent};
