const form = document.querySelector('#form');
const resultContainer = document.querySelector('#result-container');
const modalImg = document.querySelector('#modalImg');
const modalTitle = document.querySelector('#modalTitle');
const modalAuthor = document.querySelector('#modalAuthor');
const modalYear = document.querySelector('#modalYear');
const modalPages = document.querySelector('#modalPages');
const modalSubjects = document.querySelector('#modalSubjects');
const modalDescription = document.querySelector('#modalDescription');
const modalBuy = document.querySelector('#modalBuy')
const api = 'https://openlibrary.org';

//Cargar todos los eventos
window.addEventListener('load', ()=>{
    form.addEventListener('submit', getBooks);
    resultContainer.addEventListener('click', getModalInfo)
})

//funcion para obtener los datos del formulario y llamar la api
const getBooks = e=>{
    e.preventDefault();
    const search = form['search'].value;

    form['search'].value = '';
    requestApiBooks(search);
}

//funcion para hacerle la peticion a la api 
const requestApiBooks = async search=>{

    displaySpinner();
    const url = `${api}/search.json?q=${search}`;

    const requestJson = await fetch(url);
    const result = await requestJson.json();

    displayBooks(result, search);
}

//funcion para mostrar los resultados en el html, con 4 columnas en cada fila
const displayBooks = (result, search)=>{

    let resultContainerHTML = `
        <div class="row mt-3">
            <div class="col font_color fs-5">
                Search results for:
            </div>
        </div>
        <div class="row mb-2">
            <div class="col font_color fs-1 fw-bold">
                ${search}
            </div>
        </div>
    `
    let rowHTML = '<div class="row mt-4 w-75">';
    let columns = 0;

    for(const doc of result.docs){
        const {key, title, first_publish_year, number_of_pages_median, cover_i, author_name, id_goodreads} = doc;


        let colHTML = addColumn(key, title, first_publish_year, number_of_pages_median, cover_i, author_name, id_goodreads);
        rowHTML += colHTML;

        columns++;
        if(columns === 4){
            rowHTML += '</div>'
            resultContainerHTML += rowHTML;

            rowHTML = '<div class="row mt-4 w-75">';
            columns = 0;
        }
 
    }

    resultContainer.innerHTML = resultContainerHTML;
}

//funcion que crea una columna con todos los datos dados por la api
const addColumn = (key, title, first_publish_year, number_of_pages_median, cover_i, author_name, id_goodreads)=>{

    let image, goodreadsLink, hrefClass;

    if (cover_i === undefined) { 
        image = 'assets/img/error_image.png'; 
    }
    else{
        image = `https://covers.openlibrary.org/b/id/${cover_i}-M.jpg`;
    } 
    

    if(id_goodreads === undefined) {
        goodreadsLink = 'not available';
        hrefClass = 'book_link_disable';
    }
    else{
        goodreadsLink = `https://www.goodreads.com/book/show/${id_goodreads[id_goodreads.length - 1]}`;
        hrefClass = 'book_link';
    }
    
    const columnHTML = `

        <div class="col col-8 col-sm-5 col-lg-2 m-auto my-3 p-0 pb-2 d-flex flex-column align-items-center font_color container_book" data-key="${key}" data-img="${image}" data-title="${title}" data-author="${author_name}" data-year="${first_publish_year}" data-pages="${number_of_pages_median}" data-buy="${goodreadsLink}">
            <img src="${image}" alt="" class="book_img rounded mb-1" data-bs-toggle="modal" data-bs-target="#informationModal">
            <span class="book_title fs-5 fw-bold text-center text-truncate" data-bs-toggle="modal" data-bs-target="#informationModal">${title}</span>
            <span class="book_author fs-6 text-center text-truncate">By ${author_name}</span>
            <a href="${goodreadsLink}" role="button" class="${hrefClass} w-100 mt-2 p-1 text-center  rounded" target="_blank"><i class="bi bi-bag-fill"></i> Buy now</a>
        </div>
    `;

    return columnHTML;
}

//funcion para obtener los datos de los atributos del elemento padre y llamar a la api
const getModalInfo = e=>{

    if(e.target.hasAttribute('data-bs-toggle')){

        const book =  e.target.parentElement;

        const data = {
            key: book.getAttribute('data-key'),
            img: book.getAttribute('data-img'),
            title: book.getAttribute('data-title'),
            author: book.getAttribute('data-author'),
            year: book.getAttribute('data-year'),
            pages: book.getAttribute('data-pages'),
            buy: book.getAttribute('data-buy'),
        };

        requestApiWorks(data);
    }
    
}

//funcion para hacerle la peticion a la api
const requestApiWorks = async data=>{
    const {key} = data;

    const url = `${api}${key}.json`;

    const requestJson = await fetch(url);
    const result = await requestJson.json();

    displayWorks(result, data);
}

//funcion para cambiar los datos del modal
const displayWorks = (result, data) =>{
    const {img, title, author, year, pages, buy} = data;
    const {description, subjects} = result;
    let descriptionText = description;
    if (typeof description != 'string') descriptionText = 'No description found...';

    modalImg.src = img;
    modalTitle.textContent = title;
    modalAuthor.textContent = author;
    modalYear.textContent = year;
    modalPages.textContent = pages;
    modalDescription.textContent = descriptionText; 

    let subjectText = '';
    for(let i = 0; i < 10; i++){
        if(subjects === undefined || subjects[i] === undefined) break
        if(subjects[i + 1] === undefined || i === 9){
            subjectText += subjects[i];
        }
        else{
            subjectText += subjects[i] + ', ';
        }
        
    }
    modalSubjects.textContent = subjectText;

    if(buy === 'not available'){
        modalBuy.classList.remove('book_link');
        modalBuy.classList.add('book_link_disable');
    }
    else{
        modalBuy.classList.remove('book_link_disable');
        modalBuy.classList.add('book_link');
        modalBuy.href = buy;
    }

    
}

//funcion que añade un spiner mientras cargan los datos
const displaySpinner = ()=>{
    resultContainer.innerHTML = '<span class="my-2 fs-5 font_color">Loading results...</span> <div class="my-2 spinner-border font_color" role="status">'
}