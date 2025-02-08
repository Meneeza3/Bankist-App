'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  type: 'pre',
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  type: 'standard',
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
  type: 'pre',
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
  type: 'standard',
};

const account5 = {
  owner: 'Ahmed Hossam',
  movements: [1000000, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 5555,
  type: 'pre',
};

const accounts = [account1, account2, account3, account4, account5];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////

// take the movements of one account and display it
const dipalyMovements = function (movements, sorted = false) {
  containerMovements.innerHTML = '';
  const movs = sorted ? movements.slice().sort((a, b) => a - b) : movements;

  movs.forEach(function (mov, i) {
    let type = mov > 0 ? 'deposit' : 'withdrawal';

    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov}€</div>
        </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// take the movements of an account and display the total sum of this movements
const balanceCalcDisplay = function (account) {
  const sumBalance = account.movements.reduce(function (acc, ele) {
    return acc + ele;
  }, 0);
  labelBalance.textContent = `${sumBalance} €`;
  currentUser.sumBalance = sumBalance;
};

// took the accounts array and make a property for each object called username and calc it's value from the owner name
const createUsernames = function (accounts) {
  accounts.forEach(function (account) {
    account.username = account.owner
      .toLocaleLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

// calc the totall IN and the total OUT
const caclDisp_InOut = function (movements, interestRate) {
  const sumIn = movements
    .filter(ele => ele > 0)
    .reduce((acc, ele) => acc + ele, 0);
  labelSumIn.textContent = `${sumIn} €`;

  const sumOut = movements
    .filter(ele => ele < 0)
    .reduce((acc, ele) => acc + Math.abs(ele), 0);
  labelSumOut.textContent = `${sumOut} €`;

  const interest = movements
    .filter(ele => ele > 0)
    .map(deposit => (deposit * interestRate) / 100)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(1)} €`;
};

// whenever i press the login_button
let currentUser;
btnLogin.addEventListener('click', function (e) {
  e.preventDefault();
  currentUser = accounts.find(acc => acc.username === inputLoginUsername.value);
  if (currentUser && Number(inputLoginPin.value) === Number(currentUser.pin)) {
    labelWelcome.textContent = `Welcome back, ${
      currentUser.owner.split(' ')[0]
    }!`;

    containerApp.style.opacity = 1;
    dipalyMovements(currentUser.movements);
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    balanceCalcDisplay(currentUser);
    caclDisp_InOut(currentUser.movements, Number(currentUser.interestRate));
  }
});

// update the current user data when getting loan or transfer money
const updateCurrentUser = function (user) {
  dipalyMovements(user.movements);
  balanceCalcDisplay(user);
  caclDisp_InOut(user.movements, user.interestRate);
};

// transfer money from user to another
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const toUser = accounts.find(acc => acc.username === inputTransferTo.value);
  const amountToTransfer = inputTransferAmount.value;
  if (
    toUser &&
    toUser.username !== currentUser.username &&
    amountToTransfer <= currentUser.sumBalance &&
    amountToTransfer > 0
  ) {
    currentUser.movements.push(Number(-1 * amountToTransfer));
    // update UI
    updateCurrentUser(currentUser);

    toUser.movements.push(Number(amountToTransfer)); // update the other user

    inputTransferTo.value = inputTransferAmount.value = '';
    inputTransferAmount.blur();
  }
});

// get loan
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loan = Number(inputLoanAmount.value);
  let flag = currentUser.movements.some(dep => dep > loan * 0.1);
  if (loan > 0 && flag) {
    inputLoanAmount.value = '';
    inputLoanAmount.blur();
    currentUser.movements.push(loan);

    // update UI
    updateCurrentUser(currentUser);
  }
});

// logout the current user
btnClose.addEventListener('click', function (e) {
  e.preventDefault();
  if (
    currentUser.username === inputCloseUsername.value &&
    currentUser.pin === Number(inputClosePin.value)
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentUser.username
    );
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    inputCloseUsername.value = inputClosePin.value = '';
  }
});

// sort the movements
let sorted = 0;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  dipalyMovements(currentUser.movements, !sorted);
  sorted = !sorted;
});
