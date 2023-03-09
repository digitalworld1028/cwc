import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import {AUTH_HEADER} from "../reducer/utils";
import {need_relogin} from "../util/AwsUtils";
import queryString from "query-string";
export const CUR_VERSION = '1.0';



function is_admin() {
  const awsCredential = JSON.parse(localStorage.getItem(AUTH_HEADER));
  return awsCredential.admin;
}


function getRedirectPath () {
    let path = "";
    //console.log("herf:" + window.location.href);
    let pathArrs = window.location.href.split("?");
    let searchParams = "";
    if(pathArrs.length > 1) {
        searchParams = pathArrs[1];
        //console.log("searchParams:" + searchParams);
        const params = queryString.parse(searchParams);
        path = params.action;
    }

    return path;

}
function checkForPublicPage(path) {
    let publicPaths = ["/app/login", "/app/signup", "/app/verify"];
    return publicPaths.includes(path);
}



export const PrivateRoute = ({ component: Component, ...rest }) => {
    let path = '/app/' + getRedirectPath();
    let newPath = path;
    let isLogined = localStorage.getItem(AUTH_HEADER) && !need_relogin();
    let isLoginPage = path === '/app/login';
    if(isLogined && isLoginPage) {
        newPath = "/app/case/all"
    }
    let isPublicPage = checkForPublicPage(newPath);
    if(!isLogined && !isPublicPage) {
        newPath = "/app/login";
    }

    let isRedirect = window.location.href.indexOf("index.html")> 0 || newPath != path;

    //console.log(`newpath:${newPath}, path:${path}, isRedirect:${isRedirect}`);
    return (<Route {...rest} render={props => isRedirect ? <Redirect to={newPath}/> : <Component {...props} />}/>);
}

export const ControlRoute = ({ component: Component, ...rest }) => (
    <Route {...rest} render={props => (
        localStorage.getItem(AUTH_HEADER) && is_admin()
            ? <Component {...props} />
            : <div/>
    )} />
)

export default PrivateRoute;
