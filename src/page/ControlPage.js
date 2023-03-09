import React from "react";
import {connect} from "react-redux"
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/ControlReducer";
import autoBind from 'react-autobind';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CreatableSelect from "react-select/creatable";
import {buildBillingChartData, generateBillingNew} from "./Shared";
import {
    Badge,
    Button, Card, DropdownButton, DropdownItem,
    FormGroup, FormLabel, InputGroup,
    Row, Tab,
    Table, Tabs,
} from "react-bootstrap";
import BillingChart from "../component/BillingChart";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSync} from "@fortawesome/free-solid-svg-icons";

class ControlPage extends React.Component {

    constructor(props, context) {
      super(props, context);
      autoBind(this);
      this.monthlyLimitRef = React.createRef();
      const currentDate = new Date();
      this.state = {
          selectedCaseWorkers: {},
          selectedMeshWorkers: {},
          selectedHostState: {},
          refreshInterval: 0,
          lastListTime: '',
          selectedUserId: '',
          selectedUserLimitId: '',
          selectedDaemonState: {},
          selectedDaemonMode: {},
          startBillMonth: new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1),
          endBillMonth: currentDate,
      };
    }

    componentDidMount() {
        this.props.listPendingItems();
        this.props.fetchUsers();
        this.props.listHosts();
        this.props.listPastItems();
        this.props.listDaemons();
    }

    componentDidUpdate(prevProps) {

    }

    handleCheckboxChange(evt) {

    }

    changeWorker(event) {
        let res = event.split(",");
        let type = res[2];
        if (type === 'case') {
          let case_id = res[1];
          let worker = res[0];
          let user_id = res[3];
          let workers = this.state.selectedCaseWorkers;
          workers[case_id] = worker + ',' + user_id;
          this.setState({
            selectedCaseWorkers: workers
          });
        } else {
          let mesh_id = res[1];
          let worker = res[0];
          let user_id = res[3];
          let workers = this.state.selectedMeshWorkers;
          workers[mesh_id] = worker + ',' + user_id;
          this.setState({
            selectedMeshWorkers: workers
          });
        }
    }

    switchInstance(event) {
      let res = event.split(",");
      let target_state = res[0];
      let instance_id = res[1];
      let workers = this.state.selectedHostState;
      workers[instance_id] = target_state;
      this.setState({
        selectedHostState: workers
      });
    }

    onClickUpdateMonthly() {
      let limit = this.monthlyLimitRef.current.value;
      let user_id = this.state.selectedUserLimitId.value;
      if (user_id && limit) {
        this.props.updateMonthlyLimit(user_id, limit);
      } else {
        alert('Select a user or enter limit!');
      }
    }

    onClickHostAction() {
      this.props.switchOnOffHosts(this.state.selectedHostState);
      this.setState({
        selectedHostState: {}
      });
    }

    onClickCommit(obj_id, type) {
      //console.log(obj_id);
      if (type === 'case') {
        if (this.state.selectedCaseWorkers[obj_id]) {
          let res = this.state.selectedCaseWorkers[obj_id].split(",");
          let worker = res[0];
          let user_id = res[1];
          this.props.updateCase(obj_id, worker, user_id);
        } else {
          alert('Select worker!');
        }
      } else {
        if (this.state.selectedMeshWorkers[obj_id]) {
          let res = this.state.selectedMeshWorkers[obj_id].split(",");
          let worker = res[0];
          let user_id = res[1];
          this.props.updateMesh(obj_id, worker, user_id);
        } else {
          alert('Select worker!');
        }
      }
    }

    changeRefresh(event) {
      let refresh_interval = parseInt(event);
      if (refresh_interval === 0) {
        this.setState({refreshInterval: 0});
        clearInterval(this.interval);
      } else {
        this.setState({
          refreshInterval: refresh_interval
        });
        this.interval = setInterval(() => this.refreshList(), refresh_interval * 1000);
      }
    }

    switchDaemonPause(event) {
      let res = event.split(",");
      let paused = res[0];
      let worker = res[1];
      let host = res[2];
      let key = res[3];
      let workers = this.state.selectedDaemonState;
      workers[key] = {
        'paused': paused,
        'worker': worker,
        'host': host
      };
      this.setState({
        selectedDaemonState: workers
      });
    }

    switchDaemonMode(event) {
      let res = event.split(",");
      let nonstop = res[0];
      let worker = res[1];
      let host = res[2];
      let key = res[3];
      let workers = this.state.selectedDaemonMode;
      workers[key] = {
        'nonstop': nonstop,
        'worker': worker,
        'host': host
      };
      this.setState({
        selectedDaemonMode: workers
      });
    }

    onClickDaemonPause() {
      for (var key in this.state.selectedDaemonState){
        let info = this.state.selectedDaemonState[key];
        this.props.updateDaemonInfo(info);
      }

      this.setState({
        selectedDaemonState: {}
      });
    }

    onClickDaemonMode() {
      for (var key in this.state.selectedDaemonMode){
        let info = this.state.selectedDaemonMode[key];
        this.props.updateDaemonInfo(info);
      }

      this.setState({
        selectedDaemonMode: {}
      });
    }

    refreshList() {
      this.componentDidMount();
      this.setState({lastListTime: "Last sync at: " + new Date().toLocaleTimeString()});
    }

    render() {
      const {pendingItems, userList} = this.props;
      const {selectedUserId, billMonth} = this.state;
      const {selectedUserLimitId} = this.state;
      const {caseListResult} = this.props;
      const {pastCaseList} = this.props;
      const {hostList, daemonList} = this.props;
      const {startBillMonth, endBillMonth} = this.state;
      //console.log(caseListResult);
      //console.log(this.props);
      return (
        <Card>
            <Card.Header>
                <InputGroup className="mb-3">
                    <InputGroup.Prepend>
                        <i  onClick={this.refreshList} className="action margin10" style={{marginRight:20}} title="Refresh List">
                            <FontAwesomeIcon icon={faSync}/>
                        </i>
                        <FormLabel lg={4}>Mesh And Case Job Management </FormLabel>
                        <InputGroup.Text id="basic-addon1" style={{marginLeft:60}}>Auto Refresh:</InputGroup.Text>
                    </InputGroup.Prepend>
                    <DropdownButton id="refresh_mesh_list" title={this.state.refreshInterval === 0 ? `Auto Refresh` :
                        `every ${this.state.refreshInterval} seconds`} onSelect={this.changeRefresh}>
                        <DropdownItem key={1} eventKey={10} href="#">Every 10 seconds</DropdownItem>
                        <DropdownItem key={2} eventKey={60} href="#">Every 60 seconds</DropdownItem>
                    </DropdownButton>
                    {this.state.lastListTime &&
                    <InputGroup.Append>
                        <InputGroup.Text>{this.state.lastListTime}</InputGroup.Text>
                    </InputGroup.Append>
                    }
                </InputGroup>
            </Card.Header>
            <Card.Body>
                <Tabs defaultActiveKey={1}>
                    <Tab eventKey={1} title='Daemon Status'>
                        <h1 style={{marginTop:30}}>Update Daemon Status</h1>
                        <FormGroup controlId="formBasicText">
                            <Table striped bordered  hover>
                                <thead>
                                <tr>
                                    <th>Worker Group</th>
                                    <th>Host</th>
                                    <th>Running Mode</th>
                                    <th>Paused State</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {daemonList && daemonList.map(
                                    item => (
                                        <tr key={item.daemonKey} className={`table-content-row ${item.paused ? 'mark_red' : ''}`}>
                                            <td >{item.worker}</td>
                                            <td >{item.host}</td>
                                            <td>{item.nonstop ? `Non-Stop` : `StopAndGo`}</td>
                                            <td >{item.paused ? `Paused` : `Running`}</td>
                                            <td >
                                                <DropdownButton className='btn_with_margin_left' id={`select_deamon_${item.daemonKey}_mode`} title={this.state.selectedDaemonMode[item.daemonKey] ?
                                                    (this.state.selectedDaemonMode[item.daemonKey]['n'] === '1' ? 'NonStop' : 'StopAndGo')  :
                                                    `NonStop/StopAndGo`}  onSelect={this.switchDaemonMode}>
                                                    <DropdownItem key="1" eventKey={`1,${item.worker},${item.host},${item.daemonKey}`} href="#">NonStop</DropdownItem>
                                                    <DropdownItem key="2" eventKey={`0,${item.worker},${item.host},${item.daemonKey}`} href="#">StopAndGo</DropdownItem>
                                                </DropdownButton>
                                                <Button variant="light" onClick={() => this.onClickDaemonMode()}>Commit</Button>

                                                <DropdownButton className='btn_with_margin_left' id={`select_deamon_${item.daemonKey}`} title={this.state.selectedDaemonState[item.daemonKey] ?
                                                    (this.state.selectedDaemonState[item.daemonKey]['p'] === '1' ? 'Pause' : 'Resume')  :
                                                    `Pause/Resume`}  onSelect={this.switchDaemonPause}>
                                                    <DropdownItem key="1" eventKey={`1,${item.worker},${item.host},${item.daemonKey}`} href="#">Pause</DropdownItem>
                                                    <DropdownItem key="2" eventKey={`0,${item.worker},${item.host},${item.daemonKey}`} href="#">Resume</DropdownItem>
                                                </DropdownButton>
                                                <Button variant="light" onClick={() => this.onClickDaemonPause()}>Commit</Button>
                                            </td>
                                        </tr>)
                                )}
                                </tbody>
                            </Table>
                        </FormGroup>
                    </Tab>
                    <Tab eventKey={2} title='External Hosts'>
                        <h1 style={{marginTop:30}}>External Hosts List</h1>
                        <FormGroup controlId="formBasicText">
                            <Table striped bordered  hover>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Instance ID</th>
                                    <th>State</th>
                                    <th>Machine Type</th>
                                    <th>Image ID</th>
                                    <th>Launch Time(UTC)</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {hostList && hostList.map(
                                    item => (

                                        <tr key={item.instanceId} className='table-content-row'>
                                            <td >{item.name}</td>
                                            <td >{item.instanceId}</td>
                                            <td >{item.state}</td>
                                            <td >{item.instanceType}</td>
                                            <td >{item.imageId}</td>
                                            <td >{item.launchTime}</td>
                                            <td >
                                                <DropdownButton id={`select_worker_${item.instanceId}`} title={this.state.selectedHostState[item.instanceId] ? this.state.selectedHostState[item.instanceId]  :
                                                    `Turn On/Off`}  onSelect={this.switchInstance}>
                                                    <DropdownItem key="1" eventKey={`stopped,${item.instanceId}`} href="#">Turn Off</DropdownItem>
                                                    <DropdownItem key="2" eventKey={`running,${item.instanceId}`} href="#">Start</DropdownItem>
                                                </DropdownButton>
                                                <Button variant="light" onClick={() => this.onClickHostAction()}>Commit</Button>
                                            </td>
                                        </tr>)
                                )}
                                </tbody>
                            </Table>
                        </FormGroup>
                    </Tab>
                    <Tab eventKey={3} title='Pending Mesh'>
                        <h1 style={{marginTop:30}}>Pending Mesh List</h1>
                        <FormGroup controlId="formBasicText">
                            <Table striped bordered condensed={'true'} hover>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Mesh ID</th>
                                    <th>Submit Time</th>
                                    <th>Status</th>
                                    <th>Worker Group</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pendingItems && pendingItems.mesh_list.map(
                                    item => (

                                        <tr key={item.meshId} className='table-content-row'>
                                            <td >{item.name}</td>
                                            <td >{item.meshId}</td>
                                            <td >{item.addTime}</td>
                                            <td >{item.status}</td>
                                            <td >{item.worker}</td>
                                            <td >
                                                <DropdownButton id={`select_worker_${item.meshId}`} title={this.state.selectedMeshWorkers[item.meshId] ? this.state.selectedMeshWorkers[item.meshId]  :
                                                    `Select Worker`}  onSelect={this.changeWorker}>
                                                    <DropdownItem key="1" eventKey={`base,${item.meshId},mesh,${item.userId}`} href="#">Base</DropdownItem>
                                                    <DropdownItem key="2" eventKey={`remote_a,${item.meshId},mesh,${item.userId}`} href="#">RemoteA</DropdownItem>
                                                </DropdownButton>
                                                <Button variant="light" onClick={() => this.onClickCommit(item.meshId, 'mesh')}>Commit</Button>
                                            </td>
                                        </tr>)
                                )}
                                </tbody>
                            </Table>
                        </FormGroup>
                    </Tab>
                    <Tab eventKey={4} title='Pending Cases'>
                        <h1 style={{marginTop:30}}>Pending Case List</h1>
                        <FormGroup controlId="formBasicText">
                            <Table striped bordered condensed={'true'} hover>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Case ID</th>
                                    <th>Submit Time</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Worker Group</th>
                                    <th>Worker Instance</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>

                                {pendingItems && pendingItems.case_list.map(
                                    item => (
                                        <tr key={item.caseId} className='table-content-row'>
                                            <td >{item.name}</td>
                                            <td >{item.caseId}</td>
                                            <td >{item.submitTime}</td>
                                            <td >{item.priority}</td>
                                            <td >{item.status}</td>
                                            <td >{item.worker}</td>
                                            <td >{item.workerHost}</td>
                                            <td >
                                                <DropdownButton id={`select_worker_${item.caseId}`} title={this.state.selectedCaseWorkers[item.caseId] ? this.state.selectedCaseWorkers[item.caseId]  :
                                                    `Select Worker`}  onSelect={this.changeWorker}>
                                                    <DropdownItem key="1" eventKey={`base,${item.caseId},case,${item.userId}`} href="#">Base</DropdownItem>
                                                    <DropdownItem key="2" eventKey={`remote_a,${item.caseId},case,${item.userId}`} href="#">RemoteA</DropdownItem>
                                                </DropdownButton>
                                                <Button variant="light" onClick={() => this.onClickCommit(item.caseId, 'case')}>Commit</Button>
                                            </td>
                                        </tr>)
                                )}

                                </tbody>
                            </Table>
                        </FormGroup>

                    </Tab>
                    <Tab eventKey={5} title='Recent Cases'>
                        <h1 style={{marginTop:30}}>Past Completed/Failed Case List (48 hours)</h1>
                        <FormGroup controlId="formBasicText">
                            <Table striped bordered condensed={'true'} hover>
                                <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Case ID</th>
                                    <th>Submit Time</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Worker Group</th>
                                    <th>Worker Instance</th>
                                    <th>Action</th>
                                </tr>
                                </thead>
                                <tbody>

                                {pastCaseList && pastCaseList.map(
                                    item => (
                                        <tr key={item.caseId} className='table-content-row'>
                                            <td >{item.name}</td>
                                            <td >{item.caseId}</td>
                                            <td >{item.submitTime}</td>
                                            <td >{item.priority}</td>
                                            <td >{item.status}</td>
                                            <td >{item.worker}</td>
                                            <td >{item.workerHost}</td>
                                            <td >
                                                <DropdownButton id={`select_worker_${item.caseId}`} title={this.state.selectedCaseWorkers[item.caseId] ? this.state.selectedCaseWorkers[item.caseId]  :
                                                    `Select Worker`}  onSelect={this.changeWorker}>
                                                    <DropdownItem key="1" eventKey={`base,${item.caseId},case`} href="#">Base</DropdownItem>
                                                    <DropdownItem key="2" eventKey={`remote_a,${item.caseId},case`} href="#">RemoteA</DropdownItem>
                                                </DropdownButton>
                                                <Button variant="light" onClick={() => this.onClickCommit(item.caseId, 'case')}>Commit</Button>
                                            </td>
                                        </tr>)
                                )}

                                </tbody>
                            </Table>
                        </FormGroup>

                    </Tab>
                    <Tab eventKey={6} title='Billing'>
                        <h1 style={{marginTop:30}}>Show Billing Info</h1>
                        {userList &&

                        <CreatableSelect
                            isClearable
                            placeholder="Select user to show billing (accountId/email/limit/login_times/invite_code)"
                            value={selectedUserId}
                            onChange={this.handleUserChange}
                            options={userList}
                        /> }

                        <InputGroup className="flex align-items-center">

                            <InputGroup.Append className="align-items-center">
                                <InputGroup.Text id="basic-addon1" style={{marginLeft:60, marginRight:20}}>Select Start Month: </InputGroup.Text>
                            </InputGroup.Append>
                            <InputGroup.Append className="align-items-center">
                                <DatePicker
                                    selected={startBillMonth}
                                    onChange={this.handleStartBillMonthChange}
                                    dateFormat="yyyy.MM"
                                    showMonthYearPicker placeholderText="select start month"/>
                            </InputGroup.Append>
                            <InputGroup.Append className="align-items-center">
                                <InputGroup.Text id="basic-addon1" style={{marginLeft:60, marginRight:20}}>Select End Month: </InputGroup.Text>
                            </InputGroup.Append>
                            <InputGroup.Append className="align-items-center">
                                <DatePicker
                                    selected={endBillMonth}
                                    onChange={this.handleEndBillMonthChange}
                                    dateFormat="yyyy.MM"
                                    showMonthYearPicker placeholderText="select end month"/>
                            </InputGroup.Append>
                            <InputGroup.Append className="align-items-center">
                                <Button style={{marginLeft:20}} onClick={() => this.onClickBillingInfo()}>Fetch</Button>
                            </InputGroup.Append>
                        </InputGroup>
                        <div className="d-flex justify-content-center" style={{marginTop:20}}>
                        {caseListResult && this.state.selectedUserId &&
                        <BillingChart data={buildBillingChartData(caseListResult)}/>}
                        </div>
                        {caseListResult  && this.state.selectedUserId &&
                        generateBillingNew(caseListResult, this.state.selectedUserId.value)
                        }

                    </Tab>
                    <Tab eventKey={7} title='Spend Limit'>
                        <h1 style={{marginTop:30}}><Badge variant="primary">Update Monthly Spend Limit</Badge></h1>
                        <FormGroup controlId="formBasicText" bsClass='drop_down_users'>
                            {userList &&

                            <CreatableSelect
                                isClearable
                                placeholder="Select user to update limit"
                                value={selectedUserLimitId}
                                onChange={this.handleUserLimitChange}
                                options={userList}
                            /> }

                            <div><input type="text" className="form-control" placeholder="Enter Monthly Spend Limit" ref={this.monthlyLimitRef}/>
                                <Button variant="light" onClick={() => this.onClickUpdateMonthly()}>Commit</Button>
                            </div>
                        </FormGroup>
                    </Tab>
                </Tabs>
          </Card.Body>



        </Card>
    )
    }

    handleUserChange = selectedOption => {
      this.setState({ selectedUserId: selectedOption });
      //console.log(`Option selected:`, selectedOption);
    };
    handleUserLimitChange = selectedOption => {
      this.setState({ selectedUserLimitId: selectedOption });
      //console.log(`Option selected:`, selectedOption);
    };

    handleStartBillMonthChange = date => {
        this.setState({startBillMonth : date});

    }
    handleEndBillMonthChange = date => {
        this.setState({endBillMonth : date});

    }

    onClickBillingInfo() {
        const {selectedUserId, startBillMonth, endBillMonth} = this.state;
        if (!selectedUserId.value) {
            alert('Select a user!');
            return;
        }
        if(!startBillMonth) {
            alert('Select a start month for billing!');
            return;
        }
        if(!endBillMonth) {
            alert('Select a end month for billing!');
            return;
        }
        this.props.listCasesForBilling(this.state.selectedUserId.value, this.state.startBillMonth, this.state.endBillMonth);
    }
}

export default connect(
    state => state.control,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(ControlPage);
