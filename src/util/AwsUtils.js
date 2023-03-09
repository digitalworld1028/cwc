// this function converts the generic JS ISO8601 date format to the specific format the AWS API wants
import {LOGIN_CONTROL_KEY} from "../reducer/AuthReducer";
import {AUTH_HEADER, getS3User, WEB_VERSION} from "../reducer/utils";
import {CUR_VERSION} from "../container/PrivateRoute";
import AWS from "aws-sdk";
import {config} from "./EnvConfig";
import axios from "axios";

export function getAmzDate(dateStr) {
    let chars = [":","-"];
    for (let i=0;i<chars.length;i++) {
        while (dateStr.indexOf(chars[i]) != -1) {
            dateStr = dateStr.replace(chars[i],"");
        }
    }
    dateStr = dateStr.split(".")[0] + "Z";
    return dateStr;
}

export function need_relogin() {
    let cur_time = new Date().getTime();
    if(window.location.href.indexOf(".html") && window.location.href.indexOf("index.html") < 0) {
        return false;
    }
    if (!localStorage.getItem(LOGIN_CONTROL_KEY)) {
        return true;
    }
    let login_info = JSON.parse(localStorage.getItem(LOGIN_CONTROL_KEY));

    if (login_info.expire_time < cur_time) {
        return true;
    }
    if (!localStorage.getItem(WEB_VERSION) || localStorage.getItem(WEB_VERSION) < CUR_VERSION) {
        return true;
    }
    return false;
}

export function isLoginPage() {
    let isLogin = true;
    //console.log("isLoginPage:" + window.location);
    if(window.location.hasOwnProperty('search')) {
        let searchParams = window.location.search;
        //console.log("searchParams:" + searchParams);
        if(searchParams.indexOf("signup") >= 0 && window.location.href.indexOf("index.html")>=0) {
            isLogin = false;
        }
    }
    //console.log("islogin:" + isLogin);
    return isLogin;
}

export function getAppActionType() {
    let isLogin = 1;
    //console.log("current windows location:" + window.location);

    //console.log("islogin:" + isLogin);
    return isLogin;
}
export function awsBuildMeshSignedUrl(meshId, filepath, onCallback) {
    let user = getS3User();
    const webapiEndpoint= config.webapiV2.URL;

    return fetch(`${webapiEndpoint}/mesh/${meshId}/signedUrl?filepath=${filepath}`, {
        method: "get",
        headers:{
            "AUTHORIZATION": "Bearer " + user.accessToken,
            "FLOW360USER": user.identityId,
            "FLOW360ACCESSUSER":user.guestUserIdentity
        }
    }).then(response => response.json())
        .then(data => {
            if(data) {
                onCallback(data.data)
            }
            else {
                onCallback()
            }

        })
        .catch(()=> {
            onCallback();
        });
}

export function awsBuildSignedUrl(caseId, filepath, onCallback) {
    let user = getS3User();
    const webapiEndpoint= config.webapiV2.URL;

    return fetch(`${webapiEndpoint}/case/${caseId}/signedUrl?filepath=${filepath}`, {
        method: "get",
        headers:{
            "AUTHORIZATION": "Bearer " + user.accessToken,
            "FLOW360USER": user.identityId,
            "FLOW360ACCESSUSER":user.guestUserIdentity
        }
    }).then(response => response.json())
      .then(data => {
          if(data) {
              onCallback(data.data)
          }
          else {
              onCallback()
          }

      })
      .catch(()=> {
          onCallback();
      });
}

export function awsUploadFile(bucket, path, file, onProgressCallback, onCompleteCallback) {
    const awsCredential = JSON.parse(localStorage.getItem(AUTH_HEADER));
    const s3 = new AWS.S3({
        ...awsCredential,
        region: config.s3.REGION,
        params: {
            Bucket: bucket
        }
    });
    s3.upload({
        Key: path,
        Body: file,
    }, function (err, data) {

        if (err) {
            onCompleteCallback(false);
            return //console.log('There was an error uploading your photo: ', err);
        } else {
            onCompleteCallback(true);
        }
    }).on('httpUploadProgress', progress => {
        onProgressCallback(progress.loaded, progress.total);
    });
}
