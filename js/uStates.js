(function(){
	var uStates={};
		
	uStates.draw = function(id, data, toolTip){		
		function mouseOver(d){
			d3.select("#tooltip").transition().duration(200).style("opacity", .9);      
			
			d3.select("#tooltip").html(toolTip(d.n, data[d.id]))  
				.style("left", (d3.event.pageX - 50) + "px")     
				.style("top", (d3.event.pageY - 550) + "px");
		}
		
		function mouseOut(){
			d3.select("#tooltip").transition().duration(500).style("opacity", 0);      
		}
		
		d3.select(id).append("g")
			.attr("transform", "translate(30, 30)")
		  .selectAll(".state")
			.data(uStatePaths).enter().append("path").attr("class","state").attr("d",function(d){ return d.d;})
			.style("fill",function(d){ return data[d.id].color; })
			.on("mouseover", mouseOver).on("mouseout", mouseOut);
	}
	this.uStates=uStates;
})();

