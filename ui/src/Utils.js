export function formatCurrency(number) {
    number = number ? number : 0
    return new Intl.NumberFormat('en', {style: 'currency', currency: 'GBP'}).format(number)
}
