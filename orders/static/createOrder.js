async function changeOrderView(orderID){
    console.log(orderID)
    const response = await fetch('changeOrderView/', {
        method: 'POST',
        body: orderID
    });
    if (response.status == 200){
        let newHTML = await response.text();
        document.getElementById("orderContainer").innerHTML = newHTML;
    } else{
        alert("Some error in chaning order view");
    }
}

async function updateOrder(data) {
    data.preventDefault();
    const formData = new FormData(data.target);
    const formDataObj = {};
    for (const pair of formData.entries()) {
        if(pair[0] == "order_id"){pair[1] = parseInt(pair[1])}
        formDataObj[pair[0]] = pair[1];
    }

    const response = await fetch('updateOrder/', {
        method: 'POST',
        body: JSON.stringify(formDataObj)
    });
    if (response.status == 200){
        alert("Saved")
    } else{
        alert("Some error in chaning order view");
    }
}

function checkID(oldid,id){
    fetch('checkID/', {
        method: 'POST',
        body: id
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Value does not exist")
        document.getElementById("order-"+oldid).value = oldid;
    });
}


var typeList = {
    "4mm":0.968,
    "5mm":1.21,
    "6mm":1.45,
    "8mm":1.93,
    "10mm":2.42,
    "12mm":2.90,
    "15mm":3.63,
    "19mm":4.60
}

function addType(id){
    const last_element = document.getElementById("order_field").querySelector("div .flicker_top:last-of-type");

    let count;
    if (last_element === null) {
        count = 1;
    } else{
        count = Number(last_element.id) + 1;
    }

    const createButton = document.getElementById("glass_type");
    
    const fieldset = document.createElement("div");
    fieldset.setAttribute("id",count);
    fieldset.classList.add("flicker_top");

    if (id == "glass_type") {
        fieldset.innerHTML = `
        <div class="divRow">
            <select name="thickness" id="thickness-${count}" style="visibility: hidden;" disabled>
                <option disabled selected value> -- -- </option>
                ${Object.entries(typeList).map((item) => `
                    <option value="${item[0]}">${item[0]}</option>
                `).join('')}
            </select>
            <input class="form label" placeholder="Discription:" disabled>
            <input class="form small label" placeholder="Rate:" style="width: 40px;" disabled>
            <input class="form label" placeholder="Chrg:" style="width: 40px;" disabled>

            <select name="unit" id="unit-${count}" style="visibility: hidden;" disabled>
                <option value="mm" selected>mm</option>
                <option value="inch">inch</option>
            </select>
        </div>
        <div class="divRow">
            <select name="thickness" id="thickness-${count}" required>
                <option disabled selected value> -- -- </option>
                ${Object.entries(typeList).map((item) => `
                    <option value="${item[0]}">${item[0]}</option>
                `).join('')}
            </select>
            <input class="form" name="description" placeholder="Discription">
            <input class="form small" type="number" name="defaultRate" title="Rate" onchange="setRate(${count})" 
            placeholder="Rate" id="defaultRate-${count}" min="1" style="width: 40px;" value="10">

            <input class="form" type="number" name="defaultChargeable" id="chargeable-${count}" onchange="setChargeableSize(${count})" 
            placeholder="Chrg" min=0 style="width: 40px;" title="Chargeable Rate" value="10">

            <select name="unit" id="unit-${count}">
                <option value="mm" selected>mm</option>
                <option value="inch">inch</option>
            </select>

            <span class="close un-selectable" title="${count}" id="remove-${count}"
            onclick="deleteRow(this.title)">&times;</span>
        </div>
        
        <br>

        <div class="divRow head">
            <input class="form small label" placeholder="Height" disabled></input>
            <input class="form small label" placeholder="Width" disabled></input>
            <input class="form small label" placeholder="Chg/Ht" disabled></input>
            <input class="form small label" placeholder="Chg/Wh" disabled></input>
            <input class="form small label" placeholder="Quantity" disabled></input>
            <input class="form small label" placeholder="Rate" disabled></input>
            <input class="form small label" placeholder="Amount" disabled></input>
        </div>
        <button type="button" id="add-${count}" value="${count}"
        onclick="addNew(this.id,this.value)" style="margin:auto;display:block;">addNew</button>
        `;
    } else if (id == "custom_charge"){
        fieldset.innerHTML = `
            <div class="divRow">
                <input name="custom" hidden></input>
                <input class="form" name="description" placeholder="Discription">
                <input class="form small" style="visibility: hidden;">
                <input class="form small" style="visibility: hidden;">

                <input class="form small" type="number" name="quantity" id="cust-quantity-${count}" placeholder="Quantity">
                <input class="form small" type="number" name="rate" id="rate-${count}" 
                onchange="calculateCustomAmount(${count})" placeholder="Rate">

                <input class="form small" type="number" name="amount" id="amount-${count}" placeholder="Amount">
                <span class="close un-selectable" title="${count}" id="remove-${count}"
                onclick="deleteRow(this.title)">&times;</span>
            </div>
        `;
    }
    document.getElementById("order_field").insertBefore(fieldset,createButton);
}

