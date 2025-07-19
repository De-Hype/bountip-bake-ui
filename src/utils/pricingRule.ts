// type PricingRules = {
//   markupPercentage?: number;
//   discountPercentage?: number;
// };

// export const calculateTierPrice = (
//   basePrice: number | string,
//   rules: PricingRules
// ): number => {
//   // Early return for invalid base price
//   if (basePrice === "" || basePrice === 0 || basePrice === "0") {
//     return 0;
//   }

//   const numericBasePrice =
//     typeof basePrice === "string" ? parseFloat(basePrice) : basePrice;

//   if (isNaN(numericBasePrice)) {
//     throw new Error("Invalid basePrice: not a number");
//   }

//   const { markupPercentage, discountPercentage } = rules;


//   let finalPrice = numericBasePrice;

//   if (typeof markupPercentage === "number") {
//     finalPrice = numericBasePrice * (1 + markupPercentage / 100);
//   } else if (typeof discountPercentage === "number") {
//     finalPrice = numericBasePrice * (1 - discountPercentage / 100);
//   }

//   return parseFloat(finalPrice.toFixed(2));
// };

type PricingRules = {
  markupPercentage?: number;
  discountPercentage?: number;
};

export const calculateTierPrice = (
  basePrice: number | string,
  rules: PricingRules
): string => {
  // Early return for invalid base price
  if (basePrice === "" || basePrice === 0 || basePrice === "0") {
    return "0";
  }

  const numericBasePrice =
    typeof basePrice === "string" ? parseFloat(basePrice) : basePrice;

  if (isNaN(numericBasePrice)) {
    throw new Error("Invalid basePrice: not a number");
  }

  const { markupPercentage, discountPercentage } = rules;

  let finalPrice = numericBasePrice;

  if (typeof markupPercentage === "number") {
    finalPrice = numericBasePrice * (1 + markupPercentage / 100);
  } else if (typeof discountPercentage === "number") {
    finalPrice = numericBasePrice * (1 - discountPercentage / 100);
  }

  // Format with comma and 2 decimal places
  return finalPrice.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};
