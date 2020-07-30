function usMap_func () {
    var margin = {top: 10, right: 50, bottom: 60, left: 50},
    width = 850 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    y = d3.scaleLinear().rangeRound([height, 0]).nice(),
    x = d3.scaleBand().rangeRound([0, width]).paddingInner(0.05).align(0.1);

    var svg = d3.select("#usMap").append("svg")
        .attr("id", "usMap_svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // uStatePaths.forEach(function (s) {
    //     sampleData[s.id] = {deaths: 0, 
    //         deaths_million: 0,
    //         rank_in_deaths_million: 0,
    //         color: "#bab0ac"}
    // })
    d3.csv("data/2_circular_barplot.csv", function(d) {
        uStatePaths.forEach(function (s) {
            if (d.state == s.n) { 
                sampleData[s.id] = {deaths: +d.deaths, 
                    deaths_million: +d.deaths_million,
                    rank_in_deaths_million: +d.rank_in_deaths_million,
                    color: color[+d.color]}
            }
        })
    }, function(error, raw) {
        if (error) throw error;
        uStates.draw("#usMap", sampleData, tooltipHtml);
    });

    function tooltipHtml(n, d){	/* function to create html content string in tooltip div. */
		return "<h4>"+n+"</h4><table>"+
			"<tr><td>Deaths</td><td>"+(d.deaths)+"</td></tr>"+
			"<tr><td>Deaths/million</td><td>"+(d.deaths_million)+"</td></tr>"+
			"<tr><td>Rank in Deaths/million</td><td>"+(d.rank_in_deaths_million)+"</td></tr>"+
			"</table>";
	}
}



function cirChart_func () {
    var margin = {top: 150, right: 100, bottom: 150, left: 100},
        width = 1920 * 0.5 - margin.left - margin.right,
        height = 1080 - margin.top - margin.bottom,
        innerRadius = 180,
        outerRadius = Math.min(width, height) / 2,
        y = d3.scaleRadial().range([innerRadius, outerRadius])
            .domain([0, 130]);


    d3.csv("data/2_circular_barplot.csv", function(d) {
        d.deaths = +d.deaths;
        // console.log(d.deaths)
        return d;
    }, function(error, data) {
        if (error) throw error;

        var x = d3.scaleBand().range([0, 2 * Math.PI]).align(0)
            .domain(data.map(function(d) { return d.state; }));


        svg_sce2.append("g")
          .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", function(d) { return color[d['color']]; })
            .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                .innerRadius(innerRadius)
                .outerRadius(function(d) { return y(d['deaths']); })
                .startAngle(function(d) { return x(d.state); })
                .endAngle(function(d) { return x(d.state) + x.bandwidth(); })
                .padAngle(0.05)
                .padRadius(innerRadius)).call(toolTip_circular)

        svg_sce2.append("g")
                .selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("text-anchor", function(d) { return (x(d.state) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
                .attr("transform", function(d) { return "rotate(" + ((x(d.state) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d['deaths'])+10) + ",0)"; })
                .append("text")
                .text(function(d){return(d.state)})
                .attr("transform", function(d) { return (x(d.state) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
                .style("font-size", "20px")
                .attr("alignment-baseline", "middle").call(toolTip_circular)

    });

    function toolTip_circular(selection) {

        // add tooltip (svg circle element) when mouse enters label or slice
        selection.on('mouseenter', function (data) {

            svg_sce2.append('text')
                .attr('class', 'toolCircle')
                .attr('dy', "-1.2em") // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                .html(toolTipHTML_circular(data)) // add text to the circle.
                .style('font-size', '1.5em')
                .style('text-anchor', 'left'); // centres text in tooltip

            svg_sce2.append('circle')
                .attr('class', 'toolCircle')
                .attr('r', innerRadius * 0.85) // radius of tooltip circle
                .style('fill', function(d) { return color[data['color']]; }) // colour based on category mouse is over
                .style('fill-opacity', 0.35);

        });

        // remove the tooltip when mouse leaves the slice/label
        selection.on('mouseout', function () {
            d3.selectAll('.toolCircle').remove();
        });
    }

    // function to create the HTML string for the tool tip. Loops through each key in data object
    // and returns the html string key: value
    function toolTipHTML_circular(data) {

        var tip = '',
            i   = 0;

    // console.log(data)

        for (var key in data) {

            if (key == 'color') { continue; }

            // if value is a number, format it as a percentage
            var value = data[key];

            // leave off 'dy' attr for first tspan so the 'dy' attr on text element works. The 'dy' attr on
            // tspan effectively imitates a line break.
            if (i === 0) tip += '<tspan x="-5.4em">' + key + ': ' + value + '</tspan>';
            else tip += '<tspan x="-5.4em" dy="1.2em">' + key + ': ' + value + '</tspan>';
            i++;
        }

        return tip;
    }

}

usMap_func ();


// var svg_sce2 = d3.select("#circularChart").append("svg")
//     .attr("id", "circularChart_svg")
//     .attr("width", 1920 - 200)
//     .attr("height", 1080 - 300)
//     .append("g")
//     .attr("transform", "translate(430, 370)")



// cirChart_func ();

