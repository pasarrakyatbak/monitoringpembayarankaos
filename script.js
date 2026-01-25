const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let allData = []; // Tempat menyimpan data asli dari API

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

      allData = json.hasil; // Simpan ke variabel global agar bisa di-filter
      renderAll(allData);
      renderSummary(allData, json.rekapUkuranLunas);

    } catch (err) {
      console.error(err);
      alert("Gagal memuat data kaos");
    } finally {
      hideLoading();
    }
  }

  /* =============================
      LOGIKA PENCARIAN (SEARCH) - TAMBAHKAN INI
  ============================= */
  searchInput.addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    
    // Filter data berdasarkan No Lapak atau Nama
    const filteredData = allData.filter(item => {
      const noLapak = String(item.noLapak).toLowerCase();
      const nama = String(item.nama).toLowerCase();
      return noLapak.includes(keyword) || nama.includes(keyword);
    });

    // Tampilkan hanya data yang cocok
    renderAll(filteredData);
  });

  /* =============================
      SUMMARY & REKAP UKURAN
  ============================= */
  function renderSummary(data, rekapUkuran) {
    document.getElementById('totalPelapak').textContent = data.length;
    document.getElementById('totalLunas').textContent =
      data.filter(d => d.status === "Lunas").length;
    document.getElementById('totalBelum').textContent =
      data.filter(d => d.status !== "Lunas").length;

    const rekapContainer = document.getElementById('rekapUkuranContainer');
    if (rekapContainer && rekapUkuran) {
      let html = '';
      for (const [ukuran, jumlah] of Object.entries(rekapUkuran)) {
        if (jumlah > 0) {
          html += `
            <div class="ukuran-item">
              <span class="label">${ukuran}</span>
              <span class="val">${jumlah}</span>
            </div>`;
        }
      }
      rekapContainer.innerHTML = html || '<p style="font-size:12px; color:#666;">Belum ada kaos lunas</p>';
    }
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
      let installmentCols = '';
      for (let i = 1; i <= 10; i++) {
        installmentCols += `<td>${row.angsuran['a' + i] || 0}</td>`;
      }

      tableBody.innerHTML += `
        <tr class="${row.status !== 'Lunas' ? 'belum-lunas' : ''}">
          <td>${row.noLapak}</td>
          <td>${row.nama}</td>
          <td>${row.ukuran}</td>
          <td>${row.jumlahPesan}</td>
          ${installmentCols} 
          <td>
            <input type="checkbox" ${row.qris ? 'checked' : ''} data-nolapak="${row.noLapak}">
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
      let installmentList = '';
      for (let i = 1; i <= 10; i++) {
        const nilai = row.angsuran['a' + i] || 0;
        if (nilai > 0 || i <= 4) { 
          installmentList += `<div class="item"><span>A${i}</span><strong>${nilai.toLocaleString('id-ID')}</strong></div>`;
        }
      }

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
            <div class="item"><span>Ukuran</span><strong>${row.ukuran}</strong></div>
            <div class="item"><span>Jml Pesan</span><strong>${row.jumlahPesan}</strong></div>
            <div class="installment-grid">${installmentList}</div>
            <div class="item highlight"><span>Sisa Tagihan</span><strong>Rp ${Number(row.sisa).toLocaleString('id-ID')}</strong></div>
            <div class="item full">
              <span>Potongan QRIS</span>
              <input type="checkbox" ${row.qris ? 'checked' : ''} data-nolapak="${row.noLapak}">
            </div>
          </div>
        </div>`;
    });
  }

  /* =============================
      UPDATE QRIS
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
        loadData(); // Refresh data setelah update

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
