import * as React from 'react';
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/MeshStudioReducer";
import {connect} from "react-redux";
import {ProgressBar} from '@progress/kendo-react-progressbars';
import {Grid, GridColumn as Column, GridRow} from '@progress/kendo-react-grid';
import { Dialog, DialogActionsBar } from '@progress/kendo-react-dialogs';
import {Form, Field, FormElement, FieldWrapper} from '@progress/kendo-react-form';
import {Error, FloatingLabel, Hint, Label} from '@progress/kendo-react-labels';
import { ListView, ListViewHeader, ListViewFooter } from '@progress/kendo-react-listview';

import {
  FormDatePicker, FormNumericTextBox, FormInput,
  FormCheckbox, FormMaskedTextBox, FormTextArea, FormJSONTextArea, jsonValidator
} from '../component/kendo-form-component';

import {
  termsValidator, emailValidator, nameValidator,
  phoneValidator, guestsValidator, nightsValidator,
  arrivalDateValidator
} from '../component/kendo-validator-component'

import { Input } from '@progress/kendo-react-inputs';
import {
  Toolbar, ToolbarItem, ButtonGroup, Button, ToolbarSpacer
  , ToolbarSeparator, DropDownButton, DropDownButtonItem
} from '@progress/kendo-react-buttons'
import {Card, FormGroup, InputGroup} from "react-bootstrap";
import autoBind from "react-autobind";
import {getFileCompression} from "../util/FileUtils";


const notNullReg = new RegExp(/(?!^$)([^\s])/);
const notNullValidator = (value) => (notNullReg.test(value) ? "" : "output mesh name can't be empty.");

const outputMeshNameInput = (fieldRenderProps) => {
  const { validationMessage, visited, label, id, valid, value, inputMeshName, ...others } = fieldRenderProps;
  const showValidationMessage = visited && validationMessage;
  return (
    <FieldWrapper>
      <InputGroup>
        <InputGroup.Prepend>Input Mesh Name:</InputGroup.Prepend>
        <Input value={inputMeshName} disabled={true} type={'string'} />
      </InputGroup>
      <InputGroup>
        <InputGroup.Prepend>Output Mesh Name:</InputGroup.Prepend>
        <Input value={value} valid={valid} type={'string'} id={id} {...others} />
      </InputGroup>

      {
        showValidationMessage &&
        <Error>{validationMessage}</Error>
      }
    </FieldWrapper>
  );
};

const rotationSettingItem = (fieldRenderProps) => {

  const {
    // The meta props of the Field.
    validationMessage, touched, visited, modified, valid, type,
    // The input props of the Field.
    label, id, value, onChange, onFocus, onBlur, values, onDelete,
    // The custom props that you passed to the Field.
    ...others
  } = fieldRenderProps;
  const onValueChange = (e,val) => {
    onChange({value: {...value, ...val}});
  };

  const showValidationMessage = visited && validationMessage;
  return (
    <FieldWrapper>
        <InputGroup>
          <InputGroup.Prepend>Center of Rotation:(x, y, z)</InputGroup.Prepend>
          <Input placeholder={"x,y,z"} onChange={(e) => onValueChange(e,{'centerOfRotate':e.value})}></Input>
        </InputGroup>
        <InputGroup>
          <InputGroup.Prepend>Axis of Rotation:(x, y, z)</InputGroup.Prepend>
          <Input placeholder={"x,y,z"} onChange={(e) => onValueChange(e,{'axisOfRotate':e.value})}></Input>
        </InputGroup>
        <InputGroup>
          <InputGroup.Prepend>Rotation Degree:</InputGroup.Prepend>
          <Input onChange={(e) => onValueChange(e, {'degreeOfRotate':e.value})}></Input>
        </InputGroup>
      {
        showValidationMessage &&
        <Error>{validationMessage}</Error>
      }
    </FieldWrapper>
  );
};

const zoneSettingItem = (fieldRenderProps) => {

  const {
    // The meta props of the Field.
    validationMessage, touched, visited, modified, valid, type,
    // The input props of the Field.
    label, id, value, onChange, onFocus, onBlur, values, onDelete,
    // The custom props that you passed to the Field.
    ...others
  } = fieldRenderProps;
  const onValueChange = (e,val) => {
    onChange({value: {...value, ...val}});
  };

  const showValidationMessage = visited && validationMessage;
  return (
    <FieldWrapper>
      <InputGroup>
        <InputGroup.Prepend>Zone Mapping</InputGroup.Prepend>
        <Input placeholder={"from source zone"} onChange={(e) => onValueChange(e,{'source':e.value})}></Input>
        <Input placeholder={"to target zone"} onChange={(e) => onValueChange(e,{'target':e.value})}></Input>
      </InputGroup>
      {
        showValidationMessage &&
        <Error>{validationMessage}</Error>
      }
    </FieldWrapper>
  );
};
const MeshListHeader = () => {
  return (
    <ListViewHeader style={{color: '#454545', marginBottom: 0, fontSize: 14}} className='pl-1 pb-2 pt-2'>
      Mesh Files:
    </ListViewHeader>
  );
}


