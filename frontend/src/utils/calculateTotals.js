const calculateTotals = (items, tax = 0, discount = 0) => {
    const subTotal = items.reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
    );

    const taxAmount = (subTotal * tax) / 100;
    const grandTotal = subTotal + taxAmount - discount;

    return {
        subTotal,
        taxAmount,
        grandTotal
    };
};

export default calculateTotals;
