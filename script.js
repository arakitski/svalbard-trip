// Svalbard Trip - Interactive Scripts

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Nav Toggle
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('show');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
      });
    });
  }

  // Day Accordion Toggle
  const dayCards = document.querySelectorAll('.day-card');
  dayCards.forEach(card => {
    const header = card.querySelector('.day-header');
    if (header) {
      header.addEventListener('click', () => {
        card.classList.toggle('active');
      });
    }
  });

  // Interactive Checklist with LocalStorage
  const checkItems = document.querySelectorAll('.check-item');
  const STORAGE_KEY = 'svalbard_checklist_state';
  
  let savedState = {};
  try {
    savedState = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch (e) {
    savedState = {};
  }

  checkItems.forEach((item, index) => {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    if (savedState[index]) {
      checkbox.checked = true;
      item.classList.add('done');
    }

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        item.classList.add('done');
        savedState[index] = true;
      } else {
        item.classList.remove('done');
        delete savedState[index];
      }
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedState));
      } catch (e) {}
    });
  });

  // Budget Calculator
  const rates = {
    PLN: { symbol: 'PLN', rate: 1 },
    EUR: { symbol: '€', rate: 0.23 },
    NOK: { symbol: 'NOK', rate: 2.65 }
  };

  // Base tier values per person in PLN
  const budgetTiers = {
    economy: {
      flights: 1750,
      hotel: 1100,
      icecave: 1450,
      snowmobile: 650,
      weapon: 100,
      dogsled: 700,
      food: 800,
      transfers: 150
    },
    standard: {
      flights: 2150,
      hotel: 1400,
      icecave: 1600,
      snowmobile: 750,
      weapon: 125,
      dogsled: 800,
      food: 1200,
      transfers: 175
    },
    premium: {
      flights: 2350,
      hotel: 2200,
      icecave: 1800,
      snowmobile: 1500, // individual sled
      weapon: 150,
      dogsled: 950,
      food: 1900,
      transfers: 200
    }
  };

  let currentTier = 'standard';
  let currentGroupSize = 6;
  let currentCurrency = 'PLN';

  const groupBtns = document.querySelectorAll('[data-group]');
  const tierBtns = document.querySelectorAll('[data-tier]');
  const currBtns = document.querySelectorAll('[data-currency]');

  function updateCalculator() {
    const tierData = budgetTiers[currentTier];
    const curr = rates[currentCurrency];

    const perPersonBase = 
      tierData.flights + 
      tierData.hotel + 
      tierData.icecave + 
      tierData.snowmobile + 
      tierData.weapon + 
      tierData.dogsled + 
      tierData.food + 
      tierData.transfers;

    const perPersonFormatted = Math.round(perPersonBase * curr.rate).toLocaleString('ru-RU');
    const totalGroupFormatted = Math.round(perPersonBase * currentGroupSize * curr.rate).toLocaleString('ru-RU');

    const totalValElem = document.getElementById('calcTotalValue');
    const subtotalElem = document.getElementById('calcSubtotalValue');

    if (totalValElem) {
      totalValElem.textContent = `${perPersonFormatted} ${curr.symbol}`;
    }
    if (subtotalElem) {
      subtotalElem.textContent = `Всего на группу (${currentGroupSize} чел.): ${totalGroupFormatted} ${curr.symbol}`;
    }

    // Update breakdown items
    const setItem = (id, val) => {
      const el = document.getElementById(id);
      if (el) {
        el.textContent = `${Math.round(val * curr.rate).toLocaleString('ru-RU')} ${curr.symbol}`;
      }
    };

    setItem('bFlights', tierData.flights);
    setItem('bHotel', tierData.hotel);
    setItem('bIceCave', tierData.icecave);
    setItem('bSnowmobile', tierData.snowmobile);
    setItem('bDogsled', tierData.dogsled);
    setItem('bFood', tierData.food);
  }

  groupBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      groupBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentGroupSize = parseInt(btn.dataset.group, 10);
      updateCalculator();
    });
  });

  tierBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tierBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTier = btn.dataset.tier;
      updateCalculator();
    });
  });

  currBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCurrency = btn.dataset.currency;
      updateCalculator();
    });
  });

  // Initial Calculation
  updateCalculator();
});
