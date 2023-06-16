document.addEventListener("DOMContentLoaded", function() {
    var firebaseConfig = {
        apiKey: "AIzaSyAuLNkpFgnd9YAWfcRY_kklrDOt19HK_UM",
        authDomain: "unified-altar-389603.firebaseapp.com",
        projectId: "unified-altar-389603",
        storageBucket: "unified-altar-389603.appspot.com",
        messagingSenderId: "894405393564",
        appId: "1:894405393564:web:c385d9191504b1ae108159"
    };

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    var db = firebase.firestore();

    let dbData = [];

    // Get data from Firestore
    db.collection("STATUS").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id; // add the document id to the data
            dbData.push(data);
        });
        createTable(dbData);
    });

    function createTable(data) {
        let table = document.getElementById("data-table");
        // clear existing table content
        table.innerHTML = '';

        // Add table headers
        let headers = Object.keys(data[0]).filter(key => key !== 'No' && key !== '防具分類2');
        let headerRow = document.createElement("tr");
        headers.forEach(header => {
            let th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Add table rows
        data.sort((a, b) => a.No - b.No).forEach(row => {
            let tr = document.createElement("tr");
            headers.forEach(header => {
                let td = document.createElement("td");
                td.textContent = row[header];
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
    }
    
    let searchInput = document.getElementById("search");
    let saveBtn = document.getElementById("saveBtn");
    let clearBtn = document.getElementById("clearBtn");

    searchInput.addEventListener("input", function() {
        // Clear existing table
        document.getElementById("data-table").innerHTML = '';

        // Create a new table with only non-enhanced items
        createTable(dbData.filter(row => !row.強化済みフラグ));
    });

    saveBtn.addEventListener("click", function() {
        // STATUS SAVEボタンが押されたときの処理をここに書く
        alert("保存機能は現在利用できません！");
    });

    clearBtn.addEventListener("click", function() {
        // STATUS CLEARボタンが押されたときの処理をここに書く
        alert("クリア機能は現在利用できません！");
    });
});
