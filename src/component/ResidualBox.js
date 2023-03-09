import React from "react";
import * as d3 from "d3";
import "../style/default.css"
import { Chart } from "react-charts"

let data = [];

let axes;
const series = {
  showPoints: false,
}
let colorsWithNames = {};

export default class ResidualBox extends React.Component{

    componentDidMount() {
        //console.log("caseResidualBox", this.props);
    }

    componentWillUpdate(nextProps, nextState, nextContext) {

    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.drawChart();
    }

    drawChart() {
        const get_residual_body = this.props.data;
        d3.select(`#d3line-${this.props.id}`).selectAll("svg").remove();


        if(get_residual_body && get_residual_body.step) {
            const buildName = (name) => {
                let newName;
                if (name !== 'step' && name.indexOf("_") >= 0) {
                    const splitName =  name.split('_')[1];
                     newName =  `residual${splitName[0].toUpperCase() + splitName.slice(1)}`;
                     if (newName === 'residualCont') {
                         newName = 'residualMass';
                     }
                     return newName
                } else {
                    return name;
                }
            }

            var resid = [];
            let names= {};
            for (let i = 0; i < get_residual_body.step.length; i++) {
                let obj = {};
                
                Object.keys(get_residual_body).map((item, index) => {    
                   const name = buildName(item); 
                    ;
                    let colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#32efba', '#007bff', '#BD9E39', '#BDBDBD', '#5254A3', '#AD494A', '#A55194', '#8C564B', '#969696', '#9C9EDE', '#E7969C', '#DE9ED6', '#C49C94', '#D9D9D9', '#393B79', '#843C39', '#7B4173', '#8C6D31', '#636363', '#6B6ECF', '#D6616B', '#CE6DBD', '#BD9E39', '#BDBDBD', '#5254A3', '#AD494A', '#A55194', '#8C564B', '#969696', '#9C9EDE', '#E7969C', '#DE9ED6', '#C49C94', '#D9D9D9'];
                    if (name !== 'step' && name) {
                        names[name] = colors[index]; 
                    }
                    obj[name] = get_residual_body[item][i];
                    resid.push(
                        obj
                    );
                })
            }
            colorsWithNames = names;
            data = [];
            for(let eachName in colorsWithNames) {
                let eachData={label: eachName, color: colorsWithNames[eachName], data: []};
                for(let each of resid) {
                    if(eachData.data.length === 0 || each.step > eachData.data[eachData.data.length - 1][0]) eachData.data.push([each.step, each[eachName]]);
                }
                data.push(eachData);
            }
            axes = [
              { primary: true, type: 'linear', position: 'bottom', hardMax: data[0].data.length - 1 },
              { type: 'log', position: 'left', hardMax: 1, hardMin: 1e-12 }
            ]
        }

    }
    render() {
        return <div style={{ width: this.props.width, height: this.props.height, position: "relative", margin: "10px auto 40px 40px"}}>
            {Object.keys(colorsWithNames).length ? <div style={{position: "absolute", top: "30px", right: "20px", padding: "8px"}}>
                {Object.keys(colorsWithNames).map((key, index) => <div key={index} style={{display: "flex", justifyContent: "flex-start", alignItems: "center"}}><span style={{backgroundColor: colorsWithNames[key], width: "20px", height: "5px", marginRight: "10px"}}></span><p className="m-0 font-weight-bold">{key}</p></div>)}
            </div> : <div></div>}
            {data.length ? <>
                <div style={{position: "absolute", top: 0, left: "-40px", height: "100%", display: "flex", alignItems: "center"}}>
                    <p style={{writingMode: "vertical-lr", textOrientation: "upright", margin: 0}}>Resiual</p>
                </div>
                <div style={{position: "absolute", bottom: "-40px", left: 0, width: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
                    <p style={{margin: 0}}>steps</p>
                </div>
                <Chart data={data} axes={axes} series={series}/>
            </> : <div style={{width: "100%", display: "flex", justifyContent: "center", margin: "20px"}}><div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
             </div></div>
            }
        </div>
    }
}