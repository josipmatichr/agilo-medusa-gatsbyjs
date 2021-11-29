import React, { useContext, useEffect, useState } from "react";
import StoreContext from "../../context/store-context";
import * as styles from "../../styles/product.module.css";
import * as accordionStyles from "../../styles/accordion.module.css";
import { createClient } from "../../utils/client";
import { formatPrices } from "../../utils/format-price";
import { getSlug, resetOptions } from "../../utils/helper-functions";
import { Accordion, AccordionItem, AccordionItemHeading, AccordionItemButton, AccordionItemPanel } from "react-accessible-accordion";

const Product = ({ location }) => {
  const { cart, addVariantToCart } = useContext(StoreContext);
  const [options, setOptions] = useState({
    variantId: "",
    quantity: 0,
    size: "",
  });

  const [product, setProduct] = useState(undefined);
  const client = createClient();

  useEffect(() => {
    const getProduct = async () => {
      const slug = getSlug(location.pathname);
      const response = await client.products.retrieve(slug);
      console.log( response );
      setProduct(response.product);
    };

    getProduct();
  }, [location.pathname]);

  useEffect(() => {
    if (product) {
      setOptions(resetOptions(product));
    }
  }, [product]);

  const handleQtyChange = (action) => {
    if (action === "inc") {
      if (
        options.quantity <
        product.variants.find(({ id }) => id === options.variantId)
          .inventory_quantity
      )
        setOptions({
          variantId: options.variantId,
          quantity: options.quantity + 1,
          size: options.size,
        });
    }
    if (action === "dec") {
      if (options.quantity > 1)
        setOptions({
          variantId: options.variantId,
          quantity: options.quantity - 1,
          size: options.size,
        });
    }
  };

  const handleAddToBag = () => {
    addVariantToCart({
      variantId: options.variantId,
      quantity: options.quantity,
    });
    if (product) setOptions(resetOptions(product));
  };

  const [colorID, setColorID] = useState(0);

  const colors = [
    {
      id: 1,
      title: 'black',
      colorHex: '#000',
    },
    {
      id: 2,
      title: 'white',
      colorHex: '#fff',
    },
  ]

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
          <p className={styles.price}>{formatPrices(cart, product.variants[0])}</p>
          <p className={styles.subtitle}>{product.subtitle}</p>
          <div className={styles.selection}>
            <div className={styles.colorPickerGroup}>
              {colors.map((color, index) => {
                return (
                  <div className={styles.colorPickerGroupItem}>
                    <input
                      type="radio"
                      name="color"
                      value={color.title}
                      id={color.id}
                      key={index}
                      className={styles.colorPickerInput}
                      onClick={() => setColorID(index)}
                      checked={colorID === index} />
                    <label for={color.id} style={{backgroundColor: color.colorHex}} className={styles.colorPickerLabel} />
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.selection}>
            <div className="selectors">
              <select
                onChange={ e => {
                  const selected = JSON.parse(e.currentTarget.value);

                  setOptions({
                    variantId: selected.variantId,
                    quantity: options.quantity,
                    size: selected.size,
                  })
                } }
                className={styles.select}
              >
                {product.variants
                  .slice(0)
                  .reverse()
                  .map((variant) => {
                    return (
                      <option
                        key={variant.id}
                        value={JSON.stringify({
                          variantId: variant.id,
                          size: variant.title
                        })}
                      >
                        {variant.title}
                      </option>
                    );
                })}
              </select>
            </div>
          </div>
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
          <button className={styles.addbtn} onClick={() => handleAddToBag()}>Add to cart</button>

          <Accordion allowZeroExpanded>
            <AccordionItem className={accordionStyles.accordionItem}>
              <AccordionItemHeading className={accordionStyles.accordionItemHeading}>
                <AccordionItemButton className={accordionStyles.accordionItemButton}>Product details</AccordionItemButton>
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
