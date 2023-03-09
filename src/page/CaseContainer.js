import React from "react"
import {
    FormGroup,
    Table,
    Modal,
    Card,
    Form,
    Button,
    Popover,
    Dropdown,
    DropdownItem,
    DropdownButton,
    OverlayTrigger,
    Tooltip,
    Tabs,
    Tab,
    InputGroup,
    FormLabel,
    FormControl
} from "react-bootstrap";
import autoBind from "react-autobind";
import CaseSummary from "../component/CaseSummary";
import connect from "react-redux/es/connect/connect";
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/CaseReducer";
import ResidualBox from "../component/ResidualBox";
import ForcesBox from "../component/ForcesBox";
import Confirm from "../component/Confirm";
import history from "../history"
import ReactJson from "react-json-view";

import '@icon/open-iconic/open-iconic.css'
import {getOrgId, getS3User, getS3UserId} from "../reducer/utils";
import {getCasePrice} from "../util/BillingUtils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDownload, faQuestion, faRedo, faSync, faTrash, faUpload} from "@fortawesome/free-solid-svg-icons";
import {config} from "../util/EnvConfig";
import {awsBuildSignedUrl} from "../util/AwsUtils";
import moment from "moment";
import axios from "axios";
import {visualizeFlow360Case} from "../component/visualizeCase-21.1.1";
import { Form as FormKendo, Field as FieldKendo, FormElement as FormElementKendo} from '@progress/kendo-react-form';
import { FormJSONTextArea, jsonValidator } from "../component/kendo-form-component";
import ConvertDateToLocal from '../util/DateUtils';
import Humanize from "humanize-plus";

const trStyle = {
    backgroundColor: 'transparent'
};


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

const checkboxCol = {
  width: 20,
  textAlign: 'center'
}

class CaseContainer extends React.Component {
    constructor(props) {
        //console.log("caseContainer.props", props);
        super(props);
        autoBind(this);

        this.forkACaseRef = React.createRef();
        this.state = {
            value: '',
            selectedCaseId: '',
            selectedCaseIdToDownload: '',
            refreshInterval: this.props.refreshInterval ? this.props.refreshInterval : 30,
            lastListTime: '',
            selectedMeshId: '',
            downloadType: '',
            downloadResult: false,
            case_downloadable: false,
            selectedTabKey: 1,
            isNewCase: false,
            isCaseAllChecked: false,
            caseChecked: [],
            inputForkCaseName: ''
        };
        this.changeRefresh(this.state.refreshInterval);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {meshId} = this.props.match.params;

        this.state.selectedMeshId = meshId;
        if (this.props.match.params.meshId !== prevProps.match.params.meshId) {
            this.props.listCases(this.props.match.params.meshId);
            let orgId = getOrgId();
            if(orgId !== undefined && orgId !== null && orgId.length > 0) {
                this.props.getOrganize(orgId);
                this.props.getOrganizeCasesWithWaitingForApproval(orgId);
            }
        }
    }

    componentDidMount() {
        const {meshId} = this.props.match.params;
        //console.log(this.props);
        //console.log(this.state);
        let orgId = getOrgId();
        if(orgId !== undefined && orgId !== null && orgId.length > 0) {
            this.props.getOrganize(orgId);
            this.props.getOrganizeCasesWithWaitingForApproval(orgId);

        }
        this.props.listCases(meshId);

        this.state.selectedMeshId = meshId;
    }

    componentWillUnmount() {
      clearInterval(this.interval);
    }

    /**
     * Filter the checked case and trigger the delete action
     * @param e
     */
    handleDeleteFromCheckbox(e) {
      var selectedCase = this.state.caseChecked.filter((item) => item.checked);
      this.props.batchDeleteCases(selectedCase);
      this.setState({
        caseChecked: []
      });
    }

    handleInputChange(event) {
      if(!event) return false;
      //console.log(event.target);

      const target = event.target;
      if(!target) return false;
      
      const name = target.name

      this.setState({[name]: target.value});
    }

