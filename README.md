Quick Tips:

create a heroku web app:
`heroku create`

rename remote:
`git remote rename heroku flow360app`


list remote:
`git remote -v`
`flow360app	https://git.heroku.com/mighty-refuge-36604.git (fetch)
flow360app	https://git.heroku.com/mighty-refuge-36604.git (push)
https://git.heroku.com/flow360-staging.git
origin	https://github.com/flexcompute/Flow360WebClient.git (fetch)
origin	https://github.com/flexcompute/Flow360WebClient.git (push)`

publish & deploy code from local:
`git push flow360app master`


This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:
### `npm install react-script`
### `npm install aws4`
### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.


## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
### the icons
2 icons libs are used in the project.
1. https://useiconic.com/open#icons 
2. bootstrap icons

### Code Splitting

This section has moved here: https://facebook.github.io/create-react-app/docs/code-splitting

### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size

### Making a Progressive Web App

This section has moved here: https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app

### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration

### Deployment

This section has moved here: https://facebook.github.io/create-react-app/docs/deployment

### `npm run build` fails to minify

This section has moved here: https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify

## Completed Tasks
### Overview
1. Create the web following react-redux framework.
2. Integrate with REST api
### Login Page
1. Retrieve the aws key and secret by username and password
2. Secured Mesh/Case Pages.
3. Save the access credential on local storage.
4. Logout
### Mesh Page
1. Create Mesh & Upload File (log the progress on console)
2. Delete Mesh
3. Show Mesh Detail 
4. Show Mesh Visualization.
5. Show mesh list.
6. Navigate to Case page by selected mesh.
7. Refresh mesh detail.
### Case Page
1. list case all or list case by mesh id
2. show case detail: description, convergence, forces
3. Refresh case detail.
4. delete case.


## TODOs
### Mesh Page
1. Search mesh locally.
2. create new case.
### Case Page
1. Fork Case
2. Download Case
3. Show case description in the better way


##Deploy the AWS AMPLIFY
1. Add EXPORT REACT_APP_RUNTIME_ENV={DEV/PROD} before npm run build. 
as well as REACT_APP_GIT_VER=`git log -1 --pretty='format:%cd' --date=format:%Y%m%d-%H%M%S`
2. On Rewrites and redirects, add map from "/" to "/welcome.html"
