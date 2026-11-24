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

  // Base tier values per person in PLN (validated 2026/2027 operator pricing)
  const budgetTiers = {
    economy: {
      flights: 1850,
      hotel: 1250,
      icecave: 1700, // 4500 NOK own sleeping bag
      snowmobile: 680,
      weapon: 110,
      dogsled: 740,
      food: 850,
      transfers: 160
    },
    standard: {
      flights: 2200,
      hotel: 1550,
      icecave: 1920, // 4500 NOK + 600 NOK sleeping bag rental
      snowmobile: 780,
      weapon: 130,
      dogsled: 830,
      food: 1250,
      transfers: 180
    },
    premium: {
      flights: 2550,
      hotel: 2300,
      icecave: 2150,
      snowmobile: 1580, // individual sled or East Coast safari
      weapon: 160,
      dogsled: 980,
      food: 1950,
      transfers: 220
    }
  };

  let currentTier = 'standard';
  let currentGroupSize = 4;
  let currentCurrency = 'PLN';

  const groupBtns = document.querySelectorAll('[data-group]');
  const tierBtns = document.querySelectorAll('[data-tier]');
  const currBtns = document.querySelectorAll('[data-currency]');

  function updateCalculator() {
    const tierData = budgetTiers[currentTier];
    const curr = rates[currentCurrency];

    // Odd group size (5 people) incurs single-room & odd-sled sharing surcharge (~12% on hotel & sled)
    const isOddGroup = (currentGroupSize % 2 !== 0);
    const hotelAdjusted = isOddGroup ? Math.round(tierData.hotel * 1.16) : tierData.hotel;
    const sledAdjusted = (isOddGroup && currentTier !== 'premium') ? Math.round(tierData.snowmobile * 1.18) : tierData.snowmobile;
    // Ice cave standard limit is 2-4 per guide; >4 requires private 2nd guide surcharge (~220 PLN/person)
    const iceCaveAdjusted = (currentGroupSize > 4) ? tierData.icecave + 220 : tierData.icecave;

    const perPersonBase = 
      tierData.flights + 
      hotelAdjusted + 
      iceCaveAdjusted + 
      sledAdjusted + 
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
    setItem('bHotel', hotelAdjusted);
    setItem('bIceCave', iceCaveAdjusted);
    setItem('bSnowmobile', sledAdjusted);
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
