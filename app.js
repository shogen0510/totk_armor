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
        let headers = [];  // Initialize headers as an empty array
        
        if(data.length > 0) {
            headers = Object.keys(data[0]); // assuming all objects have same structure
        }
    
        // Add table rows
        data.sort((a, b) => a.No - b.No).forEach(row => {
            let tr = document.createElement("tr");
            headers.forEach(header => {
                let td = document.createElement("td");
                if (header === '強化済みフラグ') {
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
    
    
    function saveStatus() {
        let checkboxes = document.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            let level = checkbox.getAttribute("id");
            let checked = checkbox.checked ? 0 : 1;  // if checked, set 0, else set 1
    
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
        alert("保存が成功しました！");
    }

    function clearStatus() {
        db.collection("STATUS").get().then(snapshot => {
            snapshot.forEach(doc => {
                db.collection("STATUS").doc(doc.id).update({
                    '強化済みフラグ': 0
                });
            });
        }).catch(err => console.log(err));

        db.collection("DB").get().then(snapshot => {
            snapshot.forEach(doc => {
                db.collection("DB").doc(doc.id).update({
                    '強化済みフラグ': 0
                });
            });
        }).catch(err => console.log(err));
        alert("全ての強化フラグがクリアされました！");
    }

    let searchInput = document.getElementById("search");
    let saveBtn = document.getElementById("saveBtn");
    let clearBtn = document.getElementById("clearBtn");

    searchInput.addEventListener("input", function() {
        // Clear existing table
        document.getElementById("data-table").innerHTML = '';

        // Create a new table with only non-enhanced items
        createTable(dbData.filter(row => row.強化済みフラグ !== 1));
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
