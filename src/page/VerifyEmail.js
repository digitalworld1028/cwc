import React from "react";
import {connect} from "react-redux"
import {bindActionCreators} from "redux";
import {actionCreators} from "../reducer/AuthReducer";
import {NavLink} from "react-router-dom";
import { withRouter } from "react-router";
import logoDark from '../style/assets/images/logo.svg';

class VerifyEmail extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      btn_disabled: false,
      checkboxChecked: false,
    }
  }

  componentDidMount() {
    const { code, email } = this.props.match.params;
    if (code && email) {
      this.verify_click(code, email)
    }
    
  }

  reset_spinner() {
    if (this.state.btn_disabled) {
      this.setState({btn_disabled: false, loading: false});
    }
  }

  verify_click(code, email) {
    this.props.clearError();
    this.setState({btn_disabled: true, loading: true});
    this.props.verifyEmail(email, code);
  }


  render() {
    const {verifyError} = this.props;
    if (verifyError) {
      const { success } = verifyError;
      if (!success || success) {
        this.reset_spinner();
      }
    }
    return (
      <>
          <div className='auth-wrapper'>
            <div className='auth-content text-center'>
                <div className='card'>
                  <div className='row align-items-center'>
                    <div className='col-md-12'>
                      <div className='card-body'>
                      <a href='https://www.flexcompute.com/'> <img src={logoDark} alt='' className='logo img-fluid mb-4'/>
                      </a>

                      <div className="form-group">
                          {verifyError && (
                            verifyError.success === false && (
                              <>
                                <h4 className='mb-3 f-w-400'>Verification failed!</h4>
                                <p>{verifyError.err_msg}</p>
                                <NavLink
                                  to='/login'
                                  type='button'
                                  style={{color: 'white'}}
                                  className='btn btn-primary mb-4 mt-2 '
                                ><i className='feather icon-arrow-left'/>
                                 To login page
                                </NavLink>
                              </>
                            )
                          ) }
                          {verifyError && (
                            verifyError.success && (
                              <div>
                                 <h4 className='mb-3 f-w-400'>Registration is confirmed</h4>
                                 <p>{verifyError.err_msg}</p>
                                 <NavLink
                                  to='/login'
                                  type='button'
                                  style={{color: 'white'}}
                                  className='btn btn-primary mb-4 mt-2 '
                                ><i className='feather icon-arrow-left'/>
                                 To login page
                                </NavLink>
                              </div>
                            )
                          ) }
                      </div>

                      </div>

                    </div>
                  </div>
              </div>
            </div>
          </div>
      </>
    )
  }

}
export default connect(
  state => state.auth,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(withRouter(VerifyEmail));