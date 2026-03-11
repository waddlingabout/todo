# A really simple todo app
A really simple todo app with really basic security.

*Tip / Use case: Take an old ipad, download a kiosk app, point it to the url, voila - you can now put a live todo website on your irl desktop.*

## Installation

Run npm install to get the dependencies.

Add the .env file in the root directory.
The env file needs three fields:
   - PORT="YOURPORT"
   - PASSWORD="YOURPASSWORD"
   - KEY="YOURAPIKEY"

Make sure the user running the server has write permissions in the root folder.

Make any changes you want to the static site to personalize it!


## Running the application

Run the server with "npm start".

### Api calls

#### POST /api/login
Login
Request:
```json
  {
    "password": "myPassword"
  }
```

Response:
```json
  {
    "key": "myApiKey"
  }
```

#### NOTE Following calls need the api key in the header
```bash
  curl mytodo.com/api/endpoint -H "x-api-key: MYAPIKEY"
```

#### GET /api/list
Get the list of todo items.

Response:
```json
[
  {
    "content": "clean floor",
    "checked": false
  },
  {
    "content": "eat food",
    "checked": true
  }
]
```