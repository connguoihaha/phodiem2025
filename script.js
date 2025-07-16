let chartData = {};
let currentChart = null;
let isLoading = false;

// Show loading state
function showLoading() {
    isLoading = true;
    const btn = document.querySelector('.btn-primary');
    btn.innerHTML = '<span class="loading-spinner"></span>Đang tải...';
    btn.disabled = true;
}

// Hide loading state
function hideLoading() {
    isLoading = false;
    const btn = document.querySelector('.btn-primary');
    btn.innerHTML = '<i class="bi bi-graph-up"></i> Hiển thị biểu đồ';
    btn.disabled = false;
}

// Show alert
function showAlert(message, type = 'info') {
    const alert = document.getElementById('alert');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `<i class="bi bi-${type === 'info' ? 'info-circle' : (type === 'warning' ? 'exclamation-triangle' : 'x-circle')}"></i> ${message}`;
    alert.classList.remove('d-none');
    
    if (type !== 'info') {
    setTimeout(() => {
        alert.classList.add('d-none');
    }, 5000);
    }
}

// Hide alert
function hideAlert() {
    document.getElementById('alert').classList.add('d-none');
}

// Load data using original logic
showAlert('Đang tải dữ liệu...', 'info');

fetch("chart_data.json")
    .then(res => res.json())
    .then(data => {
    chartData = data;
    console.log("Chart data loaded:", Object.keys(chartData));
    hideAlert();
    })
    .catch(err => {
    console.error("❌ Error loading data:", err);
    showAlert("❌ Lỗi tải dữ liệu: " + err, 'danger');
    });

function renderSelected() {
    const code = document.getElementById("comboCode").value;
    
    if (!code) {
    showAlert("Vui lòng chọn mã tổ hợp hợp lệ!", 'warning');
    return;
    }

    if (!chartData[code]) {
    showAlert("❌ Dữ liệu tổ hợp không tồn tại!", 'danger');
    return;
    }

    showLoading();
    
    // Simulate processing time
    setTimeout(() => {
    const combo = chartData[code];
    
    // Destroy existing chart
    if (currentChart) {
        currentChart.destroy();
    }
    
    // Create new chart with harmonious colors
    currentChart = Highcharts.chart("chart", {
        chart: { 
        type: "column",
        backgroundColor: 'transparent',
        style: {
            fontFamily: 'Inter, sans-serif'
        }
        },
        title: { 
        text: `Phổ điểm tổ hợp ${code}`,
        style: {
            color: '#f1f5f9',
            fontSize: '1.5rem',
            fontWeight: '600'
        }
        },
        xAxis: {
        categories: combo.labels,
        title: { 
            text: "Khoảng điểm",
            style: { color: '#cbd5e1' }
        },
        labels: { style: { color: '#cbd5e1' } },
        gridLineColor: '#64748b'
        },
        yAxis: {
        title: { 
            text: "Số thí sinh",
            style: { color: '#cbd5e1' }
        },
        
        labels: { style: { color: '#cbd5e1' } },
        gridLineColor: '#64748b'
        },
        tooltip: {
        pointFormat: "Số thí sinh: <b>{point.y:,.0f}</b>",
        backgroundColor: 'rgba(76,87,220,0.95)',
        borderColor: '#64748b',
        borderRadius: 8,
        style: { color: '#f1f5f9' }
        },
        plotOptions: {
        column: {
            borderWidth: 0,
            borderRadius: 4,
            dataLabels: {
            enabled: true,
            style: { 
                color: '#000000', 
                fontSize: '11px',
                fontWeight: '600',
                textOutline: 'none'
            }
            }
        }
        },
        series: [
        {
            name: "Số thí sinh",
            type: "column",
            data: combo.data,
            color: '#4f46e5'
        },
        {
            name: "Đường xu hướng",
            type: "spline",  // hoặc "line" nếu bạn muốn góc nhọn
            data: combo.data,
            color: '#f97316',  // màu cam sáng
            lineWidth: 2,
            marker: {
            enabled: true,
            radius: 3,
            symbol: 'circle',
            fillColor: '#f97316'
            },
            enableMouseTracking: false,
            lineWidth: 6,
        }
        ],
        credits: { enabled: false },
        legend: { enabled: false }
    });

    // Update stats table
    renderStatsTable(combo.stats, code);
    document.getElementById("inputScoreSection").classList.remove("d-none");
    hideLoading();
    
    // Show success message
    showAlert(`✅ Đã tải thành công phổ điểm tổ hợp ${code}!`, 'info');
    setTimeout(hideAlert, 1000);
    
    }, 500);
}