const MeshItemRender = props => {
  let item = props.dataItem;
  return (
    <div className='row p-2 border-bottom align-middle' style={{ margin: 0}}>
      <label style={{fontSize: 12, color: '#454545', marginBottom: 0}} className="text-uppercase">{item.name}</label>
    </div>
  );
}

class StudioContainer extends React.Component {

  constructor(props, context) {
    super(props, context);
    autoBind(this);
    this.transformRef = React.createRef();
    this.transButtonRef = React.createRef();
    this.fileRef = React.createRef();
    this.processMeshRef = React.createRef();
    this.mergedPatchesTextArea = React.createRef();
    this.state = {
      transformSettingShow: false,
      mergeSettingShow: false,
      processMeshSettingShow: false,
      rotationNextIndex: 1,
      rotations:[],
      zones:[],
      jsonValue: null,
    };
    //data: products.map(dataItem => Object.assign({selected: false}, dataItem)),
  }

  componentDidMount() {
    this.props.listStudioResources();
  }

  selectionChange = (event) => {
    this.props.selectionChange(event.dataItem);

  }

  headerSelectionChange = (event) => {
    const checked = event.syntheticEvent.target.checked;
    this.props.headerSelectionChange(checked);
  }


  render() {
    const {uploadedFilePercent, isUploading, items} = this.props;
    const {outputMeshName} = this.state;
    let zones = ["zone1"];
    return (
      <Card>
        <Toolbar>
          <ToolbarItem>
            <ButtonGroup>
              <Button icon="refresh" title="refresh" onClick={this.refreshStudio}>Refresh</Button>
            </ButtonGroup>
            <ToolbarSeparator/>
            <ButtonGroup>
              <Button icon="upload" title="upload" togglable={false} onClick={this.chooseFile}>Upload</Button>
              <Button icon="rotate-right" title="transform" togglable={false}
                      ref={this.transButtonRef}
                      onClick={this.transform}>Trans</Button>
              <Button icon="back-element" title="merge" togglable={false} onClick={this.mergeSetup}>Merge</Button>
              <Button icon="style-builder" title="gomesh" togglable={false} onClick={this.processMeshSetup}>Process</Button>
            </ButtonGroup>
            <ToolbarSeparator/>
            <ButtonGroup>
              <Button icon="delete" title="delete" togglable={false}>Delete</Button>
            </ButtonGroup>

          </ToolbarItem>

          <ToolbarSpacer/>
          <input style={{visibility:'hidden'}} accept=".ugrid,.gz,.bz2,.cgns" type="file"  placeholder="choose mesh file to upload"
                 ref={this.fileRef} onChange={this.onFileSelected}  />
          <ToolbarItem>
            <DropDownButton text="View" icon="eye">
              <DropDownButtonItem icon="table" text="table"/>
            </DropDownButton>
          </ToolbarItem>
        </Toolbar>

        <Card.Body>
          <FormGroup controlId="formBasicText">
            { isUploading &&
            <ProgressBar value={uploadedFilePercent} label={props => {
              return <strong>{this.getCurrentFileName()}: {props.value}% </strong>
            }}/>
            }
            <Grid
              pageSize={10}
              data={items}
              style={{height: '400px'}}
              selectedField="selected"
              onHeaderSelectionChange={this.headerSelectionChange}
              onSelectionChange={this.selectionChange}
            >
              <Column
                field="selected"
                width="50px"
                />

              <Column field="itemId" title="ID"/>
              <Column field="name" title="Name" width="300px"/>
              <Column field="createTime" title="Create Time"/>
              <Column field="status" title="Status"/>
              <Column field="parentId" title="Parent"/>
            </Grid>

          </FormGroup>

        </Card.Body>

        {this.state.transformSettingShow &&
        <Dialog title={"Setting: Transformation"} width={500} height={700} onClose={this.cancelTransformSetting}>
          <Form
            ref = {this.transformRef}
            render={(formRenderProps) => (
          <FormElement style={{maxWidth: 650, height:300}}>
            <Field
              id={'outputMeshName'}
              name={'outputMeshName'}
              label={'Output Mesh Name'}
              inputMesh={this.props.items.filter(v => v.selected)[0].name}
              component={outputMeshNameInput}
              validator={notNullValidator}
            />
            {
              <fieldset className="border p-2">
                <legend style={{fontSize: 16}} className="w-auto">Zones Rename </legend>
                {
                  zones.map((zoneItem,i) => {
                    return <Field
                      key={'zone' +i}
                      id={'zoneName' +i}
                      name={'zoneName' + i}
                      label={'Zone Rename'}
                      component={zoneSettingItem}
                      validator={notNullValidator}
                    />
                  })
                }

              </fieldset>
            }
            <br/>
            <InputGroup className="mb-3">
              <InputGroup.Prepend><Label>Add Rotation: </Label></InputGroup.Prepend>
              <Button icon={"add"} onClick={this.onAddRotation} ></Button>

            </InputGroup>
            {
              this.state.rotations && this.state.rotations.map((rotateItem, i) => {
                return   <fieldset className="border p-2">
                  <legend style={{fontSize: 16}} className="w-auto">rotate - {i}
                    <Button icon={"delete"} onClick={() => this.onRotateDeleted(rotateItem)}></Button>
                  </legend>
                  <Field
                  key={'rotate' + rotateItem.id}
                  id={'rotate' + rotateItem.id}
                  name={'rotate' + rotateItem.id}
                  label={'rotate'}
                  component={rotationSettingItem}
                  validator={notNullValidator}
                />
                </fieldset>
              })
            }
          </FormElement>)} />
          <DialogActionsBar>
            <Button  onClick={this.cancelTransformSetting}>Cancel</Button>
            <Button type={"submit"} onClick={this.submitTransform}>Submit</Button>
          </DialogActionsBar>
        </Dialog>
        }
        {this.state.mergeSettingShow &&
        <Dialog title={"Setting: Merge Meshes"} width={500} height={500} onClose={this.cancelMergeSetting}>
          <ListView
            data={this.props.items.filter(v => v.selected)}
            item={MeshItemRender}
            style={{ width: "100%" }}
            header={MeshListHeader}

          />
          <Input
            name="outputMesh"
            style={{ width: "100%", marginTop: 15}}
            label="Output Mesh:"
            minLength={2}
            defaultValue={"mesh.merged"}
            value={outputMeshName}
            required={true}
            onChange={this.onOutputMeshNameChanged}
          />
          <DialogActionsBar>
            <Button  onClick={this.cancelMergeSetting}>Cancel</Button>
            <Button type={"submit"} onClick={this.submitMerge}>Submit</Button>
          </DialogActionsBar>
        </Dialog>
        }
        {this.state.processMeshSettingShow &&
        <Dialog title={"Setting: Process Mesh"} width={500} height={500} onClose={this.cancelProcessMeshSetting}>
          <Form
            ref = {this.processMeshRef}
            render={() => (
              <FormElement style={{width: "100%"}}>
                <legend className={'k-form-legend'}>BOOK YOUR DREAM VACATION TODAY</legend>
                <Field
                  id={'tags'}
                  name={'tags'}
                  label={'Tags'}
                  optional={true}
                  hint={"Enter Tags, Example as tag1,tag2"}
                  component={FormInput}
                />
                <Field
                  id={'flow360mesh'}
                  name={'flow360mesh'}
                  optional={true}
                  label={'Enter Flow360Mesh.JSON or choose a file:'}
                  hint={'JSON format text only'}
                  component={FormJSONTextArea}
                  validator={jsonValidator}
                />
              </FormElement>
            )}
          />
          <DialogActionsBar>
            <Button  onClick={this.cancelProcessMeshSetting}>Cancel</Button>
            <Button type={"submit"} onClick={this.submitProcessMesh}>Submit</Button>
          </DialogActionsBar>
        </Dialog>
          }

      </Card>

    );
  }

