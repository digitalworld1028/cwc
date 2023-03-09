import React from "react";
import {getAppActionType, isLoginPage} from "../util/AwsUtils";

class RedirectToLoginOrSignUpPage extends React.Component {
    constructor(props) {
        super();

        //using host here, as I'm redirecting to another location on the same host
        //console.log(props);

        //console.log("this.target:" + this.target);
    }

    componentDidMount() {
        this.props.history.push(this.target);
    }

    render() {
        return (
          <div>
            <br />
            <span>Redirecting to Login page</span>
          </div>
        )
    }
}

export default RedirectToLoginOrSignUpPage;
