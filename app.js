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
    let statusData = {};

    // Get data from Firestore
    db.collection("DB").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id; // add the document id to the data
            dbData.push(data);
        });
        db.collection("STATUS").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                statusData[doc.id] = doc.data();
            });
            createTable(dbData, statusData);
        });
    });

    function createTable(data, status, onlyNonEnhanced = false) {
        let table = document.getElementById("data-table");
        // clear existing table content
        table.innerHTML = '';

        // Add table headers
        let headers = Object.keys(data[0]);
        let headerRow = document.createElement("tr");
        headers.push("強化済みフラグ"); // Add the checkbox field
        headers.forEach(header => {
            let th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);

        // Add table rows
        data.forEach(row => {
            // If onlyNonEnhanced is true, skip rows with '強化済みフラグ' checked
            if (!onlyNonEnhanced || !status[row['防具強化Lv']]?.強化済みフラグ) {
                let tr = document.createElement("tr");
                headers.forEach(header => {
                    let td = document.createElement("td");
                    if (header === '強化済みフラグ') {
                        let checkbox = document.createElement("input");
                        checkbox.setAttribute("type", "checkbox");
                        checkbox.setAttribute("id", row['防具強化Lv']); // set checkbox id to '防具強化Lv' value
                        checkbox.checked = status[row['防具強化Lv']]?.強化済みフラグ || false; // default to unchecked if the field is not present
                        td.appendChild(checkbox);
                    } else {
                        td.textContent = row[header];
                    }
                    tr.appendChild(td);
                });
                table.appendChild(tr);
            }
        });
    }

    function summarizeMaterials(data, status) {
        let summary = {};

        data.forEach(row => {
            if (!status[row['防具強化Lv']]?.強化済みフラグ) {
                let materials = row['必要素材']; // assuming '必要素材' is an object with material names as keys and quantities as values
                for (let material in materials) {
                    if (summary.hasOwnProperty(material)) {
                        summary[material] += materials[material];
                    } else {
                        summary[material] = materials[material];
                    }
                }
            }
        });

        return summary;
    }

    function saveStatus() {
        let checkboxes = document.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            let id = checkbox.getAttribute("id"); // Now this is the '防具強化Lv' value
            let checked = checkbox.checked;
    
            // Update Firestore
            db.collection("STATUS").doc(id).set({
                '強化済みフラグ': checked
            });
    
            // Reflect the status in the DB collection
            db.collection("DB").doc(id).update({
                '強化済みフラグ': checked
            });
        });
    }
    
    function clearStatus() {
        let checkboxes = document.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            let id = checkbox.getAttribute("id");
    
            // Update Firestore
            db.collection("STATUS").doc(id).set({
                '強化済みフラグ': false
            });
    
            // Reflect the status in the DB collection
            db.collection("DB").doc(id).update({
                '強化済みフラグ': false
            });
        });
    }

    let searchInput = document.getElementById("search");
    let saveBtn = document.getElementById("saveBtn");
    let clearBtn = document.getElementById("clearBtn");

    searchInput.addEventListener("input", function() {
        // Clear existing table
        document.getElementById("data-table").innerHTML = '';

        // Create a new table with only non-enhanced items
        createTable(dbData, statusData, true);

        // Calculate and display the materials summary
        let materialsSummary = summarizeMaterials(dbData, statusData);
        // Code to display materialsSummary goes here...
    });

    saveBtn.addEventListener("click", function() {
        // STATUS SAVEボタンが押されたときの処理をここに書く
        saveStatus();
        alert("保存が成功しました！");
    });

    clearBtn.addEventListener("click", function() {
        // STATUS CLEARボタンが押されたときの処理をここに書く
        clearStatus();
    });
});