function importImage(fileTag){
    if (fileTag.files && fileTag.files[0]) {
        var reader = new FileReader();
        reader.readAsDataURL(fileTag.files[0])
        reader.addEventListener('load', (e) => {
            const data = e.target.result;
            console.log(document.getElementById("img").title)
            saveCanvas(document.getElementById("img").title,data)
        });
      }
}

var miscArray = {
    "Hole:":["hole",40],
    "Big Hole:":["bighole",40],
    "C.S.K Hole:":["cskhole",100],
    "Cutout:":["cutout",125],
    "Big Cutout:":["bigcutout",125],
};

function addNew(addButton_id, fieldset_id){
    if (
        document.getElementById("unit-"+fieldset_id).value === 'mm'
        && document.getElementById("chargeable-"+fieldset_id).value === ""
        || document.getElementById("defaultRate-"+fieldset_id).value === ""
    ){
        console.log("Error promp!"+"This Error")
        return
    }

    if (
        document.getElementById("unit-"+fieldset_id).value === 'inch'
        && document.getElementById("defaultRate-"+fieldset_id).value === ""
    ){
        console.log("Error promp!")
        return
    }

    const fieldset = document.getElementById(fieldset_id);

    const last_element = fieldset.querySelector("div .flicker:last-of-type");
    let number_count;
    if (last_element === null) {
        number_count = 1;
    } else{
        number_count = Number(last_element.id.split("-")[1]) + 1;
    }

    // number_count += 1;
    const addnewButton = document.getElementById(addButton_id);

    const order_div = document.createElement("div");
    order_div.setAttribute("id",fieldset_id+"-"+number_count);

    order_div.classList.add("divRow");
    order_div.classList.add("size");
    order_div.classList.add("flicker");
    
    const unit = document.getElementById("unit-"+fieldset_id).value;
    if (unit == "mm") {
        order_div.innerHTML = `
        <input class="form small" type="number" name="height" id="height-${fieldset_id}-${number_count}" min=1 
        onchange="calculateChargeableSize('${fieldset_id}-${number_count}',${fieldset_id})" placeholder="Height" required>
        
        <input class="form small" type="number" name="width" id="width-${fieldset_id}-${number_count}" min=1 
        onchange="calculateChargeableSize('${fieldset_id}-${number_count}',${fieldset_id})" placeholder="Width" required>

        <input class="form small" type="value" name="chargeable-height" id="chargeable-height-${fieldset_id}-${number_count}" 
        tabindex="-1" placeholder="Chrg/Height" readonly>

        <input class="form small" type="number" name="chargeable-width" id="chargeable-width-${fieldset_id}-${number_count}" 
        tabindex="-1" placeholder="Chrg/Width" readonly>

        <input class="form small" type="number" name="quantity" id="quantity-${fieldset_id}-${number_count}" min=1 
        onchange="calculateAmount('${fieldset_id}-${number_count}',${fieldset_id})" placeholder="Quantity" required>

        <input class="form small" type="number" name="rate" id="rate-${fieldset_id}-${number_count}" 
        placeholder="Rate" value="${document.getElementById(`defaultRate-${fieldset_id}`).value}" readonly>

        <input class="form small" type="number" name="amount" id="amount-${fieldset_id}-${number_count}" placeholder="Amount" readonly>

        <span class="close un-selectable" title="${fieldset_id}-${number_count}" id="remove-${fieldset_id}-${number_count}" 
        onclick="deleteRow(this.title)">&times;</span>

        <span class="collapsible un-selectable" title="${fieldset_id}-${number_count}" id="collapse-${fieldset_id}-${number_count}" onclick="collapse(this.title)">&#43;</span>

        ${Object.entries(miscArray).map((item) => `
            <div class="divRow" style="display:none;" id="${item[1][0]}-${fieldset_id}-${number_count}">
                <input class="form small" style="visibility: hidden;">
                <input class="form small" style="visibility: hidden;">
                <input class="form small" style="visibility: hidden;">

                <input class="form small label" tabindex="-1" name="${item[1][0]}" id="${item[1][0]}-label" style="text-align:right;" 
                placeholder="${item[0]}" disabled></input>

                <input class="form small" type="number" name="quantity" id="${item[1][0]}-quantity-${fieldset_id}-${number_count}" min=1 
                onchange="calculateMiscAmount(this.id)" placeholder="Quantity" disabled>

                <input class="form small" type="number" name="rate" id="${item[1][0]}-rate-${fieldset_id}-${number_count}" 
                value="${item[1][1]}" placeholder="Rate" readonly disabled>

                <input class="form small" type="number" name="amount" id="${item[1][0]}-amount-${fieldset_id}-${number_count}" 
                placeholder="Amount" readonly disabled>
            </div>
            `).join('')}

        <div class="divRow content" id="collapse_content-${fieldset_id}-${number_count}">
            ${Object.entries(miscArray).map((item) => `
            <label for="hole">${item[0]}
                <input type="checkbox" id="${item[1][0]}-${fieldset_id}-${number_count}" onchange="show_hide(this.id);collapse('${fieldset_id}-${number_count}')">
            </label>
            `).join('')}
        </div>
        `;
    } else if (unit == "inch"){
        order_div.innerHTML = `
        <input class="form small" type="number" name="height" id="height-${fieldset_id}-${number_count}" 
        step="any" min="1" placeholder="Height" required>

        <input class="form small" type="number" name="width" id="width-${fieldset_id}-${number_count}" 
        step="any" min="1" placeholder="Width" required>
        
        <input class="form small" style="visibility: hidden;">
        <input class="form small" style="visibility: hidden;">

        <input class="form small" type="number" name="quantity" id="quantity-${fieldset_id}-${number_count}" 
        onchange="calculateAmount('${fieldset_id}-${number_count}',${fieldset_id})" placeholder="Quantity" required>

        <input class="form small" type="number" name="rate" id="rate-${fieldset_id}-${number_count}" 
        placeholder="Rate" value="${document.getElementById(`defaultRate-${fieldset_id}`).value}" readonly>

        <input class="form small" type="number" name="amount" id="amount-${fieldset_id}-${number_count}" placeholder="Amount" readonly>

        <span class="close un-selectable" title="${fieldset_id}-${number_count}" id="remove-${fieldset_id}-${number_count}" 
        onclick="deleteRow(this.title)">&times;</span>
        `;
    }

    fieldset.insertBefore(order_div,addnewButton);
}

