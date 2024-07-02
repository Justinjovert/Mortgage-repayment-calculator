


const createErrorMessage = (node) => {
    const parentElement = node.parentNode
    const span = document.createElement('span')
    span.classList.add('error-message')
    parentElement.insertBefore(span, node.nextSibling)
    return span
}


// Checks if radio type is empty or not
const isEmpty = (node) => {
    //If it is null or has no value, create span error
    if (node === null || !node.value) {

        if (node.nextElementSibling === null || node.parentNode.nextElementSibling.tagName !== 'SPAN') {
            // Send parentNode instead of node
            // Whole query div, and not label div
            const errorMsgSpan = createErrorMessage(node.parentNode)
            errorMsgSpan.textContent = "This field is required"
        }
        return false
    }
    //If not empty, remove any span error and return true
    else {
        //Remove span error
        if (node.closest('.userinput-radio').nextElementSibling !== null && node.closest('.userinput-radio').nextElementSibling.tagName === 'SPAN') {
            node.closest('.userinput-radio').nextElementSibling.remove()
        }
        return true
    }
}

const isValidExp = (regExp, node, Msg) => {
    // If it is not a valid expression
    if (!regExp.test(node.value)) {
        //Create a span error
        if (node.nextElementSibling === null || node.nextElementSibling.tagName !== 'SPAN') {
            const errorMsgSpan = createErrorMessage(node)
            if (!node.value) {
                errorMsgSpan.textContent = "This field is required"
            }
            else {
                errorMsgSpan.textContent = Msg
            }
        }
        //If there already exists a span error, change textcontent
        else if (node.nextElementSibling.tagName === 'SPAN') {
            if (!node.value) {
                node.nextElementSibling.textContent = "This field is required"
            }
            else {
                node.nextElementSibling.textContent = Msg
            }
        }
        // Style node to error
        node.classList.add('userinput-input-error')
        node.parentNode.querySelector('.input-wrapper-label').classList.add('error-label')
        node.parentNode.querySelector('.input-wrapper-label').style.color = 'white'
        return false
    }
    //If it is a valid regular expression
    else {
        if (node.nextElementSibling !== null && node.nextElementSibling.tagName === 'SPAN') {
            node.nextSibling.remove()
        }
        node.classList.remove('userinput-input-error')
        node.parentNode.querySelector('.input-wrapper-label').classList.remove('error-label')
        node.parentNode.querySelector('.input-wrapper-label').style.color = 'var(--slate700)'
        return true
    }
}


const calculateResults = (value, term, interest, mortgageType) => {

    let principal = parseFloat(value.replace(/,/g, ''))
    interest = parseFloat(interest.replace(/,/g, ''))

    let monthlyPaymentValue
    let overTheTermValue
    const monthlyInterest = (interest/100)/12

    if(mortgageType === 'repayment'){
        console.log('repayment')
        monthlyPaymentValue = principal * (monthlyInterest * Math.pow(1 + monthlyInterest, term * 12)) / (Math.pow(1 + monthlyInterest, term * 12) - 1);
        overTheTermValue = monthlyPaymentValue.toFixed(2) * (parseInt(term) * 12) // Years * 12 months
    }
    else if (mortgageType === 'interest'){
        monthlyPaymentValue = principal * monthlyInterest
        overTheTermValue = monthlyPaymentValue.toFixed(2) * (parseInt(term) * 12) // Years * 12 months
    }

    const monthlyPayment = document.querySelector('[data-monthly-repayment]')
    const overTheTerm = document.querySelector('[data-term-value]')

    monthlyPayment.textContent = `${monthlyPaymentValue.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}`
    overTheTerm.textContent = `${overTheTermValue.toLocaleString('en-GB', { style: 'currency', currency: 'GBP' })}`
}


const calculatorButton = document.querySelector('.userinput-calculate')
// 
const mortgageAmount = document.querySelector('[data-mortgage-amount]')
const mortgageTerm = document.querySelector('[data-mortgage-term]')
const interestRate = document.querySelector('[data-interest-rate]')
const mortgageType = document.getElementsByName('mortgageType')

calculatorButton.addEventListener('click', () => {


    //Loops query radio input values
    //And put the value on variable if checked
    //Otherwise default value for error message
    let queryValue = document.querySelector('.query-wrapper')
    for (let index = 0; index < mortgageType.length; index++) {
        if (mortgageType[index].checked) {
            queryValue = mortgageType[index]
            break
        }

    }

    // ChatGPT regExp
    // Accepts with or without commas, 2 decimals
    const decimalsExp = /^(\d{1,3}(,\d{3})*|\d+)(\.\d{1,2})?$/
    const termExp = /^\d+$/

    // Error message
    const mortgageAmountMsg = "This is an invalid amount"
    const mortgageTermMsg = "This is an invalid term"
    const interestRateMsg = "This is an invalid interest rate"


    // Checks if they are all valid
    const areAllTrue = []
    areAllTrue.push(isValidExp(decimalsExp, mortgageAmount, mortgageAmountMsg))
    areAllTrue.push(isValidExp(termExp, mortgageTerm, mortgageTermMsg))
    areAllTrue.push(isValidExp(decimalsExp, interestRate, interestRateMsg))
    areAllTrue.push(isEmpty(queryValue))

    // If all elements are true, proceed with calculation
    const emptyResults = document.querySelector('.empty-results')
    const completeResults = document.querySelector('.complete-results')
    if (areAllTrue.every(element => element == true)) {
        calculateResults(mortgageAmount.value, mortgageTerm.value, interestRate.value, queryValue.value)
        // Empty results div
        emptyResults.style.display = 'none'
        // Completed result divs
        completeResults.style.display = 'block'
    }
    else { // Display the empty result div
        emptyResults.style.display = 'flex'
        completeResults.style.display = 'none'
    }
})



// Highlight selected query
mortgageType.forEach(element => {
    element.addEventListener('change', () => {
        mortgageType.forEach(element => element.parentNode.classList.remove('selected-label'))
        element.parentNode.classList.add('selected-label')
    })
});

// Empty the input fields
const clearAll = document.querySelector('[data-clear]')
clearAll.addEventListener('click', () => {
    mortgageAmount.value = ''
    mortgageTerm.value = ''
    interestRate.value = ''
    mortgageType.forEach(element => {
        element.checked = false
    });
})