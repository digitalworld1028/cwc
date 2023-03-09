import createAction, {
    parseTimeFormat,
    getS3UserId,
    is_json_string,
    AUTH_HEADER, callGet2WithToken, callDelWithToken, callPost2WithToken, callPut2WithToken
} from "./utils"
import {config} from "../util/EnvConfig";
import {awsUploadFile} from "../util/AwsUtils";
import {getMeshName} from "../util/FileUtils";

const GET_MESH = "GET_MESH";
const GET_VERSIONS = "GET_VERSIONS";
const DEL_MESH = "DEL_MESH";
const GET_MESH_ERROR = "GET_MESH_ERROR";
const GET_MESH_LIST = "GET_MESH_LIST";
const REFRESH_MESH_LIST = "REFRESH_MESH_LIST";
const GET_MESH_VISUALIZATION = "GET_CASE_VISUALIZATION";
const MESH_FILE_UPLOAD_PROCESS = "MESH_FILE_UPLOAD_PROCESS";
const MESH_FILE_UPLOAD_COMPLETE = "MESH_FILE_UPLOAD_COMPLETE";
const SET_INTERVAL = "SET_MESH_INTERVAL";

export const actionCreators = {
    getMesh: (id) => (dispatch, state) => {
        return callGet2WithToken(`mesh/${id}/processInfo`)
            .then(resp => {
                dispatch(createAction(GET_MESH, resp.data.data.gridProperties));
                //console.log("getMesh", resp);
            })
            .catch(err => {
                dispatch(createAction(GET_MESH_ERROR, "Failed to get mesh detail"));
                //console.log("getMesh.err", err);
            })
    },
    batchDeleteMeshs: (meshes) => (dispatch, state) => {
      let removedIds = [];
      Promise.all(meshes.map(item =>
        callDelWithToken(`mesh/${item.meshId}`)
          .then(resp => {
            removedIds.push(item.meshId);
          })
          .catch(err => {
            //console.log("deleteMesh.err", err);
          })
      )).then(function (results) {
        //console.log(removedIds);
        dispatch(createAction(GET_MESH_LIST, state().mesh.meshList.filter(item => !removedIds.includes(item.meshId))));
      });
    },
    delMesh: (id) => (dispatch, state) => {
        return callDelWithToken(`mesh/${id}`)
            .then(resp => {
                dispatch(createAction(GET_MESH_LIST, state().mesh.meshList.filter(item => item.meshId !== id)));
            })
            .catch(err => {
                return //console.log("deleteMesh.err", err);
            });
    },
    clearDetail:() => (dispatch, state) => {
        dispatch(createAction(GET_MESH, null));
    },
    listVersions: () => (dispatch, state) => {
        return callGet2WithToken("solver/versions")
            .then(resp => {
                let options = resp.data.data.map(function(x) {
                    return {value: x.version, label: x.version};
                });
                dispatch(createAction(GET_VERSIONS, options));
            });
    },
    listMeshs: () => (dispatch, state) => {
        return callGet2WithToken("meshes")
            .then(resp => {
                let meshList = resp.data.data.filter(item => item.meshStatus !== "deleted");
                meshList.sort((v1, v2) => {
                    return parseTimeFormat(v2.meshAddTime) - parseTimeFormat(v1.meshAddTime);
                });
                dispatch(createAction(GET_MESH_LIST, meshList));
            })
            .catch(err => {
                //console.log("getMesh.err", err.response);
            });
    },
    getVisualization: (id) => (dispatch, state) => {
        return callGet2WithToken(`mesh/${id}/visualize`)
            .then(resp => {
                dispatch(createAction(GET_MESH_VISUALIZATION, resp.data.data));
            })
            .catch(err => {
                //console.log("getVisualization.err", err.response);
            });
    },

    submitCase: (meshId, body, file, callback) => (dispatch, state) => {
        let fileReader;
        fileReader = new FileReader();
        fileReader.onloadend = function() {
           let json = fileReader.result;
           if (!is_json_string(json)) {
             alert('Input json config is not valid');
             return;
           }
           body["runtimeParams"] = json;
           return callPost2WithToken(`mesh/${meshId}/case`, body)
               .then(resp => {
                   callback();
               })
               .catch(err => {
                   alert(err);
               });
        };

        fileReader.readAsText(file);
    },
    submitMesh: (body, file) => (dispatch, state) => {
        return callPost2WithToken("mesh", body)
            .then(resp => {
                let prev_perc = 0;
                actionCreators.listMeshs()(dispatch, state);
                let mesh = resp.data.data;
                let s3Path = `users/${getS3UserId()}/${mesh.meshId}/${getMeshName(body.meshFormat, body.meshEndianness, body.meshCompression, body.meshName)}`;

                awsUploadFileToMesh(
                  s3Path,
                  file,
                  (uploadedSize, totalSize) => {
                    if (prev_perc < parseInt(uploadedSize / totalSize * 100)) {
                      prev_perc = parseInt(uploadedSize / totalSize * 100);
                      dispatch(createAction(MESH_FILE_UPLOAD_PROCESS, prev_perc));
                    }
                  },
                  (success)=> {
                      mesh.meshStatus = 'uploaded';
                      callPut2WithToken(`mesh/${mesh.meshId}`, mesh)
                          .then(r => {
                              dispatch(createAction(MESH_FILE_UPLOAD_COMPLETE, {meshId: mesh.meshId, res: success}));
                              let meshList = state().mesh.meshList.map(item => item.meshId == mesh.meshId ? {...item, meshStatus:mesh.meshStatus} : item);
                              dispatch(createAction(GET_MESH_LIST, meshList));
                          });
                  }
                );
            })
            .catch(err => {
                //console.log("submitMesh.err", err);
                // alert('Fail to upload the mesh file.');
            })
    },
    setInterval: (interval) => (dispatch, state) => {
        dispatch(createAction(SET_INTERVAL, interval));
    },
    rerunMesh: (meshId) => (dispatch, state) => {
        let meshList = state().mesh.meshList.filter(item => item.meshId == meshId);
        if(meshList.length > 0) {
            let mesh = meshList[0];
            mesh.meshStatus = 'uploaded';
            callPut2WithToken(`mesh/${mesh.meshId}`, mesh)
                .then(r => {
                    let meshList = state().mesh.meshList.map(item => item.meshId == mesh.meshId ? {...item, meshStatus:mesh.meshStatus} : item);
                    dispatch(createAction(GET_MESH_LIST, meshList));
                });

        }

    }

};

export function reducer(state = {}, action) {
    //console.log('mesh.reducer', action.type);
    switch (action.type) {
        case GET_MESH:
            return {...state, detail: action.payload};
        case DEL_MESH:
            return state;
        case GET_MESH_LIST:
            return {...state, meshList: action.payload};
        case GET_VERSIONS:
            return {...state, versions: action.payload};
        case GET_MESH_VISUALIZATION:
            return {...state, meshPics: action.payload};
        case MESH_FILE_UPLOAD_COMPLETE:
            return {...state, uploadResult: action.payload, uploadedFilePercent:100};
        case MESH_FILE_UPLOAD_PROCESS:
            return {...state, uploadedFilePercent: action.payload};
            case SET_INTERVAL:
            return {...state, refreshInterval: action.payload};

        default:
            return state;
    }
};

function awsUploadFileToMesh(path, file, onProgressCallback, onCompleteCallback) {
  awsUploadFile(config.s3.MESH_BUCKET, path, file, onProgressCallback, onCompleteCallback);
}

