function makeResponsive() {

	// Step 1: Set up our chart
	//= ================================
	var svgWidth = 1000;
	var svgHeight = 600;

	var margin = {
	  top: 20,
	  right: 40,
	  bottom: 100,
	  left: 100
	};

	var width = svgWidth - margin.left - margin.right;
	var height = svgHeight - margin.top - margin.bottom;

	// Step 2: Create an SVG wrapper,
	// append an SVG group that will hold our chart,
	// and shift the latter by left and top margins.
	// =================================
	var svg = d3
	  .select("#scatter")
	  .append("svg")
	  .attr("width", svgWidth)
	  .attr("height", svgHeight);

	// create svg container
	//var svg = d3.select("#scatter").append("svg")
	 //   .attr("height", ChartHeight)
	  //  .attr("width", ChartWidth);

	// shift everything over by the margins
	var chartGroup = svg.append("g")
	    .attr("transform", `translate(${margin.left}, ${margin.top})`);

	//Initial Parameters
	var chosenXAxis = "poverty";
	var chosenYAxis = "obesity";

	// Import data from an external CSV file
	d3.csv("assets/data/data.csv").then(function(healthcareInfo, err) {
	  if (err) throw err;
	  console.log(healthcareInfo);
	  console.log([healthcareInfo]);

	  // Format the data
	  healthcareInfo.forEach(function(data) {
	    data.poverty = +data.poverty;
	    data.age = +data.age;
	    data.income = +data.income;
	    data.healthcare = +data.healthcare;
	    data.obesity = +data.obesity;
	    data.smokes = +data.smokes;
	    
	  });

	// Create scaling functions
		var xLinearScale = xScale(healthcareInfo, chosenXAxis);

		var yLinearScale = yScale(healthcareInfo, chosenYAxis);

	  // Create axis functions
	  	var bottomAxis = d3.axisBottom(xLinearScale);
	  	var leftAxis = d3.axisLeft(yLinearScale);
	  
	  // Add x-axis
		var xAxis = chartGroup.append("g")
		  	.classed("chart", true)
		    .attr("transform", `translate(0, ${height})`)
		    .call(bottomAxis);

	  // Add y-axis to the left side of the display
		var yAxis = chartGroup.append("g")
		    // Define the color of the axis text
		    .classed("chart", true)
		    .call(leftAxis);

		// append circles to data points
		var circlesGroup = chartGroup.selectAll("circle")
		  .data(healthcareInfo)
		  .enter()
		  .append("circle")
		  .attr("r", "10")
		  .classed("stateCircle", true)
		  .attr("stroke-width", "3")
		  .attr("cx", d => xLinearScale(d[chosenXAxis]))
		  .attr("cy", d => yLinearScale(d[chosenYAxis]))
		  .attr("fill", "red");
		// Event listeners with transitions
	  	circlesGroup.on("mouseover", function() {
	  	 	d3.select(this)
			  .transition()
			  .duration(1000);
			  //.attr("r", 20)
			  //.attr("fill", "lightblue");
			});

		circlesGroup.on("mouseout", function() {
		    d3.select(this)
		      .transition()
		      .duration(1000);
		      //.attr("r", 10)
		      //.attr("fill", "red");
		  });

		//add state abbreviation
		var stateAbrvs = chartGroup.selectAll()
			.data(healthcareInfo)
			.enter()
			.append("text")
			.attr("r", "10")
			.classed("stateText", true)
			.attr("x", d => xLinearScale(d[chosenXAxis]))
			.attr("y", d => yLinearScale(d[chosenYAxis]))
			.text(d => d.abbr)
			.attr("dy", 5);

		 // Create group for three x-axis labels
		var labelsXGroup = chartGroup.append("g")
		    .attr("transform", `translate(${width / 2}, ${height + 20})`)
		    .classed("aText", true);

		var povertyLabel = labelsXGroup.append("text")
		    .attr("x", 0)
		    .attr("y", 20)
		    .attr("value", "poverty") // value to grab for event listener
		    .classed("active", true)
		    .text("In Poverty (%)");

		var ageLabel = labelsXGroup.append("text")
		    .attr("x", 0)
		    .attr("y", 40)
		    .attr("value", "age") // value to grab for event listener
		    .classed("inactive", true)
		    .text("Age (Median)");

		 var incomeLabel = labelsXGroup.append("text")
		    .attr("x", 0)
		    .attr("y", 60)
		    .attr("value", "income") // value to grab for event listener
		    .classed("inactive", true)
		    .text("Household Income (Median)");

		 // Create group for three y-axis labels
		var labelsYGroup=chartGroup.append("g")
		    .attr("transform", "rotate(-90)")
		    .attr("dy", "1em")
		    .classed("aText", true);

		var obesityLabel = labelsYGroup.append("text")
		    .attr("x", 0 - (height/2))
		    .attr("y", 0 - margin.left + 20)
		    .attr("value", "obesity") // value to grab for event listener
		    .classed("active", true)
		    .text("Obesse (%)");

		var smokesLabel = labelsYGroup.append("text")
		    .attr("x", 0 - (height/2))
		    .attr("y", 0 - margin.left + 40)
		    .attr("value", "smokes") // value to grab for event listener
		    .classed("inactive", true)
		    .text("Smokes (%)");

		var healthcareLabel = labelsYGroup.append("text")
		    .attr("x", 0 - (height/2))
		    .attr("y", 0 - margin.left + 60)
		    .attr("value", "healthcare") // value to grab for event listener
		    .classed("inactive", true)
		    .text("Lacks Healthcare (%)");

		//update tooltip
		var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
		var stateAbrvs = updateToolText(chosenXAxis, chosenYAxis, stateAbrvs);

	 // x axis labels event listener
		labelsXGroup.selectAll("text")
		    .on("click", function() {
		      // get value of selection
			    var value = d3.select(this).attr("value");
			    if (value !== chosenXAxis) {

			        // replaces chosenXAxis with value
			        chosenXAxis = value;

			        // console.log(chosenXAxis)

			        // updates x scale for new data
			        xLinearScale = xScale(healthcareInfo, chosenXAxis);

			        // updates x axis with transition
			        xAxis = renderXAxes(xLinearScale, xAxis);

			        // updates circles with new x values
			        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
			        stateAbrvs = renderText(stateAbrvs, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

			        // updates tooltips with new info
			        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
			        stateAbrvs = updateToolTip(chosenXAxis, chosenYAxis, stateAbrvs);

		        // changes classes to change bold text
		        if (chosenXAxis === "poverty") {
			          povertyLabel
			            .classed("active", true)
			            .classed("inactive", false);
			          ageLabel
			            .classed("active", false)
			            .classed("inactive", true);
			          incomeLabel
			            .classed("active", false)
			            .classed("inactive", true);  
			    } else  if (chosenXAxis === "age") {
			          povertyLabel
			            .classed("active", false)
			            .classed("inactive", true);
			          ageLabel
			            .classed("active", true)
			            .classed("inactive", false);
			          incomeLabel
			            .classed("active", false)
			            .classed("inactive", true);  
			    } else {
				          povertyLabel
				            .classed("active", false)
				            .classed("inactive", true);
				          ageLabel
				            .classed("active", false)
				            .classed("inactive", true);
				          incomeLabel
				            .classed("active", true)
				            .classed("inactive", false); 
				        }
			    }

			});

	    // y axis labels event listener
		  labelsYGroup.selectAll("text")
		    .on("click", function() {
		      // get value of selection
		      var value = d3.select(this).attr("value");
		      if (value !== chosenYAxis) {

		        // replaces chosenYAxis with value
		        chosenYAxis = value;

		        console.log(chosenYAxis);

		        // updates y scale for new data
		        yLinearScale = yScale(healthcareInfo, chosenYAxis);

		        // updates y axis with transition
		        yAxis = renderYAxes(yLinearScale, yAxis);

		        // updates circles with new y values
		        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
		        stateAbrvs = renderText(stateAbrvs, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

		        // updates tooltips with new info
		        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
		        stateAbrvs = updateToolTip(chosenXAxis, chosenYAxis, stateAbrvs);

		        // changes classes to change bold text
		        if (chosenYAxis === "healthcare") {
		          obesityLabel
		            .classed("active", false)
		            .classed("inactive", true);
		          smokesLabel
		            .classed("active", false)
		            .classed("inactive", true);
		          healthcareLabel
		            .classed("active", true)
		            .classed("inactive", false);  
		        } else  if (chosenYAxis === "smokes") {
		          obesityLabel
		            .classed("active", false)
		            .classed("inactive", true);
		          smokesLabel
		            .classed("active", true)
		            .classed("inactive", false);
		          healthcareLabel
		            .classed("active", false)
		            .classed("inactive", true);  
		        } else {
		          obesityLabel
		            .classed("active", true)
		            .classed("inactive", false);
		          smokesLabel
		            .classed("active", false)
		            .classed("inactive", true);
		          healthcareLabel
		            .classed("active", false)
		            .classed("inactive", true); 
		        }
		      }
		    });

	    //xScale function
	    function xScale(healthcareInfo, chosenXAxis) {
	    	var xLinearScale = d3.scaleLinear()
		    	.domain([d3.min(healthcareInfo, d => d[chosenXAxis]) *0.75,
		    		d3.max(healthcareInfo, d => d[chosenXAxis]) *1
		    		])
		    	.range([0, width]);
		    return xLinearScale;
	    }

	    //yScale function
	    function yScale(healthcareInfo, chosenYAxis) {
	    	var yLinearScale = d3.scaleLinear()
		    	.domain([d3.min(healthcareInfo, d => d[chosenYAxis]) *0.75,
		    		d3.max(healthcareInfo, d => d[chosenYAxis]) *1
		    		])
		    	.range([height, 0]);
		    return yLinearScale;
	    }

	    //renderCircles function

	    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
	    	circlesGroup.transition()
	    		.duration(10)
	    		.attr("cx", d => newXScale(d[chosenXAxis]))
	    		.attr("cy", d => newYScale(d[chosenYAxis]));
		    return circlesGroup;
	    }

	     //renderText function

	    function renderText(stateAbrvs, newXScale, chosenXAxis, newYScale, chosenYAxis) {
	    	stateAbrvs.transition()
	    		.duration(10)
	    		.attr("x", d => newXScale(d[chosenXAxis]))
	    		.attr("y", d => newYScale(d[chosenYAxis]));
		    return stateAbrvs;
	    }

	    //renderXAxes function
		function renderXAxes(newXScale, xAxis) {
	    	
	    	 var bottomAxis = d3.axisBottom(newXScale);
	    	 xAxis.transition()
    			.duration(10)
    			.call(bottomAxis);

  			return xAxis;
	    }

	    //renderYAxes function
		function renderYAxes(newYScale, yAxis) {
	    	
	    	 var leftAxis = d3.axisLeft(newYScale);
	    	 yAxis.transition()
    			.duration(1000)
    			.call(leftAxis);

  			return yAxis;
	    }


	    // updateToolTip function

	    function updateToolTip (chosenXAxis, chosenYAxis, circlesGroup) {
	    	if (chosenXAxis === "poverty") {
	    		var xlabel = "Poverty (%):";
	    	} else if (chosenXAxis === "age") {
	    		var xlabel = "Age:";
	    	} else {
	    		var xlabel = "Income: $";
	    	}

	    	if (chosenYAxis === "obesity") {
	    		var ylabel = "Obesse (%):";
	    	} else if (chosenYAxis === "smokes") {
	    		var ylabel = "Smokes (%):";
	    	} else {
	    		var ylabel = "Lacks Healthcare (%):";
	    	}

	    	var toolTip = d3.tip()
	    		.attr("class", "d3-tip")
	    		.offset([80, -70])
	    		.html(function(d){
	    			return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
	    		});

	    	circlesGroup.call(toolTip);

	    	circlesGroup.on("mouseover", function(data){
	    		toolTip.show(data);
	    	});

	    	circlesGroup.on("mouseout", function(data){
	    		toolTip.hide(data);
	    	});

	    	return circlesGroup;
	    }

	    //updateToolText function
	    function updateToolText (chosenXAxis, chosenYAxis, stateAbrvs) {
	    	if (chosenXAxis === "poverty") {
	    		var xlabel = "Poverty (%):";
	    	} else if (chosenXAxis === "age") {
	    		var xlabel = "Age:";
	    	} else {
	    		var xlabel = "Income: $";
	    	}

	    	if (chosenYAxis === "obesity") {
	    		var ylabel = "Obesse (%):";
	    	} else if (chosenYAxis === "smokes") {
	    		var ylabel = "Smokes (%):";
	    	} else {
	    		var ylabel = "Lacks Healthcare (%):";
	    	}

	    	var toolTip = d3.tip()
	    		.attr("class", "d3-tip")
	    		.offset([80, -80])
	    		.html(function(d){
	    			return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}`);
	    		});

	    	stateAbrvs.call(toolTip);

	    	stateAbrvs.on("mouseover", function(data){
	    		toolTip.show(data);
	    	});

	    	stateAbrvs.on("mouseout", function(data){
	    		toolTip.hide(data);
	    	});

	    	return stateAbrvs;
	    }
	 });
}
 
makeResponsive();

// Event listener for window resize.
// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);
   
