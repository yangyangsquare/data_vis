function usMap_func () {
    var margin = {top: 50, right: 50, bottom: 100, left: 50},
        width = 850 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom;

        // D3 Projection
        var projection = d3.geoAlbersUsa()
        .translate([width / 2, height / 2]) // translate to center of screen
        .scale([1000]); // scale things down so see entire US

        // Define path generator
        var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection

        //Create SVG element and append map to the SVG
        var svg = d3.select("#usMap")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom);
        var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        // Load in my states data!
        d3.csv("data/2_circular_barplot.csv", function(data) {
        var dataArray = [];
        for (var d = 0; d < data.length; d++) {
            dataArray.push(parseFloat(data[d].color))
        }

        // Load GeoJSON data and merge with states data
        d3.json("us-states.json", function(json) {

        // Loop through each state data value in the .csv file
        for (var i = 0; i < data.length; i++) {
            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
                var jsonState = json.features[j].properties.name;
                var d = data[i]
                if ( d.State == jsonState) {
                    // Copy the data value into the JSON
                    json.features[j].properties.color = d.color;
                    json.features[j].properties.Deaths = d.Deaths;
                    json.features[j].properties.Deaths_million = d["Deaths/million"];
                    json.features[j].properties.Deaths_million_rank = d["Deaths/million rank"];
                    // Stop looking through the JSON
                    break;
                }
            }
        }

        // Bind the data to the SVG and create one path per GeoJSON feature
        svg.selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function(d) { 
                // console.log(d.properties.value)
                return color[d.properties.color] })
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html("<h4>" + d.properties.name + "</h4><table>"
                    + "<tr><td>Deaths<td>" + d.properties.Deaths + "</tr></td>"
                    + "<tr><td>Deaths/million<td>" + d.properties.Deaths_million + "</tr></td>"
                    + "<tr><td>Deaths/million rank<td>" + d.properties.Deaths_million_rank + "</tr></td>")
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // draw legend
        var all_case = [">60 deaths", "31-60 deaths", "21-30 deaths", "11-20 deaths", "6-10 deaths", "1-5 death(s)", "0 death"];
        var legend = svg.append("g").selectAll(".legend")
            .data(all_case)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        // // draw legend colored rectangles
        legend.append("rect")
            .attr("x", width-150)
            .attr("y", height-10)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", function(d, i) { return color[i]});

        // // draw legend text
        legend.append("text")
            .attr("x", width-150+15)
            .attr("y", height-10+10)
            .text(function(d) { return d;})
    
         // annotation
        var arrow_pos = [350, 400],
            angle = 60,
            line_length = 150,
            textbox_length = 400,
            annotation_text = "Southern states see the most deaths.";
        annotation(svg, arrow_pos, angle, line_length, textbox_length, annotation_text)
        });
    });
}

usMap_func ();

