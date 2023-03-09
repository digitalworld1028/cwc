import {sha512} from "js-sha512"
import history from "../history"
import {
    AUTH_HEADER,
    WEB_VERSION,
    signup,
    verify_email,
    test_password_strength,
    xzdfg,
    reset_password,
    reset_pwd_with_code,
    is_str_empty_or_blank,
    callGetWithBasicAuth2,
    callPost2WithToken,
    toUsername,
    callDelWithToken,
    callGet2WithToken,
    getS3User
} from "./utils";
import {CUR_VERSION} from "../container/PrivateRoute"
import createAction from "./utils";

const loginType = 'LOGIN';
const clearError = 'CLEAR_ERR';
const logoutType = 'LOGOUT';
const loginError = 'LOGIN_ERR';
const signupError = 'SIGNUP_ERR';
const verifyError = 'VERIFY_ERR';
const resetNotice = 'resetNotice';
const salt = "5ac0e45f46654d70bda109477f10c299";
const loginValidDays = 7;
export const LOGIN_CONTROL_KEY = "login_info";
const GET_CASE_LIST = "GET_CASE_LIST";
const GET_MESH_LIST = "GET_MESH_LIST";
const REFRESH_CASE_LIST = "GET_CASE_LIST";
const REFRESH_MESH_LIST = "GET_MESH_LIST";
const initialState = {accessToken: null};

export const actionCreators = {
    signup: (username, password, passwordSecond, zxc, personName, company) =>(dispatch, state) => {
        zxc = zxc.toUpperCase().trim();
        if (is_str_empty_or_blank(zxc) || !xzdfg(zxc)) {
          return dispatch(createAction(signupError, {
              success: false,
              err_msg: 'W'+'rong '+'In'+'vite'+' Co'+'de',
          }));
        }
        if (is_str_empty_or_blank(username)) {
          return dispatch(createAction(signupError, {
              success: false,
              err_msg: 'Please fill in email.',
          }));
        }

        if (test_password_strength(password) < 4) {
          return dispatch(createAction(signupError, {
              success: false,
              err_msg: 'Please choose stronger password to protect your account',
          }));
        }
        if (password === passwordSecond) {
          signup(username, password, zxc, personName, company, (err_obj) => {
              if (err_obj) {
                return dispatch(createAction(signupError, {
                  success: false,
                    err_msg: err_obj.message,
                }));
              } else {
                window.location.href = '/app/signup-success';
              }
          });
        } else {
          return dispatch(createAction(signupError, {
              success: false,
              err_msg: 'Please confirm your passwords match',
          }));
        }
    },
    verifyEmail:  (username, verify_code) =>(dispatch, state) => {
        if (username && verify_code) {
          verify_email(username, verify_code, (err_obj) => {
              if (err_obj) {
                return dispatch(createAction(verifyError, {
                    success: false,
                    err_msg: err_obj.message,
                }));
              } else {
                return dispatch(createAction(verifyError, {
                    success: true,
                    err_msg: 'Your email is verified, please click log in below to sign in.',
                }));
              }
          });
        } else {
          return dispatch(createAction(verifyError, {
              success: false,
              err_msg: 'Missing email and verification code.',
          }));
        }
    },
    requestReset:  (username) =>(dispatch, state) => {
        dispatch(createAction(resetNotice, null));
        if (username) {
          reset_password(username,
            (err_obj) => {
                return dispatch(createAction(resetNotice, {
                    success: false,
                    notice: err_obj.message,
                }));
            },
            (result) => {
                return dispatch(createAction(resetNotice, {
                    success: true,
                    notice: 'Please check your email to get verification code and reset your password.',
                }));
            });
        } else {
          return dispatch(createAction(resetNotice, {
              notice: 'Please type in your email',
          }));
        }
    },
    resetPwd: (username, verify_code, pwdOne, pwdTwo) =>(dispatch, state) => {
        dispatch(createAction(resetNotice, null));
        if (is_str_empty_or_blank(username) || is_str_empty_or_blank(verify_code)) {
          return dispatch(createAction(resetNotice, {
              success: false,
              notice: 'Please fill in email and verification code in order to reset password!',
          }));
        }
        if (test_password_strength(pwdOne) < 4) {
          return dispatch(createAction(resetNotice, {
              success: false,
              notice: 'Please choose stronger password to protect your account',
          }));
        }
        if (pwdOne === pwdTwo) {
          reset_pwd_with_code(username, pwdOne, verify_code,
            () => {
                return dispatch(createAction(resetNotice, {
                    success: true,
                    notice: 'Password is reset successfully! Click Log In to sign in.'
                }));
            },
            (err_obj) => {
                return dispatch(createAction(resetNotice, {
                    success: false,
                    notice: err_obj.message,
                }));
            });
        } else {
          return dispatch(createAction(resetNotice, {
              success: false,
              notice: 'Please confirm your passwords match',
          }));
        }
    },
    clearError: () => (dispatch, state) => {
        return dispatch(createAction(clearError, {}));
    },
    login: (username, password) =>(dispatch, state) => {
        const encrypedPwd = sha512(password + salt);
        return callGetWithBasicAuth2("auth", username, encrypedPwd)
            .then(resp => {
                return dispatch(createAction(loginType, {
                    secretAccessKey: resp.data.data.user.userSecretAccessKey,
                    accessKeyId: resp.data.data.user.userAccessKey,
                    admin: resp.data.data.user.role == 'admin',
                    guestUserIdentity:resp.data.data.user.identityId,
                    ...resp.data.data.user,
                    ...resp.data.data.auth
                }));
            })
            .catch(err => {
                return dispatch(createAction(loginError, {
                    err_msg: err.response && err.response.hasOwnProperty("data") ? err.response.data.error : "unknown error!"
                }));
            });

    },
    logout: () => ({type: logoutType})
};

export function reducer(state = initialState, action) {
    state = state || initialState;
    if (action.type === loginType) {
        localStorage.setItem(AUTH_HEADER, JSON.stringify(action.payload));
        let cur_date = new Date();
        cur_date.setDate(cur_date.getDate() + loginValidDays);
        let control_info = {login_time: new Date().getTime(), expire_time: cur_date.getTime()};
        localStorage.setItem(LOGIN_CONTROL_KEY, JSON.stringify(control_info));
        localStorage.setItem(WEB_VERSION, CUR_VERSION);
    } else if (action.type === loginError) {
      return {...state, loginError: action.payload};
    } else if (action.type === signupError) {
      return {...state, signupError: action.payload};
    } else if (action.type === verifyError) {
      return {...state, verifyError: action.payload, signupError: null};
    } else if (action.type === clearError) {
      return {...state, loginError: null, signupError: null, verifyError: null, resetNotice: null};
    } else if (action.type == resetNotice) {
      return {...state, loginError: null, signupError: null, verifyError: null, resetNotice: action.payload};
    }

    return state;
};
