import React from "react";
import {connect} from "react-redux"
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/AuthReducer";
import "./LoginPage.css"
import {Alert, FormLabel, Button, OverlayTrigger, Popover, ProgressBar, FormGroup, FormCheck} from "react-bootstrap";
import {NavLink} from "react-router-dom";
import { withRouter } from "react-router";
import {test_password_strength} from "../reducer/utils";
import logoDark from '../style/assets/images/logo.svg';

class RegisterPage extends React.Component {

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
        this.pwdStrength = 0;
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


    async signup_click(user, pwd, pwd2, code, personName, company) {
      this.props.clearError();
      this.setState({btn_disabled: true, loading: true});
      await this.props.signup(user, pwd, pwd2, code, personName, company);
    }

    render() {
        const {signupError} = this.props;
        if (signupError) {
          const { success } = signupError;
          if (!success || success) {
            this.reset_spinner();
          }
        }

        const popover = (
          <Popover id="popover-basic" title="Choose strong password">
            Password must have at least 8 characters, with at least 1 special character (!@#$%^&), 1 numeric, 1 lower and 1 upper case letter.
          </Popover>
        );
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
                                      { this.state.loading ? (
                                        <Button block disabled>
                                            <span className="spinner-border spinner-border-sm mr-1" role="status" />Loading...
                                        </Button>
                                      ) : (
                                        <button disabled={this.state.btn_disabled || !this.state.checkboxChecked}
                                        className="btn btn-primary btn-block"
                                          onClick={() => this.signup_click(this.usernameRef.current.value, this.passwordRef.current.value,
                                          this.passwordRefSecond.current.value, this.inviteCodeRef.current.value,
                                            this.usernameRef.current.value, '')}>Sign Up
                                      </button>
                                      )}
                                    </div>


                                  <div className="form-group">
                                      {signupError && (
                                        signupError.success === false && (
                                          <Alert  variant={"warning"}>
                                          {signupError.err_msg}
                                          </Alert>
                                        )
                                      ) }
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

export default connect(
    state => state.auth,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(withRouter(RegisterPage));
