import {createStore, applyMiddleware, combineReducers} from "redux";
import thunk from "redux-thunk";
import {createLogger} from 'redux-logger';
import { composeWithDevTools } from 'redux-devtools-extension';

import {reducer as authReducer} from "./reducer/AuthReducer";
import {reducer as meshReducer} from "./reducer/MeshReducer";
import {reducer as studioReducer} from "./reducer/MeshStudioReducer";
import {reducer as caseReducer} from "./reducer/CaseReducer";
import {reducer as controlReducer} from "./reducer/ControlReducer";

export default createStore(
    combineReducers({auth: authReducer, mesh: meshReducer, meshCase: caseReducer, control: controlReducer, studio: studioReducer})
    ,process.env.REACT_APP_RUNTIME_ENV != 'PROD'
        ? composeWithDevTools(applyMiddleware(thunk, createLogger()))
        :composeWithDevTools(applyMiddleware(thunk))
);
