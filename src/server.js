import { error } from 'console';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'node:fs';
import { appendFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3021;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

let queue = Promise.resolve();


app.post("/api/add", async (req, res) => {
    try {
        const validatedData = validateAdd(req.body);
        await addToWriteQueue(validatedData.id,validatedData.content, true);

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


app.post("/api/rem", async (req, res) => {
    try {
        const validatedData = validateRem(req.body);
        await addToWriteQueue(validatedData.id,"", false);

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

app.post("/api/chk", async (req, res) => {
    try {
        const validatedData = validateRem(req.body);
        await addToCheckQueue(validatedData.id,"");

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

app.get("/api/list", async (req, res) => {
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
        fs.writeFileSync(path.join(__dirname,"data.json"), JSON.stringify({}));

    }
    console.log(`Server running on http://localhost:${PORT}`);
});

function validateAdd(inputData) {
    const isObject = typeof inputData === 'object' && inputData !== null && !Array.isArray(inputData);
    
    if (!isObject) throw new Error("Request body must be an object");

    const keys = Object.keys(inputData);

    if (keys.length === 1 && typeof inputData[keys[0]] === 'string') {
        const id = keys[0];
        const content = inputData[id];
        return { id, content };
    } else {
        throw new Error("bad request: expected {id: 'string'}");
    }
}
function validateRem(inputData) {
    const isObject = typeof inputData === 'object' && inputData !== null && !Array.isArray(inputData);
    
    if (!isObject) throw new Error("Request body must be an object");

    const keys = Object.keys(inputData);

    if (keys.length === 1) {
        const id = keys[0];
        const content = inputData[id];
        return { id, content };
    } else {
        throw new Error("bad request: expected {id}");
    }
}

function addToWriteQueue(key, value, mode){

    let operation;
    if(mode){
        operation = () => writeJson(key, {content: value, checked: false});

    } else{
        operation = () => removeJson(key, value);
    }

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

function writeJson(key, value) {
    const filePath = path.join(__dirname,"data.json");//path.join(__dirname, 'data.json');
    const olddata = fs.readFileSync(filePath);
    let json = JSON.parse(olddata);

    json[key] = value;

    fs.writeFileSync(filePath,JSON.stringify(json));
}
function writeJsonCheck(key) {
    const filePath = path.join(__dirname,"data.json");//path.join(__dirname, 'data.json');
    const olddata = fs.readFileSync(filePath);
    let json = JSON.parse(olddata);

    var checked = json[key].checked;
    json[key].checked = !checked;

    fs.writeFileSync(filePath,JSON.stringify(json));
}

function removeJson(key, value) {
    const filePath = path.join(__dirname,"data.json");//path.join(__dirname, 'data.json');
    const olddata = fs.readFileSync(filePath);
    let json = JSON.parse(olddata);

    delete json[key];

    fs.writeFileSync(filePath,JSON.stringify(json));
}

function readJson(){
    const filePath = path.join(__dirname,"data.json");//path.join(__dirname, 'data.json');
    const olddata = fs.readFileSync(filePath);
    let json = JSON.parse(olddata);

    return json;
}