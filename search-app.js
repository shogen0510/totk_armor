window.onload = function() {
    var firebaseConfig = {
        apiKey: "AIzaSyAuLNkpFgnd9YAWfcRY_kklrDOt19HK_UM",
        authDomain: "unified-altar-389603.firebaseapp.com",
        projectId: "unified-altar-389603",
        storageBucket: "unified-altar-389603.appspot.com",
        messagingSenderId: "894405393564",
        appId: "1:894405393564:web:c385d9191504b1ae108159"
    };
    
    firebase.initializeApp(firebaseConfig);
    
    var db = firebase.firestore();
    
    // ユーザーのログイン状態の監視
    firebase.auth().onAuthStateChanged(function(user) {
        if (!user) {
            // ユーザーがログアウトしている場合、ログインページにリダイレクト
            window.location.href = "top.html";
        } else {
            // User is signed in, let's get their user-specific collection or create it
            db.collection("userStatuses").doc(user.uid).set({}, {merge: true}).then(function() {
                // If the user does not have a STATUS collection, initialize it
                db.collection("userStatuses").doc(user.uid).collection("STATUS").get().then(function(querySnapshot) {
                    if (querySnapshot.empty) {
                        // Here, clone your original STATUS collection
                        // Set all '強化済みフラグ' to 0
                        db.collection("STATUS").get().then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                let data = doc.data();
                                data['強化済みフラグ'] = 0;
                                db.collection("userStatuses").doc(user.uid).collection("STATUS").doc(doc.id).set(data);
                            });
                        });
                    }
                });
            });
            fetchStatusData();
        }
    });
    
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
    function fetchStatusData() {
        dbData = [];
        let user = firebase.auth().currentUser;  // <- use currentUser directly instead of onAuthStateChanged
        if (user) {
            db.collection("userStatuses").doc(user.uid).collection("STATUS").get().then((querySnapshot) => {
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
        }
    }

    // You can see that we're now using fetchStatusData() to pull the user's data
    // This function gets called every time the page is loaded, and will also be called after we update the data
    // This ensures that our page stays up-to-date whenever changes are made to the Firebase data

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

                // Split the keyword by space (both full-width and half-width) to get an array of keywords
                let keywords = keyword.split(/[\s\u3000]/);

                // Check if each keyword is included in the document
                let isAllKeywordsIncluded = keywords.every(kw =>
                    data.防具.includes(kw) ||
                    data.防具分類1.includes(kw) ||
                    data.強化Lv.includes(kw) ||
                    data.必要素材.includes(kw)
                );

                if(data.強化済みフラグ === 0 && isAllKeywordsIncluded) {
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

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    // Update '強化済みフラグ' in all matching STATUS documents
                    db.collection("userStatuses").doc(user.uid).collection("STATUS").where('防具強化Lv', '==', level).get().then(snapshot => {
                        snapshot.forEach(doc => {
                            db.collection("userStatuses").doc(user.uid).collection("STATUS").doc(doc.id).update({
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
                }
            });
        });
        alert("Saved!");
        fetchStatusData(); // Update the displayed data after the save
    }

    function clearStatus() {
        let checkboxes = document.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        alert("Cleared!");
    }

    let searchForm = document.getElementById("searchForm");
    let saveBtn = document.getElementById("saveBtn");
    let clearBtn = document.getElementById("clearBtn");

    searchForm.addEventListener("submit", function(event) {
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