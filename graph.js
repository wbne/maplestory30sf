// import Chart from 'chart.js/auto'
import "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";

function formatNumber(number) {
    const units = ['','K','M','B','T']; // Thousand, Million, Billion, Trillion
    let unitIndex = 0;
    let formattedNumber = Number(number);

    while (formattedNumber >= 1000 && unitIndex < units.length - 1) {
        formattedNumber /= 1000;
        unitIndex++;
    }

    // Format the number with one decimal place
    return `${formattedNumber.toFixed(2)}${units[unitIndex]}`;
}

window.plotLineGraph = function plotLineGraph(dataFrame, level, start, end) {
    const labels = dataFrame.getColumn('prob');
    const data = {
    labels: labels,
    datasets: [
        {
        label: 'Cost',
        data: dataFrame.getColumn('cost'),
        borderColor: 'rgb(57, 200, 50)',
        backgroundColor: 'rgba(125, 251, 123, 0.5)',
        type: 'line',
        order: 0,
        yAxisID: 'y1',
        },
        {
        label: 'Booms',
        data: dataFrame.getColumn('booms'),
        borderColor: 'rgb(200, 50, 50)',
        backgroundColor: 'rgba(251, 123, 123, 0.5)',
        yAxisID: 'y2',
        }
    ]
    };

    const config = {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            interaction: {
                intersect: false,
                mode: 'index',
            },
            onClick: (evt, activeElements, chart) => {
                const index = activeElements[0].index;
                // console.log(`Cost: ${chart.data.datasets[0].data[index]}`);
                // console.log(`Booms: ${chart.data.datasets[1].data[index]}`);
                // console.log(`Probability: ${chart.data.labels[index]}`);
                const result = `Starforcing Lv. ${level} from ${start} -> ${end}
Percentile: ${chart.data.labels[index]}
Cost: ${formatNumber(chart.data.datasets[0].data[index])}
Booms: ${formatNumber(chart.data.datasets[1].data[index])}`;
                navigator.clipboard.writeText(result);
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Starforcing Lv. ${level} from ${start} -> ${end}`
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += formatNumber(context.parsed.y);
                            }
                            return label;
                        },
                    }
                }
            },
            scales: {
                y1: {
                  type: 'linear',
                  display: true,
                  position: 'left',
                },
                y2: {
                  type: 'linear',
                  display: true,
                  position: 'right',
          
                  // grid line settings
                  grid: {
                    drawOnChartArea: false, // only want the grid lines for one axis to show up
                  },
                },
              }
        },
    };

    let chartStatus = Chart.getChart("chart"); // <canvas> id
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    new Chart(
        document.getElementById('chart'),
        config
    );
}