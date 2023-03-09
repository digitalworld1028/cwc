import React from "react";
import {connect} from "react-redux"
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/AuthReducer";
import {Alert, Button, Form} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import { withRouter } from "react-router";
import logoDark from '../style/assets/images/logo.svg';

class ResetPassword extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          loading: false,
          btn_disabled: false,
          checkboxChecked: false,
        };
        this.usernameRef = React.createRef();
        this.inviteCodeRef = React.createRef();
        this.companyRef = React.createRef();
        this.personNameRef = React.createRef();
        this.passwordRef = React.createRef();
        this.passwordRefSecond = React.createRef();
        this.verify_usernameRef = React.createRef();
        this.verify_codeRef = React.createRef();
        this.reset_usernameRef = React.createRef();
        this.reset_codeRef = React.createRef();
        this.pwdStrength = 0;
    }

    reset_spinner() {
      if (this.state.btn_disabled) {
        this.setState({btn_disabled: false, loading: false});
      }
    }

    async request_reset_click(user) {
      this.setState({btn_disabled: true, loading: true});
      await this.props.requestReset(user);
    }

    reset_click(user, verify_code, pwdOne, pwdTwo) {
      this.setState({btn_disabled: true, loading: true});
      this.props.resetPwd(user, verify_code, pwdOne, pwdTwo);
    }

    render() {
      const {resetNotice} = this.props;
      if (resetNotice) {
        const { success } = resetNotice;
        if (!success || success) {
          this.reset_spinner();
        }
      }
          return (
            <div className='auth-wrapper'>
              <div className='auth-content text-center'>
                  <a href='https://www.flexcompute.com/'> <img src={logoDark} alt='' className='logo img-fluid mb-4'/>
                  </a>
                  <div className='card'>
                    <div className='row align-items-center'>  
                        <div className='col-md-12'>
                            <div className='card-body text-left'>
                              <h4 className='mb-3 f-w-400 text-center'>
                                Reset Password
                              </h4>
                              <Form>
                                <div className="form-group">
                                    <span>Fill in your email to get a verification code.
                                    </span> 
                                    <input type="text" className="form-control reset_form_val mt-2" placeholder="Email Address" ref={this.reset_usernameRef} required="required"/>
                                </div>

                                <div className="form-group">
                                    { this.state.loading ? (
                                      <Button block disabled>
                                          <span className="spinner-border spinner-border-sm mr-1" role="status" />Loading...
                                      </Button>
                                    ) : (
                                      <button disabled={this.state.btn_disabled}
                                      className="btn btn-primary btn-block"
                                        onClick={() => this.request_reset_click(this.reset_usernameRef.current.value)}>Get Verification Code
                                        </button>
                                    )}
                                </div>

                                <div className="form-group">
                                    {resetNotice && (
                                      resetNotice.success === false && (
                                        <Alert  variant={"warning"}>
                                        {resetNotice.notice}
                                        </Alert>
                                      )
                                    ) }
                                    {resetNotice && (
                                      resetNotice.success && (
                                        <Alert  variant={"success"}>
                                        {resetNotice.notice}
                                        </Alert>
                                      )
                                    ) }
                                </div>

                          </Form>
                          <p className='mb-0 text-muted text-center '>Already have an account? <NavLink to='/app/login' className='f-w-400'>Sign in</NavLink></p>
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
)(withRouter(ResetPassword));
