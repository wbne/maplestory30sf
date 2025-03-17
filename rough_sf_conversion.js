function parseCSVToDataFrame(csvContent) {
    const rows = csvContent.split('\n').filter(row => row.trim() !== '');
    const headers = rows[0].split(',').map(header => header.trim());
    const data = [];

    // Loop through each row (starting from index 1 to skip headers)
    for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(value => value.trim());
        const rowObject = {};

        // For each column, associate the value with the corresponding header
        for (let j = 0; j < headers.length; j++) {
            rowObject[headers[j]] = values[j] || null; // Handle empty cells
        }

        data.push(rowObject);
    }

    return {
        columns: headers,
        rows: data,
        getColumn: function(columnName) {
            return this.rows.map(row => row[columnName]);
        },
        getRow: function(index) {
            return this.rows[index];
        },
        shape: function() {
            return [this.rows.length, this.columns.length];
        }
    };
}

function fetchCSV(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);  // Set up a GET request for the CSV file

    // Set the callback for when the request finishes
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            const csvContent = xhr.responseText;  // Get the CSV content
            const dataFrame = parseCSVToDataFrame(csvContent);  // Parse the CSV
            console.log(`Loaded ${url}`)
            callback(dataFrame);
        } else {
            console.error('Failed to load CSV file');
        }
    };
    xhr.send();
}

// statistics function to calculate costs and plot data
/*
    less boom flag
    starcatch flag
*/
function statistics(start, goal, level = 200, thirty = false, lessboom = false, starcatch = false) {
    const costs = allCosts[level];
    const success = percentages.getColumn('pass');
    const maintain = percentages.getColumn('stay');
    const boom = percentages.getColumn('boom');
    let chartData = 'prob,cost,booms\n';

    const p_threshold = 0.96;
    let prevP = 0;
    let probability = -1;
    let attempt = 0;
    let expectedBoom = 0;
    let estimatedCost = 0;

    let multiplier = 1;
    if (thirty) {
        multiplier = 0.7;
    }

    const maxStar = 30;
    let states = [Array(maxStar + 1).fill(0)];
    states[0][start] = 1;

    while (probability < p_threshold) {
        let distribution = Array(maxStar + 1).fill(0);

        let current = states.pop();
        let midrun = 1 - current[goal];

        for (let star = 0; star < goal; star++) {
            distribution[star] += current[star] * maintain[star];
            distribution[star + 1] += current[star] * success[star];
            distribution[12] += current[star] * boom[star];

            estimatedCost += multiplier * costs[star] * current[star] / midrun;
            expectedBoom += current[star] * boom[star] / midrun;
        }

        distribution[goal] += current[goal];
        states.push(distribution);

        attempt++;
        probability = states[0].slice(goal).reduce((sum, value) => sum + value, 0);

        if (probability > prevP + 0.01) {
            chartData += `${probability.toFixed(2)},${estimatedCost.toFixed(0)},${expectedBoom.toFixed(2)}\n`;
            prevP = probability;
        }
    }

    console.log(`Final estimated cost: ${estimatedCost.toFixed(2)} with ${expectedBoom.toFixed(2)} booms`);
    plotLineGraph(parseCSVToDataFrame(chartData), level, start, goal);
}

let percentages;
fetchCSV('percentages.csv', function(dataFrame) {
    percentages = dataFrame;
});
let allCosts = {};
const levels = [140, 150, 160, 200, 250];
for(let index in levels) {
    fetchCSV(levels[index] + '.csv', function(dataFrame) {
        allCosts[levels[index]] = dataFrame.getColumn('cost');
    });
}

// document.getElementById("chart").onclick = function(event) {
//     const target = event.target;
//     if(typeof target === 'object') {
//         console.log(target)
//     }
// };

// Handle Popup Button Click
document.getElementById('chart').addEventListener('click', function() {
    document.getElementById('popup').style.display = 'flex'; // Show the popup
    setTimeout(function() {
        document.getElementById('popup').style.display = 'none';
    }, 2900); // <-- time in milliseconds
});

// Handle Close Button Click
document.getElementById('popup').addEventListener('click', function() {
    document.getElementById('popup').style.display = 'none'; // Hide the popup
});