function calculateChargeableSize(id,superID) {
    const defaultChargeable = Number(document.getElementById("chargeable-"+superID).value);
    const height = document.getElementById("height-"+id);
    const width = document.getElementById("width-"+id);

    if (height.value != "" && checkMin(height) === true) {
        document.getElementById("chargeable-height-"+id).value =  defaultChargeable + Number(height.value);
    }
    if (width.value != "" && checkMin(width) === true) {
        document.getElementById("chargeable-width-"+id).value = defaultChargeable + Number(width.value);
    }
    
}

function calculateAmount(id,superID) {
    const rate = Number(document.getElementById("rate-"+id).value);
    const quantity = document.getElementById("quantity-"+id);
    
    if (!checkMin(quantity)) {
        return
    }
    if (document.getElementById("unit-"+superID).value === 'mm'){
        // (((height*width)/1000)/1000) * 10.764 * qty = rft
        // rft * rate = amount
        const height = Number(document.getElementById("chargeable-height-"+id).value);
        const width = Number(document.getElementById("chargeable-width-"+id).value);
        if (height != 0 && width != 0) {
            let rft = (((height * width)/1000)/1000) * 10.764 * Number(quantity.value);
            let amount = Math.round(rft * rate);
            document.getElementById("amount-"+id).value = amount;
        } else{
            console.log("Error promp!");
        }
    } else if (document.getElementById("unit-"+superID).value === 'inch') {
        // (height * width)/144 * qty = rft
        // rft * rate = amount
        const height = Number(document.getElementById("height-"+id).value);
        const width = Number(document.getElementById("width-"+id).value);
        if (height != 0 && width != 0) {
            let rft = (height * width)/144 * Number(quantity.value);
            let amount = Math.round(rft * rate);
            document.getElementById("amount-"+id).value = amount;
        } else{
            console.log("Error promp!");
        }
    } else {
        console.log("Bruh how tf did you manage to get this error pls man pls go to sleep mf");
    }
    calculateTotalQuantity();
    calculateTotalAmount();
}

