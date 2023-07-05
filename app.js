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
        return Promise.all([
            db.collection("armor").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let data = doc.data();
                    links[data.name] = data.URL;
                });
            }),
            db.collection("materials").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let data = doc.data();
                    links[data.name] = data.URL;
                });
            })
        ]);
    }

    // Fetch and store "STATUS" collection to localStorage on load
    function fetchAndStoreStatus() {
        return db.collection("STATUS").get().then((querySnapshot) => {
            let statusData = [];
            let localStatusData = JSON.parse(localStorage.getItem("STATUS")) || [];

            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.id = doc.id;

                // Use the flag value stored in the local storage instead of resetting it
                let localData = localStatusData.find(item => item.id === data.id);
                if(localData) {
                    data["強化済みフラグ"] = localData["強化済みフラグ"];
                } else {
                    data["強化済みフラグ"] = 0; // If there's no local data, set the flag to 0
                }
                
                statusData.push(data);
            });

            // Sort the data by the 'No.' field in ascending order
            statusData.sort((a, b) => a.No - b.No);

            // Store to localStorage
            localStorage.setItem("STATUS", JSON.stringify(statusData));
        });
    }

    // Fetch and store "DB" collection to localStorage on load
    function fetchAndStoreDB() {
        return db.collection("DB").get().then((querySnapshot) => {
            let dbData = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.id = doc.id;
                dbData.push(data);
            });

            // Sort the data by the 'No.' field in ascending order
            dbData.sort((a, b) => a["No."] - b["No."]);

            // Store to localStorage
            localStorage.setItem("DB", JSON.stringify(dbData));
        });
    }

    // Fetch links and store collections
    fetchLinks();
    fetchAndStoreStatus();
    fetchAndStoreDB();

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

    // Get data from localStorage
    Promise.all([
        fetchLinks(),
        fetchAndStoreStatus(),
        fetchAndStoreDB()
    ]).then(() => {
        if (localStorage.getItem("STATUS")) {
            dbData = JSON.parse(localStorage.getItem("STATUS"));
            if (document.getElementById('status-table')) {
                createTable(dbData, 'STATUS', 'status-table');
            } else {
                console.error("Unable to find an element with the id 'status-table' in the DOM");
            }
        }
    })

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
            if(header === "防具分類1" && type === "STATUS"){
                // Create a unique list of "防具分類1" values
                let categories = Array.from(new Set(data.map(row => row["防具分類1"])));
                let select = document.createElement("select");
                // Add an "All" option
                let option = document.createElement("option");
                option.value = "All";
                option.textContent = "All";
                select.appendChild(option);
                // Add options for each category
                categories.forEach(category => {
                    let option = document.createElement("option");
                    option.value = category;
                    option.textContent = category;
                    select.appendChild(option);
                });
                // Add an event listener to the select element
                select.addEventListener("change", function(){
                    // If "All" is selected, display all data, otherwise filter the data
                    if(this.value === "All"){
                        createTable(dbData, 'STATUS', 'status-table');
                    } else {
                        let filteredData = dbData.filter(row => row["防具分類1"] === this.value);
                        createTable(filteredData, 'STATUS', 'status-table');
                    }
                });
                th.appendChild(select);
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        // Create table body
        let tbody = document.createElement("tbody");
        for(let i = 0; i < data.length; i++){
            let tr = document.createElement("tr");
            for(let j = 0; j < headers.length; j++){
                let td = document.createElement("td");
                td.textContent = data[i][headers[j]];
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);

        // Add table rows
        data.forEach(row => {
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
                    link.target = "_blank"; // This makes the link open in a new tab
                    link.rel = "noopener noreferrer"; // This prevents the new page from manipulating the original page
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
        let dbData = JSON.parse(localStorage.getItem('DB'));
        let statusData = JSON.parse(localStorage.getItem('STATUS'));
        let searchData = [];
    
        // Define the fields to be included in the search
        let searchFields = ["強化Lv", "必要素材", "防具", "防具分類1"];
    
        // Split the keyword by space (both full-width and half-width) to get an array of keywords
        let keywords = keyword.split(/[\s\u3000]/);
    
        dbData.forEach(data => {
            // Only look at items that have not been enhanced
            if (statusData.some(status => status['防具強化Lv'] === data['防具強化Lv'] && status['強化済みフラグ'] === 0)) {
                // Check if each keyword is included in the searchFields of the document
                let isAllKeywordsIncluded = keywords.every(kw => {
                    return searchFields.some(field => data[field].toString().includes(kw));
                });
        
                // If all keywords are included, add the document to searchData
                if (isAllKeywordsIncluded) {
                    searchData.push(data);
                }
            }
        });
        
        // Call the function to create a table
        createTable(searchData, 'DB', 'search-table');
    
        // Create quantity table
        let quantities = aggregateMaterialQuantities(searchData);
        createQuantityTable(quantities, 'quantity-table');
    }

    // Assign an event listener to the search button
    document.getElementById('searchBtn').addEventListener('click', function(e) {
        e.preventDefault();
        let keyword = document.getElementById('search').value;
        if(keyword.trim() !== '') {
            searchDB(keyword);
        }
    });

    // Event Listener for Save button
    document.getElementById('saveBtn').addEventListener('click', function() {
        let checkboxes = document.querySelectorAll('#status-table input[type="checkbox"]');
        let statusData = JSON.parse(localStorage.getItem('STATUS'));

        checkboxes.forEach(cb => {
            let index = statusData.findIndex(row => row['防具強化Lv'].toString() === cb.id);
            if (index > -1) {
                statusData[index]['強化済みフラグ'] = cb.checked ? 1 : 0;
            }
        });

        localStorage.setItem('STATUS', JSON.stringify(statusData));

        // Display saved message
        alert("Saved!");

        location.reload();
    });
    
    // Event Listener for Clear button
    document.getElementById('clearBtn').addEventListener('click', function() {
        let statusData = JSON.parse(localStorage.getItem('STATUS'));

        statusData.forEach(row => {
            row['強化済みフラグ'] = 0;
        });

        localStorage.setItem('STATUS', JSON.stringify(statusData));
        location.reload();
    });
});