function renderStatsTable(stats, code) {
    const statsSection = document.getElementById("statsSection");
    const statsTable = document.getElementById("statsTable");
    
    const statsData = [
    { 
        label: 'Số thí sinh', 
        value: parseInt(stats.count).toLocaleString(), 
        description: 'Tổng số thí sinh tham gia tổ hợp ' + code,
        class: 'stat-count'
    },
    { 
        label: 'Điểm trung bình', 
        value: stats.mean, 
        description: 'Điểm trung bình cộng của tổ hợp',
        class: 'stat-mean'
    },
    { 
        label: 'Trung vị', 
        value: stats.median, 
        description: 'Điểm ở giữa khi sắp xếp theo thứ tự',
        class: 'stat-median'
    },
    { 
        label: 'Điểm thấp nhất', 
        value: stats.min, 
        description: 'Điểm thấp nhất của tổ hợp',
        class: 'stat-min'
    },
    { 
        label: 'Điểm cao nhất', 
        value: stats.max, 
        description: 'Điểm cao nhất của tổ hợp',
        class: 'stat-max'
    },
    { 
        label: 'Độ lệch chuẩn', 
        value: stats.std, 
        description: 'Mức độ phân tán của điểm số',
        class: 'stat-std'
    }
    ];

    statsTable.innerHTML = statsData.map(stat => `
    <tr>
        <td><strong>${stat.label}</strong></td>
        <td><span class="stat-value ${stat.class}">${stat.value}</span></td>
        <td class="text-muted">${stat.description}</td>
    </tr>
    `).join('');

    statsSection.classList.remove('d-none');
}

// Add enter key support
document.getElementById('comboCode').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
    renderSelected();
    }
});

// Add change event for immediate feedback
document.getElementById('comboCode').addEventListener('change', function() {
    const code = this.value;
    if (code && !chartData[code]) {
    showAlert("Dữ liệu cho tổ hợp này chưa có sẵn!", 'warning');
    }
});

const COMBINATION_CODES = {
    A: {
    A00: "A00 (Toán + Lý + Hóa)",
    A01: "A01 (Toán + Lý + Tiếng Anh)",
    A02: "A02 (Toán + Lý + Sinh)",
    A03: "A03 (Toán + Lý + Sử)",
    A04: "A04 (Toán + Lý + Địa)",
    A05: "A05 (Toán + Hóa + Sử)",
    A06: "A06 (Toán + Hóa + Địa)",
    A07: "A07 (Toán + Sử + Địa)",
    A08: "A08 (Toán + Sử + GDCD)",
    A09: "A09 (Toán + Địa + GDCD)",
    A10: "A10 (Toán + Lý + GDCD)",
    A11: "A11 (Toán + Hóa + GDCD)"
    },
    B: {
    B00: "B00 (Toán + Hóa + Sinh)",
    B01: "B01 (Toán + Sinh + Sử)",
    B02: "B02 (Toán + Sinh + Địa)",
    B03: "B03 (Toán + Sinh + Văn)",
    B04: "B04 (Toán + Sinh + GDCD)",
    B08: "B08 (Toán + Sinh + Tiếng Anh)"
    },
    C: {
    C00: "C00 (Văn + Sử + Địa)",
    C01: "C01 (Văn + Toán + Lý)",
    C02: "C02 (Văn + Toán + Hóa)",
    C03: "C03 (Văn + Toán + Sử)",
    C04: "C04 (Văn + Toán + Địa)",
    C14: "C14 (Văn + Toán + GDCD)",
    C19: "C19 (Văn + Sử + GDCD)",
    C20: "C20 (Văn + Địa + GDCD)"
    },
    D: {
    D01: "D01 (Văn + Toán + Tiếng Anh)",
    D07: "D07 (Toán + Hóa + Tiếng Anh)",
    D08: "D08 (Toán + Sinh + Tiếng Anh)",
    D09: "D09 (Toán + Sử + Tiếng Anh)",
    D10: "D10 (Toán + Địa + Tiếng Anh)",
    D14: "D14 (Văn + Sử + Tiếng Anh)",
    D15: "D15 (Văn + Địa + Tiếng Anh)"
    }
};

