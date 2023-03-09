import React from 'react';
import { Link } from 'react-router-dom';
import logoDark from '../style/assets/images/logo.svg';

const SignUpSuccess = () => (
  <div>
    <div className='auth-wrapper'>
        <div className='auth-content container'>
            <div className='row align-items-center'>
                <div className='col-sm-8'>
                    <img src={logoDark} alt='' className='img-fluid mb-4'/>
                    <h2 className='font-weight-bolder'>You have been successfully registered!</h2>
                    <h5 className='mb-4'>Kindly check your email to verify your account.</h5>
                    <Link to='/app/login' className='btn btn-primary mb-4' style={{color: 'white'}}>Log In</Link>
                </div>
            </div>
        </div>
    </div>
  </div>
);

export default SignUpSuccess;