import React from "react"
import ReactJson from 'react-json-view'
import {Col, Row} from "react-bootstrap";
import {Link} from "react-router-dom";
import ConvertDateToLocal from '../util/DateUtils';


export default class CaseSummary extends React.Component {
    constructor(props) {
        super(props);
    }

    goToMeshDetail(mesh_id) {
        //console.log("go to mesh detail:" + mesh_id);
      this.props.history.push({
           pathname: `/app/mesh`,
           state: {selectedMeshId: mesh_id}
       });
        window.location.href = window.location.href;
        return false;
    }

    render() {
        const caseInfo = this.props.data;
        return (
            <div className="margin10">
                <Row>
                    <Col sm={2}><label>Name:</label></Col>
                    <Col sm={4}>{caseInfo.caseName}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>CaseId:</label></Col>
                    <Col sm={4}>{caseInfo.caseId}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>MeshId:</label></Col>
                    <Col sm={4}>
                        <Link  to={{ pathname: `/app/mesh`,
                            state: {selectedMeshId:`${caseInfo.caseMeshId}`}}}>{caseInfo.caseMeshId}</Link>
                    </Col>
                </Row>
                <Row>
                    <Col sm={2}><label>Status:</label></Col>
                    <Col sm={2}>{caseInfo.caseStatus}</Col>
                    <Col sm={2}><label>Submit Time:</label></Col>
                    <Col sm={2}><ConvertDateToLocal utcDate={caseInfo.caseSubmitTime}/></Col>
                </Row>
                <Row>
                    <Col sm={2}><label>Finish Time:</label></Col>
                    <Col sm={4}><ConvertDateToLocal utcDate={caseInfo.caseFinishTime}/></Col>
                </Row>
                <Row>
                    <Col sm={2}><label>Runtime Params:</label></Col>
                    <Col sm={10}>{<ReactJson collapsed={true} src={{...caseInfo.runtimeParams}}></ReactJson>}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>Tags:</label></Col>
                    <Col sm={10}>{JSON.stringify(caseInfo.caseTags)}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>ParentId:</label></Col>
                    <Col sm={4}>{caseInfo.caseParentId}</Col>
                </Row>
            </div>
        );
    }
}
