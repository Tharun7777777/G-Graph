// ==== Line Chart ====
fetch('line_data.php')
    .then(response => response.json())
    .then(data => {
        const svg = d3.select("#lineGraphContainer")
                      .append("svg")
                      .attr("width", 500)
                      .attr("height", 300);

        const margin = { top: 20, right: 20, bottom: 30, left: 50 };
        const width = +svg.attr("width") - margin.left - margin.right;
        const height = +svg.attr("height") - margin.top - margin.bottom;

        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

        const parseDate = d3.timeParse("%Y-%m-%d");

        data.forEach(d => {
            d.date = parseDate(d.date);
            d.total = +d.total;
        });

        const x = d3.scaleTime().rangeRound([0, width]);
        const y = d3.scaleLinear().rangeRound([height, 0]);

        x.domain(d3.extent(data, d => d.date));
        y.domain([0, d3.max(data, d => d.total)]);

        const line = d3.line()
            .x(d => x(d.date))
            .y(d => y(d.total));

        g.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x));

        g.append("g")
            .call(d3.axisLeft(y));

        g.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "#b972ff")
            .attr("stroke-width", 4)
            .attr("d", line);
    });



// ==== Pie Chart ====
fetch('pie_data.php')
    .then(response => response.json())
    .then(data => {
        const width = 300, height = 300, radius = Math.min(width, height) / 2;
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        const svg = d3.select("#pieChartContainer")
                      .append("svg")
                      .attr("width", width)
                      .attr("height", height)
                      .append("g")
                      .attr("transform", `translate(${width / 2},${height / 2})`);

        const pie = d3.pie().value(d => d.total);
        const arc = d3.arc().innerRadius(0).outerRadius(radius);

        const arcs = svg.selectAll("arc")
            .data(pie(data))
            .enter()
            .append("g");

        arcs.append("path")
            .attr("fill", d => color(d.data.category))
            .attr("d", arc);

        arcs.append("text")
            .attr("transform", d => `translate(${arc.centroid(d)})`)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .text(d => d.data.category);
    });

// ==== Calendar Heatmap ====
fetch('calender_data.php')
    .then(response => response.json())
    .then(data => {
        const cellSize = 40; // Bigger for better visibility
        const width = 7 * cellSize;  // 7 days per week
        const height = Math.ceil(data.length / 7) * cellSize;

        const svg = d3.select("#calendarHeatmapContainer")
                      .append("svg")
                      .attr("width", width + 100)
                      .attr("height", height + 50);

        const parseDate = d3.timeParse("%Y-%m-%d");
        const formatDate = d3.timeFormat("%d");

        const color = d3.scaleSequential()
                        .domain([0, d3.max(data, d => d.total)])
                        .interpolator(d3.interpolateBlues);

        data.forEach(d => {
            d.dateObj = parseDate(d.date);
        });

        svg.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("x", (d, i) => (d.dateObj.getDay()) * cellSize)
            .attr("y", (d, i) => (Math.floor(i / 7)) * cellSize)
            .attr("width", cellSize - 5)
            .attr("height", cellSize - 5)
            .attr("fill", d => color(d.total));

        svg.selectAll("text.date")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "date")
            .attr("x", (d, i) => (d.dateObj.getDay()) * cellSize + 5)
            .attr("y", (d, i) => (Math.floor(i / 7)) * cellSize + 15)
            .style("font-size", "10px")
            .text(d => formatDate(d.dateObj));

        svg.selectAll("text.total")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "total")
            .attr("x", (d, i) => (d.dateObj.getDay()) * cellSize + 5)
            .attr("y", (d, i) => (Math.floor(i / 7)) * cellSize + 30)
            .style("font-size", "10px")
            .text(d => d.total > 0 ? `₹${d.total}` : "");
    });










