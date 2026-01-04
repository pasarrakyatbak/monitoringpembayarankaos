const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let allData = [];

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const tableBody = document.getElementById('tableBody');
  const cardContainer = document.getElementById('cardContainer');
  const loadingOverlay = document.getElementById('loadingOverlay');

  /* =============================
     LOADING
  ============================= */
  const showLoading = () => loadingOverlay.classList.remove('hidden');
  const hideLoading = () => loadingOverlay.classList.add('hidden');

  /* =============================
     LOAD DATA
  ============================= */
  async function loadData() {
    try {
      showLoading();

      const res = await fetch(`${API_URL}?action=kaos`);
      const json = await res.json();

      if (json.status !== "success") throw new Error("API error");

      allData = json.hasil;
      renderAll(allData);
      renderSummary(allData);

    } catch (err) {
      console.error(err);
      alert("Gagal memuat data kaos");
    } finally {
      hideLoading();
    }
  }

  /* =============================
     SUMMARY
  ============================= */
  function renderSummary(data) {
    document.getElementById('totalPelapak').textContent = data.length;
    document.getElementById('totalLunas').textContent =
      data.filter(d => d.status === "Lunas").length;
    document.getElementById('totalBelum').textContent =
      data.filter(d => d.status !== "Lunas").length;
  }

  /* =============================
     RENDER ALL
  ============================= */
  function renderAll(data) {
    renderTable(data);
    renderCard(data);
  }

  /* =============================
     TABLE (DESKTOP)
  ============================= */
  function renderTable(data) {
    tableBody.innerHTML = '';

    data.forEach(row => {
      tableBody.innerHTML += `
<tr class="${row.status !== 'Lunas' ? 'belum-lunas' : ''}">
  <td>${row.noLapak}</td>
  <td>${row.nama}</td>
  <td>${row.ukuran}</td>
  <td>${row.jumlahPesan}</td>
  <td>${row.angsuran.a1}</td>
  <td>${row.angsuran.a2}</td>
  <td>${row.angsuran.a3}</td>
  <td>${row.angsuran.a4}</td>
  <td>
    <input type="checkbox"
      ${row.qris ? 'checked' : ''}
      data-nolapak="${row.noLapak}">
  </td>
  <td>Rp ${Number(row.sisa).toLocaleString('id-ID')}</td>
  <td>
    <span class="badge ${row.status === 'Lunas' ? 'badge-lunas' : 'badge-belum'}">
      ${row.status}
    </span>
  </td>
</tr>`;
    });
  }

  /* =============================
     CARD (MOBILE)
  ============================= */
  function renderCard(data) {
    cardContainer.innerHTML = '';

    data.forEach(row => {
      cardContainer.innerHTML += `
<div class="pelapak-card ${row.status !== 'Lunas' ? 'belum-lunas' : ''}">
  <div class="pelapak-header">
    <div>
      <div class="lapak">Lapak ${row.noLapak}</div>
      <div class="nama">${row.nama}</div>
    </div>
    <span class="badge ${row.status === 'Lunas' ? 'badge-lunas' : 'badge-belum'}">
      ${row.status}
    </span>
  </div>

  <div class="pelapak-body">
    <div class="item"><span>Ukuran Kaos</span><strong>${row.ukuran}</strong></div>
    <div class="item"><span>Jumlah Pesanan</span><strong>${row.jumlahPesan}</strong></div>
    <div class="item"><span>Angsuran 1</span><strong>${row.angsuran.a1}</strong></div>
    <div class="item"><span>Angsuran 2</span><strong>${row.angsuran.a2}</strong></div>
    <div class="item"><span>Angsuran 3</span><strong>${row.angsuran.a3}</strong></div>
    <div class="item"><span>Angsuran 4</span><strong>${row.angsuran.a4}</strong></div>
    <div class="item"><span>Sisa Tagihan</span>
      <strong>Rp ${Number(row.sisa).toLocaleString('id-ID')}</strong>
    </div>

    <div class="item full">
      <span>Punya QRIS Danamon</span>
      <input type="checkbox"
        ${row.qris ? 'checked' : ''}
        data-nolapak="${row.noLapak}">
    </div>
  </div>
</div>`;
    });
  }

  /* =============================
     UPDATE QRIS (PAKAI NO LAPAK)
  ============================= */
  document.body.addEventListener('change', async (e) => {
    if (e.target.type === 'checkbox' && e.target.dataset.nolapak) {
      try {
        showLoading();

        const fd = new FormData();
        fd.append('action', 'updateQRIS');
        fd.append('noLapak', e.target.dataset.nolapak);
        fd.append('qris', e.target.checked ? 'true' : 'false');

        const res = await fetch(API_URL, { method: 'POST', body: fd });
        const json = await res.json();

        if (!json.success) throw new Error(json.message);

        loadData();

      } catch (err) {
        alert('Gagal update QRIS');
        console.error(err);
      } finally {
        hideLoading();
      }
    }
  });

  /* =============================
     INIT
  ============================= */
  loadData();
});
