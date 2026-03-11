import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';
import { profileEnd } from 'node:console';

config();
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5, 
    message: { "error": "Too many login attempts, please try again later." }
});

const verifyApiKey = (req, res, next) => {
    const providedKey = req.headers['x-api-key'];

    const expectedKey = process.env.KEY;

    if (!providedKey || providedKey !== expectedKey) {
        return res.status(401).json({ 
            ok: false, 
            error: "Unauthorized: Invalid or missing API key" 
        });
    }
    next();
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

let queue = Promise.resolve();

/*
 * api calls:
    {data: index}

    or

    {data: content}
 */



app.post("/api/login",loginLimiter, async (req, res) =>{

    try{
        const pass = req.body.password;

        if (pass != process.env.PASSWORD){

            return res.status(403).json({});
        }
        return res.status(200).json({"key": process.env.KEY});
    }catch{
        return res.status(400).json({
            "ok": false,
            "error": e.message 
        });
    }

});

app.post("/api/add", verifyApiKey, async (req, res) => {
    try {
        const validatedData = validateAdd(req.body);
        await addToWriteQueue(validatedData.content);

        return res.status(200).json({
            "ok": true
        });

    } catch (e) {
        return res.status(400).json({
            "ok": false,
            "error": e.message 
        });
    }
});


app.post("/api/rem", verifyApiKey, async (req, res) => {
    try {
        const validatedIndex = validateIdx(req.body);
        await addToRemoveQueue(validatedIndex.id);

        return res.status(200).json({
            "ok": true
        });

    } catch (e) {
        return res.status(400).json({
            "ok": false,
            "error": e.message 
        });
    }
});

app.post("/api/chk", verifyApiKey, async (req, res) => {
    try {
        const validatedIndex = validateIdx(req.body);
        await addToCheckQueue(validatedIndex.id);

        return res.status(200).json({
            "ok": true
        });

    } catch (e) {
        return res.status(400).json({
            "ok": false,
            "error": e.message 
        });
    }
});

app.get("/api/list", verifyApiKey, async (req, res) => {
    try{

        let json = await addToReadQueue();
        return res.status(200).json(json);

    } catch (e) {
        return res.status(400).json({
            "error": "big error" 
        });
    }

});

app.listen(PORT, () => {
    try{
        var fun = fs.readFileSync(path.join(__dirname,"data.json"))
        
    }
    catch (e){
        console.error(e.message);
        fs.writeFileSync(path.join(__dirname,"data.json"), JSON.stringify([]));

    }
    console.log(`Server running on http://localhost:${PORT}`);
});

function validateAdd(inputData) {
    const isObject = typeof inputData === 'object' && inputData !== null && !Array.isArray(inputData);

    if (!isObject) throw new Error('bad request: expected { "data": "string" }');

    const keys = Object.keys(inputData);

    if (keys.length === 1 && keys[0] === 'data' && typeof inputData['data'] === 'string') {
        const id = keys[0]; 
        const content = inputData[id]; 

        return { id, content };
    } else {
        throw new Error('bad request: expected { "data": "string" }');
    }
}

function validateIdx(inputData) {
    const isObject = typeof inputData === 'object' && inputData !== null && !Array.isArray(inputData);
    
    if (!isObject) throw new Error("Request body must be an object");

    const keys = Object.keys(inputData);

    if (keys.length === 1 && keys[0] === 'data' && typeof inputData.data === 'string') {
        
        const id = inputData.data; 
        
        return { id };
    } else {
        throw new Error('bad request: expected { "data": "idx" }');
    }
}


function addToWriteQueue(value){

    let operation;

    operation = () => writeJson(value, false);

    const current = queue.then(operation);

    queue = current.catch((err) => {
        console.error("Queue error:", err);
    });
    return current;
}

function addToRemoveQueue(idx){

    let operation;
    
    operation = () => removeJson(idx);

    const current = queue.then(operation);

    queue = current.catch((err) => {
        console.error("Queue error:", err);
    });
    return current;
}

function addToCheckQueue(key){
    const operation = () => writeJsonCheck(key);

    const current = queue.then(operation);

    queue = current.catch((err) => {
        console.error("Queue error:", err);
    });
    return current;
}

function addToReadQueue(){
    const operation = () => readJson();
    const current = queue.then(operation);
    
    queue = current.catch((err)=>{
        console.error("Queue error:", err)
    });
    return current;
}

// reading & writing
function writeJson(content, checked) {
    const filePath = path.join(__dirname, "data.json");
    
    const fileData = fs.readFileSync(filePath);
    let jsonArray = JSON.parse(fileData); 

    jsonArray.push({ 
        content: content, 
        checked: checked 
    });

    fs.writeFileSync(filePath, JSON.stringify(jsonArray, null, 2));
}

function writeJsonCheck(indexToCheck) {
    const filePath = path.join(__dirname, "data.json");
    
    const fileData = fs.readFileSync(filePath);
    let jsonArray = JSON.parse(fileData); 

    if (jsonArray[indexToCheck]) {

        jsonArray[indexToCheck].checked = !jsonArray[indexToCheck].checked;
    }
    else{
        throw new Error("index doesn't exist");
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonArray, null, 2));
}

function removeJson(indexToDelete) {
    const filePath = path.join(__dirname, "data.json");
    const fileData = fs.readFileSync(filePath);
    let jsonArray = JSON.parse(fileData);


    if (jsonArray[indexToDelete]) {
        jsonArray.splice(indexToDelete, 1);
    }
    else{
        throw new Error("index doesn't exist");
    }

    fs.writeFileSync(filePath, JSON.stringify(jsonArray, null, 2));
}

function readJson(){
    const filePath = path.join(__dirname,"data.json");
    const olddata = fs.readFileSync(filePath);
    let jsonArray = JSON.parse(olddata);

    return jsonArray;
}