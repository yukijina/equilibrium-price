// let API_KEY;
// let API_HOST;
const searchBtn = document.querySelector('.form__btn-submit');
const clearBtn = document.querySelector('.form__btn-clear');
const resultContainer = document.querySelector('.result__container');
const loaderContainer = document.querySelector('.loader__container');
const calcContainer = document.querySelector('.calc__container');
let product;
let price;
let average;

const request = new XMLHttpRequest();

// onClick Search
searchBtn.addEventListener('click', function(e) {
  e.preventDefault();
  product = document.getElementById('product').value;
  searchBtn.disabled = true;

  if (product === '' || product.length < 2) {
    alert('Product Name is required');
    return ;
  }
  sendData(product);
})

// onClick clear search section
clearBtn.addEventListener('click', function(e) {
  e.preventDefault();
  location.reload();
})

// Fetch data from external api
function sendData(product) {
  document.querySelector('.loader').style.display = 'block';

  request.open('GET', `https://amazon23.p.rapidapi.com/product-search?query=${product}&page=1&country=US`, true);
  request.setRequestHeader('x-rapidapi-key', API_KEY);
  request.setRequestHeader('x-rapidapi-host', API_HOST);
  request.setRequestHeader('useQueryString', true);

  request.onload = function() {
    const data = JSON.parse(this.response);
    if(request.status === 200) {
      document.querySelector('.loader').style.display = 'none';
      const listContainer = document.createElement('div');
      listContainer.setAttribute('class', 'list__container');
      const h2 = document.createElement('h2');
      h2.textContent = 'Search Results';
      
      resultContainer.appendChild(h2);
      resultContainer.appendChild(listContainer);
      const ul = document.createElement('ul');
      listContainer.appendChild(ul);
      let sum = 0;

      const priceContainer = document.createElement('div');
      priceContainer.setAttribute('class', 'price__container');
      const p = document.createElement('p');
      const p1 = document.createElement('p');
      const p2 = document.createElement('p');
      const p3 = document.createElement('p');
      p.setAttribute('class', 'searchlist-average');
      resultContainer.appendChild(priceContainer);

      data.result.slice(0, 10).forEach(result => {
        //console.log('result', result);
        sum += result.price.current_price;
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.setAttribute('class', 'searchlist-price');
        li.setAttribute('class', 'searchlist');
        span.textContent = ` Price: ${result.price.currency} ${result.price.current_price}`;
        li.textContent = result.title;
        li.appendChild(span);
        ul.appendChild(li);
      })

      average = Math.round((sum / 10) * 100 / 100).toFixed(2);
      price = parseInt(average);
     
      p.textContent = `Average Price: USD ${average}`;
      p1.textContent = `Sold 100/month: USD ${average * 100}`;
      p2.textContent = `Sold 200/month: USD ${average * 200}`;
      p3.textContent = `Sold 300/month: USD ${average * 300}`;
      priceContainer.appendChild(p);
      priceContainer.appendChild(p1);
      priceContainer.appendChild(p2);
      priceContainer.appendChild(p3);

      localStorage.setItem(product, average);
      createPriceSection();
      drawChart();
    } else {
      const p = document.createElement('p');
      p.textContent = 'There were no results found. Please try with another keyword!';
      
      resultContainer.appendChild(p);
    }
  }
  request.send();
 
}

// Display past search results
window.addEventListener('load', function() {
  const items = { ...localStorage };

  const container = document.querySelector('.pastsearch__container');
  const h2 = document.createElement('h2');
  h2.textContent = 'Your past search results';
  const small = document.createElement('p');
  small.setAttribute('class', 'pastsearch__subtitle');
  small.textContent = 'Keyword | Ave.Price';
  container.appendChild(h2);
  container.appendChild(small);
  const ul = document.createElement('ul');
  container.appendChild(ul);

  const btn = document.createElement('button');
  btn.setAttribute('class', 'form__btn pastsearch__btn');
  btn.textContent = 'CLEAR HISTORY';

  if (localStorage.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'There was no data found';
    container.appendChild(p);
  } else {
    for (let item in items) {
      //console.log(item, ' Average Price: ', items[item]);
      const li = document.createElement('li');
      li.textContent = `${item} | USD ${items[item]} `;
      ul.appendChild(li);
    }
    container.appendChild(btn);
  }

  btn.onclick = function() {
    if (window.confirm('Are you sure you want to clear all histories ?')) {
      localStorage.clear();
      location.reload();
    } 
  }
})

/////  equilibrium price
const section = document.querySelector('.section');
const sectionText = document.querySelector('.section__subtitle');

