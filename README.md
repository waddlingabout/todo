# A really simple todo app
A really simple todo app with really basic security.

*Tip / Use case: Take an old ipad, download a kiosk app, point it to the url, voila - you can now put a live todo website on your irl desktop.*

## Installation

Run npm install to get the dependencies.

Add the `.env` file in the root directory.
The env file needs three fields:
   - PORT="YOURPORT"
   - PASSWORD="YOURPASSWORD"
   - KEY="YOURAPIKEY"

Make sure the user running the server has write permissions in the root folder.

Make any changes you want to the static site to personalize it!

The app is not secure if ur not using https, so set that up if you wan't to keep snoopers out.

## Running the application

Run the server with `npm start`.

---

## API Calls

### POST `/api/login`
Login

**Request:**
```json
{
  "password": "myPassword"
}
```

**Response:**
```json
{
  "key": "myApiKey"
}
```

---

### NOTE: Authenticated Endpoints
The following calls need the API key in the header:
```bash
curl mytodo.com/api/endpoint -H "x-api-key: MYAPIKEY"
```

### GET `/api/list`
Get the list of todo items.

**Response:**
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

### POST `/api/add`
Add a new item to the todo list.

**Request:**
```json
{
  "data": "buy groceries"
}
```

**Response:**
```json
{
  "ok": true
}
```

### POST `/api/rem`
Remove an item from the todo list by its array index.

**Request:**
```json
{
  "data": "0" 
}
```

**Response:**
```json
{
  "ok": true
}
```

### POST `/api/chk`
Toggle the checked/unchecked status of a todo item by its array index.

**Request:**
```json
{
  "data": "1" 
}
```

**Response:**
```json
{
  "ok": true
}
```

### GET `/api/stream`
Server-Sent Events (SSE) endpoint to listen for real-time list updates. 

*Note: This endpoint accepts the API key in the headers OR in the URL query string (e.g., `/api/stream?key=MYAPIKEY`) for easier browser integration.*

**Response stream format:**
```text
data: [{"content":"clean floor","checked":false},{"content":"eat food","checked":true}]

```