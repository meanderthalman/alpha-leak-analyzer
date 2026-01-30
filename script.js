let chart;
const currentYear = 2026;
const inflationRate = 0.06;

// FIX: This ensures the "wiggles" in the graph stay the same during toggles
function getPseudoRandom(index, rate) {
    const value = Math.sin(index + rate * 10) * 10000;
    return (value - Math.floor(value)) * 2 - 1;
}

function format(n) {
    let absN = Math.abs(n);
    if (absN >= 10000000) return (n/10000000).toFixed(2) + ' Cr';
    if (absN >= 100000) return (n/100000).toFixed(2) + ' L';
    return (n/1000).toFixed(1) + ' K';
}

function toggleInflation() {
    const cb = document.getElementById('adjInflation');
    const wrap = document.getElementById('toggleWrap');
    cb.checked = !cb.checked;
    
    // Visual Feedback
    if(cb.checked) wrap.classList.add('active');
    else wrap.classList.remove('active');
    
    sync();
}

function sync() {
    const p = parseFloat(document.getElementById('principal').value) || 0;
    const cv = parseFloat(document.getElementById('currentValue').value) || 0;
    const y = parseInt(document.getElementById('years').value);
    
    document.getElementById('pHint').innerText = '₹ ' + format(p);
    document.getElementById('cvHint').innerText = '₹ ' + format(cv);
    document.getElementById('yVal').innerText = y;

    calculate(p, cv, y);
}

function calculate(P, CV, Y) {
    const adj = document.getElementById('adjInflation').checked;
    const startYear = currentYear - Y;
    const datasets = [];
    let maxLeak = 0;

    // User Asset Path
    const userCAGR = Math.pow(CV/P, 1/Y) - 1;
    const userData = genPath(P, Y, userCAGR, 0.02, startYear, adj);
    datasets.push({
        label: 'Your Portfolio', data: userData,
        borderColor: '#f85149', borderWidth: 4, pointRadius: 0, tension: 0.3
    });

    // Benchmark Paths
    document.querySelectorAll('.chip.active').forEach(chip => {
        const r = parseFloat(chip.dataset.rate);
        const path = genPath(P, Y, r, 0.12, startYear, adj);
        const finalBenchmark = path[path.length - 1].y;
        const finalUser = userData[userData.length - 1].y;
        maxLeak = Math.max(maxLeak, finalBenchmark - finalUser);
        
        datasets.push({
            label: chip.dataset.name, data: path, borderColor: chip.dataset.color, 
            borderWidth: 2, borderDash: [6, 4], pointRadius: 0, tension: 0.4
        });
    });

    // Update UI Stats
    document.getElementById('leakVal').innerText = '₹ ' + format(maxLeak);
    const benchmarkRate = 0.13; 
    const recoveryRate = adj ? (benchmarkRate - inflationRate) : benchmarkRate;
    const delay = maxLeak > 0 ? Math.log((CV + maxLeak)/CV) / Math.log(1 + recoveryRate) : 0;
    
    document.getElementById('delayVal').innerText = `${Math.floor(delay)}y ${Math.round((delay%1)*12)}m`;

    // Dynamic Grading
    const leakBadge = document.getElementById('gradeLeak');
    if (maxLeak <= 0) { 
        leakBadge.innerText = "Alpha Leader"; leakBadge.style.background = "#3fb950"; 
    } else if (delay > 3) { 
        leakBadge.innerText = "Severe Leak"; leakBadge.style.background = "#f85149"; 
    } else { 
        leakBadge.innerText = "Moderate Leak"; leakBadge.style.background = "#ffd700"; leakBadge.style.color = "black";
    }

    renderChart(datasets);
}

function genPath(p, years, r, vol, start, adj) {
    let pts = [];
    let curr = p;
    for(let i=0; i <= years * 12; i++) {
        let val = curr;
        if(adj) val = curr / Math.pow(1 + inflationRate, i/12);
        pts.push({ x: start + (i/12), y: Math.round(val) });
        
        // Deterministic wiggle: pseudo-randomness based on step index 'i'
        // This ensures the graph shape stays identical when toggling inflation
        let wiggle = getPseudoRandom(i, r);
        curr *= (1 + (r/12) + (vol/Math.sqrt(12) * wiggle));
    }
    return pts;
}

function renderChart(ds) {
    const ctx = document.getElementById('chartCanvas').getContext('2d');
    if(chart) chart.destroy();
    chart = new Chart(ctx, {
        type: 'line',
        data: { datasets: ds },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                x: { type: 'linear', ticks: { color:'#8b949e' }, grid: { color: 'rgba(48,54,61,0.2)' } },
                y: { ticks: { color:'#8b949e', callback: v => '₹' + format(v) }, grid: { color: 'rgba(48,54,61,0.2)' } }
            },
            plugins: {
                legend: { position: 'bottom', labels: { color: '#8b949e' } },
                tooltip: { mode: 'index', intersect: false }
            }
        }
    });
}

document.querySelectorAll('.chip').forEach(c => c.onclick = () => { c.classList.toggle('active'); sync(); });
window.onload = sync;
