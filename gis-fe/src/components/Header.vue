<script setup>
const navigate = (url) => (window.location.href = url);
</script>

<template>
  <div class="header-container">
    <!-- Kiri: Logo + Judul -->
    <div class="header-left">
      <button @click="navigate('/gis-fe')" class="logo-button">
        <img src="/Sigap07.svg" class="logo-image" />
      </button>
      <span class="title-text">SIGAP KUMUH</span>
    </div>

    <!-- Kanan: Dashboard dan Beranda -->
    <div class="nav-buttons">
      <div
        class="beranda-flat"
        @click="navigate('https://10.15.38.162:3100/web/sigapkumuh')"
        title="Beranda"
      >
        <i class="fas fa-home"></i>
        <span class="beranda-label">Beranda</span>
      </div>

      <div
        class="dashboard-flat"
        @click="navigate('https://10.15.38.162:9200/portal')"
        title="Dashboard"
      >
        <i class="fas fa-tachometer-alt"></i>
        <span class="dashboard-label">Dashboard</span>
      </div>

      <div
        class="login-flat"
        @click="navigate('https://10.15.38.162:9200/login')"
        title="Login"
      >
        <i class="fa-solid fa-user"></i>
        <span class="login-label">Login</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-container {
  position: fixed;
  top: 10px;
  left: 10px;
  right: 10px;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem; /* dari 1rem ke 1.5rem */
  height: 5.25rem; /* dari 3.5rem (56px) jadi 84px */
  background-color: white;
  border-radius: 9999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem; /* dari 0.5rem */
}

.logo-button {
  width: 3.75rem; /* 60px, dari 2.5rem / 40px */
  height: 3.75rem;
  border-radius: 9999px;
  background-color: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.logo-image {
  height: 2.25rem; /* 36px, dari 24px */
  margin: 0 auto;
}

.title-text {
  font-size: 1.6875rem; /* ~27px, dari 18px */
  font-weight: 600;
  color: #0ea5e9;
}

/* navbar dashbaord dan beranda */
.nav-buttons {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-flat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 1.3125rem; /* ~21px */
  cursor: pointer;
  color: #35b4ed;
  background-color: transparent;
  transition: background-color 0.3s ease;
}

.dashboard-flat:hover {
  background-color: rgba(14, 165, 233, 0.1);
}

.dashboard-label {
  display: none;
}

.beranda-flat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 1.3125rem; /* ~21px */
  cursor: pointer;
  color: #35b4ed;
  background-color: transparent;
  transition: background-color 0.3s ease;
}

.beranda-flat:hover {
  background-color: rgba(14, 165, 233, 0.1);
}

.beranda-label {
  display: none;
}

.login-flat {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 1.3125rem; /* ~21px */
  cursor: pointer;
  color: #35b4ed;
  background-color: transparent;
  transition: background-color 0.3s ease;
}
.login-flat:hover {
  background-color: rgba(14, 165, 233, 0.1);
}
.login-label {
  display: none;
}

@media (min-width: 480px) {
  .dashboard-label {
    display: inline;
  }
  .beranda-label {
    display: inline;
  }
}
</style>
