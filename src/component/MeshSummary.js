import React from "react"
import {Col, Row} from "react-bootstrap";
import ReactJson from 'react-json-view'
import TextTruncate from "react-text-truncate";
import Humanize from "humanize-plus";
const truncateTextStyle={
        cursor: 'pointer',
        marginRight: 15
}
export default class MeshSummary extends React.Component {
    render() {
        const mesh = this.props.data;
        let stringifyMesh;
        try {
            stringifyMesh = JSON.stringify(JSON.parse(mesh.meshParams));
        } catch (exception) {
            stringifyMesh = [];
        }
        const parseMesh = stringifyMesh.length !== 0 ? JSON.parse(stringifyMesh) : [];
        const nodeElementCount = this.props.nodeElementInfo;
        return (
            <div>
                <Row>
                    <Col sm={2}><label>Name:</label></Col>
                    <Col sm={4}>
                      {/* <TextTruncate
                        title={mesh.meshName}
                        style={truncateTextStyle}
                        element="div"
                        truncateText="......"
                        text={mesh.meshName}
                      /> */}
                      {mesh.meshName}
                    </Col>
                    <Col sm={2}><label>SolverVersion:</label></Col>
                    <Col sm={4}>{mesh.solverVersion}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>MeshId:</label></Col>
                    <Col sm={4}>{mesh.meshId}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>Status:</label></Col>
                    <Col sm={2}>{mesh.meshStatus}</Col>
                    <Col sm={2}><label>Size:</label></Col>
                    <Col sm={2}>{Humanize.formatNumber(mesh.meshSize)}</Col>
                    <Col sm={2}><label>Format:</label></Col>
                    <Col sm={2}>{mesh.meshFormat}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>NoSlipWalls:</label></Col>
                    <Col sm={10}>{<ReactJson collapsed={true} src={ parseMesh && parseMesh.boundaries ? parseMesh.boundaries.noSlipWalls : []}></ReactJson>}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>Boundaries:</label></Col>
                    <Col sm={10}>{<ReactJson collapsed={true} src={mesh.boundaries || mesh.boundaries !== null ? mesh.boundaries : []}></ReactJson>}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>MeshJson:</label></Col>
                    <Col sm={10}>{<ReactJson collapsed={true} src={mesh.meshParams || mesh.meshParams !== null ? JSON.parse(mesh.meshParams) : []}></ReactJson>}</Col>
                </Row>
                <Row>
                    <Col sm={2}><label>Tags:</label></Col>
                    <Col sm={10}>{JSON.stringify(mesh.meshTags)}</Col>
                </Row>
                <Row>
                    <hr />
                </Row>
                <Row>
                    <h3 style={{marginLeft:10, textDecoration:"underline"}}>Mesh Statistics</h3>

                </Row>
                <Row>
                    <Col sm={3}><label>NumberOfNodes:</label></Col>
                    <Col sm={8}>{nodeElementCount && nodeElementCount.Nodes}</Col>

                </Row>
                <Row>
                    <Col sm={3}><label>NumberOfTriangles:</label></Col>
                    <Col sm={2}>{nodeElementCount && nodeElementCount.Triangles}</Col>
                    <Col sm={3}><label>NumberOfQuadrilaterals:</label></Col>
                    <Col sm={2}>{nodeElementCount && nodeElementCount.Quadrilaterals}</Col>
                </Row>
                <Row>
                    <Col sm={3}><label>NumberOfTetrahedrons:</label></Col>
                    <Col sm={2}>{nodeElementCount && nodeElementCount.Tetrahedrons}</Col>
                    <Col sm={3}><label>NumberOfPrisms:</label></Col>
                    <Col sm={2}>{nodeElementCount && nodeElementCount.Prisms}</Col>
                </Row>
                <Row>
                    <Col sm={3}><label>NumberPyramids:</label></Col>
                    <Col sm={2}>{nodeElementCount && nodeElementCount.Pyramids}</Col>
                    <Col sm={3}><label>NumberOfHexahedrons:</label></Col>
                    <Col sm={2}>{nodeElementCount && nodeElementCount.Hexes}</Col>
                </Row>
            </div>
        );
    }
}
