import React from "react";
import {connect} from "react-redux"
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/AuthReducer";
import "./LoginPage.css"
import {Alert, FormLabel, InputGroup, OverlayTrigger, Popover, ProgressBar, FormGroup, FormCheck} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import { withRouter } from "react-router";
import { BarLoader } from 'react-spinners';
import {test_password_strength} from "../reducer/utils";
import $ from 'jquery';
import { Mixpanel } from '../util/mixpanel_util';
import logoDark from '../style/assets/images/logo.svg';

class SignupPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          loading: false,
          btn_disabled: false,
          checkboxChecked: false,
        };
        this.usernameRef = React.createRef();
        this.inviteCodeRef = React.createRef();
        this.passwordRef = React.createRef();
        this.passwordRefSecond = React.createRef();
        this.verify_usernameRef = React.createRef();
        this.verify_codeRef = React.createRef();
        this.reset_usernameRef = React.createRef();
        this.reset_codeRef = React.createRef();
        this.pwdStrength = 0;
    }

    componentDidMount() {
      $('.reset_form_val').val();
      if (this.props.verifyInfo) {
        Mixpanel.track('verify_code');
      } else if (this.props.resetPassword) {
        Mixpanel.track('reset_pwd');
      } else {
        Mixpanel.track('signup');
      }
    }

    componentDidUpdate(prevProps) {
      this.reset_spinner();
    }

    handleCheckboxChange(evt) {
      this.setState({ checkboxChecked: evt.target.checked });
    }

    handlePwdChange(event) {
      let res = test_password_strength(event.target.value);
      let new_strength = res / 4 * 100;
      if (new_strength != this.pwdStrength) {
        this.setState({pwdStrength: new_strength});
      }
    }

    go_to_login() {
      this.props.history.push({pathname: '/app/login'});
    }

    reset_spinner() {
      if (this.state.btn_disabled) {
        this.setState({btn_disabled: false, loading: false});
      }
    }

    verify_click(email, verify_code) {
      this.props.clearError();
      this.setState({btn_disabled: true, loading: true});
      this.props.verifyEmail(email, verify_code);
    }

    signup_click(user, pwd, pwd2, code, personName, company) {
      this.props.clearError();
      this.setState({btn_disabled: true, loading: true});
      this.props.signup(user, pwd, pwd2, code, personName, company);
    }

    request_reset_click(user) {
      this.setState({btn_disabled: true, loading: true});
      this.props.requestReset(user);
    }

    reset_click(user, verify_code, pwdOne, pwdTwo) {
      this.setState({btn_disabled: true, loading: true});
      this.props.resetPwd(user, verify_code, pwdOne, pwdTwo);
    }

    render() {
        const {signupError, verifyInfo, verifyError, resetPassword, resetNotice} = this.props;
        //console.log(resetPassword);
        const popover = (
          <Popover id="popover-basic" title="Choose strong password">
            Password must have at least 8 characters, with at least 1 special character (!@#$%^&), 1 numeric, 1 lower and 1 upper case letter.
          </Popover>
        );

        if (verifyInfo) {
          return (
               <div className='auth-wrapper'>
                  <div className='auth-content text-center'>
                  <a href='https://www.flexcompute.com/'> <img src={logoDark} alt='' className='logo img-fluid mb-4'/>
                  </a>

                   <h2 className="text-center">Verify Email</h2>
                   <h4 className="text-center">Please find verification code from email</h4>
                   <div className="form-group">
                       <input type="text" className="form-control" placeholder="Email" ref={this.verify_usernameRef} required="required"/>
                   </div>
                   <div className="form-group">
                       <input type="text" className="form-control" placeholder="VerificationCode" ref={this.verify_codeRef} required="required"/>
                   </div>
                   <div className="form-group">
                       <button disabled={this.state.btn_disabled}
                         className="btn btn-primary"
                           onClick={() => this.verify_click(this.verify_usernameRef.current.value, this.verify_codeRef.current.value)}>Verify Email</button>
                   </div>
                   <div className="form-group">
                       {verifyError &&
                           <Alert  variant={"warning"}>
                             {verifyError.err_msg}
                       </Alert>}
                   </div>
                   <div className='sweet-loading'>
                     <BarLoader
                       width={340}
                       height={4}
                       color={'#337ab7'}
                       loading={this.state.loading}
                     />
                   </div>
                   <div className="form-group">
                       <button
                         className="btn btn-primary btn-block"
                           onClick={() => this.go_to_login()}>Log In</button>
                   </div>
               </div>
               </div>
             );
        } else if (resetPassword) {
          ////////////////// reset password///////////
          return (
            <div className='auth-wrapper'>
              <div className='auth-content text-center'>
                  <a href='https://www.flexcompute.com/'> <img src={logoDark} alt='' className='logo img-fluid mb-4'/>
                  </a>
                  <div className='card'>
                    <div className='row align-items-center'>  
                        <div className='col-md-12'>
                            <div className='card-body text-left'>
                              <h4 className='mb-3 f-w-400 text-center'>Reset Password</h4>

                          <div className="form-group">
                          Step 1. Fill in your email to get a verification code.
                              <input type="text" className="form-control reset_form_val" placeholder="Email" ref={this.reset_usernameRef} required="required"/>
                          </div>
                          <div className="form-group">
                              <button disabled={this.state.btn_disabled}
                                className="btn btn-primary btn-block"
                                  onClick={() => this.request_reset_click(this.reset_usernameRef.current.value)}>Get Verification Code</button>
                          </div>

                          <div className="form-group">
                          Step 2. Check your email and fill the code below, and choose a new password
                              <input type="text" className="form-control reset_form_val" placeholder="VerificationCode" ref={this.verify_codeRef} required="required"/>
                          </div>
                          <div className="form-group">
                            <OverlayTrigger trigger="focus" placement="right" overlay={popover}>
                              <input type="password" onChange={(evt) => this.handlePwdChange(evt)} className="form-control reset_form_val" placeholder="Password" ref={this.passwordRef} required="required"/>
                            </OverlayTrigger>
                          </div>
                          <ProgressBar now={this.state.pwdStrength} label="strength of password" className="prog_bar_green" />
                          <div className="form-group">
                              <input type="password" className="form-control reset_form_val" placeholder="Confirm Password" ref={this.passwordRefSecond} required="required"/>
                          </div>
                          <div className="form-group">
                              <button disabled={this.state.btn_disabled}
                                className="btn btn-primary btn-block"
                                  onClick={() => this.reset_click(this.reset_usernameRef.current.value,
                                    this.verify_codeRef.current.value, this.passwordRef.current.value, this.passwordRefSecond.current.value)}>Reset Password</button>
                          </div>
                          <div className="form-group">
                              {resetNotice &&
                                  <Alert  variant={"warning"}>
                                    {resetNotice.notice}
                              </Alert>}
                          </div>
                          <div className='sweet-loading'>
                            <BarLoader
                              width={340}
                              height={4}
                              color={'#337ab7'}
                              loading={this.state.loading}
                            />
                          </div>
                          <p className='mb-0 text-muted text-center '>Already have an account? <NavLink to='/app/login' className='f-w-400'>Sign in</NavLink></p>
                      </div>
                    </div>
                  </div>      
                </div> 
               </div>
              </div>
             );
        } else {

          // Signup page
          return (
            <div className='auth-wrapper'>
              <div className='auth-content text-center'>
                  <a href='https://www.flexcompute.com/'> <img src={logoDark} alt='' className='logo img-fluid mb-4'/>
                  </a>
                  <div className='card'>
                      <div className='row align-items-center'>  
                          <div className='col-md-12'>
                              <div className='card-body text-left'>
                                <h4 className='mb-3 f-w-400 text-center'>Sign Up</h4>
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder="Email (required)" ref={this.usernameRef} required="required"/>
                                </div>
                                <div className="form-group">
                                    <input type="text" className="form-control" placeholder="Invitation Code (required)" ref={this.inviteCodeRef} required="required"/>
                                </div>

                                <div className="form-group">
                                  <OverlayTrigger trigger="focus" placement="right" overlay={popover}>
                                    <input type="password" onChange={(evt) => this.handlePwdChange(evt)} className="form-control" placeholder="Password" ref={this.passwordRef} required="required"/>
                                  </OverlayTrigger>
                                </div>
                                <ProgressBar now={this.state.pwdStrength} label="strength of password" className="prog_bar_green" />
                                <div className="form-group">
                                    <input type="password" className="form-control" placeholder="Confirm Password" ref={this.passwordRefSecond} required="required"/>
                                </div>
                                  <FormGroup className="terms-condition-checkbox" controlId="formBasicCheckbox">
                                    <FormCheck type="checkbox" 
                                      onChange={(evt) => this.handleCheckboxChange(evt)}
                                      checked={this.state.checkboxChecked}/>
                                      <FormLabel>By checking this box and signing up, you agree to our
                                        <a target="_blank" href="/term_of_service.html"> terms of services </a> and
                                        <a target="_blank" href="/privacy.html"> privacy policy</a>.</FormLabel>
                                      </FormGroup>

                                  <div className="form-group">
                                    <button disabled={this.state.btn_disabled || !this.state.checkboxChecked}
                                      className="btn btn-primary btn-block"
                                        onClick={() => this.signup_click(this.usernameRef.current.value, this.passwordRef.current.value,
                                        this.passwordRefSecond.current.value, this.inviteCodeRef.current.value,
                                          this.usernameRef.current.value, '')}>Sign Up</button>
                                </div>
                                <div className="form-group">
                                    {signupError &&
                                        <Alert  variant={"warning"}>{signupError.err_msg}</Alert>}
                                </div>
                                <div className='sweet-loading'>
                                  <BarLoader
                                    width={340}
                                    height={4}
                                    color={'#337ab7'}
                                    loading={this.state.loading}
                                  />
                                </div>
                                <p className='mb-0 text-muted text-center '>Already have an account? <NavLink to='/app/login' className='f-w-400'>Sign in</NavLink></p>

                          </div>
                      </div>
                  </div>      
                </div>                          
              </div>
          </div>
          )
        }
    }
}

export default connect(
    state => state.auth,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(withRouter(SignupPage));