    render() {
        const {caseList, detail, organizeDetail, casesOfWaitingForApproval} = this.props;
        const {meshId} = this.props.match.params;
        const s3User = getS3User();
        const hasOwnership = !s3User.guestUserIdentity || s3User.guestUserIdentity == s3User.identityId;
        const drop_down_refresh = {0: 'Disabled', 10: '10 seconds', 30: '30 seconds',
          60: '1 minute'};
        let downloadFiles = [
          {name:"Flow360 Json", value:"flow360.json", forceDownload: true}
          ,{name:'Volume', value:"results/volumes.tar.gz"}
          ,{name:'Surfaces', value:"results/surfaces.tar.gz"}
          ];
        if(s3User.admin) {
            downloadFiles.push({name:'Log', value:"solver.out"});
        }
        const editHint = <Popover show={true} id="tooltip-disabled">
            <p>ctrl + click: enter edit mode</p>
            <p>ctrl + Enter: submit changes</p>
            <p>Escape key: cancel</p>
        </Popover>;

        return (
            <Card>
                <Card.Header>
                      <InputGroup className="flex align-items-center">
                        {hasOwnership && <Confirm description="Are you sure? Deletion is not reversible.">

                          {confirm => <OverlayTrigger
                            key={`tooltip-delete-selected`}
                            placement={'bottom'}
                            overlay={
                              <Tooltip id={`tooltip-delete`}>
                                Delete Selected Case
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
                                  Refresh Case List
                                </Tooltip>
                              }
                            >
                              <i className="action margin10" style={{marginRight:20}}
                                onClick={this.refreshCaseList}>
                                  <FontAwesomeIcon icon={faSync}/>
                              </i>
                            </OverlayTrigger>
                            <FormLabel className="mb-0" lg={4}>Case Management: </FormLabel>
                            {meshId &&
                            <FormLabel className="mb-0" id="inputGroup-sizing-default">
                              {meshId.toUpperCase()}
                            </FormLabel>}
                            <InputGroup.Text id="basic-addon1" style={{marginLeft:60}}>Auto Refresh:</InputGroup.Text>
                        </InputGroup.Prepend>
                        <DropdownButton id="refresh_case_list" title={drop_down_refresh[this.state.refreshInterval]} onSelect={this.changeRefreshAndSetProps}>
                            {Object.keys(drop_down_refresh).map((key, index) => (
                                <DropdownItem key={index} eventKey={key} href="#">{drop_down_refresh[key]}</DropdownItem>
                            ))
                            }
                        </DropdownButton>
                        {this.state.lastListTime &&
                        <InputGroup.Append>
                            <InputGroup.Text>{this.state.lastListTime}</InputGroup.Text>
                        </InputGroup.Append>
                        }
                    </InputGroup>

                    {organizeDetail && casesOfWaitingForApproval && casesOfWaitingForApproval.length > 0 &&
                        <Button onClick={this.approveCaseToRun}>
                            {"Approve batch of cases totaling $" + casesOfWaitingForApproval.map((v) => getCasePrice(v)).reduce((prev, curr) => prev + curr, 0)}
                        </Button>
                    }
                </Card.Header>
                <Card.Body>
                    <FormGroup controlId="formBasicText">
                        {/* <div className="upload_mesh">
                          <DropdownButton variant="secondary" id="more_action_checkbox" title="Actions">
                            <DropdownItem onClick={this.handleDeleteFromCheckbox}>Delete</DropdownItem>
                          </DropdownButton>
                        </div> */}


                        <Table striped bordered condensed='true' hover>
                            <thead>
                            <tr>
                                <th style={checkboxCol}><Form.Check type="checkbox" id="formCheckboxAll" onChange={this.caseSelectAll} checked={this.state.isCaseAllChecked} /></th>
                                <th>Name</th>
                                <th>Id</th>
                                <th>Submit Time</th>
                                <th>Start Time</th>
                                <th>Finish Time</th>
                                <th>Status</th>
                                <th>Work</th>
                                <th>Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            <Confirm title="Confirm" description="Are you sure? Deletion is not reversible.">
                            {confirm =>
                               (caseList && caseList.map(
                                    (caseItem, index) => ([
                                        <tr
                                          key={caseItem.caseId} className={(caseItem.caseId == this.state.selectedCaseId) ? 'table_row_grey table-content-row' : 'table-content-row'}>
                                            <td className="text-center"><Form.Check type="checkbox" id={caseItem.caseId} checked={this.state.caseChecked[index] !== undefined && this.state.caseChecked[index].checked ? true : false} onChange={() => this.handleOptionChangeCase(index)} value={caseItem.meshId} /></td>
                                            <td onClick={() => this.getAllCaseDetail(caseItem.caseId)}><a
                                                   onClick={() => this.getAllCaseDetail(caseItem.caseId)}>{caseItem.caseName}
                                            </a></td>
                                            <td>{caseItem.caseId}</td>
                                            <td onClick={() => this.getAllCaseDetail(caseItem.caseId)}><ConvertDateToLocal utcDate={caseItem.caseSubmitTime}/></td>
                                            <td onClick={() => this.getAllCaseDetail(caseItem.caseId)}><ConvertDateToLocal utcDate={caseItem.caseStartTime}/></td>
                                            <td onClick={() => this.getAllCaseDetail(caseItem.caseId)}><ConvertDateToLocal utcDate={caseItem.caseFinishTime}/></td>
                                            <td onClick={() => this.getAllCaseDetail(caseItem.caseId)}>{caseItem.caseStatus}</td>
                                            <td>{"completed" === caseItem.caseStatus ? Humanize.formatNumber(caseItem.computeCost,2) : ""}</td>
                                            <td>
                                              {(hasOwnership || s3User.admin) && <OverlayTrigger
                                                key={`tooltip-forkCase-${caseItem.caseId}`}
                                                placement={'top'}
                                                overlay={
                                                  <Tooltip id={`tooltip-forkCase-${caseItem.caseId}`}>
                                                    Fork Case
                                                  </Tooltip>
                                                }
                                              >
                                                <i className="oi action margin10 oi-fork"
                                                   onClick={(e) => this.handleForkCaseClick(e, caseItem)}>
                                                </i>
                                              </OverlayTrigger>
                                              }
                                                {false && <OverlayTrigger
                                                  key={`tooltip-reRun-${caseItem.caseId}`}
                                                  placement={'top'}
                                                  overlay={
                                                    <Tooltip id={`tooltip-reRun-${caseItem.caseId}`}>
                                                      Re-run
                                                    </Tooltip>
                                                  }
                                                >
                                                  <i className="action margin10"
                                                    onClick={() => this.props.rerunCase(caseItem.caseId)}>
                                                      <FontAwesomeIcon icon={faRedo}/>
                                                  </i>
                                                </OverlayTrigger>}
                                                <OverlayTrigger
                                                  key={`tooltip-download-${caseItem.caseId}`}
                                                  placement={'top'}
                                                  overlay={
                                                    <Tooltip id={`tooltip-download-${caseItem.caseId}`}>
                                                      Download
                                                    </Tooltip>
                                                  }
                                                >
                                                  <Dropdown className="action margin10 inline">
                                                    <Dropdown.Toggle as={downloadToggle} id={`download-${caseItem.caseId}`}>
                                                      <FontAwesomeIcon icon={faDownload}/>
                                                    </Dropdown.Toggle>

                                                    <Dropdown.Menu>
                                                      {
                                                        downloadFiles.map((item, index) => {
                                                          return <DropdownItem key={index} onClick={(e) => this.openDownload(e, caseItem.caseId, item.value, caseItem.caseName, caseItem.forceDownload)}>{item.name}</DropdownItem>
                                                        })
                                                      }
                                                    </Dropdown.Menu>
                                                  </Dropdown>
                                                </OverlayTrigger>
                                              {(hasOwnership || s3User.admin) && <OverlayTrigger
                                                key={`tooltip-delete-${caseItem.caseId}`}
                                                placement={'top'}
                                                overlay={
                                                  <Tooltip id={`tooltip-delete-${caseItem.caseId}`}>
                                                    Delete
                                                  </Tooltip>
                                                }
                                              >
                                                <i className="action-delete margin10"
                                                   onClick={confirm(() => this.props.delCase(caseItem.caseId))}>
                                                  <FontAwesomeIcon icon={faTrash}/>
                                                </i>
                                              </OverlayTrigger>
                                              }
                                            </td>
                                        </tr>,
                                        caseItem.caseId == this.state.selectedCaseId && <tr style={trStyle}>
                                                <td colSpan={7}>
                                                        {this.props.detail &&
                                                        <Tabs defaultActiveKey={1} variant="tabs" onSelect={key => this.setState({ selectedTabKey: key })} id="uncontrolled-tab-example">
                                                            <Tab eventKey={1} title="Description" ><br/>
                                                                <CaseSummary history={history} data={this.props.detail}/>
                                                            </Tab>
                                                            {this.props.caseResidual &&
                                                            <Tab eventKey={2} title="Convergence">
                                                                <br/>
                                                                <ResidualBox  id={"residual"} data={this.props.caseResidual}
                                                                             width={800} height={500}/>
                                                            </Tab>}
                                                            { this.props.caseTotalForces &&
                                                            <Tab eventKey={3} title={"Forces"}>
                                                                <br/>
                                                                <ForcesBox id={"residual"} data={this.props.caseTotalForces}
                                                                                                              width={1200} height={650}/>

                                                            </Tab>}
                                                            { caseItem.caseStatus == 'completed' &&
                                                            <Tab eventKey={4} title="Visualization" onClick={visualizeFlow360Case.at(caseItem.caseId, "visualization-" + caseItem.caseId)}>
                                                                <br/><br/>
                                                                <p>The picture shows the instantaneous solution at the end  of the current case.</p>
                                                                
                                                                <div id={"visualization-" + caseItem.caseId}></div>
                                                            </Tab>}
                                                        </Tabs>}
                                                </td>
                                            </tr>
                                        ]

                                    )
                                )
                            )}
                            </Confirm>
                            </tbody>
                        </Table>

                    </FormGroup>
                </Card.Body>

                <Modal show={this.state.isNewCase} onHide={this.handleNewCaseClose}>
                    <Modal.Header closeButton>
                      <Modal.Title>Fork A Case
                          <OverlayTrigger placement="right" overlay={editHint}>
                            <span className="d-inline-block">
                              <i className="action margin10">
                                  <FontAwesomeIcon icon={faQuestion}/>
                              </i>
                            </span>
                          </OverlayTrigger>
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form horizontal>
                            <Form.Group controlId="formForkCase">
                              <Form.Label className="mb-0">Fork Case Name</Form.Label>
                              <InputGroup className="mb-4 align-items-center">
                                <FormControl
                                  name="inputForkCaseName"
                                  placeholder="Enter Name"
                                  aria-label="Enter Name"
                                  aria-describedby="basic-addon2"
                                  defaultValue={this.state.inputForkCaseName}
                                  onChange={this.handleInputChange}
                                />
                              </InputGroup>
                            </Form.Group>
                            {/* {this.props.detail &&
                            <ReactJson onEdit={this.handleCaseRuntimeParamsChange} style={scrollStyle}
                                        collapsed={false} src={this.props.detail.runtimeParams}>

                            </ReactJson>} */}
                            <FormKendo
                              ref = {this.forkACaseRef}
                              render={() => (
                              <FormElementKendo>
                                {this.props.detail &&
                                <FieldKendo
                                  id={'flow360mesh'}
                                  name={'flow360mesh'}
                                  optional={true}
                                  label={'Enter Flow360Mesh.JSON or choose a file:'}
                                  hint={'JSON format text only'}
                                  rows={'14'}

                                  // defaultValue={JSON.stringify(this.state.flow360mesh, undefined, 4)}
                                  existValue={JSON.stringify(this.props.detail.runtimeParams, undefined, 4)}
                                  component={FormJSONTextArea}
                                  validator={jsonValidator}
                                />}
                              </FormElementKendo>)} />
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button bsStyle="primary"
                                onClick={this.handleForkCaseSubmit}>Submit</Button>
                        <Button onClick={this.handleNewCaseClose}>Close</Button>
                    </Modal.Footer>
                </Modal>
            </Card>

        );
    }
    handleCaseRuntimeParamsChange(e) {
        //console.log(e);
        this.setState({updatedCaseRuntimeParams: e.updated_src})
    }
    handleNewCaseClose(e) {
        this.setState({isNewCase: false});
    }

    openDownload(e, case_id, filename, forceDownload) {
      //console.log(filename);
      e.stopPropagation();
      awsBuildSignedUrl(case_id, filename, (signedUrl) => {
        if (signedUrl) {
          if(forceDownload) {
            axios.get(signedUrl).then((response) => {
              if(response.data) {
                const element = document.createElement("a");
                const output = JSON.stringify(response.data, null, "   ");
                const file = new Blob([output], {type: 'text/plain'});
                element.href = URL.createObjectURL(file);
                element.download = filename;
                document.body.appendChild(element); // Required for this to work in FireFox
                element.click();
                document.body.removeChild(element);
              }
              else {
                alert(`${filename} not found.`);
              }
            })
          }
          else {
            let a = document.createElement('a');
            a.href = signedUrl;
            a.click();
          }
        } else {
          alert(`${filename} not found.`);
        }
      });
    }

    refreshCaseList() {
        if(this.state.isNewCase) {
            return;
        }
      if (this.state.selectedCaseId) {
          this.getCaseDetail(this.state.selectedCaseId);
      }
      this.props.listCases(this.state.selectedMeshId);
      this.props.getOrganizeCasesWithWaitingForApproval(getOrgId());
      this.state.lastListTime = "Last sync at: " + new Date().toLocaleTimeString();
    }

    changeRefreshAndSetProps(e) {
        let refresh_interval = parseInt(e);
        this.changeRefresh(e);
        this.props.setInterval(refresh_interval);
    }
    changeRefresh(event) {
      let refresh_interval = parseInt(event);
      if (refresh_interval == 0) {
        this.setState({refreshInterval: 0});
        clearInterval(this.interval);
      } else {
        this.setState({
          refreshInterval: refresh_interval
        });
        this.interval = setInterval(() => this.refreshCaseList(), refresh_interval * 1000);
      }
    }

    getAllCaseDetail(id) {

        if (this.state.selectedCaseId === id) {
            this.props.clearDetail();
            this.setState({selectedCaseId: null, selectedTabKey: 1});
        } else {
            this.getCaseDetail(id);
            this.setState({selectedCaseId: id, selectedTabKey: 1});
        }
    }

    handleForkCaseClick(e, caseItem) {
        const {getCase} = this.props;
        e.stopPropagation();
        getCase(caseItem.caseId);

        this.setState({isNewCase: true, parentCase:caseItem, inputForkCaseName: caseItem.caseName});
    
        return false;
    }

    handleForkCaseSubmit(e) {
        const {parentCase} = this.state;
        let runtimeParams = this.forkACaseRef.current.values;
      let flow360mesh = runtimeParams.flow360mesh ? runtimeParams.flow360mesh.replace(/\n/g, '') : JSON.stringify(parentCase.runtimeParams);

      this.setState({isNewCase: false});

      this.props.forkCase(parentCase.caseId, {
          // runtimeParams: JSON.stringify(this.state.updatedCaseRuntimeParams || this.props.detail.runtimeParams),
          runtimeParams: flow360mesh,
          caseName: this.state.inputForkCaseName
      });
    }

    approveCaseToRun(e) {
        const orgId = getOrgId()
        if(orgId !== undefined && orgId !== null && orgId.length > 0) {
            this.props.approveCaseToRun(orgId)
        }
    }

    getCaseDetail(selectedCaseId) {
        //console.log("selectedCaseId:" + selectedCaseId);
        this.props.getCase(selectedCaseId);
        this.props.getCaseResidual(selectedCaseId);
        this.props.getCaseTotalForces(selectedCaseId);
    }


    caseSelectAll() {
      this.setState({
        isCaseAllChecked: !this.state.isCaseAllChecked
      }, () => {
        var arrCaseChecked = [];
        this.props.caseList.filter((c) => { return c }).map((item) => {
          arrCaseChecked.push({
            checked: this.state.isCaseAllChecked,
            caseId: item.caseId
          })
        });
        this.setState({caseChecked: arrCaseChecked});
      });
    }

    handleOptionChangeCase(i) {
      /**
       * Handle the checkbox of items
       */
      var arrInitCaseChecked = [];
      if(this.state.caseChecked.length === 0) {
        this.props.caseList.filter((c) => { return c }).map((item) => {
          arrInitCaseChecked.push({
            checked: false,
            caseId: item.caseId
          })
        });
      } else {
        arrInitCaseChecked = this.state.caseChecked;
      }

      arrInitCaseChecked[i].checked = !arrInitCaseChecked[i].checked;

      this.setState({caseChecked: arrInitCaseChecked}, () => {
        /**
         * Active checkall if all checkbox of items are checked
         */
        var isAllChecked = this.state.caseChecked.filter((c) => {
          return c;
        }).length === this.state.caseChecked.filter((item) => item.checked === true).length;
        this.setState({isCaseAllChecked: isAllChecked});
      });
    }
}


export default connect(
    state => state.meshCase,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(CaseContainer);