var Mdemand = -1000;
var Bdemand = 10000;
var Msupply; // what if ABC can hire more people when price goes up? 
var Bsupply = 8000;
var consumption;
var supply;
var message;
let calcBtn;

// Create a price radio button
function createPriceSection() {
  const section = document.querySelector('.section');
  
  for (let i = -4; i < 5; i++) {
    const input = document.createElement('input');
    const label = document.createElement('label');
    input.setAttribute('value', price + i);
    input.setAttribute('name', 'price');
    input.setAttribute('type', 'radio');
    label.setAttribute('for', 'price');
    label.setAttribute('class', 'section__price');
    label.innerHTML = `$ ${price + i}`;
    section.appendChild(input);
    section.appendChild(label);
  }
  
  document.getElementsByName("price")[4].checked = true;
  
  const btn = document.createElement('input');
  btn.setAttribute('type', 'button');
  btn.setAttribute('value', 'Calculate');
  btn.setAttribute('id', 'calculate');
  btn.setAttribute('class', 'form__btn');
  section.appendChild(btn);
  document.getElementById("calculate");
  calculate();
}

/// Google chart
google.charts.load('current', {'packages':['corechart']});
google.charts.setOnLoadCallback(drawChart);

function drawChart(position=5) {
  var data = new google.visualization.DataTable();

  data.addColumn('number', 'Quantity');
  data.addColumn('number', 'Price');

 if (price !== undefined) {
   consumption = price * Mdemand + Bdemand;
   //Equibrium Msupply value (consumption === supply)
   Msupply = (consumption - Bsupply) / price;
   Msupply = Math.round(Msupply)
   supply = price * Msupply + Bsupply;

   //console.log('con', consumption, 'sup', supply, 'price', price, 'msupply', Msupply)

  if (consumption > supply) {
    // consumption = supply;
    message = `ABC Company canot make enough ${product}`;
  }

  if (consumption <= 0) {
    //consumption = 0;
    message = `No one will buy ${product} at this price`;
  }

  if (consumption < supply) {
    //consumption = supply;
    message = `Too much supply`;
  }

  if (consumption === supply) {
    message = `${price} is the equilibrium value`
  }
  
  revenue = consumption * price;
  document.getElementById('result').innerHTML = `${product} sold: ${consumption} /month Revenue:${revenue}/month - ${message}`

  let num = parseInt(average);
  var data = google.visualization.arrayToDataTable([
    ["Quantity", 'Demand', 'Supply'],
    [Msupply - 5000, num + 5, num - 5],
    [Msupply - 4000, num + 4, num - 4],
    [Msupply - 3000, num + 3, num - 3],
    [Msupply - 2000, num + 2, num - 2],
    [Msupply - 1000, num + 1, num - 1],
    [Msupply, num, num],
    [Msupply + 1000, num -1, num + 1],
    [Msupply + 2000, num - 2, num + 2],
    [Msupply + 3000, num - 3, num + 3],
    [Msupply + 4000, num - 4, num + 4],
    [Msupply + 5000, num - 5, num +5],
  ]);

  const options = {
    title: 'Equilibrium Price',
    legend: { position: 'bottom' },
    width: 500,
    height: 500,
    fontSize:8,
    hAxis: {
      title: 'Quantity',
      ticks: [Msupply - 5000, Msupply - 4000, Msupply - 3000, Msupply - 2000, Msupply - 1000, Msupply, Msupply + 1000, Msupply + 2000, Msupply + 3000, Msupply + 4000, Msupply + 5000]
    },
    vAxis: {
      title: 'Price',
      ticks: [num - 5, num - 4, num - 3, num - 2, num - 1, num, num + 1, num + 2, num + 3, num + 4, num + 5]
    }
  };
  
  const chart = new google.visualization.LineChart(document.getElementById('linear_div'));
  
  google.visualization.events.addListener(chart, 'ready', selectHandler);
  google.visualization.events.addListener(chart, 'select', selectHandler);
  
  function selectHandler() {
    chart.setSelection([{row: position, column: null}]);
  }
    chart.draw(data, options);
  }
}


// onClick calculate 
function calculate() {
  document.getElementById('calculate').addEventListener('click', calculateOutput);
}

function calculateOutput() {
  const priceOptions = document.getElementsByName('price');

  message = '';
  let position;
  for (let i = 0; i < priceOptions.length; i++) {
    if (priceOptions[i].checked) {
     price = parseInt(priceOptions[i].value);
      position = i + 1;
      break;
    }
  }
  drawChart(position);
}
