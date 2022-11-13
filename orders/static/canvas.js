const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Canvas history and undo/redo buttons
class canvasHistroy{
    constructor(maxsize){
        this.maxsize = maxsize;
        this.sessionArray = [];
        this.current_session = -1;
    }
    saveSession(){
        if (this.sessionArray.length >= this.maxsize){
            this.sessionArray.shift();
            this.current_session -= 1;
        }

        if (this.current_session != -1){
            if(this.current_session != this.sessionArray.length - 1){
                while (this.current_session != this.sessionArray.length - 1){
                    this.sessionArray.pop();
                }
            }
        }
            
        this.sessionArray[this.current_session+1] = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.current_session += 1;
    }
    undoButton(){
        if (this.current_session > 0){
            ctx.putImageData(this.sessionArray[this.current_session-1], 0, 0);
            this.current_session -= 1;
        }
    }
    redoButton(){
        if (this.current_session < this.maxsize-1){
            ctx.putImageData(this.sessionArray[this.current_session+1], 0, 0);
            this.current_session += 1;
        }
    }
}
const history = new canvasHistroy(10);
history.saveSession();

const quadrants = ["bottom-left", "top-left", "top-right", "bottom-right"];
let current_quadrant = "";
let quad_count = 0;



class canvasClass{
    constructor(){
        // Canvas initialize variables
        this.height = canvas.height;
        this.width = canvas.width;
        this.curX = this.curY = this.prevX = this.prevY = null;
        this.hold = false;
        this.img = null;
        ctx.lineWidth = 2;
    }
    draw(){
        const name = () =>{
            console.log(this.height);
        }

        ctx.strokeStyle = "#000000";
        let s, a;
        if (document.getElementById("draw").checked) {
            canvas.onmousedown = function (e){
                this.curX = e.clientX - canvas.getBoundingClientRect().left;
                this.curY = e.clientY - canvas.getBoundingClientRect().top;
                this.hold = true;
                ctx.beginPath();
                ctx.moveTo(this.curX, this.curY);
            };
            canvas.onmousemove = function (e){
                if(this.hold){
                    this.curX = e.clientX - canvas.getBoundingClientRect().left;
                    this.curY = e.clientY - canvas.getBoundingClientRect().top;
                    draw(this.curX,this.curY);
                }
            };
            canvas.onmouseup = function (e){
                this.hold = false;
                history.saveSession();
            };
            canvas.onmouseout = function (e){
                this.hold = false;
            };
            function draw(curX,curY){
                ctx.lineTo(curX, curY);
                ctx.stroke();
            }
        } else if (document.getElementById("line").checked) {
            canvas.onmousedown = function (e){
                this.img = ctx.getImageData(0, 0, this.width, this.height);
                this.prevX = e.clientX - canvas.getBoundingClientRect().left;
                this.prevY = e.clientY - canvas.getBoundingClientRect().top;
                this.hold = true;
            };
            canvas.onmousemove = function (e){
                if (this.hold){
                    ctx.putImageData(this.img, 0, 0);
                    this.curX = e.clientX - canvas.getBoundingClientRect().left;
                    this.curY = e.clientY - canvas.getBoundingClientRect().top;
                    ctx.beginPath();
                    ctx.moveTo(this.prevX, this.prevY);
                    ctx.lineTo(this.curX, this.curY);
                    ctx.stroke();
                    ctx.closePath();
                }
            };
            canvas.onmouseup = function (e){
                this.hold = false;
                history.saveSession();
            };
            canvas.onmouseout = function (e){
                this.hold = false;
            };
        } else if (document.getElementById("rectangle").checked) {
            canvas.onmousedown = function (e){
                this.img = ctx.getImageData(0, 0, this.width, this.height);
                this.prevX = e.clientX - canvas.getBoundingClientRect().left;
                this.prevY = e.clientY - canvas.getBoundingClientRect().top;
                this.hold = true;
            };
            canvas.onmousemove = function (e){
                if (this.hold){
                    ctx.putImageData(this.img, 0, 0);
                    this.curX = e.clientX - canvas.getBoundingClientRect().left - this.prevX;
                    this.curY = e.clientY - canvas.getBoundingClientRect().top - this.prevY;
                    ctx.strokeRect(this.prevX, this.prevY, this.curX, this.curY);
                }
            };
            canvas.onmouseup = function (e){
                this.hold = false;
                history.saveSession();
            };
            canvas.onmouseout = function (e){
                this.hold = false;
            };
        } else if (document.getElementById("circle").checked) {
            canvas.onmousedown = function (e){
                this.img = ctx.getImageData(0, 0, this.width, this.height);
                this.prevX = e.clientX - canvas.getBoundingClientRect().left;
                this.prevY = e.clientY - canvas.getBoundingClientRect().top;
                this.hold = true;
            };    
            canvas.onmousemove = function (e){
                if (this.hold){
                    ctx.putImageData(this.img, 0, 0);
                    this.curX = e.clientX - canvas.getBoundingClientRect().left;
                    this.curY = e.clientY - canvas.getBoundingClientRect().top;
                    ctx.beginPath();
                    ctx.arc(Math.abs(this.curX + this.prevX)/2, Math.abs(this.curY + this.prevY)/2, 
                        Math.sqrt(Math.pow(this.curX - this.prevX, 2) + Math.pow(this.curY - this.prevY, 2))/2, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.stroke();
                }
            };
            canvas.onmouseup = function (e){
                this.hold = false;
                history.saveSession();
            }; 
            canvas.onmouseout = function (e){
                this.hold = false;
            };
        } else if (document.getElementById("text").checked) {
            canvas.onmousedown = function (e){
                this.curX = e.clientX - canvas.getBoundingClientRect().left;
                this.curY = e.clientY - canvas.getBoundingClientRect().top;
                console.log(this.curX, this.curY);
                let value = prompt("Enter Text", "haha");
                ctx.font = "20px Arial";
                ctx.fillText(value, this.curX, this.curY);
                history.saveSession();
            };
        } else if (document.getElementById("erase").checked) {
            canvas.onmousedown = function (e){
                this.curX = e.clientX - canvas.getBoundingClientRect().left;
                this.curY = e.clientY - canvas.getBoundingClientRect().top;
                this.hold = true;
                this.prevX = this.curX;
                this.prevY = this.curY;
                ctx.beginPath();
                ctx.moveTo(this.prevX, this.prevY);
            };
            canvas.onmousemove = function (e){
                if(this.hold){
                    this.curX = e.clientX - canvas.getBoundingClientRect().left;
                    this.curY = e.clientY - canvas.getBoundingClientRect().top;
                    draw(this.curX,this.curY);
                }
            };
            canvas.onmouseup = function (e){
                this.hold = false;
                history.saveSession();
            };
            canvas.onmouseout = function (e){
                this.hold = false;
            };
            function draw (curX, curY){
                ctx.lineTo(curX, curY);
                ctx.strokeStyle = "#ffffff";
                ctx.stroke();
            }
        } else if (document.getElementById("arc").checked) {
            canvas.onmousedown = function (e){
                this.img = ctx.getImageData(0, 0, this.width, this.height);
                this.prevX = e.clientX - canvas.getBoundingClientRect().left;
                this.prevY = e.clientY - canvas.getBoundingClientRect().top;
                this.hold = true;
            };
            canvas.onmousemove = function (e){
                if (this.hold){
                    ctx.putImageData(this.img, 0, 0);
                    this.curX = e.clientX - canvas.getBoundingClientRect().left;
                    this.curY = e.clientY - canvas.getBoundingClientRect().top;
                    switch (current_quadrant) {
                        case "bottom-left":
                            s = Math.PI * 1.5, a = 0;
                            break;
                        case "top-left":
                            s = 0, a = Math.PI * 0.5;
                            break;
                        case "top-right":
                            s = Math.PI * 0.5, a = Math.PI * 1;
                            break;
                        case "bottom-right":
                            s = Math.PI * 1, a = Math.PI * 1.5;
                            break;
                        default:
                            console.log("error in arc")
                            break;
                    }
                    ctx.beginPath();
                    ctx.arc(Math.abs(this.curX + this.prevX)/2, Math.abs(this.curY + this.prevY)/2,
                        Math.sqrt(Math.pow(this.curX - this.prevX, 2) + Math.pow(this.curY - this.prevY, 2))/2,s , a, false);
                    ctx.stroke();
                }
            };
            canvas.onmouseup = function (e){
                this.hold = false;
                history.saveSession();
            }; 
            canvas.onmouseout = function (e){
                // this.hold = false;
            };
        }
    }

    clearCanvas(){
        ctx.clearRect(0, 0, this.width, this.height);
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, this.width, this.height);
    }

