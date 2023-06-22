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

    let links = {};

    // Fetch links from Firestore
    function fetchLinks() {
        db.collection("armor").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                links[data.name] = data.URL;
            });
        });

        db.collection("materials").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                links[data.name] = data.URL;
            });
        });
    }

    // Fetch links
    fetchLinks();

    let dbData = [];

    // This function will count the quantities for each item
    function aggregateMaterialQuantities(data) {
        let quantities = {};

        data.forEach(row => {
            if (row.必要素材 in quantities) {
                quantities[row.必要素材] += row.必要数量;
            } else {
                quantities[row.必要素材] = row.必要数量;
            }
        });

        return quantities;
    }

    // This function will create a new table using the material quantities
    function createQuantityTable(quantities, tableId) {
        let table = document.getElementById(tableId);
        if (!table) {
            console.error("Unable to find an element with the id '" + tableId + "' in the DOM");
            return;
        }

        // Clear out any existing rows
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        // Add table rows
        for (let material in quantities) {
            let tr = document.createElement("tr");

            let materialTd = document.createElement("td");
            materialTd.textContent = material;
            tr.appendChild(materialTd);

            let quantityTd = document.createElement("td");
            quantityTd.textContent = quantities[material];
            tr.appendChild(quantityTd);

            table.appendChild(tr);
        }
    }

    // Get data from Firestore
    db.collection("STATUS").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            let data = doc.data();
            data.id = doc.id;
            dbData.push(data);
        });

        // Ensure that 'status-table' exists in the DOM before attempting to create it
        if (document.getElementById('status-table')) {
            createTable(dbData, 'STATUS', 'status-table');
        } else {
            console.error("Unable to find an element with the id 'status-table' in the DOM");
        }
    });

    function createTable(data, type, tableId) {
        let table = document.getElementById(tableId);
        let headers;
        if(type === 'STATUS'){
            headers = ["防具", "防具分類1", "強化Lv", "強化済みフラグ"];
        } else if(type === 'DB') {
            headers = ["防具", "防具分類1", "強化Lv", "必要素材", "必要数量"];
        }

        // Clear out any existing rows
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        // Create table headers
        let thead = document.createElement("thead");
        let headerRow = document.createElement("tr");
        headers.forEach(header => {
            let th = document.createElement("th");
            th.textContent = header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Add table rows
        data.sort((a, b) => a['No'] - b['No']).forEach(row => {
            let tr = document.createElement("tr");
            headers.forEach(header => {
                let td = document.createElement("td");
                if (header === '強化済みフラグ' && type === 'STATUS') {
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.checked = row[header];
                    checkbox.id = row['防具強化Lv'].toString();
                    td.appendChild(checkbox);
                } else if ((header === '防具' || header === '必要素材') && links[row[header]]) {
                    let link = document.createElement("a");
                    link.textContent = row[header];
                    link.href = links[row[header]]; // Link from Firestore
                    td.appendChild(link);
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
                    data.id = doc.id;
                    searchData.push(data);
                }
            });
            searchData.sort((a, b) => a['No.'] - b['No.']); // Sort searchData based on 'No'
            let quantities = aggregateMaterialQuantities(searchData);
            createQuantityTable(quantities, 'quantity-table');
            createTable(searchData, 'DB', 'search-table');
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

    searchBtn.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the form from being submitted normally
        let searchKeyword = document.getElementById("search").value; // Get the search input value
        searchDB(searchKeyword);
    });   

    saveBtn.addEventListener("click", function() {
        // When SAVE button is clicked, execute the saveStatus function
        saveStatus();
    });

    clearBtn.addEventListener("click", function() {
        // When CLEAR button is clicked, execute the clearStatus function
        clearStatus();
    });

    // 表を生成する関数をオーバーライドします
    function createTable(data, type, tableId) {
        let table = document.getElementById(tableId);
        let headers;
        if(type === 'STATUS'){
            headers = ["防具", "防具分類1", "強化Lv", "強化済みフラグ"];
        } else if(type === 'DB') {
            headers = ["防具", "防具分類1", "強化Lv", "必要素材", "必要数量"];
        }

        // Clear out any existing rows
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }

        // フィルター用のオブジェクトを作成します
        let filters = {};
        headers.forEach(header => {
            filters[header] = new Set();
        });

        // フィルターを適用します
        let filteredData = data.filter(row => {
            for (let header in filters) {
                let filterValue = filters[header].value;
                if (filterValue !== "All" && row[header] !== filterValue) {
                    return false;
                }
            }
            return true;
        });

        // フィルター用の選択肢を更新します
        filteredData.forEach(row => {
            for (let header in filters) {
                filters[header].add(row[header]);
            }
        });

        // Create table headers
        let thead = document.createElement("thead");
        let headerRow = document.createElement("tr");
        headers.forEach(header => {
            let th = document.createElement("th");
            th.textContent = header;

            // フィルター用の選択肢を追加します
            let filterSelect = document.createElement("select");
            filterSelect.innerHTML = '<option value="All">All</option>';
            Array.from(filters[header]).forEach(value => {
                let option = document.createElement("option");
                option.value = value;
                option.text = value;
                filterSelect.appendChild(option);
            });
            filterSelect.onchange = function() {
                filters[header].value = this.value;
                createTable(data, type, tableId); // 表を更新します
            };
            th.appendChild(filterSelect);

            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // フィルターされたデータで表を作成します
        createFilteredTable(filteredData, headers, table);
    }

    // フィルターされたデータで表を作成する関数を作成します
    function createFilteredTable(data, headers, table) {
        let tbody = document.createElement("tbody");
        data.forEach(row => {
            let tr = document.createElement("tr");
            headers.forEach(header => {
                let td = document.createElement("td");
                td.textContent = row[header];
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
    }
});
