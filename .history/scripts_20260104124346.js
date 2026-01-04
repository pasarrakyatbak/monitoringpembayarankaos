const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec'; // Ganti dengan URL dari Deploy Apps Script

let listKaos = [];

async function muatData() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getKaos`);
        const data = await response.json();

        if (data.status === "success") {
            listKaos = data.hasil;
            tampilkanData(listKaos);
            document.getElementById('loading').classList.add('hidden');
            document.getElementById('dataTableContainer').classList.remove('hidden');
        }
    } catch (err) {
        console.error("Gagal memuat data:", err);
    }
}

function tampilkanData(items) {
    const container = document.getElementById('dataTableContainer');
    container.innerHTML = '';

    if (items.length === 0) {
        container.innerHTML = `<div class="text-center py-10 text-gray-400">Data tidak ditemukan.</div>`;
        return;
    }

    items.forEach(item => {
        const isLunas = item.status === "LUNAS";

        const card = `
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-bold text-gray-800">${item.nama}</h3>
                        <p class="text-sm text-emerald-600 font-semibold uppercase tracking-wider">Lapak: ${item.nomor_lapak}</p>
                    </div>
                    <span class="px-4 py-1 rounded-full text-xs font-black tracking-widest ${isLunas ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}">
                        ${item.status}
                    </span>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p class="text-gray-400 text-[10px] uppercase font-bold">Ukuran</p>
                        <p class="font-bold text-gray-700 uppercase">${item.ukuran}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p class="text-gray-400 text-[10px] uppercase font-bold">QRIS Danamon</p>
                        <p class="font-bold text-gray-700">${item.qris ? '✅ AKTIF' : '❌ TIDAK'}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p class="text-gray-400 text-[10px] uppercase font-bold">Total Harga</p>
                        <p class="font-bold text-emerald-700">Rp ${item.harga_total.toLocaleString()}</p>
                    </div>
                    <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p class="text-gray-400 text-[10px] uppercase font-bold text-rose-500">Sisa Tagihan</p>
                        <p class="font-black text-rose-600">Rp ${item.sisa.toLocaleString()}</p>
                    </div>
                </div>

                <div class="border-t border-dashed border-gray-200 pt-4">
                    <p class="text-[10px] font-bold text-gray-400 uppercase mb-2">Riwayat Angsuran (1-4)</p>
                    <div class="flex gap-2 flex-wrap">
                        ${item.angsuran.map((val, idx) => `
                            <div class="flex-1 min-w-[80px] text-center bg-emerald-50 border border-emerald-100 py-1 rounded-lg">
                                <span class="block text-[8px] text-emerald-500 uppercase">Ke-${idx + 1}</span>
                                <span class="text-xs font-bold text-emerald-800">${val ? 'Rp ' + val.toLocaleString() : '-'}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

// Fitur Cari
document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const hasilCari = listKaos.filter(item =>
        item.nama.toLowerCase().includes(keyword) ||
        item.nomor_lapak.toString().includes(keyword)
    );
    tampilkanData(hasilCari);
});

muatData();