import React from "react";
import {connect} from "react-redux"
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/AuthReducer";
import queryString from 'query-string'
import "./LoginPage.css"
import {Alert, Button, ButtonGroup, Form} from "react-bootstrap";
import { withRouter } from "react-router";
import { BarLoader } from 'react-spinners';
import {NavLink} from "react-router-dom";

class LoginPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          loading: false,
          btn_disabled: false,
        };
        this.usernameRef = React.createRef();
        this.passwordRef = React.createRef();
        const { location } = props;
        const values = queryString.parse(location.search);
        if (values.test) {
          localStorage.setItem('test', values.test);
        }
        if (values.untest) {
          localStorage.removeItem('test');
        }
    }

    reset_spinner() {
      if (this.state.btn_disabled) {
        this.setState({btn_disabled: false, loading: false});
      }
    }

    async login_click(user, pwd) {
        this.props.clearError();
        this.setState({btn_disabled: true, loading: true});
        await this.props.login(user, pwd);
        this.props.history.push("/app/case/all");
    }

    render() {
        const {loginError} = this.props;
        if (loginError) {
          this.reset_spinner();
        }
        return (
            <div className="login-form">
                <Form>
                    <Form.Group controlId="formBasicEmail">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control type="email" placeholder="Enter email" sytle={{textTransform: "none"}} ref={this.usernameRef} required="required"/>
                        <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                        </Form.Text>
                    </Form.Group>

                    <Form.Group controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control type="password" sytle={{textTransform: "none"}} placeholder="Password" ref={this.passwordRef} required="required"/>
                    </Form.Group>
                    <Form.Group>
                    <Button disabled={this.state.btn_disabled}
                            variant="primary"  block
                            onClick={() => this.login_click(this.usernameRef.current.value, this.passwordRef.current.value)}>
                        Log in</Button>
                    </Form.Group>
                    <ButtonGroup>
                        <NavLink to="/app/signup" className="btn btn-info btn_with_margin_left">Sign Up</NavLink>
                        <NavLink className="btn btn-info btn_with_margin_left" to="/app/reset">Reset Password</NavLink>
                    </ButtonGroup>
                    {loginError &&
                    <Alert  variant={"warning"}>
                        {loginError.err_msg}
                    </Alert>}
                    <BarLoader
                        width={340}
                        height={4}
                        color={'#337ab7'}
                        loading={this.state.loading}
                    />
                </Form>
            </div>

        );
    }
}

export default connect(
    state => state.auth,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(withRouter(LoginPage));
