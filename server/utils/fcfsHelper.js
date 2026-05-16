/**
 * FCFS Helper - SIPENDORA (Mega Upgrade Edition)
 * Menghitung parameter matematis antrian First-Come-First-Served.
 *
 * @param {Date} arrivalTime     - Waktu klik bayar (AT)
 * @param {Date} nextAvailableST - Waktu mulai tercepat yang tersedia (dari queue)
 * @param {number} durationHours - Lama sewa dalam jam (BT)
 * @returns {Object} Metrik penjadwalan
 */
const calculateFCFSMetrics = (arrivalTime, nextAvailableST, durationHours) => {
    const at = new Date(arrivalTime);
    const st = new Date(nextAvailableST);
    const bt = durationHours * 60; // Konversi jam ke menit (Burst Time)
    
    // Completion Time = Start Time + Burst Time
    const ct = new Date(st.getTime() + bt * 60000); 

    // 3. Core Calculations (dalam menit)
    const tat = Math.max(bt, (ct - at) / (1000 * 60)); // Turnaround Time
    const wt  = Math.max(0, (st - at) / (1000 * 60)); // Waiting Time

    // 4. Advanced Metrics
    const responseTime = wt;
    return {
        arrival_time: at,
        start_time: st,
        end_time: ct,
        burst_time: Math.round(bt),
        turnaround_time: Math.round(tat),
        waiting_time: Math.round(wt),
        response_time: Math.round(responseTime)
    };
};

module.exports = { calculateFCFSMetrics };