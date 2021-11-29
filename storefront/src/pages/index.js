import React, {useContext} from "react";
import StoreContext from "../context/store-context";
import * as styles from "../styles/home.module.css";
import {Link} from "gatsby";
import {formatPrices} from "../utils/format-price";

const IndexPage = () => {
  const {cart, products} = useContext(StoreContext);

  return(
    <div className={styles.grid}>
      {products &&
        products.map((product) => {
          return(
            <div className={styles.gridItem}>
              <Link to={`/product/${product.id}`} className={styles.card} key={product.id}>
                <img src={product.thumbnail} className={styles.cardThumbnail} />

                <footer className={styles.cardFooter}>
                  <h2 className={styles.cardTitle}>{product.title}</h2>
                  <p>{formatPrices(cart, product.variants[0])}</p>
                </footer>
              </Link>
            </div>
          );
        })}
    </div>
  )
};

export default IndexPage;
