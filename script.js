const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let allData = []; 
let searchTimeout; // Untuk fungsi debounce search

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const tableBody = document.getElementById('tableBody');
  const cardContainer = document.getElementById('cardContainer');
  const loadingOverlay = document.getElementById('loadingOverlay');

  /* =============================
      LOADING STATE
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
      renderSummary(allData, json.rekapUkuranLunas);

    } catch (err) {
      console.error(err);
      alert("Gagal memuat data kaos");
    } finally {
      hideLoading();
    }
  }

  /* =============================
      LOGIKA PENCARIAN DENGAN LOADING
  ============================= */
  const handleSearch = () => {
    // Tampilkan loading segera setelah user mengetik
    showLoading();

    // Hapus timeout sebelumnya agar tidak bertumpuk
    clearTimeout(searchTimeout);

    // Jalankan filter setelah user berhenti mengetik selama 300ms
    searchTimeout = setTimeout(() => {
      const keyword = searchInput.value.toLowerCase().trim();
      
      const filteredData = allData.filter(item => {
        const noLapak = String(item.noLapak || "").toLowerCase();
        const nama = String(item.nama || "").toLowerCase();
        return noLapak.includes(keyword) || nama.includes(keyword);
      });

      renderAll(filteredData);
      
      // Sembunyikan loading setelah render selesai
      hideLoading();
    }, 300); 
  };

  searchInput.addEventListener('input', handleSearch);

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

  function renderTable(data) {
    tableBody.innerHTML = '';
    if (data.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:20px;">Data tidak ditemukan</td></tr>';
      return;
    }
    // ... (Logika renderTable tetap sama seperti sebelumnya)
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
          <td><input type="checkbox" ${row.qris ? 'checked' : ''} data-nolapak="${row.noLapak}"></td>
          <td>Rp ${Number(row.sisa).toLocaleString('id-ID')}</td>
          <td><span class="badge ${row.status === 'Lunas' ? 'badge-lunas' : 'badge-belum'}">${row.status}</span></td>
        </tr>`;
    });
  }

  function renderCard(data) {
    cardContainer.innerHTML = '';
    if (data.length === 0) {
      cardContainer.innerHTML = '<p style="text-align:center; padding:20px; color:#666;">Data tidak ditemukan</p>';
      return;
    }
    // ... (Logika renderCard tetap sama seperti sebelumnya)
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
            <div><div class="lapak">Lapak ${row.noLapak}</div><div class="nama">${row.nama}</div></div>
            <span class="badge ${row.status === 'Lunas' ? 'badge-lunas' : 'badge-belum'}">${row.status}</span>
          </div>
          <div class="pelapak-body">
            <div class="item"><span>Ukuran</span><strong>${row.ukuran}</strong></div>
            <div class="item"><span>Jml Pesan</span><strong>${row.jumlahPesan}</strong></div>
            <div class="installment-grid">${installmentList}</div>
            <div class="item highlight"><span>Sisa Tagihan</span><strong>Rp ${Number(row.sisa).toLocaleString('id-ID')}</strong></div>
            <div class="item full"><span>Potongan QRIS</span><input type="checkbox" ${row.qris ? 'checked' : ''} data-nolapak="${row.noLapak}"></div>
          </div>
        </div>`;
    });
  }

  /* =============================
      UPDATE QRIS
  ============================= */
  document.body.addEventListener('change', async (e) => {
    if (e.target.type === 'checkbox' && e.target.dataset.nolapak) {
      const currentCheckbox = e.target;
      try {
        showLoading(); // Loading saat update data dimulai
        const fd = new FormData();
        fd.append('action', 'updateQRIS');
        fd.append('noLapak', currentCheckbox.dataset.nolapak);
        fd.append('qris', currentCheckbox.checked ? 'true' : 'false');

        const res = await fetch(API_URL, { method: 'POST', body: fd });
        const json = await res.json();

        if (!json.success) throw new Error(json.message);
        
        await loadData(); 

      } catch (err) {
        alert('Gagal update QRIS: ' + err.message);
        currentCheckbox.checked = !currentCheckbox.checked; 
        hideLoading(); // Sembunyikan loading jika gagal
      }
      // hideLoading() tidak perlu di sini karena sudah ada di dalam loadData() -> finally
    }
  });

  loadData();
});
