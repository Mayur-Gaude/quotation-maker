import { useState } from "react";
import calculateTotals from "../utils/calculateTotals";

const useQuotation = () => {
    const [companyDetails, setCompanyDetails] = useState({ name: "" });
    const [customerDetails, setCustomerDetails] = useState({ name: "" });
    const [items, setItems] = useState([
        { description: "", quantity: 1, rate: 0, amount: 0 }
    ]);
    const [tax, setTax] = useState(0);
    const [discount, setDiscount] = useState(0);

    const totals = calculateTotals(items, tax, discount);

    const addItem = () =>
        setItems([...items, { description: "", quantity: 1, rate: 0, amount: 0 }]);

    const updateItem = (index, field, value) => {
        const updated = [...items];
        updated[index][field] = value;

        if (field === "quantity" || field === "rate") {
            updated[index].amount =
                updated[index].quantity * updated[index].rate;
        }

        setItems(updated);
    };

    const removeItem = index =>
        setItems(items.filter((_, i) => i !== index));

    return {
        companyDetails,
        setCompanyDetails,
        customerDetails,
        setCustomerDetails,
        items,
        setItems,
        addItem,
        updateItem,
        removeItem,
        tax,
        setTax,
        discount,
        setDiscount,
        totals
    };
};

export default useQuotation;
