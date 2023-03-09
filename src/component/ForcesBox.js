import React from "react";
import * as d3 from "d3";
import $ from 'jquery';

export default class ForcesBox extends React.Component {

    componentDidMount() {
        //console.log("caseResidualBox", this.props);
    }

    componentWillUpdate(nextProps, nextState, nextContext) {
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        this.drawChart();
    }

    get_average_forces(values) {
      if (values && values.length > 0) {
        let queue = [];
        let result = [];
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
          let hist_len = Math.max(parseInt(i * 0.1), 1);
          queue.push(values[i]);
          sum += values[i];
          while (queue.length > hist_len) {
            sum -= queue.shift();
          }
          let average_force = sum / queue.length;
          result.push(average_force);
        }
        return result;
      } else {
        return [];
      }
    }

    expo(x, f) {
      return Number.parseFloat(x).toExponential(f);
    }

    drawChart() {
        let forces = [];
        const get_total_forces_body = this.props.data;
        d3.select(`#forces-${this.props.id}`).selectAll("svg").remove();
        d3.select(`#forces-${this.props.id}`).selectAll("div").remove();
        $(`#forces-${this.props.id}-reading`).empty();
        if(get_total_forces_body) {
            let avg_CL = this.get_average_forces(get_total_forces_body["CL"]);
            let avg_CD = this.get_average_forces(get_total_forces_body["CD"]);
            let avg_CFx = this.get_average_forces(get_total_forces_body["CFx"]);
            let avg_CFy = this.get_average_forces(get_total_forces_body["CFy"]);
            let avg_CFz = this.get_average_forces(get_total_forces_body["CFz"]);
            let avg_CMx = this.get_average_forces(get_total_forces_body["CMx"]);
            let avg_CMy = this.get_average_forces(get_total_forces_body["CMy"]);
            let avg_CMz = this.get_average_forces(get_total_forces_body["CMz"]);
            for (let i = 0; i < get_total_forces_body.steps.length; ++i) {
                forces.push({
                    "steps": get_total_forces_body["steps"][i],
                    "CL": get_total_forces_body["CL"][i],
                    "CD": get_total_forces_body["CD"][i],
                    "CFx": get_total_forces_body["CFx"][i],
                    "CFy": get_total_forces_body["CFy"][i],
                    "CFz": get_total_forces_body["CFz"][i],
                    "CMx": get_total_forces_body["CMx"][i],
                    "CMy": get_total_forces_body["CMy"][i],
                    "CMz": get_total_forces_body["CMz"][i],
                    "CL_avg": avg_CL[i],
                    "CD_avg": avg_CD[i],
                    "CFx_avg": avg_CFx[i],
                    "CFy_avg": avg_CFy[i],
                    "CFz_avg": avg_CFz[i],
                    "CMx_avg": avg_CMx[i],
                    "CMy_avg": avg_CMy[i],
                    "CMz_avg": avg_CMz[i],
                });
            }
            $(`#forces-${this.props.id}-reading`).append(
              '<table  style="width:600px;" ><tr><th>CL: </th><th>' + this.expo(avg_CL[avg_CL.length-1],4) +'</th><th>' +
              'CD: </th><th>' + this.expo(avg_CD[avg_CD.length-1], 4) + '</th><th></th></tr><tr><th>' +
              'CFx:</th><th>' + this.expo(avg_CFx[avg_CFx.length-1],4)+ '</th><th>' +
              'CFy:</th><th>' + this.expo(avg_CFy[avg_CFy.length-1], 4)+ '</th><th>' +
              'CFz:</th><th>' + this.expo(avg_CFz[avg_CFz.length-1], 4)+ '</th></tr><tr><th>' +
              'CMx:</th><th>' + this.expo(avg_CMx[avg_CMx.length-1],4) + '</th><th>' +
              'CMy:</th><th>' + this.expo(avg_CMy[avg_CMy.length-1], 4)+ '</th><th>' +
              'CMz:</th><th>' + this.expo(avg_CMz[avg_CMz.length-1], 4) + '</th></tr></table>'
            );

            this.drawForces(forces,{
                'CL' : 'blue',
                'CD' : 'red'
            }, []);

            this.drawForces(forces,{
                'CFx' : 'red',
                'CFy' : 'green',
                'CFz' : 'blue'
            },[]);

            this.drawForces(forces,{
                'CMx' : 'red',
                'CMy' : 'green',
                'CMz' : 'blue'
            },[]);
        }


    }

    drawForces(forces, colors, extra)
    {
        let axisColors = {
            'red' : '#d62728',
            'green' : '#2ca02c',
            'blue' : '#1f77b4'
        };
        let axisClasses = {
            'blue' : 'axisBlue',
            'red' : 'axisRed',
            'green' : 'axisGreen'
        };

        // transform data
        const margin = {top: 20, right: 250, bottom: 60, left: 120},
            width = this.props.width - margin.left - margin.right,
            height = this.props.height - margin.top - margin.bottom;

        // append the svg obgect to the body of the page
        // appends a 'group' element to 'svg'
        // moves the 'group' element to the top left margin
        var div = d3.select(`#forces-${this.props.id}`).append("div")
            .style("width", this.props.width+"px")
            .style("height", this.props.height+"px")
            .style("position", "relative");
        var valueDiv = div.append("div")
            .style("position", "absolute")
            .style("top", "40px")
            .style("right", "290px")
            .style("padding", "8px")
        Object.keys(colors).map((key, index) => {
            var innerValueDiv = valueDiv.append("div")
                .attr("key", index)
                .style("display", "flex")
                .style("justify-content", "flex-start")
                .style("align-items", "center")
            innerValueDiv.append("span")
                .style("background", axisColors[colors[key]])
                .style("width", "20px")
                .style("height", "5px")
                .style("margin-right", "10px");
            innerValueDiv.append("p")
                .style("margin", 0)
                .style("font-weight", "bold")
                .text(key)

        })
        var svg = div.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g").attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        svg.append('clipPath')
            .attr('id', 'clipper')
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', this.props.width)
            .attr('height', 100);

        // set the ranges
        var x = d3.scaleLinear().range([0, width]);
        var y = {};
        for (var k in colors)
            y[k] = d3.scaleLinear().range([height, 0]);

        // define the line
        var valuelines = {};
        for (var k in colors) {
            valuelines[k] = d3.line()
                .x(function(d) { return x(d.steps); })
                .y(function(d) { return y[k](d[k]); });
        }

        // Scale the range of the forces
        x.domain(d3.extent(forces, function(d) { return d.steps; }));

        for (var k in colors) {
            let y_min =  d3.min(forces.slice(Math.floor(forces.length / 3)), function(d) { return d[k]; }) - 0.00025;
            let y_max =  d3.max(forces.slice(Math.floor(forces.length / 3)), function(d) { return d[k]; }) + 0.00025;
            y[k].domain([y_min - 0.5 * (y_max - y_min),
                y_max + 0.5 * (y_max - y_min)]);
        }

        // Add the valueline path.
        for (var k in colors) {
            svg.append("path")
                .data([forces])
                .attr("class", "line")
                .attr("stroke", axisColors[colors[k]])
                .attr("d", valuelines[k]);
        }

        // Add the X Axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", 'axis')
            .call(d3.axisBottom(x));

        svg.append("text")
            .attr("y", height+40)
            .attr("x", width/2)
            .style("text-anchor", "middle")
            .text('step');

        let axisFunctions = {
            'red' : d3.axisLeft,
            'blue' : d3.axisRight,
            'green' : d3.axisLeft
        };

        let axisShift = {
            'red' : 0,
            'blue' : width,
            'green' : width
        };

        let axisLabelShift = {
            'red' : -80,
            'blue' : width+120,
            'green' : width-80
        };

        // Add the Y Axis
        for (var k in colors) {
            var c = colors[k];
            svg.append("g")
                .attr("class", axisClasses[c])
                .attr("transform", "translate(" + axisShift[c].toString() + ", 0 )")
                .call(axisFunctions[c](y[k]));
            svg.append("text")
                .attr("y", height / 2)
                .attr("x",-20 + axisLabelShift[c])
                .attr("fill", axisColors[c])
                .style("text-anchor", "middle")
                .text(k.split('_')[0]);
        }

        let height_line = 20;
        for (let i = 0; i < extra.length; i++) {
          svg.append("text")
          .attr("y", height / 3 * 2 + height_line * i)
          .attr("x", width+100)
          .attr("fill", "#000000")
          .attr("font-family", "sans-serif")
          .attr("font-size", "15px")
          .text('*'+extra[i]);
        }


        // gridlines in x axis function
        function make_x_gridlines() {
            return d3.axisBottom(x)
                .ticks(5)
        }

        // gridlines in y axis function
        function make_y_gridlines() {
            for (var k in colors)
                return d3.axisLeft(y[k])
                    .ticks(5)
        }

        svg.append("g")
            .attr("class", "grid")
            .attr("transform", "translate(0," + height + ")")
            .call(make_x_gridlines()
                .tickSize(-height)
                .tickFormat("")
            )

        // add the Y gridlines
        svg.append("g")
            .attr("class", "grid")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
            )
    }
    render() {
        return <div ><div id="force_box">Latest forces averaged over last 10% steps:</div>
        {this.props.data && this.props.data.steps && this.props.data.steps.length ? 
            <div><div id={`forces-${this.props.id}-reading`}></div>
             <div id={`forces-${this.props.id}`}></div></div> :
            <div style={{width: "100%", display: "flex", justifyContent: "center", margin: "20px"}}><div class="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
             </div></div>
        }
        </div>
    }


}
