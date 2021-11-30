import uniq from "lodash/uniq";

export const quantity = (item) => {
  return item.quantity;
};

export const sum = (prev, next) => {
  return prev + next;
};

export const formatPrice = (price, currency) => {
  return `${(price / 100).toFixed(2)} ${currency.toUpperCase()}`;
};

export const getSlug = (path) => {
  const tmp = path.split("/");
  return tmp[tmp.length - 1];
};

export const resetOptions = (product) => {
  const variant = product.variants.slice(0).reverse()[0];
  return {
    options: product.options.map((productOption) => {
      const type =
        productOption.title.toLowerCase() === "color" ? "color" : "select";
      const choices = uniq(productOption.values.map(({ value }) => value));
      const value = variant.options.find(
        (variantOption) => variantOption.option_id === productOption.id,
      )?.value;

      return {
        id: productOption.id,
        title: productOption.title,
        type,
        choices,
        value,
      };
    }),
    quantity: 1,
  };
};
