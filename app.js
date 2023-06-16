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
        // ...
        // Add table rows
        data.sort((a, b) => a.No - b.No).forEach(row => {
            let tr = document.createElement("tr");
            headers.forEach(header => {
                let td = document.createElement("td");
                if (header === '強化済みフラグ') {
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.checked = row[header];
                    checkbox.id = row['強化Lv'].toString();  // convert '強化Lv' to string before assigning to checkbox's id
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
            let level = Number(checkbox.getAttribute("id"));  // convert back to number before using as Firestore doc id
            let checked = checkbox.checked;
        
            // Update Firestore
            db.collection("STATUS").doc(level.toString()).update({
                '強化済みフラグ': checked
            }).then(() => {
                console.log("Document successfully updated!");
            })
            .catch((error) => {
                console.error("Error updating document: ", error);
            });
        
            // ...
        });
        alert("保存が成功しました！");
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
        // When STATUS SAVE button is clicked, execute the saveStatus function
        saveStatus();
    });

    clearBtn.addEventListener("click", function() {
        // STATUS CLEARボタンが押されたときの処理をここに書く
        // Code for the STATUS CLEAR button goes here...
    });
});
