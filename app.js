// Initialize Supabase Client (Only declared ONCE here)
const db = window.supabase.createClient(
    "https://eosgvjvpdwxmpxzerxit.supabase.co", 
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvc2d2anZwZHd4bXB4emVyeGl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1Njk3MTMsImV4cCI6MjEwMTE0NTcxM30.fD14BdJBDPNqFUKGxS5DRgsDnN8CqYdWR4k8cuAbvcg",
    { auth: { flowType: 'pkce' } }
);

// Helper function: Extract 4-digit release year
function extractYear(m) {
    if (!m) return '';
    const possibleKeys = [
        'release_year', 'year', 'release_date', 'released_year', 
        'year_of_release', 'Year', 'Release Year', 'RELEASE_YEAR'
    ];
    let val = '';
    for (let key of possibleKeys) {
        if (m[key] !== undefined && m[key] !== null && m[key] !== '') {
            val = m[key];
            break;
        }
    }
    if (!val) {
        for (let k in m) {
            if (k.toLowerCase().includes('year') || k.toLowerCase().includes('date')) {
                if (m[k]) { val = m[k]; break; }
            }
        }
    }
    const match = String(val).match(/\b(19|20)\d{2}\b/);
    return match ? match[0] : '';
}

// Helper function: Parse currency amounts
function parseAmount(val) {
    if (!val || val === 'N/A' || val === 'TBA') return null;
    let str = String(val).toUpperCase().trim();
    let num = parseFloat(str.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return null;
    if (str.includes('CR')) num *= 100;
    return num;
}

// Helper function: Automatic Verdict Calculation
function getVerdict(m) {
    const grossStr = m.collection || m.trade_gross || '';
    const budgetStr = m.budget || '';
    const rawVerdict = (m.verdict || '').toString().trim().toUpperCase();

    const isUnreleased = grossStr.toString().toUpperCase() === 'TBA' || 
                         grossStr.toString().trim() === '0' || 
                         rawVerdict === 'UPCOMING' || 
                         rawVerdict === 'UNRELEASED';

    if (isUnreleased) {
        return { label: 'UPCOMING', badgeClass: 'verdict-badge upcoming' };
    }

    const grossNum = parseAmount(grossStr);
    const budgetNum = parseAmount(budgetStr);

    if (grossNum && budgetNum && budgetNum > 0) {
        const ratio = grossNum / budgetNum;
        if (ratio >= 2.5) return { label: 'BLOCKBUSTER', badgeClass: 'verdict-badge blockbuster' };
        if (ratio >= 2.0) return { label: 'SUPER HIT', badgeClass: 'verdict-badge superhit' };
        if (ratio >= 1.4) return { label: 'HIT', badgeClass: 'verdict-badge hit' };
        if (ratio >= 1.0) return { label: 'AVERAGE', badgeClass: 'verdict-badge average' };
        if (ratio >= 0.6) return { label: 'FLOP', badgeClass: 'verdict-badge flop' };
        return { label: 'DISASTER', badgeClass: 'verdict-badge disaster' };
    }

    if (rawVerdict && rawVerdict !== 'BLOCKBUSTER') {
        if (rawVerdict.includes('SUPER')) return { label: 'SUPER HIT', badgeClass: 'verdict-badge superhit' };
        if (rawVerdict.includes('BLOCK')) return { label: 'BLOCKBUSTER', badgeClass: 'verdict-badge blockbuster' };
        if (rawVerdict.includes('HIT')) return { label: 'HIT', badgeClass: 'verdict-badge hit' };
        if (rawVerdict.includes('AVG') || rawVerdict.includes('AVERAGE')) return { label: 'AVERAGE', badgeClass: 'verdict-badge average' };
        if (rawVerdict.includes('FLOP')) return { label: 'FLOP', badgeClass: 'verdict-badge flop' };
        if (rawVerdict.includes('DISASTER')) return { label: 'DISASTER', badgeClass: 'verdict-badge disaster' };
        return { label: rawVerdict, badgeClass: 'verdict-badge hit' };
    }

    return { label: 'HIT', badgeClass: 'verdict-badge hit' };
}