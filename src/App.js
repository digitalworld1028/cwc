import React from 'react';
// import './App.css';
import LoginPage from "./page/LoginPage";
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import WorkspacePage from "./page/SecuredPage";
import ResetPassword from "./page/ResetPassword";
import ChangePassword from "./page/ChangePassword";
import VerifyEmail from "./page/VerifyEmail";
import RegisterPage from "./page/RegisterPage";
import history from "./history"
import PrivateRoute from "./container/PrivateRoute"
import SignUpSuccess from './page/SignUpSuccess';

class App extends React.Component {

    render() {
        return (
            <Router history={history}>
                <div>
                    <Switch>
                        {/* <Route path="/app/signup" render={() => (<SignupPage resetPassword={null} verifyInfo={null}/>)}/> */}
                        {/* <Route path="/app/verify" render={() => (<SignupPage resetPassword={null} verifyInfo={{}}/>)}/> */}
                        {/* <Route path="/app/reset" render={() => (<SignupPage resetPassword={{}} verifyInfo={null}/>)}/> */}
                        <Route path="/app/login" exact render={() => (<LoginPage location={this.props.location}/>)}/>
                        <Route path="/app/signup" exact render={() => <RegisterPage/> } />
                        <Route path="/app/signup-success" exact render={() => <SignUpSuccess/> } />
                        <Route path="/app/reset" exact render={() => <ResetPassword/> } />
                        <Route path="/app/reset/:email/:code" exact render={() => <ChangePassword/> } />
                        <Route path="/app/verify/:email/:code" exact render={() => <VerifyEmail/> } />
                        <PrivateRoute path="/" component={WorkspacePage} />
                    </Switch>
                    {process.env.REACT_APP_RUNTIME_ENV != 'PROD' &&
                    <div><label>Ver:{process.env.REACT_APP_RUNTIME_ENV}-{process.env.REACT_APP_GIT_VER}</label></div>
                    }
                </div>
            </Router>

        );
    }
}

export default App;
