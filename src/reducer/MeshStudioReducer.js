import createAction, {
  callGet2WithToken, callPost2WithToken, callPut2WithToken,
  getS3UserId, parseTimeFormat,
} from "./utils"
import {config} from "../util/EnvConfig";
import {awsUploadFile} from "../util/AwsUtils";
import { v4 as uuidv4 } from 'uuid';

const GET_STUDIO_FILE_LIST = "GET_STUDIO_FILE_LIST";
const STUDIO_FILE_UPLOAD_PROCESS = "STUDIO_FILE_UPLOAD_PROCESS";
const STUDIO_FILE_UPLOAD_COMPLETE = "STUDIO_FILE_UPLOAD_COMPLETE";

export const actionCreators = {
    listStudioResources: (keyword) => (dispatch, state) => {
      return callGet2WithToken("studio/items")
        .then(resp => {
          let itemList = resp.data.data.filter(item => item.status !== "deleted");
          itemList.sort((v1, v2) => {
            return parseTimeFormat(v2.createTime) - parseTimeFormat(v1.createTime);
          });
          dispatch(createAction(GET_STUDIO_FILE_LIST, itemList));
        })
        .catch(err => {
          //console.log("getMesh.err", err.response);
        });

    },
    uploadStudioFile: (file) => (dispatch, state) => {
      let prev_perc = 0;
      let uuid = uuidv4();
      let s3Path = `users/${getS3UserId()}/${uuid}/${file.name}`;
      return awsUploadFileToStudio(
        s3Path,
        file,
        (uploadedSize, totalSize) => {
          if (prev_perc < parseInt(uploadedSize / totalSize * 100)) {
            prev_perc = parseInt(uploadedSize / totalSize * 100);
            dispatch(createAction(STUDIO_FILE_UPLOAD_PROCESS, prev_perc));
          }
        },
        (success)=> {
          //console.log('upload done:' + success);
          dispatch(createAction(STUDIO_FILE_UPLOAD_COMPLETE, success));
          if(success) {
            callPut2WithToken(`studio/item/${uuid}`, {
              s3Path: s3Path,
              status: "processed",
            })
              .then(resp => {
                let itemList = [resp.data.data, ...state().studio.items];
                dispatch(createAction(GET_STUDIO_FILE_LIST, itemList));
              });
          }
        }
      );
    },
    submitMeshTransTask: (studioItem, taskBody) => (dispatch, state) => {
      return callPost2WithToken(`studio/item`, {
        // use s3Path as the file name, and the full s3 path will be updated once daemon are for transform
        status: "processing",
        parentId: studioItem.itemId,
        s3Path: JSON.parse(taskBody.taskParam).outputMesh,
      })
        .then(resp => {
          let itemList = [resp.data.data, ...state().studio.items];
          dispatch(createAction(GET_STUDIO_FILE_LIST, itemList));
          taskBody.objectId = resp.data.data.itemId;
          taskBody.solverVersion = "release-20.3.2";
          callPost2WithToken(`solver/task`, taskBody)
            .then(resp => {
              alert('the backend task is created.');
            })
            .catch(err => {
              //console.log("submitMeshTransTask.err", err.response);
            });
        });
    },
    createNewMesh: (studioItem, mesh) => (dispatch, state) => {
      //console.log(mesh);
      return callPost2WithToken("mesh", mesh)
        .then(resp => {
          let meshId = resp.data.data.meshId;

          return callPost2WithToken(`studio/item/${studioItem.itemId}/copyToMesh/${meshId}`)
            .then(resp =>{
              alert("new mesh is created.");
            })
        });
    },
    submitMergeTask: (meshFiles, taskParam, outputMeshName) => (dispatch, state) => {
      return callPost2WithToken(`studio/item`, {
        // use s3Path as the file name, and the full s3 path will be updated once daemon are for transform
        status: "processing",
        parentId: meshFiles.map(v => v.itemId).join(","),
        s3Path: `${outputMeshName}.meshmerged.json`,
      })
        .then(resp => {
          let itemList = [resp.data.data, ...state().studio.items];
          dispatch(createAction(GET_STUDIO_FILE_LIST, itemList));
          let taskBody = {
            taskType: "merge",
            taskParam: JSON.stringify(taskParam),
            objectId: resp.data.data.itemId,
            solverVersion: "release-20.3.2",
          };
          callPost2WithToken(`solver/task`, taskBody)
            .then(resp => {
              alert('a backend task is created.');
            })
            .catch(err => {
              //console.log("submitMeshTransTask.err", err.response);
            });
        });
    },
  headerSelectionChange: (checked) => (dispatch, state) => {
    const newItems = state().studio.items.map(item=>{
      item.selected = checked;
      return item;
    });
    dispatch(createAction(GET_STUDIO_FILE_LIST, newItems));
  },

  selectionChange: (dateItem) => (dispatch, state) => {
    const newItems = state().studio.items.map(item => {
      if (item.itemId === dateItem.itemId) {
        item.selected = !dateItem.selected;
      }
      return item;
    });
    dispatch(createAction(GET_STUDIO_FILE_LIST, newItems));
  }
};

export function reducer(state = {}, action) {
    //console.log('studio.reducer', action.type);
    switch (action.type) {
      case GET_STUDIO_FILE_LIST:
          return {...state, items: action.payload};
        case STUDIO_FILE_UPLOAD_COMPLETE:
            return {...state, uploadResult: action.payload, uploadedFilePercent:100, isUploading:false};
        case STUDIO_FILE_UPLOAD_PROCESS:
            return {...state, uploadedFilePercent: action.payload, isUploading:true};
      default:
            return {...state, uploadedFilePercent: 0};
    }
};

function awsUploadFileToStudio(path, file, onProgressCallback, onCompleteCallback) {
    awsUploadFile(config.s3.STUDIO_BUCKET, path, file, onProgressCallback, onCompleteCallback);
}

