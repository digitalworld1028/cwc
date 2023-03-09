import React, {useState} from 'react'
import {
    Button, Card,
    Col, DropdownButton, DropdownItem,
    OverlayTrigger, Tooltip,
    Form,
    FormGroup, FormLabel, InputGroup,
    Modal, ProgressBar, Tab,
    Table, Tabs, Dropdown,
} from "react-bootstrap";
import CreatableSelect from "react-select/creatable";
import autoBind from 'react-autobind';
import {bindActionCreators} from "redux";
import {NavLink} from "react-router-dom";
import {connect} from "react-redux";
import {actionCreators} from "../reducer/MeshReducer";
import "../style/default.css"
import MeshSummary from "../component/MeshSummary";
import Confirm from "../component/Confirm";
import {getS3User, is_str_empty_or_blank} from "../reducer/utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import moment from "moment";
import {
    faDownload,
    faFileUpload,
    faList,
    faRedo,
    faRocket,
    faSync,
    faTrash,
    faUpload
} from "@fortawesome/free-solid-svg-icons";
import {getFileCompression, getMeshName} from "../util/FileUtils";
import { Form as FormKendo, Field as FieldKendo, FormElement as FormElementKendo} from '@progress/kendo-react-form';
import { FormJSONTextArea, jsonValidator } from '../component/kendo-form-component';
import ConvertDateToLocal from '../util/DateUtils';
import {awsBuildMeshSignedUrl, awsBuildSignedUrl} from "../util/AwsUtils";

const trStyle = {
    backgroundColor: 'transparent'
};
const meshNameCellStyle = {
    maxWidth: 300
};
const checkboxCol = {
  width: 20,
  textAlign: 'center'
}

const downloadToggle = React.forwardRef(({ children, onClick }, ref) => (
    <span
        ref={ref}
        onClick={e => {
            e.preventDefault();
            onClick(e);
        }}
    >
    {children}
  </span>
));

class MeshContainer extends React.Component {

    constructor(props, context) {
        super(props, context);
        autoBind(this);

        this.fileRef = React.createRef();
        this.meshNameRef = React.createRef();
        this.caseNameRef = React.createRef();
        this.tagsRef = React.createRef();
        // this.boundaryRef = React.createRef();
        this.flow360mesh = React.createRef();
        let selectedMeshId = null;
        if (this.state && this.state.selectedMeshId) {
          selectedMeshId = this.state.selectedMeshId;
        }
        this.state = {
            value: "",
            isNewMesh: false,
            isNewCase: false,
            isUploadingMesh: false,
            newMeshEndianType: "",
            newMeshFormat: "aflr3",
            refreshInterval: this.props.refreshInterval ? this.props.refreshInterval : 30,
            lastListTime: "",
            selectedMeshId: selectedMeshId,
            selectedMeshName: "",
            showUploadProgress: false,
            selectedCasePriority: 'low',
            selectedTabKey: 1,
            selectedSolverVer: null,
            isMeshAllChecked: false,
            meshChecked: [],
            isFormatEndianness: false,
            endiannessDisable: false,
            formatEndiannessRequired: false,
            endiannessSelected: false,
            showEndiannessError: false
        };
    }

