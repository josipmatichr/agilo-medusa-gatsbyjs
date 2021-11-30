import React, { useContext, useEffect, useState } from 'react';
import StoreContext from "../../context/store-context";
import * as styles from "../../styles/product.module.css";
import * as accordionStyles from "../../styles/accordion.module.css";
import { createClient } from "../../utils/client";
import { formatPrices } from "../../utils/format-price";
import { getSlug, resetOptions } from "../../utils/helper-functions";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion";

const Product = ({ location }) => {
  const { cart, addVariantToCart } = useContext(StoreContext);
  const [options, setOptions] = useState({
    quantity: 0,
    options: [],
  });

  const [product, setProduct] = useState(undefined);
  const client = createClient();

  const variantId = product
    ? product.variants.find((productVariant) => {
        for (let i = 0; i < productVariant.options.length; i++) {
          const productVariantOption = productVariant.options[i];

          if (
            productVariantOption.value !==
            options.options.find(
              (option) => option.id === productVariantOption.option_id,
            )?.value
          ) {
            return false;
          }
        }

        return true;
      })?.id
    : undefined;

  useEffect(() => {
    const getProduct = async () => {
      const slug = getSlug(location.pathname);
      const response = await client.products.retrieve(slug);
      setProduct(response.product);
    };

    getProduct();
  }, [location.pathname]);

  useEffect(() => {
    if (product) {
      setOptions(resetOptions(product));
    }
  }, [product]);

  const handleOptionChange = (option_id, value) => {
    setOptions((options) => {
      return {
        ...options,
        options: options.options.map((option) => ({
          ...option,
          value: option.id === option_id ? value : option.value,
        })),
      };
    });
  };

  const handleQtyChange = (action) => {
    if (action === "inc") {
      if (
        options.quantity <
        product.variants.find(({ id }) => id === variantId).inventory_quantity
      )
        setOptions((option) => ({
          ...option,
          quantity: option.quantity + 1,
        }));
    }
    if (action === "dec") {
      if (options.quantity > 1)
        setOptions((option) => ({
          ...option,
          quantity: option.quantity - 1,
        }));
    }
  };

  const handleAddToBag = () => {
    addVariantToCart({
      variantId,
      quantity: options.quantity,
    });
    if (product) setOptions(resetOptions(product));
  };

  return product && cart.id ? (
    <div className={styles.container}>
      <figure className={styles.image}>
        <div className={styles.placeholder}>
          <img
            style={{ height: "100%", width: "100%", objectFit: "contain" }}
            src={product.thumbnail}
            alt={`${product.title}`}
          />
        </div>
      </figure>
      <div className={styles.info}>
        <div className={styles.infoContainer}>
          <h1 className={styles.title}>{product.title}</h1>
          <p className={styles.price}>
            {formatPrices(cart, product.variants[0])}
          </p>
          <p className={styles.subtitle}>{product.subtitle}</p>
          {options.options
            .filter((productOption) => productOption.choices.length > 1)
            .map((productOption) => (
              <div className={styles.selection} key={productOption.id}>
                {productOption.type === "color" ? (
                  <div className={styles.colorPickerGroup}>
                    {productOption.choices.map((color) => (
                      <div className={styles.colorPickerGroupItem} key={color}>
                        <input
                          type="radio"
                          name={productOption.id}
                          value={color}
                          id={`${productOption.id}_${color}`}
                          className={styles.colorPickerInput}
                          onChange={() => {
                            handleOptionChange(productOption.id, color);
                          }}
                          checked={productOption.value === color}
                        />
                        <label
                          htmlFor={`${productOption.id}_${color}`}
                          style={{ backgroundColor: color.toLowerCase() }}
                          className={styles.colorPickerLabel}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    <select
                      className={styles.select}
                      onChange={(event) => {
                        handleOptionChange(
                          productOption.id,
                          event.target.value,
                        );
                      }}
                      value={productOption.value}
                    >
                      <option value="">Select {productOption.title}</option>
                      {productOption.choices.map((choice, index) => (
                        <option value={choice} key={index}>
                          {choice}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          <div className={styles.selection}>
            <p>Select Quantity</p>
            <div className={styles.qty}>
              <button
                className={styles.qtybtn}
                onClick={() => handleQtyChange("dec")}
              >
                -
              </button>
              <span className={styles.ticker}>{options.quantity}</span>
              <button
                className={styles.qtybtn}
                onClick={() => handleQtyChange("inc")}
              >
                +
              </button>
            </div>
          </div>
          <button
            className={styles.addbtn}
            onClick={() => handleAddToBag()}
            disabled={!variantId}
          >
            Add to cart
          </button>

          <Accordion allowZeroExpanded>
            <AccordionItem className={accordionStyles.accordionItem}>
              <AccordionItemHeading
                className={accordionStyles.accordionItemHeading}
              >
                <AccordionItemButton
                  className={accordionStyles.accordionItemButton}
                >
                  Product details
                </AccordionItemButton>
              </AccordionItemHeading>
              <div className={accordionStyles.accordionItemIcon}></div>
              <AccordionItemPanel>
                <p>{product.description}</p>
              </AccordionItemPanel>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  ) : null;
};

export default Product;
