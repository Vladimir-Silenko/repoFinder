/**

Функция создает новый HTML элемент заданного типа и добавляет ему класс
@param {string} nodeType - тип создаваемого HTML элемента
@param {string} addclass - добавляемый CSS класс
@returns {HTMLElement} - созданный HTML элемент с добавленным классом
*/
const create = (nodeType, addclass) => {
    let element = document.createElement(nodeType)
    element.classList.add(addclass)
    return element
}

//------------------------------------------------------
//Объявляем переменные и создаём элементы
const form = document.querySelector('.form-container')
const container = document.querySelector('.container')

let header = document.querySelector('header')
let title = create('h1', 'header-title')
title.innerHTML = "RepoFinder"
header.appendChild(title)

let input = create('input', 'form__input')
input.setAttribute('type', 'text')
input.setAttribute('placeholder', 'input repository name')


let submitBtn = create('button', 'form__submit-btn')
submitBtn.setAttribute('type', "submit")
submitBtn.innerHTML = 'Find'

let leftBtn = create('button', 'left-btn')
leftBtn.innerHTML = '<'
let rightBtn = create('button', 'right-btn')
rightBtn.innerHTML = '>'

form.appendChild(input)
form.appendChild(submitBtn)

// -----------------------------------------

let count = 0 // счётчик для пагинации

/**

Функция отправляет запрос к API GitHub и обрабатывает полученные данные
@param {number} startIndex - индекс первого элемента, который необходимо получить из ответа API
@param {number} length - количество элементов, которые необходимо получить из ответа API
*/
async function fetchData(startIndex, length) {
    let resp = await fetch(`https://api.github.com/search/repositories?q=${input.value}&sort=stars`)
    if (resp.status == 422) {
        notFound()
        return
    }
    let data = await resp.json()
    dataHandler(data.items, startIndex, length)
}

/**

Функция отображает сообщение "NOT FOUND" при отсутствии результатов поиска
@returns {void} - функция не возвращает значения
*/
function notFound() {
    container.innerHTML = '<p class="not-found">NOT FOUND</p>'
    leftBtn.disabled = true
    rightBtn.disabled = true
}

// input.addEventListener('keydown',function(){
//     if(!this.value) this.style.background = 'red'
// })

/**

Функция обрабатывает данные, полученные от API GitHub
@param {Array} data - массив объектов с данными о репозиториях, полученных от API GitHub
@param {number} startIndex - индекс первого элемента, который необходимо отобразить
@param {number} length - количество элементов, которые необходимо отобразить
*/
function dataHandler(data, startIndex, length) {
    container.innerHTML = ''
    if (data.length === 0) {
        notFound()
        return
    }
    data = data.slice(startIndex, length)
    data.forEach(element => {
        container.innerHTML += `
            <div class="repo">
                <h2>
                    <a class="repo__link" href="https://github.com/${element.owner.login}/${element.name}" target="_blank">${element.name}</a>
                </h2>
                <div class="repo__owner">
                    <a href="https://github.com/${element.owner.login}" target="_blank">
                        <img src="${element.owner.avatar_url}" class="repo__owner-photo"/>
                    </a>
                    <h3>${element.owner.login}</h3>
                </div>
            </div>
        `
    })
    container.appendChild(leftBtn)
    container.appendChild(rightBtn)
    leftBtn.disabled = startIndex <= 0
    rightBtn.disabled = data.length < 9
}
/**
 * функция проверяет не является ли поле ввода пустым,
 * и в случае,попытки отправить пустую форму,уведомляет об ошибке
 */
const emptyFieldValidator = () => {
    input.style.background = 'red'
    setTimeout(() => {
        input.style.background = 'transparent'
    }, 1000);
}

/**
Функция обрабатывает событие нажатия на клавишу Enter в поле ввода и отправляет запрос к API GitHub
@param {KeyboardEvent} event - объект события клавиатуры
@returns {void} - функция не возвращает значения
*/
function handleKeyPress(event) {
    if (event.keyCode === 13) {
        input.value ? fetchData(count, count + 9) : emptyFieldValidator()
    }
}


/**

Функция обрабатывает событие нажатия на кнопку "Previous" и отправляет запрос к API GitHub с предыдущим диапазоном элементов
@param {MouseEvent} event - объект события мыши
@returns {void} - функция не возвращает значения
*/
function handleLeftClick(event) {
    count -= 9
    fetchData(count, count + 9)
}


/**

Функция обрабатывает событие нажатия на кнопку "Next" и отправляет запрос к API GitHub с следующим диапазоном элементов
@param {MouseEvent} event - объект события мыши
@returns {void} - функция не возвращает значения
*/
function handleRightClick(event) {
    count += 9
    fetchData(count, count + 9)
}




input.addEventListener('keypress', handleKeyPress)

submitBtn.addEventListener('click', (e) => {
    e.preventDefault()
    input.value ? fetchData(count, count + 9) : emptyFieldValidator()
})

leftBtn.addEventListener('click', handleLeftClick)

rightBtn.addEventListener('click', handleRightClick)


