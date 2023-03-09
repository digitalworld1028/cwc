import createAction, {
    callGet2WithToken,
    callPost,
    extra_param,
} from "./utils"

const GET_PENDING_ITEMS = "GET_PENDING_ITEMS";
const GET_PAST_ITEMS = "GET_PAST_ITEMS";
const UPDATE_CASE_SUCCESS = "UPDATE_CASE_SUCCESS";
const POPULATE_USERS_LIST = "POPULATE_USERS_LIST";
const LIST_BILLING = 'LIST_BILLING';
const LIST_HOSTS = 'LIST_HOSTS';
const LIST_DAEMONS = 'LIST_DAEMONS';

export const actionCreators = {
    listHosts: () => (dispatch, state) => {
        let body = {'operation': 'list_hosts'};
    },
    listDaemons: () => (dispatch, state) => {
        let body = {'operation': 'list_daemon_info'};
    },
    switchOnOffHosts: (selectedHostState) => (dispatch, state) => {
        let body = {'operation': 'change_state', 'states': selectedHostState};
    },
    listPendingItems: () => (dispatch, state) => {
        let body = {'operation': 'list_pending_meshes_and_cases'};
    },
    listPastItems: () => (dispatch, state) => {
        let body = {'operation': 'list_past_cases'};
    },
    updateDaemonInfo: (instruction) => (dispatch, state) => {
        let body = instruction;
    },
    updateCase: (case_id, worker, user_id) => (dispatch, state) => {
        let body = {
            'operation': 'lock_update_case', 'case_id': case_id,
            'worker': worker, 'user_id': user_id
        };
    },
    updateMesh: (mesh_id, worker, user_id) => (dispatch, state) => {
        let body = {
            'operation': 'lock_update_mesh', 'mesh_id': mesh_id,
            'worker': worker, 'user_id': user_id
        };
    },

    fetchUsers: () => (dispatch, state) => {
        return callGet2WithToken("admin/users")
            .then(resp => {
                let res = resp.data.data.filter(v => v.appType != 'TIDY3D').sort((v1, v2) => v1.email.localeCompare(v2.email));
                let options = res.map(function (x) {
                    return {
                        value: x.userId,
                        label: x.userId + '(' + x.email + '/' + x.loginTimes + '/' + x.inviteCode + ')'
                    };
                });
                dispatch(createAction(POPULATE_USERS_LIST, options));
            })
            .catch(err => {
                console.log("admin.err", err);
                alert('Fail to get users');
            })
    },
    listCasesForBilling: (user_id, startBillingDate, endBillingDate) => (dispatch, state) => {

        let billingGetURL = `admin/billing/user/${user_id}/from/${startBillingDate.getYear() + 1900}-${startBillingDate.getMonth() + 1}/to/${endBillingDate.getYear() + 1900}-${endBillingDate.getMonth() + 1}`;
        return callGet2WithToken(billingGetURL)
            .then(resp => {
                //console.log("billing", resp.data);
                let caseListResult = resp.data.data;
                dispatch(createAction(LIST_BILLING, caseListResult));

            })
            .catch(err => {
                //console.log("listCases.err", err.response);
            });
    },
};

export function reducer(state = {}, action) {
    //console.log("reducer_func", action.type, action.payload);
    switch (action.type) {
        case GET_PENDING_ITEMS:
            return {...state, pendingItems: action.payload};
        case UPDATE_CASE_SUCCESS:
            return {...state, updateItemSuccess: action.payload};
        case POPULATE_USERS_LIST:
            return {...state, userList: action.payload};
        case LIST_BILLING:
            return {...state, caseListResult: action.payload};
        case LIST_HOSTS:
            return {...state, hostList: action.payload};
        case GET_PAST_ITEMS:
            return {...state, pastCaseList: action.payload};
        case LIST_DAEMONS:
            return {...state, daemonList: action.payload};
        default:
            return state;
    }
};