  getCurrentFileName() {
    let file = this.fileRef.current.files[0];
    if(file) {
      return file.name;
    }
  }
  transform() {
    const selectedItems = this.props.items.filter(v => v.selected);
    if(selectedItems.length > 1) {
      alert("Please select only one mesh.")
      return;
    }
    if(selectedItems.length == 0) {
      alert("Please select at least one mesh.")
      return;
    }
    //console.log(this.transButtonRef);
    this.setState({rotations:[], rotationNextIndex: 1});
    this.setState({transformSettingShow: true});
  }
  chooseFile() {
    this.fileRef.current.click();
  }

  onFileSelected() {
    let file = this.fileRef.current.files[0];
    if(file) {
      this.props.uploadStudioFile(file);
    }
  }

  onFileForMesh() {
    let file = this.fileRef.current.files[0];
    if(file) {
      this.props.uploadStudioFile(file);
    }
  }

  cancelTransformSetting() {
    this.setState({transformSettingShow: false});
  }

  submitTransform() {
    const selectedItems = this.props.items.filter(v => v.selected);
    //console.log(selectedItems);
    //alert(JSON.stringify(this.transformRef.current.values));
    const transformInput = this.transformRef.current.values;
    //console.log(transformInput);
    if(selectedItems.length > 0) {
      let item = selectedItems[0];
      let transformParam =  {
        "inputMesh" : item.name,
        "outputMesh" : transformInput["outputMeshName"]
      }
      const rotateKeyList = Object.keys(transformInput).filter(v => v.startsWith('rotate'));

      let rotateProps = rotateKeyList.map(key => {
        let inputProp = transformInput[key];
        //console.log(inputProp);
        //console.log(inputProp.centerOfRotate);
        return {
            "type" : "rotation",
            "centerOfRotation" : this.parseStringToIntArray(inputProp["centerOfRotate"]),
            "axisOfRotation" : this.parseStringToIntArray(inputProp["axisOfRotate"]),
            "degreeOfRotation" : parseFloat(inputProp["degreeOfRotate"])
          };
      });
      transformParam["transformations"] = rotateProps;

      const zonesRenameList = Object.keys(transformInput).filter( key => key.startsWith('zoneName'))
        .map(key => transformInput[key]);
      //console.log(zonesRenameList);
      transformParam["transformations"] = rotateProps;
      transformParam["renameZones"] = zonesRenameList;
      this.props.submitMeshTransTask(item,{...item,
        taskParam: JSON.stringify(transformParam),
        taskType: "transform"
      });
      this.setState({transformSettingShow: false});
    }
  }