function calculateTotalQuantity() {
    let sum = Number(0);
    document.querySelectorAll("[id^='quantity-']").forEach(element =>{
        sum += Number(element.value);
    });
    document.getElementById("total_quantity").value = sum;
}

function calculateTotalAmount() {
    let sum = Number(0);
    document.querySelectorAll("[id*='amount-']").forEach(element =>{
        sum += Number(element.value);
    });
    document.getElementById("total_amount").value = sum;
}

function calculateCustomAmount(id) {
    let quantity = Number(document.getElementById("cust-quantity-"+id).value);
    let rate = Number(document.getElementById("rate-"+id).value);
    document.getElementById("amount-"+id).value = quantity * rate;
    calculateTotalAmount();
}

function calculateMiscAmount(id) {
    ids = id.split("-");
    let quantity = Number(document.getElementById(`${ids[0]}-quantity-${ids[2]}-${ids[3]}`).value);
    let rate = Number(document.getElementById(`${ids[0]}-rate-${ids[2]}-${ids[3]}`).value);
    document.getElementById(`${ids[0]}-amount-${ids[2]}-${ids[3]}`).value = quantity * rate;
    calculateTotalAmount();
}

function setRate(id) {
    if (!checkMin(document.getElementById("defaultRate-"+id))) {
        return
    }
    const dRate = Number(document.getElementById("defaultRate-"+id).value);
    document.querySelectorAll("[id^='rate-"+id+"']").forEach(element =>{
        element.value = dRate;
        ids = element.id.split("-");
        calculateAmount(ids[1]+"-"+ids[2],ids[1]);
    });
}

function setChargeableSize(id) {
    if (!checkMin(document.getElementById("chargeable-"+id))) {
        return
    }
    document.querySelectorAll("[id^='chargeable-height-"+id+"']").forEach(element =>{
        ids = element.id.split("-");
        calculateChargeableSize(ids[2]+"-"+ids[3],ids[2]);
        calculateAmount(ids[2]+"-"+ids[3],ids[2]) 
    });
}

function checkRange(element) {
    if (element.value > element.min && element.value < element.max) {
        return true;
    } else {
        console.log("Error promp!");
        element.value = "";
        return false;
    }
}

function checkMin(element) {
    if (element.value >= element.min) {
        return true;
    } else {
        console.log("Error promp!");
        element.value = "";
        return false;
    }
}

function deleteRow(id){
    document.getElementById(id).remove();
    calculateTotalQuantity();
    calculateTotalAmount();
}

function changeTotalQuantity(){
    const totalQty = document.getElementById("total_quantity");
    var elms = document.querySelectorAll("[id^='quantity-']");
    let sum = 0;
    for(var i = 0; i < elms.length; i++)
        sum = sum + Number(elms[i].value)
    totalQty.value = sum
}

function deleteType(data){
    document.getElementById(data).remove();
}

