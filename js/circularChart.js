
function cirChart_func () {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 700 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom,
        innerRadius = 150,
        outerRadius = Math.min(width, height) / 2,
        y = d3.scaleRadial().range([innerRadius, outerRadius])
            .domain([0, 130]);
            
    var svg_sce2 = d3.select("#circular").append("svg")
            .attr("id", "circular_svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + (margin.left + width / 2) + "," + (margin.top + height / 2) + ")");

    d3.csv("data/2_circular_barplot.csv", function(d) {
        d.Deaths = +d.Deaths;
        // console.log(d.deaths)
        return d;
    }, function(error, data) {
        if (error) throw error;

        var x = d3.scaleBand().range([0, 2 * Math.PI]).align(0)
            .domain(data.map(function(d) { return d.State; }));


        svg_sce2.append("g")
          .selectAll("path")
            .data(data)
            .enter()
            .append("path")
            .attr("fill", function(d) { return color[d['color']]; })
            .attr("d", d3.arc()     // imagine your doing a part of a donut plot
                .innerRadius(innerRadius)
                .outerRadius(function(d) { return y(d['Deaths']); })
                .startAngle(function(d) { return x(d.State); })
                .endAngle(function(d) { return x(d.State) + x.bandwidth(); })
                .padAngle(0.05)
                .padRadius(innerRadius)).call(toolTip_circular)

        svg_sce2.append("g")
                .selectAll("g")
                .data(data)
                .enter()
                .append("g")
                .attr("text-anchor", function(d) { return (x(d.State) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "end" : "start"; })
                .attr("transform", function(d) { return "rotate(" + ((x(d.State) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")"+"translate(" + (y(d['Deaths'])+10) + ",0)"; })
                .append("text")
                .text(function(d){return(d.State)})
                .attr("transform", function(d) { return (x(d.State) + x.bandwidth() / 2 + Math.PI) % (2 * Math.PI) < Math.PI ? "rotate(180)" : "rotate(0)"; })
                .style("font-size", "20px")
                .attr("alignment-baseline", "middle").call(toolTip_circular)
    });

    function toolTip_circular(selection) {

        // add tooltip (svg circle element) when mouse enters label or slice
        selection.on('mouseenter', function (data) {

            svg_sce2.append('circle')
                .attr('class', 'toolCircle')
                .attr('r', innerRadius * 0.85) // radius of tooltip circle
                .style('fill', function(d) { return color[data['color']]; }) // colour based on category mouse is over
                .style('fill-opacity', 0.35);

            svg_sce2.append('text')
                .attr('class', 'toolCircle')
                .attr('dy', "-1.2em") // hard-coded. can adjust this to adjust text vertical alignment in tooltip
                .html(toolTipHTML_circular(data)) // add text to the circle.
                .style('text-anchor', 'left'); // centres text in tooltip

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

        for (var key in data) {

            if (key == 'color') { continue; }
            var value = data[key];
            if (i === 0) tip += '<tspan x="-5.4em">' + value + '</tspan>';
             else tip += '<tspan x="-5.4em" dy="1.2em">' + key + ': ' + value + '</tspan>';
            i++;
        }

        return tip;
    }

}


function usMap_func () {
    var sampleData ={};
    d3.csv("data/2_circular_barplot.csv", function(d) {
        uStatePaths.forEach(function (s) {
            if (d.State == s.n) { 
                sampleData[s.id] = {Deaths: +d.Deaths, 
                    "Deaths/million": +d["Deaths/million"],
                    "Deaths/million rank": +d["Deaths/million rank"],
                    color: color[+d.color]}
            }
        })
    }, function(error, raw) {
        if (error) throw error;
        var svg = d3.select("#usMap").append("svg")
                .attr("width", 400)
                .attr("height",500);
        uStates.draw(svg, sampleData, tooltipHtml);
         // draw legend
         var all_case = [">60 deaths", "31-60 deaths", "21-30 deaths", "11-20 deaths", "6-10 deaths", "1-5 death(s)", "0 death"];
         var legend = d3.select("usMap").append("g").selectAll(".legend")
             .data(all_case)
             .enter().append("g")
             .attr("class", "legend")
             .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

         // // draw legend colored rectangles
         legend.append("rect")
             .attr("x", +d3.select("#usMap").attr("width")-20)
             .attr("y", +d3.select("#usMap").attr("height")/2-100)
             .attr("width", 10)
             .attr("height", 10)
             .attr("fill", function(d, i) { return color[i]});
 
         // // draw legend text
         legend.append("text")
             .attr("x", +d3.select("#usMap").attr("width"))
             .attr("y", +d3.select("#usMap").attr("height")/2-89)
             .text(function(d) { return d;})
 
    });

    function tooltipHtml(n, d){	/* function to create html content string in tooltip div. */
        var tip = "<h4>"+n+"</h4><table>"
        for (var key in d) {
            if (key == 'color') { continue; }
            var value = d[key];
            tip += '<tr><td>' + key + '<td>' + value + '</tr></td>';
        }
        return tip
	}
}

// usMap_func ();
cirChart_func ();

