import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux"
import "./index.css";
import App from "./App";
import store from "./store"
import * as serviceWorker from "./serviceWorker";
// import 'bootstrap/dist/css/bootstrap.min.css';
// import 'bootstrap/dist/js/bootstrap.bundle.min';
import './style/assets/scss/style.scss'
import '@progress/kendo-theme-default/dist/all.css';
const WrappedApp = () => (
    <Provider store={store}>
        <App/>
    </Provider>

);
ReactDOM.render(<WrappedApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