async function submitForm(data){
    data.preventDefault();
    const formData = new FormData(data.target);
    const formJson = {}
    var appendTo = "main"
    var thicknessCount = -1
    var customCount = -1

    for (const pair of formData.entries()) {
        if (pair[0] === "thickness"){
            if (thicknessCount == -1){
                formJson[pair[0]] = {}
            }
            var sizeCount = -1
            appendTo = "thickness"
            thicknessCount += 1
            formJson[pair[0]][thicknessCount] = {}
        } else if(pair[0] === "height"){
            if (sizeCount == -1){
                formJson["thickness"][thicknessCount]["sizes"] = {}
            }
            appendTo = "sizes"
            sizeCount += 1
            formJson["thickness"][thicknessCount]["sizes"][sizeCount] = {}
        } else if(pair[0] === "hole" || pair[0] === "bighole" || pair[0] === "cskhole" 
                    || pair[0] === "cutout" || pair[0] === "bigcutout"){
            appendTo = "misc"
            var currMisc = pair[0]
            formJson["thickness"][thicknessCount]["sizes"][sizeCount][pair[0]] = {}
            continue
        } else if(pair[0] === "image"){
            appendTo = "image"
            if (!formJson[pair[0]])
                formJson[pair[0]] = []
            formJson[pair[0]].push(pair[1])
        } else if(pair[0] === "custom"){
            if (customCount == -1){
                formJson[pair[0]] = {}
            }
            appendTo = "custom"
            customCount += 1
            formJson[pair[0]][customCount] = {}
            continue
        } else if(pair[0] === "total_quantity"){
            appendTo = "main"
            formJson[pair[0]] = pair[1]
        }

        switch (appendTo) {
            case "main":
                // if (pair[0] === "bill_id")
                //     formJson[pair[0]] = Number(pair[1])
                // else
                //     formJson[pair[0]] = pair[1]
                formJson[pair[0]] = pair[1]
                break;
            case "thickness":
                formJson["thickness"][thicknessCount][pair[0]] = pair[1]
                break;
            case "sizes":
                formJson["thickness"][thicknessCount]["sizes"][sizeCount][pair[0]] = pair[1]
                break;
            case "misc":
                formJson["thickness"][thicknessCount]["sizes"][sizeCount][currMisc][pair[0]] = pair[1]
                break;
            case "custom":
                formJson["custom"][customCount][pair[0]] = pair[1]
                break;
            default:
                break;
        }
    }
    console.log(formJson);
    const response = await fetch('/saveOrder/', {
        method: 'POST',
        body: JSON.stringify(formJson)
    });
    if (response.status == 200){
        alert("Saved")
    } else{
        alert("Some error in saving form");
    }
}

function collapse(id){
    thisTag = document.getElementById("collapse-"+id);
    if (thisTag.innerHTML == '+'){
        thisTag.innerHTML = "&#8722";;
    } else{
        thisTag.innerHTML = "&#43;";
    }
    var content = document.getElementById("collapse_content-"+thisTag.title);
    if (content.style.maxHeight){
    content.style.maxHeight = null;
    } else {
    content.style.maxHeight = content.scrollHeight + "px";
    }
}

var imgmodal = document.getElementById("myImg");

function openDisplay(src){
    imgmodal.style.display = "block";
    document.getElementById("displayImage").src = src;
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == imgmodal) {
        imgmodal.style.display = "none";
    }
}

function show_hide(id){
    elm = document.getElementById(id);
    document.getElementById(id).querySelectorAll("*[type='number']").forEach(element => {
        element.disabled = element.disabled ? false : true
    });
    if (elm.style.display == "none")
        elm.style.display = "block";
    else
        elm.style.display = "none";
}

function saveImage(imgURl){

    var addImage = document.getElementById("thumbnails");

    img = document.createElement("img");
    img.setAttribute("src",imgURl);
    img.setAttribute("alt","error");
    img.classList.add("thumbnail")
    img.classList.add("flicker");

    img.setAttribute("onclick","openDisplay(this.src)");

    hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("name","image");
    hiddenInput.setAttribute("value",imgURl);
    hiddenInput.setAttribute("hidden",true);
    img.appendChild(hiddenInput)

    addImage.appendChild(img);

}

var dropZone = document.getElementById('dropZone');

// Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
dropZone.addEventListener('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
});

// Get file data on drop
dropZone.addEventListener('drop', function(e) {
    e.stopPropagation();
    e.preventDefault();
    var files = e.dataTransfer.files; // Array of all files

    for (var i=0, file; file=files[i]; i++) {
        if (file.type.match(/image.*/)) {
            var reader = new FileReader();

            reader.onload = function(e2) {
                saveImage(e2.target.result);
            }

            reader.readAsDataURL(file); // start reading the file data.
        }
    }
});

