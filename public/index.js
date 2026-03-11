
document.addEventListener('DOMContentLoaded', () => {

    const login = document.getElementById('login');
    let password = null;
    login.addEventListener('submit', async (e) => {
        e.preventDefault();

        password = document.getElementById('password').value;

        const loginresult = await simplelogin(password);


        if(loginresult.ok === true) {
            login.hidden = true;
            document.getElementById("list").hidden = false;
            const apiKey = loginresult.key;

            const eventSource = new EventSource(`/api/stream?key=${apiKey}`);

            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                updateUI(data); 
            };

            eventSource.onerror = (error) => {
                console.error("SSE connection lost. Reconnecting...");
            };
        }

    })

});

async function simplelogin(password){
    const res = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    "password": password
                }) 
            });
    if(!res.ok){
        return {"ok": false, "key":""};
    } 
    const data = await res.json(); 
        
    return { "ok": true, "key": data.key };
}


function updateUI(data) {
    const list = document.getElementById("list");
    
    list.innerHTML = "";

    if (!Array.isArray(data)) {
        console.error("Expected an array, but received:", data);
        return; 
    }

    

    /*if(data.ok != null){
        const listItem = document.createElement("li");
        listItem.className = "unchecked";
        listItem.textContent = "Error!!";
        list.appendChild(listItem);
        return;
    }*/
    data.forEach(value => {
        const listItem = document.createElement("li");
        if(value.checked){
            listItem.className = "checked";
        }else{
            listItem.className = "unchecked";
        }
        listItem.textContent = value.content;
        list.appendChild(listItem);
    });
}

