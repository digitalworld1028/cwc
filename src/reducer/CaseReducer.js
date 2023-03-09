import createAction, {
    callGet2WithToken, callDelWithToken, callPost2WithToken, callPut2WithToken
} from "./utils"

const GET_CASE = "GET_CASE";
const DEL_CASE = "DEL_CASE";
const GET_CASE_ERROR = "GET_CASE_ERROR";
const GET_CASE_LIST = "GET_CASE_LIST";
const REFRESH_CASE_LIST = "REFRESH_CASE_LIST";
const GET_BILL_LIST = "GET_BILL_LIST";
const GET_CASE_RESIDUAL = "GET_CASE_RESIDUAL";
const GET_CASE_TOTAL_FORCES = "GET_CASE_TOTAL_FORCES";
const SET_INTERVAL = "SET_CASE_INTERVAL";
const GET_ORGANIZE = "GET_ORGANIZE";
const GET_ORGANIZE_CASES_WATINGFORAPPROVAL = "GET_ORGANIZE_CASES_WATINGFORAPPROVAL";
export const actionCreators = {
    listCasesForBilling: (startDate, endDate) => (dispatch, state) => {
        let billingGetURL = `billing/from/${startDate.getYear() + 1900}-${startDate.getMonth() + 1}/to/${endDate.getYear() + 1900}-${endDate.getMonth() + 1}`;
        return callGet2WithToken(billingGetURL)
            .then(resp => {
                //console.log("billing", resp.data);
                let caseListResult = resp.data.data;
                dispatch(createAction(GET_BILL_LIST, caseListResult));

            })
            .catch(err => {
                //console.log("listCases.err", err.response);
            })
    },
    getCase: (id) => (dispatch, state) => {
        return callGet2WithToken(`case/${id}/runtimeParams`)
            .then(resp => {
                let caseItem = state().meshCase.caseList.filter(item => item.caseId === id)[0];
                caseItem.runtimeParams = JSON.parse(resp.data.data.content);
                dispatch(createAction(GET_CASE, caseItem));
                //console.log("getCase", resp);
            })
            .catch(err => {
                dispatch(createAction(GET_CASE, null));
                dispatch(createAction(GET_CASE_ERROR, "Failed to get case detail"));
                //console.log("getCase.err", err);
            })
    },
    batchDeleteCases: (cases) => (dispatch, state) => {
        let removedIds = [];
        Promise.all(cases.map(item =>
          callDelWithToken(`case/${item.caseId}`)
            .then(resp => {
                removedIds.push(item.caseId);
            })
            .catch(err => {
                //console.log("deleteCase.err", err);
            })
        )).then(function (results) {
            //console.log(removedIds);
            dispatch(createAction(GET_CASE_LIST, state().meshCase.caseList.filter(item => !removedIds.includes(item.caseId))));
        });
    },
    delCase: (id) => (dispatch, state) => {
        let origCaseList = state().meshCase.caseList;
        dispatch(createAction(GET_CASE_LIST, state().meshCase.caseList.filter((item) => item.caseId !== id)));
        return callDelWithToken(`case/${id}`)
            .then(resp => {
            })
            .catch(err => {
                alert('failed to remove case:' + id);
                dispatch(createAction(GET_CASE_LIST, origCaseList));
                //console.log("getCase.err", err);
            });
    },
    rerunCase: (id) => (dispatch, state) => {
        let origCaseList = state().meshCase.caseList;
        let matchedCasesById = origCaseList.filter((item) => item.caseId == id);
        if(matchedCasesById.length != 0) {
            let caseItem = matchedCasesById[0];
            caseItem.caseStatus = 'queued';
            delete caseItem.nodeInfoRemoved;
            return callPut2WithToken(`case/${id}`, caseItem)
              .then(resp => {
              })
              .catch(err => {
                  alert('failed to remove case:' + id);
                  let caseList = origCaseList.map(item => item.caseId == id ? {...item, caseStatus:caseItem.caseStatus} : item);
                  dispatch(createAction(GET_CASE_LIST, caseList));
                  //console.log("getCase.err", err);
              });
        }

    },
    clearDetail:() => (dispatch, state) => {
        dispatch(createAction(GET_CASE, null));
    },
    listCases: (meshId) => (dispatch, state) => {
        let caseListUrl = 'cases';
        if(meshId && meshId !=='all') {
            caseListUrl = `mesh/${meshId}/cases/`;

        }
        return callGet2WithToken(caseListUrl)
            .then(resp => {
                let caseList = resp.data.data;
                dispatch(createAction(GET_CASE_LIST, caseList));
                //console.log("listCases", resp);
            })
            .catch(err => {
                //console.log("listCases.err", err.response);
            })
    },
    getCaseResidual: (id) => (dispatch, state) => {
        const {caseList} = state().meshCase;
        let caseItem = caseList.filter(v => v.caseId == id)[0];
        if(!caseItem) {
            return;
        }
        if(caseItem.caseStatus == 'queued' || caseItem.caseStatus == 'preprocess') {
            dispatch(createAction(GET_CASE_RESIDUAL, null));
        }
        else {
            return callGet2WithToken(`case/${id}/residual`)
                .then(resp => {
                    dispatch(createAction(GET_CASE_RESIDUAL, resp.data.data));
                })
                .catch(err => {
                    dispatch(createAction(GET_CASE_RESIDUAL, {steps:[]}));
                    //console.log("getCaseResidual.error", err.response);
                })
        }
    },
    getCaseTotalForces: (id) => (dispatch, state) => {
        const {caseList} = state().meshCase;
        let caseItem = caseList.filter(v => v.caseId == id)[0];
        if(!caseItem) {
            return;
        }
        if(caseItem.caseStatus == 'queued' || caseItem.caseStatus == 'preprocess') {
            dispatch(createAction(GET_CASE_TOTAL_FORCES, null));
        }
        else {
            return callGet2WithToken(`case/${id}/totalForces`)
                .then(resp => {
                    dispatch(createAction(GET_CASE_TOTAL_FORCES, resp.data.data));
                })
                .catch(err => {
                    dispatch(createAction(GET_CASE_TOTAL_FORCES, {steps:[]}));
                    //console.log("getCaseTotalForces.error", err.response);
                })
        }
    },

    forkCase: (parentCaseId, caseBody) => (dispatch, state) => {
        //console.log(caseBody);
        return callPost2WithToken(`case/${parentCaseId}/fork`, caseBody)
            .then(resp => {
                let caseList = [resp.data.data, ...state().meshCase.caseList];
                dispatch(createAction(GET_CASE_LIST, caseList));
            })
            .catch(err => {
                alert(err);
            });
    },
    setInterval: (interval) => (dispatch, state) => {
        dispatch(createAction(SET_INTERVAL, interval));
    },
    getOrganize: (orgId) => (dispatch, state) => {
        return callGet2WithToken('org')
            .then(resp => {
                //console.log("organize", resp);
                let orgDetail = resp.data.data;
                dispatch(createAction(GET_ORGANIZE, orgDetail));

            })
            .catch(err => {
                //console.log("organize.err", err.response);
            })
    },

    approveCaseToRun: (orgId) => (dispatch, state) => {

    },
    getOrganizeCasesWithWaitingForApproval: (orgId) => (dispatch, state) => {

    },
    updateOrganize: (organizeDetail, fieldName) => (dispatch, state) => {
    }

};

export function reducer(state = {}, action) {
    //console.log('case.reducer', action);
    switch (action.type) {
        case GET_CASE:
            return {...state, detail: action.payload};
        case DEL_CASE:
            return state;
        case GET_CASE_LIST:
            return {...state, caseList: action.payload};
        case GET_BILL_LIST:
          return {...state, caseListResult: action.payload};
        case GET_CASE_RESIDUAL:
            return {...state, caseResidual: action.payload};
        case GET_CASE_TOTAL_FORCES:
            return {...state, caseTotalForces: action.payload};
        case SET_INTERVAL:
            return {...state, refreshInterval: action.payload};
        case GET_ORGANIZE:
            return {...state, organizeDetail: action.payload};
        case GET_ORGANIZE_CASES_WATINGFORAPPROVAL:
            return  {...state, casesOfWaitingForApproval: action.payload};
        default:
            return state;
    }
};