  parseStringToIntArray(xyzValue) {
    const xyz = xyzValue.split(',');
    return [parseInt(xyz[0]), parseInt(xyz[1]), parseInt(xyz[2])];

  }

  onAddRotation() {
    const {rotationNextIndex} = this.state;

    this.setState({rotationNextIndex: rotationNextIndex + 1, rotations: [...this.state.rotations, {id:rotationNextIndex}]});
  }
  onAddZone() {
    this.setState({zones: [...this.state.zones, {}]});
  }

  onRotateDeleted(rotateItem) {
    this.setState({rotations: this.state.rotations.filter(item => item !== rotateItem)});
  }

  refreshStudio() {
    this.props.listStudioResources();
  }

  cancelMergeSetting() {
    this.setState({mergeSettingShow:false});
  }

  submitMerge() {
    this.setState({mergeSettingShow:false});
    let {outputMeshName} = this.state;
    //console.log(outputMeshName);
    let meshFiles = this.props.items.filter(v => v.selected);
    let mergeJson = {
      meshFiles:meshFiles.map(v => v.name)
    };
    this.props.submitMergeTask(meshFiles, mergeJson, outputMeshName);
  }

  mergeSetup() {
    const selectedItems = this.props.items.filter(v => v.selected);
    if(selectedItems.length < 2) {
      alert("Please select at least 2 resources.")
      return;
    }
    this.setState({mergeSettingShow:true});
  }

  onOutputMeshNameChanged(e) {

    this.setState({outputMeshName:e.value});
  }

  processMeshSetup() {
    const selectedItems = this.props.items.filter(v => v.selected);
    if(selectedItems.length  != 1) {
      alert("Please select only one mesh.")
      return;
    }
    this.setState({processMeshSettingShow: true});
  }

  submitProcessMesh() {
    let meshParam = this.processMeshRef.current.values;
    const selectedItems = this.props.items.filter(v => v.selected);
    //console.log(selectedItems);
    let tags = meshParam.tags ? meshParam.tags.split(",").map((x) => x.trim()).filter(x => x !== "") : [];
    // let boundaries = meshParam.boundaries ? meshParam.boundaries.split(",").map((x) => x.trim()).filter(x => x !== "") : [];
    let flow360mesh = meshParam.flow360mesh ? meshParam.flow360mesh.replace(/\n/g, '') : [];
    this.props.createNewMesh(selectedItems[0],{
      meshName: selectedItems[0].name.replace(".tar.gz", ""),
      meshTags: tags,
      meshFormat: '',
      meshSize: 0,
      // meshParams: JSON.stringify({
      //   boundaries: {
      //     noSlipWalls: boundaries
      //   }
      // }),
      meshParams: JSON.stringify(flow360mesh),
      meshStatus: 'uploading',
      solverVersion: 'release-20.3.2',
      meshCompression: getFileCompression(selectedItems[0].name),
      s3Path: selectedItems[0].s3Path
    });
    this.setState({processMeshSettingShow: false});
  }
  cancelProcessMeshSetting() {
    this.setState({processMeshSettingShow: false});
  }

}

export default connect(
  state => state.studio,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(StudioContainer);
