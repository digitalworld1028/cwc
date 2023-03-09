import React from "react";
import {connect} from "react-redux"
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/AuthReducer";
import queryString from 'query-string'
import {Alert, Button, Form} from "react-bootstrap";
import { withRouter } from "react-router";
import {Link} from "react-router-dom";
import logoDark from '../style/assets/images/logo.svg';

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
            <div className="auth-wrapper">
                <div className='auth-content text-center'>
                <a href='https://www.flexcompute.com/'> <img src={logoDark} alt='' className='logo img-fluid mb-4'/>
                    </a>
                    <div className='card'>
                      <div className='row align-items-center'>  
                          <div className='col-md-12'>
                              <div className='card-body'>
                                <Form>
                                <h4 className='mb-3 f-w-400'>Sign In</h4>
                                    <Form.Group controlId="formBasicEmail">
                                        <Form.Control type="email" placeholder="Enter email" sytle={{textTransform: "none"}} ref={this.usernameRef} required/>
                                    </Form.Group>

                                    <Form.Group controlId="formBasicPassword">
                                        <Form.Control type="password" sytle={{textTransform: "none"}} placeholder="Password" ref={this.passwordRef} required="required"/>
                                    </Form.Group>
                                    <Form.Group>
                                    { this.state.loading ? (
                                      <Button block disabled>
                                          <span className="spinner-border spinner-border-sm mr-1" role="status" />Loading...
                                      </Button>
                                    ) : (
                                      <Button disabled={this.state.btn_disabled}
                                          type="submit"
                                          variant="primary"  
                                          block
                                          onClick={() => this.login_click(this.usernameRef.current.value, this.passwordRef.current.value)}>
                                          Log in
                                      </Button>
                                    )}
                                    </Form.Group>
                                    <p className='mb-2 mt-4 text-muted'>
                                    Forgot password? 
                                    <Link to='/app/reset'   className='f-w-400'>Reset Password
                                    </Link>
                                  </p>

                                  <p className='mb-0 text-muted'>
                                    Don’t have an  account? 
                                    <Link to='/app/signup' className='f-w-400'>Signup
                                    </Link>
                                  </p>
                                </Form>
                                
                                {loginError &&
                                    <Alert  variant={"warning"}>
                                        {loginError.err_msg}
                                    </Alert>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    }
}

export default connect(
    state => state.auth,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(withRouter(LoginPage));