function updateComboOptions() {
    const block = document.getElementById("blockSelect").value;
    const comboSelect = document.getElementById("comboCode");
    
    comboSelect.innerHTML = '<option value="">-- Chọn tổ hợp --</option>';

    if (COMBINATION_CODES[block]) {
    for (const [code, label] of Object.entries(COMBINATION_CODES[block])) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = label;
        comboSelect.appendChild(option);
    }
    }
}

function analyzeInputScore() {
  const code = document.getElementById("comboCode").value;
  const inputField = document.getElementById("inputScore");
  const rawValue = inputField.value.trim().replace(",", ".");

  // Làm sạch và chuyển sang số
  const cleaned = rawValue.replace(/[^0-9.]/g, "");
  const score = parseFloat(cleaned);

  // Kiểm tra tổ hợp hợp lệ
  if (!code || !chartData[code]) {
    showAlert("⚠️ Vui lòng chọn tổ hợp hợp lệ!", "warning");
    return;
  }

  // Kiểm tra điểm hợp lệ
  if (isNaN(score) || score < 0 || score > 30) {
    showAlert("⚠️ Điểm không hợp lệ. Vui lòng nhập từ 0 đến 30!", "warning");
    return;
  }

  const combo = chartData[code];
  const labels = combo.labels;
  const data = combo.data;

  let total = data.reduce((a, b) => a + b, 0);
  let accumulated = 0;
  let found = false;

  for (let i = 0; i < labels.length; i++) {
    const label = labels[i]; // ví dụ "23-24"
    const [minStr, maxStr] = label.split("-");
    const min = parseFloat(minStr);
    const max = parseFloat(maxStr);

    if (score >= min && score < max) {
      found = true;
      break;
    }

    accumulated += data[i];
  }

  if (!found && score >= parseFloat(labels[labels.length - 1].split("-")[1])) {
    // Nếu điểm vượt mức cao nhất
    accumulated = total;
  }

  // Tính phần trăm
  const percentile = (accumulated / total) * 100; // % thí sinh thấp hơn bạn
  const standing = percentile;                    // bạn đứng trên X%
  const rank = total - accumulated;               // còn bao nhiêu người cao hơn


  // Xếp loại năng lực
  let category = "";
  if (score >= 27) category = "Xuất sắc";
  else if (score >= 24) category = "Giỏi";
  else if (score >= 20) category = "Khá";
  else if (score >= 15) category = "Trung bình";
  else if (score >= 10) category = "Yếu";
  else category = "Kém";

  // Nội dung hiển thị
  const messageHTML = `
    <div class="d-flex align-items-start">
      <i class="bi bi-bar-chart-line me-2"></i>
      <div>
        <strong>Phân tích điểm tổ hợp: ${score.toFixed(2)}</strong><br/>
        • Xếp trên: <strong>${standing.toFixed(2)}%</strong> thí sinh<br/>
        • Xếp loại: <strong>${category}</strong><br/>
        • Ước tính còn khoảng <strong>${rank.toLocaleString()}</strong> thí sinh có điểm cao hơn<br/>
        • Tổng số thí sinh tổ hợp <strong>${code}</strong>: <strong>${total.toLocaleString()}</strong>
      </div>
    </div>
  `;

  // Hiển thị kết quả
  const alertBox = document.getElementById("alert");
  alertBox.className = "alert alert-info";
  alertBox.innerHTML = messageHTML;
  alertBox.classList.remove("d-none");
  addScoreMarkerToChart(score);
}

function addScoreMarkerToChart(score) {
  const chart = Highcharts.charts.find(c => c && c.renderTo.id === "chart");

  if (!chart) return;

  // Xóa đường kẻ cũ nếu có
  chart.xAxis[0].removePlotLine("userScoreLine");

  // Thêm đường kẻ mới
  chart.xAxis[0].addPlotLine({
    value: score,
    color: 'red',
    width: 2,
    id: "userScoreLine",
    dashStyle: 'Dash',
    zIndex: 10,
    label: {
      text: ``,
      rotation: 0,
      align: 'center',
      y: 0,
      style: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px', 
        background: '#fff',
        padding: 4
      }
    }
  });
}
