# Contract Extender UI

This project is a react UI app to extend weekly contracts 

## Development
##### Requirement
* Node JS
* npm

### Configuration
* Open **src/config.json**, replace SERVER_URL with the backend server address
* Then run `npm install` to install packages

In the project directory, you can run to start dev server:
### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### Deploy Using AWS S3
    // create a bucket
    $ aws s3 mb s3://ottocar-ui --region=us-east-1
    // list buckets
    $ aws s3 ls
    // build
    $ npm run build
    // and deploy the app
    $ aws s3 sync build/ s3://ottocar-ui --region=us-east-1
