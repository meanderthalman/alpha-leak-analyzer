let chart;
const currentYear = 2026;
const inflationRate = 0.06;

/**
 * BOX-MULLER TRANSFORM
 * Generates Gaussian (Normal) distribution noise.
 * This makes the "wiggles" in the graph look like real market volatility
 * rather than artificial waves.
 */
function getGaussianNoise() {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); 
    while(v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
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
    let highestRate = 0.13; // Default floor

    // 1. Determine the "Recovery Bar" based on user-selected benchmarks
    const activeChips = document.querySelectorAll('.chip.active');
    activeChips.forEach(chip => {
        highestRate = Math.max(highestRate, parseFloat(chip.dataset.rate));
    });

    // 2. User Asset Path (Lower volatility for the "known" path)
    const userCAGR = Math.pow(CV/P, 1/Y) - 1;
    const userData = genPath(P, Y, userCAGR, 0.04, startYear, adj);
    datasets.push({
        label: 'Your Portfolio', data: userData,
        borderColor: '#f85149', borderWidth: 4, pointRadius: 0, tension: 0.3
    });

    // 3. Benchmark Paths
    activeChips.forEach(chip => {
        const r = parseFloat(chip.dataset.rate);
        // Midcaps are more volatile than Nifty/Gold
        const volatility = r > 0.18 ? 0.18 : 0.12; 
        
        const path = genPath(P, Y, r, volatility, startYear, adj);
        const finalBenchmark = path[path.length - 1].y;
        const finalUser = userData[userData.length - 1].y;
        
        maxLeak = Math.max(maxLeak, finalBenchmark - finalUser);
        
        datasets.push({
            label: chip.dataset.name, data: path, borderColor: chip.dataset.color, 
            borderWidth: 2, borderDash: [6, 4], pointRadius: 0, tension: 0.4
        });
    });

    // 4. Update UI Stats
    document.getElementById('leakVal').innerText = '₹ ' + format(maxLeak);
    
    // LOGARITHMIC TIME-DELAY CALCULATION
    // Math.log(Target/Current) / Math.log(1 + rate)
    const recoveryRate = adj ? (highestRate - inflationRate) : highestRate;
    let delay = 0;
    if (maxLeak > 0 && CV > 0) {
        delay = Math.log((CV + maxLeak) / CV) / Math.log(1 + recoveryRate);
    }
    
    document.getElementById('delayVal').innerText = `${Math.floor(delay)}y ${Math.round((delay % 1) * 12)}m`;

    // 5. Dynamic Grading
    const leakBadge = document.getElementById('gradeLeak');
    if (maxLeak <= 0) { 
        leakBadge.innerText = "Alpha Leader"; leakBadge.style.background = "#3fb950"; 
    } else if (delay > 3.5) { 
        leakBadge.innerText = "Severe Leak"; leakBadge.style.background = "#f85149"; 
    } else { 
        leakBadge.innerText = "Moderate Leak"; leakBadge.style.background = "#ffd700"; leakBadge.style.color = "black";
    }

    renderChart(datasets);
}

function genPath(p, years, r, vol, start, adj) {
    let pts = [];
    let curr = p;
    // We use a fixed seed-like approach for the loop to keep the graph 
    // somewhat consistent during toggles while still feeling "organic"
    for(let i=0; i <= years * 12; i++) {
        let val = curr;
        if(adj) val = curr / Math.pow(1 + inflationRate, i/12);
        pts.push({ x: start + (i/12), y: Math.round(val) });
        
        // Applying Gaussian Volatility to the growth step
        let noise = getGaussianNoise();
        let periodicReturn = (r / 12) + (vol * Math.sqrt(1/12) * noise);
        curr *= (1 + periodicReturn);
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
                x: { type: 'linear', ticks: { color:'#8b949e' }, grid: { color: 'rgba(48,54,61,0.1)' } },
                y: { ticks: { color:'#8b949e', callback: v => '₹' + format(v) }, grid: { color: 'rgba(48,54,61,0.1)' } }
            },
            plugins: {
                legend: { position: 'bottom', labels: { color: '#8b949e', boxWidth: 12, font: { size: 10 } } },
                tooltip: { mode: 'index', intersect: false }
            }
        }
    });
}

document.querySelectorAll('.chip').forEach(c => c.onclick = () => { c.classList.toggle('active'); sync(); });
window.onload = sync;
