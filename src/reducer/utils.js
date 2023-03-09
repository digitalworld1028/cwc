import aws4 from "aws4";
import axios from "axios"
import history from "../history"
import {sha512} from "js-sha512"
import {CognitoUserPool, CognitoUserAttribute, CognitoUser} from 'amazon-cognito-identity-js';
import {config} from "../util/EnvConfig";

let authRetry = 0;
axios.defaults.timeout = 7000
axios.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    //console.log(response);
    //console.log('success');
    authRetry = 0;
    return response;
}, function (error) {
  //console.log(error.response.status);
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    const originalRequest = error.config;
    console.log(error)
    if (history.location.pathname === "/app/login") {
      //console.log(0);
        //do nothing.
    }
    else if(error && error.response && 401 === error.response.status && authRetry < 10) {
        //refresh to get token again.
      //console.log(authRetry);
        authRetry ++;
        const user = getS3User();
        return axios.post(`${webapiEndpoint}/auth/refresh`,
            {
                "refreshToken": user.refreshToken,
                "userName": user.email
            },
            {
                headers: {
                    "FLOW360USER": user.identityId,
                    "FLOW360ACCESSUSER": user.identityId
                }
            }
            )
            .then(res => {
                if (res.status === 200) {
                    // 1) put token to LocalStorage
                    user.accessToken = res.data.data.accessToken;
                    saveS3User(user);
                    originalRequest.headers['AUTHORIZATION'] = 'Bearer ' + user.accessToken;
                    // 2) return originalRequest object with Axios.
                    return axios(originalRequest);
                }
            });
    }
    else if(error && error.response && 401 === error.response.status && authRetry >= 10) {
        clearS3User();
        //console.log("go to login");
        history.push("/app/login");
    }
    return Promise.reject(error);
});

const apiVer = 'prod';
const poolData = {
    UserPoolId : config.cognito.USER_POOL_ID,
    ClientId : config.cognito.APP_CLIENT_ID
};

const apiServerRegion = config.webapiV1.REGION;
const awsGatewayServer = config.webapiV1.SERVER;
const webapiEndpoint= config.webapiV2.URL;
const userPool = new CognitoUserPool(poolData);
export const AUTH_HEADER = "TokenKey";
export const WEB_VERSION = "flow360_version"

export const getS3UserId = () => {
    return getS3User().userId;
}
export const saveS3User = (user) => {
    localStorage.setItem(AUTH_HEADER, JSON.stringify(user));
}
export const getS3User = () => {
    let awsAccess = localStorage.getItem(AUTH_HEADER);
    if(awsAccess) {
        return JSON.parse(awsAccess);
    }
    else return {};
}
export const clearS3User = () => {
    localStorage.removeItem(AUTH_HEADER);
}
export const getOrgId = () => {
    return getS3User().organization;
}

export function xzdfg(varr) {
  let salt = 'xaareawdfgagpaw';
  let res = sha512(varr + salt);
  let allowed = [
    '92f3bf45390c5bfc4fa03f9378486bec6395918e35f412faf5a78da96fddc1c198cd211d9fa1c5ae0b658dabc67788bf3e8d8835f3e7495e8162550de0dcf056',
    '498e2c4988a239aba05e9fdee2a307568facaf66cfcea06fe0f3631fb6a6ef066f6d2901473fe86591938689031e9bd933a259023ab0cec6f21821ec5bfaae28',
    '620c5756739d618c3b98e6d933ff9cb423de9f53c99002f2a5208b87e6a388d7509d75119e15561afdb551ddb469ad51b4ebda4cd84ed122ef130ec2448a9e77',
    'fdecac90672d1743d5d3616f774cf0562d2e277007e8a96e8a9be89aacd5fed6a50bf3ad6f1ba5fa2fb0af20b020a54421f87139081406d0d0a62972bf519ce7',
    'c19b36cc882f011f7c065215ebed135cf2df9956068c12bb5a80b2bbd091381eb6db4c086d548f8aede74c5458c8787956029bd567f645a9832444337119c8f1'
  ];
  return allowed.includes(res);
}

export function parseTimeFormat(timeStr) {
    if (timeStr) {
        let timeParts = timeStr.split(/[:\.]/g).map(x => parseFloat(x));
        for (let index = timeParts.size; index < 7; index++) {
            timeParts.push(0);
        }
        return new Date(timeParts[0], timeParts[1] - 1, timeParts[2], timeParts[3], timeParts[4], timeParts[5], 0);
    } else {
        return null;
    }
}

export function reset_password(email, onFail, onPass) {
    let userData = {
      Username : toUsername(email),
      Pool : userPool
    };
    let cognitoUser = new CognitoUser(userData);
    cognitoUser.forgotPassword({
      onSuccess: (result) => onPass(result),
      onFailure: (err) => onFail(err),
    });
}

