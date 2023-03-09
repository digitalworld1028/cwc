import React from 'react'

import autoBind from 'react-autobind';
import {bindActionCreators} from "redux";
import {connect} from "react-redux";
import {actionCreators} from "../reducer/CaseReducer";
import "../style/default.css"
import {buildBillingChartData, generateBillingNew} from "./Shared";
import {getOrgId, getS3User} from '../reducer/utils';
import {
    Button,
    Card,
    InputGroup,
    Row,
    Table,
    Tooltip
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BillingChart from "../component/BillingChart";

class BillingContainer extends React.Component {


    constructor(props, context) {
        const currentDate = new Date();
        super(props, context);
        autoBind(this);
        this.state = {
            startBillMonth: new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1),
            endBillMonth: currentDate,
        };
    }

    componentDidMount() {
        const orgId = getOrgId();
        if(orgId !== undefined && orgId != null && orgId.length > 0) {
            this.props.getOrganize(orgId);
        }
    }

    render() {
        let {caseListResult} = this.props;
        const {startBillMonth, endBillMonth} = this.state;

        let user = getS3User();
        return (
            <Card>
                <Card.Header>Flow360 Billing Summary</Card.Header>
                <div>

                    <InputGroup className="flex align-items-center">
                        <InputGroup.Prepend className="align-items-center">
                            <InputGroup.Text id="basic-addon1" style={{marginLeft:60, marginRight:20}}>Select Start Month: </InputGroup.Text>
                        </InputGroup.Prepend>

                        <InputGroup.Append>
                            <DatePicker selected={startBillMonth}
                                        onChange={this.handleStartBillMonthChange}
                                        dateFormat="yyyy.MM"
                                        showMonthYearPicker placeholderText="select start month">
                            </DatePicker>
                            {/*<InputGroup.DatePicker selected={startBillMonth}*/}
                            {/*                       onChange={this.handleStartBillMonthChange}*/}
                            {/*                       dateFormat="yyyy.MM"*/}
                            {/*                       showMonthYearPicker placeholderText="select start month">*/}
                            {/*</InputGroup.DatePicker>*/}

                        </InputGroup.Append>
                        <InputGroup.Prepend className="align-items-center">
                            <InputGroup.Text id="basic-addon1" style={{marginLeft:60, marginRight:20}}>Select End Month: </InputGroup.Text>
                        </InputGroup.Prepend>

                        <InputGroup.Append>
                            <DatePicker
                                selected={endBillMonth}
                                onChange={this.handleEndBillMonthChange}
                                dateFormat="yyyy.MM"
                                showMonthYearPicker placeholderText="select end month"/>
                        </InputGroup.Append>
                        <InputGroup.Append>
                            <Button onClick={this.handleFetchBill} style={{marginLeft:30}}>Submit</Button>
                        </InputGroup.Append>
                    </InputGroup>
                    <div className="d-flex justify-content-center" style={{marginTop:20}}>
                        {caseListResult && <BillingChart  data={buildBillingChartData(caseListResult)}/>}
                    </div>
                    {caseListResult &&
                     generateBillingNew(caseListResult, user && user.email)}
                <Table striped bordered hover size="sm" style={{visibility:'hidden'}} >
                    <thead>
                    <tr>
                        <th></th>
                        <th>Case</th>
                        <th>Case Id</th>
                        <th>Mesh Id</th>
                        <th>Submit Time</th>
                        <th>Finish Time</th>
                        <th>Mesh Size</th>
                    </tr>
                    </thead>
                </Table>
            </div>
            </Card>
        );

    }
    handleStartBillMonthChange = date => {
        this.setState({startBillMonth : date});

    }
    handleEndBillMonthChange = date => {
        this.setState({endBillMonth : date});

    }

    handleFetchBill = () => {
        const {startBillMonth, endBillMonth} = this.state;
        if(endBillMonth < startBillMonth) {
            alert('the end date must be after start date');
            return;
        }
        //console.log(endBillMonth.getFullYear());
        //console.log(startBillMonth.getFullYear());
        if((endBillMonth.getFullYear() - startBillMonth.getFullYear()) * 12 + (endBillMonth.getMonth() - startBillMonth.getMonth())> 11) {
            alert("can't show the bill more than 1 years");
            return;
        }
        this.props.listCasesForBilling(startBillMonth, endBillMonth);
    }

    updateReminderOfEmailThreshold() {
        const {organizeDetail} = this.state;
        this.props.updateOrganize(organizeDetail, 'reminderEmailThreshold');

    }

    updateApprovalThreshold() {
        const {organizeDetail} = this.state;
        this.props.updateOrganize(organizeDetail, 'requriedApprovalThreshold');
    }
}

export default connect(
    state => state.meshCase,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(BillingContainer);
