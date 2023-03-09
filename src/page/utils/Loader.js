import React from 'react';

const loader = () => {
    return (
        <div className='overlay'>
            <div className='overlay__inner'>
                <div className='overlay__content text-center'>
                    <span className='spinner'></span>
                    <p style={{color: 'white', marginTop: '15px', textAlign: 'center'}}>loading...</p>
                </div>
            </div>
        </div>
    );
};

export default loader;