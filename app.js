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
                    data["強化済"] = localData["強化済"];
                } else {
                    data["強化済"] = 0; // If there's no local data, set the flag to 0
                }
                
                statusData.push(data);
            });

            // Sort the data by the 'No.' field in ascending order
            statusData.sort((a, b) => a.No - b.No);

            // Store to localStorage
            localStorage.setItem("STATUS", JSON.stringify(statusData));
        });
    }

    function fetchAndStoreDB() {
        return db.collection("DB").get().then((querySnapshot) => {
            let dbData = [];
            let mtNumbers = {}; // To store No.MT for each material
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                data.id = doc.id;
                dbData.push(data);
                // Store the No.MT of each material
                if (!(data["必要素材"] in mtNumbers)) {
                    mtNumbers[data["必要素材"]] = data["No.MT"];
                }
            });
    
            // Sort the data by the 'No.' field in ascending order for search-results-table
            dbData.sort((a, b) => a["No."] - b["No."]);
    
            // Store to localStorage
            localStorage.setItem("DB", JSON.stringify(dbData));
            // Store No.MT values to localStorage
            localStorage.setItem("MTNumbers", JSON.stringify(mtNumbers));
        });
    }

    // Filter Dropdown creation function
    function createDropdown(tableId) {
        let table = document.getElementById(tableId);
        let dropdown = document.getElementById(tableId + "-dropdown");
    
        // if dropdown already exists, remove it
        if (dropdown) {
            dropdown.remove();
        }
        dropdown = document.createElement("select");
        dropdown.id = tableId + "-dropdown";
        dropdown.innerHTML = `<option value="">すべて</option>`;
        
        // Get unique categories from dbData
        let categories = [...new Set(dbData.map(item => item["防具分類"]))];
        
        categories.forEach(category => {
            let option = document.createElement("option");
            option.value = category;
            option.text = category;
            dropdown.appendChild(option);
        });
    
        table.parentNode.insertBefore(dropdown, table);
    }
    
    // Filter function
    function filterTable() {
        let dropdown = document.getElementById('status-table-dropdown');
        let selectedCategory = dropdown.value;
    
        // Filter the dbData based on the dropdown selection
        let filteredData = selectedCategory !== "" 
                            ? dbData.filter(item => item["防具分類"] === selectedCategory) 
                            : dbData;
    
        // Generate table with filtered data
        createTable(filteredData, 'STATUS', 'status-table');
        createDropdown('status-table');
        document.getElementById('status-table-dropdown').value = selectedCategory;
        document.getElementById('status-table-dropdown').addEventListener('change', filterTable);
    }

    // 強化Lvチェックボックスの作成関数
    function createCheckboxesLV(tableId) {
        let checkboxContainerLV = document.getElementById(tableId + "-checkboxesLV");

        // チェックボックスのコンテナがすでに存在する場合は、それを削除
        if (checkboxContainerLV) {
            checkboxContainerLV.innerHTML = ''; // 既存の要素をクリア
        }

        // dbDataからユニークなカテゴリを取得
        let categories = [...new Set(dbData.map(item => item["Lv"]))];

        categories.forEach((category, index) => {
            let checkboxWrapperLV = document.createElement("div");
            let checkboxLV = document.createElement("input");
            checkboxLV.type = "checkbox";
            checkboxLV.id = categoryLV;
            checkboxLV.name = categoryLV;
            checkboxLV.className = "styled-checkbox"; 
            
            let labelLV = document.createElement("label");
            labelLV.htmlFor = categoryLV;
            labelLV.appendChild(document.createTextNode(categoryLV));

            checkboxWrapperLV.appendChild(checkboxLV);
            checkboxWrapperLV.appendChild(labelLV);
            checkboxContainerLV.appendChild(checkboxWrapperLV); // checkboxWrapperを直接checkboxContainerに追加

            // チェックボックスが変更された場合に実行
            checkboxLV.addEventListener('change', function() {
                let selectedCategories = [];
                let checkboxesLV = document.querySelectorAll('#' + tableId + '-checkboxesLV input[type="checkbox"]');
                checkboxesLV.forEach(checkboxLV => {
                    if(checkboxLV.checked) {
                        selectedCategories.push(checkbox.name);
                    }
                });
                searchDB(selectedCategories);
            });
        });
    }



    // チェックボックスの作成関数
    function createCheckboxes(tableId) {
        let checkboxContainer = document.getElementById(tableId + "-checkboxes");

        // チェックボックスのコンテナがすでに存在する場合は、それを削除
        if (checkboxContainer) {
            checkboxContainer.innerHTML = ''; // 既存の要素をクリア
        }

        // dbDataからユニークなカテゴリを取得
        let categories = [...new Set(dbData.map(item => item["防具分類"]))];

        // 最大のラベルの幅を計算
            let maxLabelWidth = 0;
            categories.forEach((category) => {
                let tempLabel = document.createElement("label");
                tempLabel.style.display = "inline-block";
                tempLabel.textContent = category;
                document.body.appendChild(tempLabel);
                maxLabelWidth = Math.max(maxLabelWidth, tempLabel.offsetWidth);
                document.body.removeChild(tempLabel);
            });


        categories.forEach((category, index) => {
            let checkboxWrapper = document.createElement("div");
            let checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = category;
            checkbox.name = category;
            checkbox.className = "styled-checkbox";  // 追加
            
            let label = document.createElement("label");
            label.htmlFor = category;
            label.appendChild(document.createTextNode(category));

            checkboxWrapper.appendChild(checkbox);
            checkboxWrapper.appendChild(label);
            checkboxContainer.appendChild(checkboxWrapper); // checkboxWrapperを直接checkboxContainerに追加

            // チェックボックスが変更された場合に実行
            checkbox.addEventListener('change', function() {
                let selectedCategories = [];
                let checkboxes = document.querySelectorAll('#' + tableId + '-checkboxes input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    if(checkbox.checked) {
                        selectedCategories.push(checkbox.name);
                    }
                });
                searchDB(selectedCategories);
            });
        });
    }


    // Fetch links and store collections
    fetchLinks();
    fetchAndStoreStatus();
    fetchAndStoreDB();

    let dbData = [];

    // Get the quantity table element
    let quantityTable = document.getElementById('quantity-table');

    // Hide the quantity table initially
    quantityTable.style.display = 'none';

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
    
        // Convert quantities to array
        let quantitiesArray = Object.entries(quantities);
        // Get No.MT values from localStorage
        let mtNumbers = JSON.parse(localStorage.getItem("MTNumbers"));
    
        // Sort by "No.MT" in ascending order
        quantitiesArray.sort((a, b) => mtNumbers[a[0]] - mtNumbers[b[0]]);
    
        // Add table rows
        for (let [material, quantity] of quantitiesArray) {
            let tr = document.createElement("tr");
    
            let materialTd = document.createElement("td");
            materialTd.textContent = material;
            tr.appendChild(materialTd);
    
            let quantityTd = document.createElement("td");
            quantityTd.textContent = quantity;
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
                createCheckboxes('status-table');
                createDropdown('status-table', "防具分類");
                document.getElementById('status-table-dropdown').addEventListener('change', filterTable);
            } else {
                console.error("Unable to find an element with the id 'status-table' in the DOM");
            }
        }
    })

    function createTable(data, type, tableId) {
        let table = document.getElementById(tableId);
        let headers;
        if(type === 'STATUS'){
            headers = ["防具分類", "防具", "Lv", "強化済"];
        } else if(type === 'DB') {
            headers = ["防具分類", "防具", "Lv", "必要素材", "必要数量"];
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
            th.textContent =header;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        // Add table rows
        data.forEach(row => {
            let tr = document.createElement("tr");
            headers.forEach(header => {
                let td = document.createElement("td");
                if (header === '強化済' && type === 'STATUS') {
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.checked = row[header];
                    checkbox.id = row['防具Lv'].toString();
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

    function searchDB(categories) {
        let dbData = JSON.parse(localStorage.getItem('DB'));
        let statusData = JSON.parse(localStorage.getItem('STATUS'));
        let searchData = [];
    
        // Define the fields to be included in the search
        let searchFields = ["防具分類"];
    
        dbData.forEach(data => {
            // Only look at items that have not been enhanced
            if (statusData.some(status => status['防具Lv'] === data['防具Lv'] && status['強化済'] === 0)) {
                // Check if each category is included in the searchFields of the document
                let isAnyCategoryIncluded = categories.some(cat => {
                    return searchFields.some(field => data[field].toString() === cat);
                });
    
                // If any category is included, add the document to searchData
                if (isAnyCategoryIncluded) {
                    searchData.push(data);
                }
            }
        });
    
        // Sort the data by the 'No.MT' field in ascending order
        searchData.sort((a, b) => a["No."] - b["No."]);
    
        // Create a table with the search results
        createTable(searchData, 'DB', 'search-results-table');
    
        // Create a quantity table based on the search results
        let quantities = aggregateMaterialQuantities(searchData);
    
        // Get the quantity table element
        let quantityTable = document.getElementById('quantity-table');
    
        // If no category is selected, hide the quantity table
        if (categories.length === 0) {
            quantityTable.style.display = 'none';
        } else {
            quantityTable.style.display = 'table';
            createQuantityTable(quantities, 'quantity-table');
        }
    }
    
    // Add event listener to search input field
    document.getElementById('searchInput').addEventListener('input', function(e) {
        searchDB(e.target.value);
    });

    // Event Listener for Save button
    document.getElementById('saveBtn').addEventListener('click', function() {
        let checkboxes = document.querySelectorAll('#status-table input[type="checkbox"]');
        let statusData = JSON.parse(localStorage.getItem('STATUS'));

        checkboxes.forEach(cb => {
            let index = statusData.findIndex(row => row['防具Lv'].toString() === cb.id);
            if (index > -1) {
                statusData[index]['強化済'] = cb.checked ? 1 : 0;
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
            row['強化済'] = 0;
        });

        localStorage.setItem('STATUS', JSON.stringify(statusData));
        location.reload();
    });
});