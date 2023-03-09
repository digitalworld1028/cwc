import React from 'react'
import {Chart} from 'react-charts'
export default class BillingChart extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        // const data = [
        //     {
        //         label: 'Series 1',
        //         data: [1, 2, 3,4]
        //     },
        //     {
        //         label: 'Series 2',
        //         data: [2, 3,4,5]
        //     }
        // ]
        // const data = [
        //     { name: '2020.1', case_cost: 2000, s3_cost: 2013},
        //     { name: '2020.2', case_cost: 2000, s3_cost: 2013 },
        //     { name: '2020.3', case_cost: 2000, s3_cost: 2013},
        //     { name: '2020.4', case_cost: 2000, s3_cost: 2013},
        //     { name: '2020.5', case_cost: 2000, s3_cost: 2013 },
        //     { name: '2020.6', case_cost: 2000, s3_cost: 2013},
        // ];
        const {data} = this.props;
        let caseComputeCost = {
            label: 'Compute Work',
            datums: data.map((v,i) => ({x: v.name, y: v.work}))
        }


        const chartData = [
            caseComputeCost
        ];
        const series = {
                type: 'bar',
            }
        const axes = [
                { primary: true, type: 'ordinal', position: 'bottom' },
                { position: 'left', type: 'linear', stacked: true }
            ]

        let chartWidth = 70 * data.length + 30

        if(data) {
            return (
                <>
                    <div style={{
                        width: chartWidth,
                        height: 300
                    }}>
                        <Chart data={chartData} series={series} axes={axes} tooltip />
                    </div>
                </>)
        }
        else {
            return null;
        }
    }
}