export function reset_pwd_with_code(email, pwd, verify_code, onSuccess, onFail) {
    let userData = {
        Username: toUsername(email),
        Pool: userPool
    };

    let cognitoUser = new CognitoUser(userData);
    cognitoUser.confirmPassword(verify_code, hashPassword(pwd),
        {
            onFailure: (err) => onFail(err),
            onSuccess: () => onSuccess(),
        });
}

export function signup(email, pwd, code, personName, company, callback) {
   email = email.toLowerCase().trim();
   let attributeList = [];
   let dataEmail = {
       Name : 'email',
       Value : email
   };
   let dataName = {
       Name : 'name',
       Value : personName
   };
   let dataCompany = {
       Name : 'website',
       Value : company
   };
   let dataCode = {
       Name : 'profile',
       Value : code
   };

   attributeList.push(new CognitoUserAttribute(dataEmail));
   attributeList.push(new CognitoUserAttribute(dataName));
   attributeList.push(new CognitoUserAttribute(dataCompany));
   attributeList.push(new CognitoUserAttribute(dataCode));

   userPool.signUp(toUsername(email), hashPassword(pwd), attributeList, null, function(err, result){
       callback(err);
   });
}

export function verify_email(email, verify_code, callback) {
  createCognitoUser(email)
      .confirmRegistration(verify_code, true, function confirmCallback(err, result) {
            callback(err);
          }
      );
}

export default function createAction(type, data) {
    return {type: type, payload: data};
}

export function callGetWithBasicAuth2(method, username, password) {

    return axios.get(`${webapiEndpoint}/${method}`, {
        method: "get", auth: {
            username: username,
            password: password
        }
    })
}

export function callPost2WithToken(method, body) {
    let user = getS3User();
    return axios.post(`${webapiEndpoint}/${method}`, body,
        {
            headers:{
                "AUTHORIZATION": "Bearer " + user.accessToken,
                "FLOW360USER": user.identityId,
                "FLOW360ACCESSUSER":user.guestUserIdentity
            }
        }
    )
}
export function callPut2WithToken(method, body) {
    let user = getS3User();
    return axios.put(`${webapiEndpoint}/${method}`, body,
        {
            headers:{
                "AUTHORIZATION": "Bearer " + user.accessToken,
                "FLOW360USER": user.identityId,
                "FLOW360ACCESSUSER":user.guestUserIdentity
            }
        }
    )
}

export function callGet2WithToken(method, query) {
    let user = getS3User();
    return axios.get(`${webapiEndpoint}/${method}`, {
        method: "get",
        headers:{
            "AUTHORIZATION": "Bearer " + user.accessToken,
            "FLOW360USER": user.identityId,
            "FLOW360ACCESSUSER":user.guestUserIdentity
        }
    })
}
export function callDelWithToken(method, query) {
    let user = getS3User();
    return axios.delete(`${webapiEndpoint}/${method}`, {
        method:"delete",
        headers:{
            "AUTHORIZATION": "Bearer " + user.accessToken,
            "FLOW360USER": user.identityId,
            "FLOW360ACCESSUSER":user.guestUserIdentity
        },
        data:{

        }

    })
}


function callPutOrPost(method, type, body, queryParams) {
    let request = {
        region: apiServerRegion,
        host: awsGatewayServer,
        method: type,
        url: `https://${awsGatewayServer}/${apiVer}/${method}?${queryParams}`,
        path: `/${apiVer}/${method}?${queryParams}`,
        data: body,
        body: JSON.stringify(body), // aws4 looks for body; axios for data,
        headers: {
            'content-type': 'application/json'
        }
    };


    let signedRequest = getAws4SignedRequest(request);
    //console.log("signedRequest", signedRequest);
    delete signedRequest.headers['Host'];
    delete signedRequest.headers['Content-Length'];

    return axios(signedRequest);
}

export function callPost(method, queryParams, body) {
    return callPutOrPost(method, "POST", body, queryParams);
}

export function extra_param() {
  if (localStorage.getItem('test')) {
    return '&test=' + localStorage.getItem('test');
  }
  return '';
}


export function is_json_string(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

export function is_str_empty_or_blank(str) {
    return (!str || /^\s*$/.test(str)) || (!str || 0 === str.length);
}

// return 1, 2, 3, 4 (strong)
export function test_password_strength(pwd) {
  let strongRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");
  let mediumRegex = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{8,})");
  if (strongRegex.test(pwd)) {
    return 4;
  }
  if (mediumRegex.test(pwd)) {
    if (pwd.length >= 6) {
      return 3;
    } else {
      return 2;
    }
  }
  return 1;

}


function getAws4SignedRequest(request) {
    let awsAccess = localStorage.getItem(AUTH_HEADER);
    if (!awsAccess) return request;
    return aws4.sign(request,
        JSON.parse(awsAccess));
}

export function toUsername(email) {
    return email.toLowerCase().replace('@', '-at-');
}

function hashPassword(password) {
    let salt = '5ac0e45f46654d70bda109477f10c299';
    return sha512(password + salt);
}

function createCognitoUser(email) {
    return new CognitoUser({
        Username: toUsername(email),
        Pool: userPool
    });
}
