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
        createTable(dbData, 'STATUS');
    });

    function createTable(data, type) {
        let table = document.getElementById("data-table"); // Define table here
        let headers;
        if(type === 'STATUS'){
            headers = ["防具", "防具分類1", "強化Lv", "強化済みフラグ"];
        } else if(type === 'DB') {
            headers = ["防具", "防具分類1", "強化Lv", "必要素材", "必要数量"];
        }

        // Add table rows
        data.sort((a, b) => a.No - b.No).forEach(row => {
            let tr = document.createElement("tr");
            headers.forEach(header => {
                let td = document.createElement("td");
                if (header === '強化済みフラグ' && type === 'STATUS') {
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.checked = row[header];
                    checkbox.id = row['防具強化Lv'].toString();  // convert '強化Lv' to string before assigning to checkbox's id
                    td.appendChild(checkbox);
                } else {
                    td.textContent = row[header];
                }
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });
    }
    
    function searchDB(keyword) {
        db.collection("DB").get().then((querySnapshot) => {
            let searchData = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                if(data.強化済みフラグ === 0 && (data.防具.includes(keyword) || data.防具分類1.includes(keyword) || data.強化Lv.includes(keyword) || data.必要素材.includes(keyword))){
                    data.id = doc.id; // add the document id to the data
                    searchData.push(data);
                }
            });
            createTable(searchData.sort((a, b) => a.No - b.No), 'DB'); // sort by "No" column and call createTable
        });
    }
    
    function saveStatus() {
        let checkboxes = document.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            let level = checkbox.id;
            let checked = checkbox.checked ? 1 : 0;  // if checked, set 1, else set 0
    
            // Update '強化済みフラグ' in all matching STATUS documents
            db.collection("STATUS").where('防具強化Lv', '==', level).get().then(snapshot => {
                snapshot.forEach(doc => {
                    db.collection("STATUS").doc(doc.id).update({
                        '強化済みフラグ': checked
                    });
                });
            }).catch(err => console.log(err));
    
            // Update '強化済みフラグ' in all matching DB documents
            db.collection("DB").where('防具強化Lv', '==', level).get().then(snapshot => {
                snapshot.forEach(doc => {
                    db.collection("DB").doc(doc.id).update({
                        '強化済みフラグ': checked
                    });
                });
            }).catch(err => console.log(err));
        });
        alert("Saved!");
    }

    function clearStatus() {
        let checkboxes = document.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        alert("Cleared!");
    }

    let searchBtn = document.getElementById("searchBtn");
    let saveBtn = document.getElementById("saveBtn");
    let clearBtn = document.getElementById("clearBtn");

    searchBtn.addEventListener("click", function() {
        let searchKeyword = document.getElementById("search").value; // Assume that searchInput is the ID of the search input field
        searchDB(searchKeyword);
    });

    saveBtn.addEventListener("click", function() {
        // When STATUS SAVE button is clicked, execute the saveStatus function
        saveStatus();
    });

    clearBtn.addEventListener("click", function() {
        // When STATUS CLEAR button is clicked, execute the clearStatus function
        clearStatus();
    });
});
