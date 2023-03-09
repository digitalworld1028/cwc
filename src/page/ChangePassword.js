import React from "react";
import {connect} from "react-redux"
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/AuthReducer";
import {Alert, OverlayTrigger, Button, Popover, ProgressBar} from "react-bootstrap";
import {NavLink } from "react-router-dom";
import { withRouter } from "react-router";
import logoDark from '../style/assets/images/logo.svg';
import {test_password_strength} from "../reducer/utils";

class SignupPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
          loading: false,
          btn_disabled: false,
          checkboxChecked: false,
        };
        this.passwordRef = React.createRef();
        this.passwordRefSecond = React.createRef();
        this.pwdStrength = 0;
    }

    go_to_login() {
      this.props.history.push({pathname: '/app/login'});
    }

    handlePwdChange(event) {
      let res = test_password_strength(event.target.value);
      let new_strength = res / 4 * 100;
      if (new_strength != this.pwdStrength) {
        this.setState({pwdStrength: new_strength});
      }
    }

    reset_spinner() {
      if (this.state.btn_disabled) {
        this.setState({btn_disabled: false, loading: false});
      }
    }


    reset_click(pwdOne, pwdTwo) {
      const { code, email } = this.props.match.params;
      this.setState({btn_disabled: true, loading: true});
      this.props.resetPwd(email, code, pwdOne, pwdTwo);
    }

    render() {
      const {resetNotice} = this.props;
      if (resetNotice) {
        const { success } = resetNotice;
        if (!success || success) {
          this.reset_spinner();
        }
      }
      const popover = (
        <Popover id="popover-basic" title="Choose strong password">
          Password must have at least 8 characters, with at least 1 special character (!@#$%^&), 1 numeric, 1 lower and 1 upper case letter.
        </Popover>
      );

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
                                Change Password
                              </h4>

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
                                  { this.state.loading ? (
                                    <Button block disabled>
                                        <span className="spinner-border spinner-border-sm mr-1" role="status" />Loading...
                                    </Button>
                                  ) : (
                                    <button disabled={this.state.btn_disabled}
                                    className="btn btn-primary btn-block"
                                      onClick={() => this.reset_click(
                                        this.passwordRef.current.value, this.passwordRefSecond.current.value
                                      )}>
                                  Change Password
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
)(withRouter(SignupPage));
