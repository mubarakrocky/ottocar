The Ottocar app consist of a backend written in Python using Flask and a UI app written in JS using React.

UI Readme is under ui/ directory.
### Development
##### Requirements
* Python 3.7
* pip
* virtualenv

##### Steps
* Edit application.env and replace the values
* Then run following

````
    $ python -m virtualenv venv
    $ source venv/bin/activate
    $ pip install -r requirement.txt
    $ env $(cat application.env | xargs) flask run
````

### Deployment

Edit the **zappa_settings.json** and provide necessary API key credentials

You can deploy your backend application to AWS lambda by executing:

	$ zappa deploy dev

After that, you can update your application code with:

	$ zappa update dev
### Deploy by docker
    // Docker image
    
    $ alias zappashell='docker run -ti -e AWS_PROFILE=default -v $(pwd):/var/task -v ~/.aws/:/root/.aws  --entrypoint=bash --rm lambci/lambda:python3.7'
    zappashell> source yourvirtualenv/bin/activate
    zappashell> pip install -r requirements.txt
    zappashell> zappa deploy