    componentDidMount() {
        this.props.listMeshs();
        this.props.listVersions();
        if (this.state.selectedMeshId) {
          this.props.getMesh(this.state.selectedMeshId);
          this.props.getVisualization(this.state.selectedMeshId);
        }
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    handleUploadClick(e) {
        this.setState({
          isNewMesh: true,
          isFormatEndianness: false,
        });
    }

    handleUploadCaseClick(e, mesh_id, mesh_name) {
        e.stopPropagation();
        this.setState({isNewCase: true, selectedMeshId: mesh_id, selectedMeshName: mesh_name});
        return false;
    }

    handleNewMeshClose(e) {
        this.setState({
          isNewMesh: false,
          showUploadProgress: false,
          formatEndiannessRequired: false,
          endiannessSelected: false,
          showEndiannessError: false});
    }

    handleNewCaseClose(e) {
        this.setState({
          isNewCase: false
        });
    }

    handleNewMeshSubmit(e) {
        if(this.state.formatEndiannessRequired && !this.state.endiannessSelected) {
          this.setState({
            showEndiannessError: true
          });
          return;
        }
        else {
          this.setState({
            showEndiannessError: false
          });
        }
        const supported_ext_list = ['.ugrid', '.ugrid.bz2', '.ugrid.gz', '.cgns'];
        this.setState({isNewMesh: false, showUploadProgress: true});
        if (!this.fileRef.current.files[0]) {
          alert('Need to select a file to upload!');
          this.setState({isNewMesh: true});
          return;
        }

        let file_name = this.fileRef.current.files[0].name;
        let valid_type = false;
        supported_ext_list.map( function(item) {
             if (file_name.toLowerCase().endsWith(item)) {
               valid_type = true;
             }
        });
        if (!valid_type) {
            let supported_types_str = supported_ext_list.join(',');
            alert('File type is not supported. We only support types: ' + supported_types_str);
            this.setState({isNewMesh: true});
            return;
        }
        let mesh_name = this.meshNameRef.current.value;
 
        if (is_str_empty_or_blank(mesh_name)) {
          mesh_name = file_name;
        }
        let file = this.fileRef.current.files[0];
        let tags = this.tagsRef.current.value.split(",").map((x) => x.trim()).filter(x => x !== "");
        let formParams = this.flow360mesh.current.values;
        if (formParams.flow360mesh === undefined) {
          alert("Mesh JSON is required");
          this.setState({isNewMesh: true});
          return;
        }
        let flow360mesh = formParams.flow360mesh ? formParams.flow360mesh.replace(/\n/g, '') : [];
        // set the file format for cgns file;
        let {newMeshEndianType, newMeshFormat} = this.state;
        if(file_name.toLowerCase().endsWith('cgns')) {
            newMeshEndianType = null ;
            newMeshFormat = 'cgns';
            if(!mesh_name.toLowerCase().endsWith('cgns')) {
                mesh_name = mesh_name + '.cgns';
            }
        }
        this.props.submitMesh({
            meshName: mesh_name,
            solverVersion: this.state.selectedSolverVer != null ? this.state.selectedSolverVer.value : null,
            meshTags: tags,
            meshEndianness: newMeshEndianType,
            meshFormat: newMeshFormat,
            meshSize: file.size,
            meshCompression: getFileCompression(file.name),
            // meshNoSlipBoundaries: this.boundaryRef.current.value.split(",").map((x) => x.trim()).filter(x => x !== "")
            meshParams: flow360mesh
        }, file);
    }

    openDownload(e, meshId, filename) {
        //console.log(filename);
        e.stopPropagation();
        awsBuildMeshSignedUrl(meshId, filename, (signedUrl) => {
            if (signedUrl) {
                let a = document.createElement('a');
                a.href = signedUrl;
                a.click();
            } else {
                alert(`${filename} not found.`);
            }
        });
    }

    handleNewCaseSubmit(e) {
      //console.log(this.fileRef);
      if(!this.caseNameRef.current.value) return alert("case name can't be empty");
      if(this.fileRef.current.files.length === 0) return alert("file can't be empty");
      let tags = this.tagsRef.current.value.split(",").map((x) => x.trim()).filter(x => x !== "");
      this.setState({isNewCase: false});
      this.props.submitCase(this.state.selectedMeshId, {
          name: this.caseNameRef.current.value,
          tags: tags,
          priority: this.state.selectedCasePriority,
          meshId: this.state.selectedMeshId,
      }, this.fileRef.current.files[0], ()=>{
          this.props.history.push({
              pathname: `/app/case/${this.state.selectedMeshId}`,
              state: {refresh: 1}
          });
      });
    }

    /**
     * Filter the checked mesh and trigger the delete action
     * @param e
     */
    handleDeleteFromCheckbox(e) {
      var selectedMesh = this.state.meshChecked.filter((item) => item.checked);
      this.props.batchDeleteMeshs(selectedMesh);
      this.setState({
        meshChecked: []
      });
    }

    render() {
      const {meshList, uploadedFilePercent, uploadResult, versions} = this.props;
      const { selectedSolverVer, isNewCase}  = this.state;
      //console.log(this.state);
      const s3User = getS3User();
      const hasOwnership = !s3User.guestUserIdentity || s3User.guestUserIdentity == s3User.identityId;
      // const hasOwnership = true;

      const drop_down_refresh = { 10: '10 seconds', 30: '30 seconds',
          60: '1 minute', 0: 'Disabled'};

        return (
            <Card>
                <Card.Header>
                      <InputGroup className="flex align-items-center">
                        {hasOwnership && <OverlayTrigger
                          key={`tooltip-upload`}
                          placement={'bottom'}
                          overlay={
                            <Tooltip id={`tooltip-upload`}>
                              Upload Mesh File
                            </Tooltip>
                          }
                        >
                          <i className="action margin10" style={{marginRight: 20}}
                             onClick={this.handleUploadClick}>
                            <FontAwesomeIcon icon={faUpload}/>
                          </i>
                        </OverlayTrigger>
                        }

                        {hasOwnership && <Confirm description="Are you sure? Deletion is not reversible.">
                          {confirm => <OverlayTrigger
                            key={`tooltip-delete-selected`}
                            placement={'bottom'}
                            overlay={
                              <Tooltip id={`tooltip-delete`}>
                                Delete Selected Mesh
                              </Tooltip>
                            }
                          >
                            <i className="action margin10" style={{marginRight: 20}}
                               onClick={confirm(() => this.handleDeleteFromCheckbox())}>
                              <FontAwesomeIcon icon={faTrash}/>
                            </i>
                          </OverlayTrigger>}
                        </Confirm>
                        }

                        <InputGroup.Prepend className="align-items-center">
                          <OverlayTrigger
                            key={`tooltip-refreshMestList`}
                            placement={'bottom'}
                            overlay={
                              <Tooltip id={`tooltip-refreshMestList`}>
                                Refresh Mesh List
                              </Tooltip>
                            }
                          >
                            <i className="action margin10" style={{marginRight:20}}
                              onClick={this.refreshMeshList}>
                                <FontAwesomeIcon icon={faSync}/>
                            </i>
                          </OverlayTrigger>
                          <FormLabel className="mb-0" lg={4}>Mesh Management: </FormLabel>
                          <InputGroup.Text id="basic-addon1" style={{marginLeft:60}}>Auto Refresh:</InputGroup.Text>
                        </InputGroup.Prepend>
                        <DropdownButton id="refresh_mesh_list" title={drop_down_refresh[this.state.refreshInterval]}
                                        onSelect={this.changeRefreshAndSetProps}>
                            {Object.keys(drop_down_refresh).map((key, index) => (
                                <DropdownItem key={index} eventKey={key} href="#" >{drop_down_refresh[key]}</DropdownItem>
                            ))
                            }
                        </DropdownButton>
                        {this.state.lastListTime &&
                        <InputGroup.Append>
                            <InputGroup.Text>{this.state.lastListTime}</InputGroup.Text>
                        </InputGroup.Append>
                        }
                    </InputGroup>
                </Card.Header>
                <Card.Body>
                    <FormGroup controlId="formBasicText">
                        <div className="upload_mesh upload_progress">
                        { this.state.showUploadProgress && uploadedFilePercent < 100 &&
                          <ProgressBar now={uploadedFilePercent} label={`Uploaded ${uploadedFilePercent}%`} />
                        }
                        </div>
                        { uploadResult &&
                          <div className="upload_progress_text">
                            { uploadResult.res ? (<span>Finish uploading mesh id {uploadResult.meshId}</span>)
                              : (<span className="upload_progress_text_err">Fail to upload mesh id {uploadResult.meshId}</span>)
                            }
                          </div>
                        }
                        <Table striped bordered condensed={'true'} hover>
                          <thead>
                          <tr>
                            <th style={checkboxCol}><Form.Check type="checkbox" id="formCheckboxAll" onChange={this.meshSelectAll} checked={this.state.isMeshAllChecked} /></th>
                            <th>Name</th>
                            <th>Id</th>
                            <th>Mesh Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                          </thead>
                          <tbody>
                            <Confirm key={"delete mesh confirm"} title="Confirm" description="Are you sure? Deletion is not reversible.">
                            {confirm =>
                              (meshList && meshList.map(
                                      (mesh, index) => (
                                          [
                                          <tr key={mesh.meshId} className={(mesh.meshId == this.state.selectedMeshId) ? 'table_row_grey table-content-row' : 'table-content-row'}>
                                              <td className="text-center"><Form.Check type="checkbox" id={mesh.meshId} defaultChecked={this.state.meshChecked[index] !== undefined && this.state.meshChecked[index].checked ? true : false} onClick={() => this.handleOptionChangeMesh(index)} value={mesh.meshId} /></td>
                                              <td onClick={() => this.getMeshDetail(mesh.meshId)} style={meshNameCellStyle}>
                                                  <a onClick={() => this.getMeshDetail(mesh.meshId)}>
                                                      <div>{mesh.meshName}</div>
                                              </a></td>
                                              <td>{mesh.meshId}</td>
                                              <td onClick={() => this.getMeshDetail(mesh.meshId)}>
                                              <ConvertDateToLocal utcDate={mesh.meshAddTime}/>
                                              </td>
                                              <td onClick={() => this.getMeshDetail(mesh.meshId)}>{mesh.meshStatus}</td>
                                              <td>
                                                {(hasOwnership || s3User.admin) && <OverlayTrigger
                                                  key={`tooltip-newCase-${mesh.meshId}`}
                                                  placement={'top'}
                                                  overlay={
                                                    <Tooltip id={`tooltip-newCase-${mesh.meshId}`}>
                                                      New Case
                                                    </Tooltip>
                                                  }
                                                >
                                                  <i className="action margin10"
                                                     onClick={(e) => this.handleUploadCaseClick(e, mesh.meshId, mesh.meshName)}>
                                                    <FontAwesomeIcon icon={faRocket}/>
                                                  </i>
                                                </OverlayTrigger>
                                                }
                                                  {false &&
                                                  <OverlayTrigger
                                                    key={`tooltip-reRun-${mesh.meshId}`}
                                                    placement={'top'}
                                                    overlay={
                                                      <Tooltip id={`tooltip-reRun-${mesh.meshId}`}>
                                                        Re-run
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="action margin10"
                                                      onClick={() => this.rerunMesh(mesh.meshId)}>
                                                        <FontAwesomeIcon icon={faRedo}/>
                                                    </i>
                                                  </OverlayTrigger>}

                                                  {s3User.admin && <OverlayTrigger
                                                      key={`tooltip-download-${mesh.meshId}`}
                                                      placement={'top'}
                                                      overlay={
                                                          <Tooltip id={`tooltip-download-${mesh.meshId}`}>
                                                              Download
                                                          </Tooltip>
                                                      }
                                                  >
                                                      <Dropdown className="action margin10 inline">
                                                          <Dropdown.Toggle as={downloadToggle}
                                                                           id={`download-${mesh.meshId}`}>
                                                              <FontAwesomeIcon icon={faDownload}/>
                                                          </Dropdown.Toggle>

                                                          <Dropdown.Menu>
                                                              {
                                                                  [
                                                                      {name: 'Log', value: "info/meshproc.out"}
                                                                      , {
                                                                      name: 'Mesh File',
                                                                      value: getMeshName(mesh.meshFormat, mesh.meshEndianness, mesh.meshCompression, mesh.meshName)
                                                                  }
                                                                  ].map((item, index) => {
                                                                      return <DropdownItem key={index}
                                                                                           onClick={(e) => this.openDownload(e, mesh.meshId, item.value)}>{item.name}</DropdownItem>
                                                                  })}
                                                          </Dropdown.Menu>
                                                      </Dropdown>
                                                  </OverlayTrigger>
                                                  }

                                                {hasOwnership && <OverlayTrigger
                                                  key={`tooltip-delete-${mesh.meshId}`}
                                                  placement={'top'}
                                                  overlay={
                                                    <Tooltip id={`tooltip-delete-${mesh.meshId}`}>
                                                      Delete
                                                    </Tooltip>
                                                  }
                                                >
                                                  <i className="action-delete margin10"
                                                     onClick={confirm(() => this.pushDelMesh(mesh.meshId))}>
                                                    <FontAwesomeIcon icon={faTrash}/>
                                                  </i>
                                                </OverlayTrigger>
                                                }
                                                  
                                                  <OverlayTrigger
                                                    key={`tooltip-goCases-${mesh.meshId}`}
                                                    placement={'top'}
                                                    overlay={
                                                      <Tooltip id={`tooltip-goCases-${mesh.meshId}`}>
                                                        Go Cases
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <i className="action margin10">
                                                      <NavLink to={`/app/case/${mesh.meshId}`}>
                                                        <FontAwesomeIcon icon={faList}/>
                                                      </NavLink>
                                                    </i>
                                                  </OverlayTrigger>
                                              </td>
                                          </tr>
                                              , mesh.meshId == this.state.selectedMeshId && <tr style={trStyle}>
                                              <td colSpan={5}>
                                              {
                                              <Tabs defaultActiveKey={1} activeKey={this.state.selectedTabKey} onSelect={key => this.setState({ selectedTabKey: key })} id="uncontrolled-tab-example">
                                                  <Tab eventKey={1} title="Description">
                                                      <br/>
                                                      <MeshSummary data={mesh} nodeElementInfo={this.props.detail}/>
                                                  </Tab>
                                                  <Tab eventKey={2} title="Visualization" disabled = {mesh.meshStatus != 'processed'}>
                                                      <br/>
                                                      {mesh.meshStatus === 'processed' && this.props.meshPics && this.props.meshPics
                                                          .map(pic => <img key={pic} src={pic} width={"30%"} height={"30%"}/>)}
                                                  </Tab>
                                              </Tabs>}
                                          </td>
                                          </tr>
                                          ]
                                      )
                                    )
                              )
                            }
                            </Confirm>
                          </tbody>
                        </Table>

                    </FormGroup>
                    <Modal show={isNewCase} onHide={this.handleNewCaseClose}>
                        <Modal.Header closeButton>
                            <Modal.Title>Upload A Case</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <Form horizontal>

                            <FormLabel>MeshId: {this.state.selectedMeshId}</FormLabel>
                            <FormLabel>MeshName: {this.state.selectedMeshName}</FormLabel>

                              <input accept=".json" type="file"  placeholder="choose case config file to upload"
                                       ref={this.fileRef} required="required" />
                              <p style={{fontSize: '0.8em'}}>Supported file: .json</p>
                              <Form.Control
                                type="text"
                                placeholder="Enter Case Name"
                                ref={this.caseNameRef}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                Please choose a case name.
                              </Form.Control.Feedback>
                              <Form.Control
                                type="text"
                                placeholder="Enter Tags, Example as tag1,tag2"
                                ref={this.tagsRef}
                                required
                              />
                              <Form.Control.Feedback type="invalid">
                                Please choose a case name.
                              </Form.Control.Feedback>
                              <InputGroup>
                                <InputGroup.Prepend>
                                  <InputGroup.Text>Processing Priority:</InputGroup.Text>
                                </InputGroup.Prepend>
                                <DropdownButton id="select_priority" title={this.state.selectedCasePriority} onSelect={this.changeCasePriority}>
                                  <DropdownItem eventKey="low" href="#">Low</DropdownItem>
                                  <DropdownItem selected eventKey="high" href="#">High</DropdownItem>
                                </DropdownButton>
                              </InputGroup>
                            </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button bsStyle="primary"
                                    onClick={this.handleNewCaseSubmit}>Submit</Button>
                            <Button onClick={this.handleNewCaseClose}>Close</Button>
                        </Modal.Footer>
                    </Modal>
                    <Modal 
                      show={this.state.isNewMesh} 
                      onHide={this.handleNewMeshClose}
                      backdrop="static"
                      >
                        <Modal.Header closeButton>
                            <Modal.Title>Upload Mesh File</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <div>
                                <input accept=".ugrid,.gz,.bz2,.cgns" type="file"  placeholder="choose mesh file to upload"
                                       ref={this.fileRef} required="required" onChange={this.onMeshFileSelected} />
                                <p style={{fontSize: '0.8em'}}>Supported file: .ugrid, .gz, .bz2, .cgns</p>
                                <input type="text" className="form-control" placeholder="Enter Mesh Name"
                                       ref={this.meshNameRef} required="required"/>
                                <input type="text" className="form-control" placeholder="Enter Tags, Example as tag1,tag2"
                                       ref={this.tagsRef} required="required"/>
                                {/* <input type="text" className="form-control" placeholder="Enter Boundaries, Example as 1,20,31,32"
                                       ref={this.boundaryRef} required="required"/> */}
                                <br />
                                <FormKendo
                                  ref = {this.flow360mesh}

                                  render={() => (
                                  <FormElementKendo>
                                    <FieldKendo
                                      id={'flow360mesh'}
                                      name={'flow360mesh'}
                                      optional={false}
                                      label={'Enter Flow360Mesh.JSON or choose a file:'}
                                      hint={'JSON format text only'}
                                      rows={5}
                                      component={FormJSONTextArea}
                                      validator={jsonValidator}
                                    />
                                  </FormElementKendo>)} /><br />
                                { this.state.isFormatEndianness && <FormGroup style={{position: "relative"}}>
                                    <FormLabel className={this.state.showEndiannessError ? "text-danger" : ""} style={{position: "absolute", top: "-12px", left: "10px", background: "white", zIndex: 100, padding: "0 10px", fontSize: "15px"}}>Format & Endianness</FormLabel>
                                    <Col sm={12} className={this.state.showEndiannessError ? "border border-danger p-3" : "border p-3"}>
                                        <InputGroup className="d-flex align-items-end">
                                            { this.state.endiannessDisable ? 
                                              <input type="radio" className="m-2" name="radioGroup" value={"little"} id="littleEndianAflr3"
                                                                checked={this.checkMeshOptionType("little", "aflr3")}
                                                                onChange={this.handleOptionChange} disabled/> :
                                              <input type="radio" className="m-2" name="radioGroup" value={"little"} id="littleEndianAflr3"
                                                                checked={this.checkMeshOptionType("little", "aflr3")}
                                                                onChange={this.handleOptionChange}/>
                                            }
                                            <label type="littleEndianAflr3" style={{fontSize: "18px", margin: "1px 4px"}}>Little endian aflr3</label>
                                            <p className="text-danger m-0 ml-3">For lb8.ugrid</p>
                                        </InputGroup>

                                        <InputGroup className="d-flex align-items-end">
                                            { this.state.endiannessDisable ? 
                                              <input type="radio" className="m-2" name="radioGroup" value={"big"} id="bigEndianAflr3"
                                                                checked={this.checkMeshOptionType("big", "aflr3")}
                                                                onChange={this.handleOptionChange} disabled/> :
                                              <input type="radio" className="m-2" name="radioGroup" value={"big"} id="bigEndianAflr3"
                                                                checked={this.checkMeshOptionType("big", "aflr3")}
                                                                onChange={this.handleOptionChange}/>
                                            }
                                            <label for="bigEndianAflr3" style={{fontSize: "18px", margin: "1px 4px"}}>Big endian aflr3</label>
                                            <p className="text-danger m-0 ml-3">For b8.ugrid</p>
                                        </InputGroup>

                                    </Col>

                                </FormGroup> }

                            </div>
                            <a target='_blank' href='https://github.com/flexcompute/Flow360PythonClient#version-history'>Release history</a>
                            {versions &&
                            <CreatableSelect
                              isClearable
                              placeholder="Select solver version or leave empty using default"
                              value={selectedSolverVer}
                              onChange={this.handleSolverVerChange}
                              options={versions}
                            />}
                        </Modal.Body>
                        <Modal.Footer style={{position: "relative"}}>
                            <Button variant="secondary" onClick={this.handleNewMeshClose}>Close</Button>
                            <Button variant="primary" onClick={this.handleNewMeshSubmit}>Submit</Button>
                        </Modal.Footer>
                    </Modal>
                </Card.Body>
            </Card>
        );
    }

    handleSolverVerChange = selectedOption => {
      this.setState({ selectedSolverVer: selectedOption });
      //console.log(`Option selected:`, selectedOption);
    };

    checkMeshOptionType(endType, format) {
        return this.state.newMeshEndianType === endType && this.state.newMeshFormat === format;
    }

    handleOptionChange(changeEvent) {
        this.setState({
            newMeshEndianType: changeEvent.target.value,
            newMeshFormat: "aflr3",
            endiannessSelected: true,
            showEndiannessError: false
        });
    };

    meshSelectAll() {
      this.setState({
        isMeshAllChecked: !this.state.isMeshAllChecked
      }, () => {
        var arrMeshChecked = [];
        this.props.meshList.filter((c) => { return c }).map((item) => {
          arrMeshChecked.push({
            checked: this.state.isMeshAllChecked,
            meshId: item.meshId
          })
        });
        this.setState({meshChecked: arrMeshChecked});
      });
    }

    handleOptionChangeMesh(i) {
      /**
       * Handle the checkbox of items
       */
      var arrInitMeshChecked = [];
      if(this.state.meshChecked.length === 0) {
        this.props.meshList.filter((c) => { return c }).map((item) => {
          arrInitMeshChecked.push({
            checked: false,
            meshId: item.meshId
          })
        });
      } else {
        arrInitMeshChecked = this.state.meshChecked;
      }

      arrInitMeshChecked[i].checked = !arrInitMeshChecked[i].checked;

      this.setState({meshChecked: arrInitMeshChecked}, () => {
        /**
         * Active checkall if all checkbox of items are checked
         */
        var isAllChecked = this.state.meshChecked.filter((c) => {
          return c;
        }).length === this.state.meshChecked.filter((item) => item.checked === true).length;
        this.setState({isMeshAllChecked: isAllChecked});
      });
    }

    getMeshDetail(id) {
        if (id === this.state.selectedMeshId) {
          // unselect
          this.setState({selectedMeshId: null, selectedTabKey: 1});
          this.props.clearDetail();
        } else {
          this.setState({selectedMeshId: id, selectedTabKey: 1});
          this.props.getMesh(id);
          this.props.getVisualization(id);
        }
    }

    refreshMeshList() {
        if (this.state.selectedMeshId) {
          this.props.listMeshs();
          this.props.getMesh(this.state.selectedMeshId);
          this.props.getVisualization(this.state.selectedMeshId);
        } else {
           this.props.listMeshs();
        }

        this.setState({
          lastListTime: "Last sync at: " + new Date().toLocaleTimeString()
        });
    }

    pushDelMesh(mesh_id) {
      this.props.delMesh(mesh_id);
      this.setState({
        meshChecked: [],
        isMeshAllChecked: false
      });
    }

    onMeshFileSelected(event) {
      let file = this.fileRef.current.files[0];
      const allowedExtensions = ['ugrid', 'gz', 'bz2', 'cgns'];
      let fileNameArray = file.name.split('.');
      let fileExtension = fileNameArray.pop();
      if(["gz", "bz2"].includes(fileExtension)) fileExtension = fileNameArray.pop();
      const specificFileName = fileNameArray.join(".");
      const extensionExist = !!allowedExtensions.find(ext => ext === fileExtension);
      if (extensionExist && fileExtension === "ugrid") {
        this.setState({
          isFormatEndianness: true
        });
      } else {
        this.setState({
          isFormatEndianness: false,
        });
      }
      if(file && fileExtension === "ugrid") {
        if(specificFileName.includes('lb8')) {
          this.setState({
            newMeshEndianType: 'little',
            newMeshFormat: "aflr3",
            endiannessDisable: true,
            formatEndiannessRequired: true,
            endiannessSelected: true
          });
        }
        else if (specificFileName.includes('b8')) {
          this.setState({
            newMeshEndianType: 'big',
            newMeshFormat: "aflr3",
            endiannessDisable: true,
            formatEndiannessRequired: true,
            endiannessSelected: true
          });
        }
        else {
          this.setState({
            newMeshEndianType: '',
            newMeshFormat: "aflr3",
            endiannessDisable: false,
            formatEndiannessRequired: true,
            endiannessSelected: false
          });
        }
      }
    }

    changeCasePriority(event) {
      this.setState({selectedCasePriority: event});
    }

    changeRefreshAndSetProps(e) {
      let refresh_interval = parseInt(e);
      this.changeRefresh(e);
      this.props.setInterval(refresh_interval);
    }

    changeRefresh(event) {
      let refresh_interval = parseInt(event);
      if (refresh_interval < 10) {
        this.setState({refreshInterval: 0});
        clearInterval(this.interval);
      } else {
        this.setState({
          refreshInterval: refresh_interval
        });
        this.interval = setInterval(() => this.refreshMeshList(), refresh_interval * 1000);
      }
    }

    rerunMesh(meshId) {
      this.props.rerunMesh(meshId);
    }
}

export default connect(
  state => state.mesh,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(MeshContainer);
