//Declaring a global variable which will be created in main function
var app = null;
var selectedColor = "none";
var numshownpic = 32;
var errorList = {
    color: "Atenção: Já tenho cor... mas não sei o que procurar :(",
    category: "Atenção: Não sei por onde deva começar... tenta escrever qualquer coisa!",
    noWord: "Erro: Não tenho essa palava na minha base de dados, tenta usar outra!"
};
var canvas = document.getElementById("hidden");

/**
 *
 * @param {boolean} bool Value that determines if there's need to load LocalStorage or not
 */
function main(bool) {
    //Creating the instance of the application
    app = new ISearchEngine("xml/Image_database.xml", bool);

    // Initializing the app
    app.init(canvas);

    console.log("Project Initiated");
}

//Function that generates an artificial image and draw it in canvas
//Useful to test the image processing algorithms
function Generate_Image(canvas) {
    var ctx = canvas.getContext("2d");
    var imgData = ctx.createImageData(100, 100);

    for (var i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i + 0] = 204;
        imgData.data[i + 1] = 0;
        imgData.data[i + 2] = 0;
        imgData.data[i + 3] = 255;
        if ((i >= 8000 && i < 8400) || (i >= 16000 && i < 16400) || (i >= 24000 && i < 24400) || (i >= 32000 && i < 32400)) imgData.data[i + 1] = 200;
    }
    ctx.putImageData(imgData, 150, 0);
    return imgData;
}


/**
 * Função de controlo para display no browser
 * @param {boolean} True    - Move toda a informação para cima
 * @param {boolean} False   - Move toda a informação para Baixo
 */
function hasSearch(bool) {
    clearContent("results");
    if (bool) { // Go UP
        moveSearchBar(true);
    } else { // Go Down
        moveSearchBar(false);
    }
}

/**
 * Função que determina a animação do display da informação.
 * @param bool: True, sobe as barras. False, desce as barras
 */

function moveSearchBar(bool) {
    let place = document.getElementById("searchContent");
    let resultPlace = document.getElementById("resultsHolder");
    if (bool) {
        place.classList.add("container-middle-top");
        resultPlace.style.display = "block";
    } else {
        place.classList.remove("container-middle-top");
        resultPlace.style.display = "none";
    }
}

/**
 * Função que limpa as imagens actualmente a serem mostradas.
 * @param {string} place    ID to Clear
 */

function clearContent(place) {
    let node = document.getElementById(place);
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

/**
 * Função que retorna um valor no campo de procura, caso não existe retorna FALSE.
 * @returns {string|boolean}
 */

function getSearchValue() {
    let value = document.getElementById("searchValue").value.trim().toLocaleLowerCase();
    if (value.length > 0) {
        return value;
    } else {
        return false;
    }
}


/**
 * Função que recebe um array com imagens e mostra-as na "tela"
 * @param {array} values    Valores de Entrada
 * @param {boolean} type    True - Procura Por LocalStorage, False - Procura Por XML
 */
function displayResults(values, type) {
    let toPlace = document.getElementById("results");
    let controlImagesShown = (values.length < numshownpic) ? values.length : numshownpic;
    for (let i = 0; i < controlImagesShown; i++) {
        let fDiv = createFDiv();
        let image = document.createElement("img");
        image.src = (type === true) ? values[i].children[0].innerHTML : values[Math.floor(Math.random() * values.length)];
        image.id = "img" + i;
        fDiv.appendChild(image)
        toPlace.appendChild(fDiv);
    }
}

function createFDiv() {
    let p = document.createElement("div");
    p.classList.add("crop");
    p.classList.add("flex-fill");
    return p;
}


function displayRandom() {
    let toPlace = document.getElementById("resultsRandom");
    let idxused = [];
    for(let i = 0; i < 5; i++) {
        let rDiv = document.createElement("div");
        rDiv.classList.add("result");
        rDiv.classList.add("shadow");
        let image = document.createElement("img");
        let idxCat = Math.floor(Math.random() * this.categories.length);
        let cat = this.categories[idxCat];
        let img = app.searchKeywords(cat);
        let control = true;
        let idx = -1;
        while(control) {
            idx = Math.floor(Math.random() * img.length);
            let controlFinal = true;
            for(let c = 0; c < idxused.length; c++) {
                if(idxused[c] === idx) {
                    controlFinal = false;
                    break;
                }
            }
            if(controlFinal) {
                idxused.push(idx);
                control = false;
            }
        }
        image.src = img[idx];
        image.id = img[idx];
        image.onclick = function() {
            let vals = app.searchISimilarity(image.id, "Manhattan");
            hasSearch(true);
            displayResults(vals, false);
            $('#examplePic').modal('hide');
            clearContent("resultsRandom");
        }
        rDiv.appendChild(image);
        toPlace.appendChild(rDiv);
    }
}

function clearRandom() {
    let plac
}

/**
 * Função para procura por KeyWords
 */
function normalSearch() {
    let searchValue = getSearchValue();
    if (searchValue !== false) {
        let images = app.searchKeywords(searchValue);
        if (images.length > 0) {
            hasSearch(true);
            displayResults(images, false);
        } else {
            triggerAlert(errorList.noWord);
        }
    } else {
        triggerAlert(errorList.category);
    }
}

/**
 * Função para procurar imagens pela mesma cor
 */
function colorSearch() {
    let searchValue = getSearchValue();
    if (searchValue !== false) {
        let images = app.searchColor(searchValue, selectedColor);
        if (images.length > 0) {
            hasSearch(true);
            displayResults(images, true);
        } else {
            triggerAlert(errorList.noWord);
        }
    } else {
        triggerAlert(errorList.color);
    }
}

/**
 * Função que procura por cor
 * @param value
 */
function setColorSearch(value) {
    selectedColor = value;
    if (selectedColor !== "none") {
        colorSearch();
    } else {
        normalSearch();
    }
}

/**
 * Função de reset
 */
function resetSearch() {
    selectedColor = "none";
}


/**
 * Função que da trigger ao alert.
 * @param {string} text Recebe um texto para apresentar no alerta
 */
function triggerAlert(text) {
    let place = document.getElementById("alert");
    place.classList.add("alertTrigger");
    place.innerHTML = text;
    setTimeout(function () {
        place.classList.remove("alertTrigger");
    }, 4000);
}

/**
 * Função que recebe uma imagem e prepara a imagem
 * @param image
 */
function readFile(image) {
    let imageType = /image.*/;
    let file = image.files[0];
    if (!file.type.match(imageType)) {
        throw "File type must be an image";
    } else {
        app.insertImage(canvas, file);
    }


}