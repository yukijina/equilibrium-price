const searchBtn = document.querySelector('.form__btn-submit')
const clearBtn = document.querySelector('.form__btn-clear')
const resultContainer = document.querySelector('.result__container')
const loaderContainer = document.querySelector('.loader__container')
let product;


const request = new XMLHttpRequest()

// onClick Search
searchBtn.addEventListener('click', function(e) {
  e.preventDefault()
  product = document.getElementById('product').value
  const test = product * 1
  if (product === '' || product.length < 2) {
    alert('Product Name is required')
    return 
  }
  sendData(product)
})

// onClick clear search
clearBtn.addEventListener('click', function(e) {
  e.preventDefault()
  location.reload()
})

// Fetch data from api
function sendData(product) {
  console.log('sending data', product)
  document.querySelector('.loader').style.display = 'block';

  request.open('GET', `https://amazon23.p.rapidapi.com/product-search?query=${product}&page=1&country=US`, true)
  request.setRequestHeader('x-rapidapi-key', 'ac620cbdf7msh6644200f423ab71p1cb203jsnec1d60cbe315')
  request.setRequestHeader('x-rapidapi-host', 'amazon23.p.rapidapi.com')
  request.setRequestHeader('useQueryString', true)

  request.onload = function() {
    const data = JSON.parse(this.response)
    if(request.status === 200) {
      document.querySelector('.loader').style.display = 'none';
      const listContainer = document.createElement('div')
      listContainer.setAttribute('class', 'list__container')
      const h2 = document.createElement('h2')
      h2.textContent = 'Search Results'
      
      resultContainer.appendChild(h2)
      resultContainer.appendChild(listContainer)
      const ul = document.createElement('ul')
      listContainer.appendChild(ul)
      let sum = 0

      const priceContainer = document.createElement('div')
      priceContainer.setAttribute('class', 'price__container')
      const p = document.createElement('p')
      const p1 = document.createElement('p')
      const p2 = document.createElement('p')
      const p3 = document.createElement('p')
      p.setAttribute('class', 'searchlist-average')
      resultContainer.appendChild(priceContainer)

      data.result.slice(0, 10).forEach(result => {
        console.log('result', result)
        sum += result.price.current_price
        const li = document.createElement('li')
        const span = document.createElement('span')
        span.setAttribute('class', 'searchlist-price')
        li.setAttribute('class', 'searchlist')
        span.textContent = ` Price: ${result.price.currency} ${result.price.current_price}`
        li.textContent = result.title
        li.appendChild(span)
        ul.appendChild(li)
      })

      const average = Math.round((sum / 10) * 100 / 100).toFixed(2)
      console.log('ave', average)
      p.textContent = `Average Price: USD ${average}`
      p1.textContent = `Sold 100/month: USD ${average * 100}`
      p2.textContent = `Sold 200/month: USD ${average * 200}`
      p3.textContent = `Sold 300/month: USD ${average * 300}`
      priceContainer.appendChild(p)
      priceContainer.appendChild(p1)
      priceContainer.appendChild(p2)
      priceContainer.appendChild(p3)

      localStorage.setItem(product, average)
      

    } else {
      const p = document.createElement('p')
      p.textContent = 'There were no results found. Please try with another keyword!'
      
      resultContainer.appendChild(p)
    }
  }
  request.send()
}


// Display past search results
window.addEventListener('load', function() {
  const items = { ...localStorage };

  const container = document.querySelector('.pastsearch__container')
  const h2 = document.createElement('h2')
  h2.textContent = 'Your past search results'
  const small = document.createElement('p')
  small.setAttribute('class', 'pastsearch__subtitle')
  small.textContent = 'Keyword | Ave.Price'
  container.appendChild(h2)
  container.appendChild(small)
  const ul = document.createElement('ul')
  container.appendChild(ul)

  const btn = document.createElement('button')
  btn.setAttribute('class', 'form__btn pastsearch__btn')
  btn.textContent = 'CLEAR HISTORY'

  if (localStorage.length === 0) {
    const p = document.createElement('p')
    p.textContent = 'There was no data found'
    container.appendChild(p)
  } else {
    for (let item in items) {
      console.log(item, ' Average Price: ', items[item]);
      const li = document.createElement('li')
      li.textContent = `${item} | USD ${items[item]} `
      ul.appendChild(li)
    }
    container.appendChild(btn)
  }

  btn.onclick = function() {
    if (window.confirm('Are you sure you want to clear all histories ?')) {
      localStorage.clear()
      location.reload()
    } 
  }
})
