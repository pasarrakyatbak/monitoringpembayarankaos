const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec';

let databaseKaos = [];

async function fetchKaos() {
    try {
        const response = await fetch(`${SCRIPT_URL}?action=getKaos`);
        const result = await response.json();

        if (result.status === "success") {
            databaseKaos = result.hasil;
            renderCards(databaseKaos);
            document.getElementById('loading').classList.add('hidden');
        } else {
            throw new Error(result.message);
        }
    } catch (err) {
        document.getElementById('loading').innerHTML = `<div class="bg-red-100 p-4 rounded-xl text-red-700 font-bold">
            ⚠️ Koneksi Gagal: ${err.message}<br>
            <button onclick="location.reload()" class="mt-2 bg-red-700 text-white px-4 py-1 rounded-lg">Coba Lagi</button>
        </div>`;
    }
}

function renderCards(data) {
    const container = document.getElementById('resultsArea');
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = `<p class="text-center text-slate-400 py-10">Data tidak ditemukan.</p>`;
        return;
    }

    data.forEach((item, index) => {
        const isLunas = item.status === "LUNAS";
        
        // Anti-Error: Pastikan angsuran adalah array
        const angsuranList = Array.isArray(item.angsuran) ? item.angsuran : [0,0,0,0];

        const card = `
            <div class="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 card-anim" style="animation-delay: ${index * 0.05}s">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h2 class="text-xl font-extrabold text-slate-800">${item.nama}</h2>
                        <span class="inline-block bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md mt-1 italic">LAPAK: ${item.no_lapak}</span>
                    </div>
                    <span class="px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${isLunas ? 'bg-emerald-600 text-white' : 'bg-amber-400 text-amber-900'} uppercase">
                        ${item.status}
                    </span>
                </div>

                <div class="grid grid-cols-3 gap-2 mb-4">
                    <div class="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                        <p class="text-[8px] text-slate-400 font-bold uppercase">Ukuran</p>
                        <p class="text-sm font-black text-slate-700">${item.ukuran}</p>
                    </div>
                    <div class="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                        <p class="text-[8px] text-slate-400 font-bold uppercase">QRIS</p>
                        <p class="text-sm font-black text-slate-700">${item.qris ? '✅' : '❌'}</p>
                    </div>
                    <div class="bg-slate-50 p-2 rounded-xl text-center border border-slate-100">
                        <p class="text-[8px] text-slate-400 font-bold uppercase text-rose-500">Sisa</p>
                        <p class="text-sm font-black text-rose-600">Rp ${(item.sisa || 0).toLocaleString('id-ID')}</p>
                    </div>
                </div>

                <div class="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100">
                    <p class="text-[9px] font-black text-emerald-600 uppercase mb-3 tracking-widest text-center">Detail Riwayat Angsuran</p>
                    <div class="grid grid-cols-4 gap-2">
                        ${angsuranList.map((val, i) => `
                            <div class="text-center">
                                <p class="text-[8px] text-emerald-400 font-bold uppercase">A${i + 1}</p>
                                <p class="text-[11px] font-bold text-emerald-900">${val > 0 ? val.toLocaleString('id-ID') : '-'}</p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });
}

document.getElementById('searchInput').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    const filtered = databaseKaos.filter(item =>
        (item.nama && item.nama.toLowerCase().includes(keyword)) ||
        (item.no_lapak && item.no_lapak.toString().includes(keyword))
    );
    renderCards(filtered);
});

fetchKaos();