    add_pixel(value){
        ctx.lineWidth = value;
    }

    change(id){
        if (document.getElementById("arc").checked){
            if (quad_count >= quadrants.length)
                quad_count = 0;
            current_quadrant = quadrants[quad_count];
            document.getElementById(id).className = current_quadrant;
            quad_count += 1;
        }
    }
}

var myCanvas = new canvasClass;

var modal = document.getElementById("myModal");
var span = document.getElementById("canvasClose");

function showCanvas(value){
    modal.style.display = "block";
    document.getElementById("canvasSaveButton").value = value;
}
// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if ((event.target == modal)) {
        modal.style.display = "none";
        imgmodal.style.display = "none";
    }
}



async function saveCanvas(value, imgURl){
    if (typeof imgURl == 'undefined'){
        console.log(value)
        imgURl = canvas.toDataURL();
    } else {
        console.log(value);
    }
    var addImage = document.getElementById("thumbnails-"+value);

    img = document.createElement("img");
    img.setAttribute("src",imgURl);
    img.setAttribute("alt","error");
    img.setAttribute("class","thumbnail");
    img.setAttribute("onclick","openDisplay(this.src)");

    hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("name","image");
    hiddenInput.setAttribute("value",imgURl);
    hiddenInput.setAttribute("hidden",true);
    img.appendChild(hiddenInput)

    addImage.appendChild(img);

    imgData = document.createElement("input");

    await new Promise(r => setTimeout(r, 100));

    var content = document.getElementById("collapse_content-"+value);
    content.style.maxHeight = content.scrollHeight + "px";
}